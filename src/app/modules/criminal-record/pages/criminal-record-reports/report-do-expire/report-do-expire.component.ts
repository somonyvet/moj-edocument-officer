import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import * as XLSX from 'xlsx';
import { ReportPaidForm } from 'src/app/stores/report-paid-form.store';
import { DataService } from 'src/app/shared/services/data.service';
import { momentObjectToDate } from 'src/app/shared/services/mapping.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { ShowVerifyQRComponent } from 'src/app/shared/components/show-verify-qr/show-verify-qr.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-report-do-expire',
    templateUrl: './report-do-expire.component.html',
    styleUrls: ['./report-do-expire.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ReportDoExpireComponent implements OnInit {
  @ViewChild('table') table: ElementRef;

  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;
  queryParam: any = null;
  errorKeys: string[] = [];
  
  constructor(
    private route: ActivatedRoute,
    public store: ReportPaidForm,
    public auth: AuthStore,
    private ps: PrintService,
    private ds: DataService,
    private funs: AngularFireFunctions,
    private dialog: MatDialog,
  ) {
    const { config } = this.auth;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async queryParams => {
      this.queryParam = queryParams;
      await this.store.fetchDoExpire(queryParams)
      this.loading = false;
    })
  }

  async ngOnDestroy(): Promise<void> {

  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e:any) {

  }

  trackByIdx(i:any) {
    return i;
  }

  print() {
    this.ps.print('#print', 'a4-2');
  }

  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement, { raw: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'បញ្ជី.xlsx');
  }

  printApplication(){
    this.ps.print("#printApplication", "a4-info-history")
  }

  showQRVerify(){
    // this.dialog
  }

  listAllError(){
    console.log("errorKeys",this.errorKeys);
  }

  async CheckReport(){
    console.log("generateDateRanges",dateList);
    const _dateList = dateList.map(m=>({fromDate:new Date(m?.fromDate), toDate:new Date(m?.toDate)}))
    for await(let item1 of _dateList){
      const data = await this.store.getDocHasExpireAt(item1);
      console.log(`fromDate ${item1?.fromDate} -> toDate ${item1?.toDate} Data Length: ${data?.length}`,)
      for await(let item2 of data){
        const res = await this.resolveExpDate(item2);
        if(res){
          console.log("post Error",res);
        }
        await delay(200);
      }
    }
  }

  async resolveExpDate(item){
    const addMessage = this.funs.httpsCallable('onCallSignVerifyOA');
    const docRef = this.ds.criminalRecordRef().doc(item?.key)
    try {
      await addMessage({
        header_key: item?.key,
        expire_at: momentObjectToDate(item?.expired_date?.toDate()),
      }).toPromise()
    } catch (err) {
      console.error('onCallSignVerifyOA failed for', item?.key, err);
      this.errorKeys.push(item?.key);
      return item?.key;
    }
    await docRef.update({resolve_expired_date: true});
    return null;
  }

  onShowRecord(data){
    const dialogRef = this.dialog.open(ShowVerifyQRComponent, {
      data: { criminalRecords: [data] },
      panelClass: 'cs-dialog-doc',
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      role: 'dialog',
    });
  }

  async checkDocumentVerifyStatus(){
    const _dateList = dateList.map(m=>({fromDate:new Date(m?.fromDate), toDate:new Date(m?.toDate)}))
    const errorList = [];
    const expireList = [];
    const revokedList = [];
    const pendingList = [];
    for await(let item1 of _dateList){
      const data = await this.store.getDocumentVerifyFromDate(item1); 
      console.log(`fromDate ${item1?.fromDate} -> toDate ${item1?.toDate} Data Length: ${data?.length}`,)
      for await(let item of data){
        const document_id1 = item?.key;
        try {
          const checkDocumentStatus1 = this.funs.httpsCallable('onCallCheckDocumentStatusVerifyOA');
          const res1 = await checkDocumentStatus1({ header_key: document_id1 }).toPromise();
          if(res1.status == "expired"){
            expireList.push(item);
          }
          else if(res1.status == "revoked"){
            revokedList.push(item);
          }
          else if(res1.status == "pending"){
            pendingList.push(item);
          }else if(res1.status == "issued"){

          }else{
            console.log("else status: ",res1)
          }
        } catch (err) {
          errorList.push(item)
          console.error('get_document_status failed for', document_id1, err);
        }
        await delay(200);
      }
    }
    console.log("expireList",expireList);
    console.log("revokedList",revokedList);
    console.log("pendingList",pendingList);
    console.log("errorList",errorList);
  }

}

interface DateRange {
  fromDate: Date;
  toDate: Date;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateDateRanges(daysAhead = 90, windowSize = 5): DateRange[] {
  const ranges: DateRange[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endLimit = new Date(today);
  endLimit.setDate(endLimit.getDate() + daysAhead);

  let cursor = new Date(today);

  while (cursor < endLimit) {
    const fromDate = new Date(cursor);
    const toDate = new Date(cursor);
    toDate.setDate(toDate.getDate() + windowSize);

    ranges.push({ fromDate, toDate });

    // move to next window (non-overlapping)
    cursor = new Date(toDate);
  }

  return ranges;
}

const dateList = [
  // {
  //     "fromDate": "2026-10-02T17:00:00.000Z",
  //     "toDate": "2026-10-07T17:00:00.000Z"
  // },
  // {
  //     "fromDate": "2026-10-07T17:00:00.000Z",
  //     "toDate": "2026-10-12T13:00:00.000Z"
  // },
  // {
  //     "fromDate": "2026-10-12T17:00:00.000Z",
  //     "toDate": "2026-10-17T13:00:00.000Z"
  // },
  // {
  //     "fromDate": "2026-10-17T17:00:00.000Z",
  //     "toDate": "2026-10-22T13:00:00.000Z"
  // },

  // {
  //     "fromDate": "2026-10-01T17:00:00.000Z",
  //     "toDate": "2026-10-26T13:00:00.000Z"
  // },
  {
      "fromDate": "2026-09-01T17:00:00.000Z",
      "toDate": "2026-10-01T17:00:00.000Z"
  },
]

// const dateList = [
//     // {
//     //     "fromDate": "2026-07-14T17:00:00.000Z",
//     //     "toDate": "2026-07-19T17:00:00.000Z"
//     // },
//     // {
//     //     "fromDate": "2026-07-19T17:00:00.000Z",
//     //     "toDate": "2026-07-24T17:00:00.000Z"
//     // },
//     {
//         "fromDate": "2026-07-24T17:00:00.000Z",
//         "toDate": "2026-07-29T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-07-29T17:00:00.000Z",
//         "toDate": "2026-08-03T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-08-03T17:00:00.000Z",
//         "toDate": "2026-08-08T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-08-08T17:00:00.000Z",
//         "toDate": "2026-08-13T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-08-13T17:00:00.000Z",
//         "toDate": "2026-08-18T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-08-18T17:00:00.000Z",
//         "toDate": "2026-08-23T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-08-23T17:00:00.000Z",
//         "toDate": "2026-08-28T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-08-28T17:00:00.000Z",
//         "toDate": "2026-09-02T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-09-02T17:00:00.000Z",
//         "toDate": "2026-09-07T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-09-07T17:00:00.000Z",
//         "toDate": "2026-09-12T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-09-12T17:00:00.000Z",
//         "toDate": "2026-09-17T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-09-17T17:00:00.000Z",
//         "toDate": "2026-09-22T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-09-22T17:00:00.000Z",
//         "toDate": "2026-09-27T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-09-27T17:00:00.000Z",
//         "toDate": "2026-10-02T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-10-02T17:00:00.000Z",
//         "toDate": "2026-10-07T17:00:00.000Z"
//     },
//     {
//         "fromDate": "2026-10-07T17:00:00.000Z",
//         "toDate": "2026-10-12T17:00:00.000Z"
//     },
    
//     {
//         "fromDate": "2026-10-12T17:00:00.000Z",
//         "toDate": "2026-10-20T17:00:00.000Z"
//     },
// ]

const expireList = [
    {
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2Fd465bff870b132cf6aea393b603c9427287666e3bba722125ff6fe920669c000.png?alt=media&token=7f8cff01-1099-415f-8eae-630df637bd34",
        "fatherCurrentNationality": "ខ្មែរ",
        "expiredDate": "",
        "name": "ឡាយ ទាវ",
        "nickname": "/",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( ឡាយ  ទាវ ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទ នៃការចេញព្រឹត្តិបត្រនេះ ៕",
        "partnerOccupation": "/",
        "placeOfBirth": "ភូមិព្រៃព្រាល ឃុំត្រពាំងធំខាងត្បុង ស្រុកត្រាំកក់ ខេត្តតាកែវ",
        "fatherPlaceOfBirth": "ស្រុកត្រាំកក់ ខេត្តតាកែវ",
        "dateOfBirth": "១០ ធ្នូ ១៩៩៦",
        "currentAddress": "ភូមិទីប៉ាក់ ឃុំជាងទង ស្រុកត្រាំកក់ ខេត្តតាកែវ",
        "partnerOriginNationality": "/",
        "currentNationality": "ខ្មែរ",
        "fatherDateOfBirth": "(ស្លាប់)",
        "gender": "ប្រុស",
        "motherDateOfBirth": "១០ សីហា ១៩៥៨",
        "occupation": "ជំនួយការគ្រូពេទ្យ",
        "motherCurrentNationality": "ខ្មែរ",
        "revoke_at": {
            "seconds": 1784017691,
            "nanoseconds": 233000000
        },
        "verify_expire_at": {
            "seconds": 1791853564,
            "nanoseconds": 974000000
        },
        "key": "GGY9WKu33eS8lu2sCjjX",
        "criminal_language_key": 1,
        "motherName": "ឡេង យ៉ុន",
        "partnerName": "/",
        "created_at": {
            "seconds": 1782871228,
            "nanoseconds": 577000000
        },
        "partnerDateOfBirth": "/",
        "motherOriginNationality": "ខ្មែរ",
        "partnerCurrentNationality": "/",
        "issueDate": "១ កក្កដា ២០២៦",
        "fatherOriginNationality": "ខ្មែរ",
        "fatherName": "ឡាយ សឿន",
        "created_by": {
            "display_name": "ឡុង សាមមុឺឌី",
            "key": "nXtOOeAIh5b86L7Q0xZQ",
            "photoUrl": null
        },
        "verify_key": "d465bff870b132cf6aea393b603c9427287666e3bba722125ff6fe920669c000",
        "verify_url": "https://verify.gov.kh/verify/V1_wJcwk6E-DJHTSXHSkoVy4UH-tlybZ?key=d465bff870b132cf6aea393b603c9427287666e3bba722125ff6fe920669c000",
        "criminal_header_key": "Olb8oN5ytm6qzOxHBDtd",
        "originNationality": "ខ្មែរ",
        "motherPlaceOfBirth": "ស្រុកត្រាំកក់ ខេត្តតាកែវ"
    },
    {
        "name": "ប្រាក់ សុវណ្ណស៊ុធីតា",
        "nickname": "/",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( ប្រាក់  សុវណ្ណស៊ុធីតា ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទ នៃការចេញព្រឹត្តិបត្រនេះ ៕",
        "expiredDate": "",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F6dc105e561cf46015b2fb19e7af00794054920d6b99a936074cb0e085545e418.png?alt=media&token=fbd8733a-e3ea-4bef-9e3a-4d22af738eb5",
        "fatherCurrentNationality": "ខ្មែរ",
        "motherCurrentNationality": "ខ្មែរ",
        "currentAddress": "ភូមិត្រពាំងគរ សង្កាត់ពងទឹក ខណ្ឌដង្កោ រាជធានីភ្នំពេញ",
        "partnerOriginNationality": "/",
        "currentNationality": "ខ្មែរ",
        "fatherDateOfBirth": "៩ វិច្ឆិកា ១៩៦៦",
        "occupation": "មន្ត្រីជាប់កិច្ចសន្យា",
        "gender": "ស្រី",
        "motherDateOfBirth": "៧ មេសា ១៩៦៤",
        "dateOfBirth": "៣ តុលា ២០០២",
        "fatherPlaceOfBirth": "ស្រុកដង្កោ ខេត្តកណ្តាល",
        "placeOfBirth": "ភូមិត្រពាំងគរ សង្កាត់ពងទឹក ខណ្ឌដង្កោ ក្រុងភ្នំពេញ",
        "partnerOccupation": "/",
        "motherOriginNationality": "ខ្មែរ",
        "partnerName": "/",
        "motherName": "គន់ ណាំ",
        "created_at": {
            "seconds": 1782877962,
            "nanoseconds": 520000000
        },
        "partnerDateOfBirth": "/",
        "criminal_language_key": 1,
        "revoke_at": {
            "seconds": 1784101813,
            "nanoseconds": 622000000
        },
        "verify_expire_at": {
            "seconds": 1791853564,
            "nanoseconds": 974000000
        },
        "key": "msedkcJfPnKZhP53UBvU",
        "criminal_header_key": "IhxswEPcngxlKOZBRtXj",
        "originNationality": "ខ្មែរ",
        "motherPlaceOfBirth": "ស្រុកដង្កោ ខេត្តកណ្តាល",
        "created_by": {
            "display_name": "ឡុង សាមមុឺឌី",
            "key": "nXtOOeAIh5b86L7Q0xZQ",
            "photoUrl": null
        },
        "verify_key": "6dc105e561cf46015b2fb19e7af00794054920d6b99a936074cb0e085545e418",
        "verify_url": "https://verify.gov.kh/verify/bSgjRaEwnVUT3LsTqWYpBlJNXT1lx9Tj?key=6dc105e561cf46015b2fb19e7af00794054920d6b99a936074cb0e085545e418",
        "fatherOriginNationality": "ខ្មែរ",
        "fatherName": "ប្រាក់ សារិទ្ធិ",
        "partnerCurrentNationality": "/",
        "issueDate": "១ កក្កដា ២០២៦"
    },
    {
        "verify_key": "967ccb2e9d7ba197501d490df40a734197d0dd09c21ca0badcf5abf3fe3ea9d0",
        "verify_url": "https://verify.gov.kh/verify/S8nEqCETSoobwjFrXQHH-XwUWc6j2vk7?key=967ccb2e9d7ba197501d490df40a734197d0dd09c21ca0badcf5abf3fe3ea9d0",
        "created_by": {
            "photoUrl": null,
            "key": "nXtOOeAIh5b86L7Q0xZQ",
            "display_name": "ឡុង សាមមុឺឌី"
        },
        "motherPlaceOfBirth": "ស្រុកបារាយណ៍ ខេត្តកំពង់ធំ",
        "originNationality": "ខ្មែរ",
        "criminal_header_key": "cnkuzMsj1QdZsFcWmSMW",
        "issueDate": "៣ កក្កដា ២០២៦",
        "partnerCurrentNationality": "/",
        "fatherName": "យក់ សែម",
        "fatherOriginNationality": "ខ្មែរ",
        "partnerDateOfBirth": "/",
        "motherName": "មាស ឡាយ",
        "partnerName": "/",
        "created_at": {
            "seconds": 1783051297,
            "nanoseconds": 982000000
        },
        "motherOriginNationality": "ខ្មែរ",
        "verify_expire_at": {
            "seconds": 1792083600,
            "nanoseconds": 0
        },
        "key": "hXaosHORKNK3LDDHoq9M",
        "revoke_at": {
            "seconds": 1784535340,
            "nanoseconds": 8000000
        },
        "criminal_language_key": 1,
        "occupation": "បុគ្គលិកធនាគារ",
        "gender": "ស្រី",
        "motherDateOfBirth": "៣ ឧសភា ១៩៥៧",
        "currentAddress": "ភូមិតាសែន ឃុំសូទិព្វ ស្រុកជើងព្រៃ ខេត្តកំពង់ចាម",
        "partnerOriginNationality": "/",
        "currentNationality": "ខ្មែរ",
        "fatherDateOfBirth": "១ កុម្ភៈ ១៩៤៨",
        "motherCurrentNationality": "ខ្មែរ",
        "partnerOccupation": "/",
        "placeOfBirth": "ភូមិត្នោតជុំទី១ ឃុំត្នោតជុំ ស្រុកបារាយណ៍ ខេត្តកំពង់ធំ",
        "fatherPlaceOfBirth": "ស្រុកបារាយណ៍ ខេត្តកំពង់ធំ",
        "dateOfBirth": "២៥ ឧសភា ១៩៨៧",
        "nickname": "/",
        "name": "ស៊្រុន លីហ្សា",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( ស៊្រុន  លីហ្សា ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទ នៃការចេញព្រឹត្តិបត្រនេះ ៕",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F967ccb2e9d7ba197501d490df40a734197d0dd09c21ca0badcf5abf3fe3ea9d0.png?alt=media&token=b8a0cc7e-964a-4f35-b5c6-a83dee5a217c",
        "fatherCurrentNationality": "ខ្មែរ",
        "expiredDate": ""
    },
    {
        "fatherName": "ជួប ជយ",
        "fatherOriginNationality": "ខ្មែរ",
        "issueDate": "៣ កក្កដា ២០២៦",
        "partnerCurrentNationality": "/",
        "motherPlaceOfBirth": "ស្រុកបារាយណ៍ ខេត្តកំពង់ធំ",
        "originNationality": "ខ្មែរ",
        "criminal_header_key": "iz9sqBDNruMC1MeSnD5Y",
        "verify_url": "https://verify.gov.kh/verify/ZtQ8HX3CbddhpqeojqDM1YAYCO2ZANUW?key=83b8af058ccdcf779f69ae94c5c34e715eed1e2f7112a81fc7e6244d1585607b",
        "verify_key": "83b8af058ccdcf779f69ae94c5c34e715eed1e2f7112a81fc7e6244d1585607b",
        "created_by": {
            "photoUrl": null,
            "display_name": "ឡុង សាមមុឺឌី",
            "key": "nXtOOeAIh5b86L7Q0xZQ"
        },
        "criminal_language_key": 1,
        "key": "mhuZB2XLckiMtCDhCd7S",
        "verify_expire_at": {
            "seconds": 1792083600,
            "nanoseconds": 0
        },
        "revoke_at": {
            "seconds": 1784517568,
            "nanoseconds": 191000000
        },
        "motherOriginNationality": "ខ្មែរ",
        "partnerDateOfBirth": "/",
        "created_at": {
            "seconds": 1783050235,
            "nanoseconds": 777000000
        },
        "motherName": "ណាញ់ ណស",
        "partnerName": "/",
        "dateOfBirth": "១៤ មិថុនា ២០០៣",
        "fatherPlaceOfBirth": "ស្រុកបារាយណ៍ ខេត្តកំពង់ធំ",
        "placeOfBirth": "ភូមិទួលសាលា ឃុំចុងដូង ស្រុកបារាយណ៍ ខេត្តកំពង់ធំ",
        "partnerOccupation": "/",
        "motherCurrentNationality": "ខ្មែរ",
        "occupation": "បុគ្គលិកក្រុមហ៊ុន",
        "gender": "ស្រី",
        "motherDateOfBirth": "៣ មេសា ១៩៧៨",
        "partnerOriginNationality": "/",
        "currentNationality": "ខ្មែរ",
        "fatherDateOfBirth": "១ កុម្ភៈ ១៩៧៤",
        "currentAddress": "ភូមិម័ល សង្កាត់ដង្កោ ខណ្ឌដង្កោ រាជធានីភ្នំពេញ",
        "expiredDate": "",
        "fatherCurrentNationality": "ខ្មែរ",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F83b8af058ccdcf779f69ae94c5c34e715eed1e2f7112a81fc7e6244d1585607b.png?alt=media&token=23d6f08a-ce07-4c62-8904-e0c44e5b65f7",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( ជុន  ស្រីនិច ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕",
        "name": "ជុន ស្រីនិច",
        "nickname": "/"
    },
    {
        "key": "MiRwW3mI76FizDHN7SK5",
        "verify_expire_at": {
            "seconds": 1792199697,
            "nanoseconds": 740000000
        },
        "revoke_at": {
            "seconds": 1784517370,
            "nanoseconds": 975000000
        },
        "criminal_language_key": 1,
        "partnerDateOfBirth": "១០ មករា ១៩៧៤",
        "created_at": {
            "seconds": 1783908530,
            "nanoseconds": 613000000
        },
        "partnerName": "ម៉ុញ ប៊ុនគាង",
        "motherName": "សៃ ង៉ោ",
        "motherOriginNationality": "ខ្មែរ",
        "issueDate": "១៣ កក្កដា ២០២៦",
        "partnerCurrentNationality": "ខ្មែរ",
        "fatherName": "ងួន ចឺន",
        "fatherOriginNationality": "ខ្មែរ",
        "verify_url": "https://verify.gov.kh/verify/GEvuvEP-eUDiL6xhCIkxlr6RLwIn6vhv?key=49d65c42fa7267f0f03f96125828e90ff03b75f9519656b3b0fa7a1dd0291dba",
        "verify_key": "49d65c42fa7267f0f03f96125828e90ff03b75f9519656b3b0fa7a1dd0291dba",
        "created_by": {
            "display_name": "ឡុង សាមមុឺឌី",
            "key": "nXtOOeAIh5b86L7Q0xZQ",
            "photoUrl": null
        },
        "motherPlaceOfBirth": "ស្រុកត្បូងឃ្មុំ ខេត្តកំពង់ចាម",
        "originNationality": "ខ្មែរ",
        "criminal_header_key": "m5SKoPXbwPao0MD4eIuv",
        "fatherCurrentNationality": "ខ្មែរ",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F49d65c42fa7267f0f03f96125828e90ff03b75f9519656b3b0fa7a1dd0291dba.png?alt=media&token=2165df08-1d98-4f70-9478-322875515e28",
        "expiredDate": "",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( អ៊ុក  ណាវី ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទ នៃការចេញព្រឹត្តិបត្រនេះ ៕",
        "name": "អ៊ុក ណាវី",
        "nickname": "/",
        "placeOfBirth": "ភូមិគួង ឃុំសួង ស្រុកត្បូងឃ្មុំ ខេត្តកំពង់ចាម",
        "partnerOccupation": "កសិករ",
        "dateOfBirth": "៥ មិថុនា ១៩៦៩",
        "fatherPlaceOfBirth": "ស្រុកមេមត់ ខេត្តកំពង់ចាម",
        "motherDateOfBirth": "(ស្លាប់)",
        "gender": "ស្រី",
        "occupation": "គ្រូពេទ្យមធ្យម",
        "partnerOriginNationality": "ខ្មែរ",
        "currentNationality": "ខ្មែរ",
        "fatherDateOfBirth": "(ស្លាប់)",
        "currentAddress": "ភូមិសារាយ ឃុំបុសខ្នុរ ស្រុកចំការលើ ខេត្តកំពង់ចាម",
        "motherCurrentNationality": "ខ្មែរ"
    },
    {
        "fatherName": "មិនដឹង",
        "fatherOriginNationality": "/",
        "issueDate": "៤ កក្កដា ២០២៤",
        "partnerCurrentNationality": "/",
        "motherPlaceOfBirth": "/",
        "originNationality": "ខ្មែរ",
        "criminal_header_key": "PbsQ1xeksrwIIl8Zv09n",
        "verify_url": "https://verify.gov.kh/verify/LGpQLoj845IKnTjQ9LpmnFI9lwfygsXD?key=9241501d2320e0b898ae3098fe7bc3499bbc4995e81a44dfcc4166ecd19e454b",
        "verify_key": "9241501d2320e0b898ae3098fe7bc3499bbc4995e81a44dfcc4166ecd19e454b",
        "created_by": {
            "display_name": "គឹម សន្តិភាព",
            "key": "pGA5AIVATo4JKSQQNFXP",
            "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
        },
        "criminal_language_key": 1,
        "key": "OuJXPumPojr7A6jL9jdA",
        "verify_expire_at": {
            "seconds": 1792405760,
            "nanoseconds": 667000000
        },
        "revoke_at": {
            "seconds": 1784458754,
            "nanoseconds": 17000000
        },
        "motherOriginNationality": "/",
        "partnerDateOfBirth": "២០០១",
        "created_at": {
            "seconds": 1784456908,
            "nanoseconds": 625000000
        },
        "partnerName": "/",
        "motherName": "មិនដឹង",
        "fatherPlaceOfBirth": "/",
        "dateOfBirth": "១ មករា ២០០០",
        "placeOfBirth": "Place of birth",
        "partnerOccupation": "/",
        "motherCurrentNationality": "/",
        "occupation": "អ្នកអភិវឌ្ឍន៍កម្មវិធី",
        "gender": "ប្រុស",
        "motherDateOfBirth": "១៩១២",
        "partnerOriginNationality": "/",
        "fatherDateOfBirth": "១៩៧២",
        "currentNationality": "ខ្មែរ",
        "currentAddress": "Current address",
        "expiredDate": "",
        "fatherCurrentNationality": "/",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F9241501d2320e0b898ae3098fe7bc3499bbc4995e81a44dfcc4166ecd19e454b.png?alt=media&token=05ac61de-a157-4854-90b1-e5d7eac8feaa",
        "confirmationNote": "ឈ្មោះខាងលើនេះ (  ឈួន  សៀវហេង  ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕",
        "name": "ឈួន សៀវហេង",
        "nickname": "/"
    },
    {
        "fatherName": "អ៊ុក ឈឺន",
        "fatherOriginNationality": "ខ្មែរ",
        "issueDate": "២០ កក្កដា ២០២៦",
        "partnerCurrentNationality": "/",
        "motherPlaceOfBirth": "ទីកន្លែងកំណើត ម្ដាយ",
        "criminal_header_key": "DQrKzNDjk4baRSjh323k",
        "originNationality": "ខ្មែរ",
        "verify_key": "de26fa2d985196b324de0b52a76c5081e875c5563d24031da2ac7af5fa8539ea",
        "verify_url": "https://verify.gov.kh/verify/7pVi4PxgrGGgDhnhXHdry7mcXfEq4FjU?key=de26fa2d985196b324de0b52a76c5081e875c5563d24031da2ac7af5fa8539ea",
        "created_by": {
            "display_name": "CR16 ",
            "key": "UyoJvGv2tlPzrSQomyDw",
            "photoUrl": null
        },
        "criminal_language_key": 1,
        "verify_expire_at": {
            "seconds": 1792471991,
            "nanoseconds": 988000000
        },
        "key": "kLqR3tVWk5BFAllXt3ar",
        "revoke_at": {
            "seconds": 1784600396,
            "nanoseconds": 113000000
        },
        "motherOriginNationality": "ខ្មែរ",
        "partnerDateOfBirth": "/",
        "partnerName": "/",
        "motherName": "ភិន សុភ័ណ",
        "created_at": {
            "seconds": 1784513083,
            "nanoseconds": 266000000
        },
        "fatherPlaceOfBirth": "ទីកន្លែងកំណើត ឪពុក",
        "dateOfBirth": "១ មករា ២០០០",
        "placeOfBirth": "/",
        "partnerOccupation": "/",
        "motherCurrentNationality": "ខ្មែរ",
        "motherDateOfBirth": "១២ សីហា ១៩៦៦",
        "gender": "ប្រុស",
        "occupation": "អ្នកអភិវឌ្ឍន៍កម្មវិធី",
        "currentAddress": "/",
        "fatherDateOfBirth": "៥ សីហា ១៩៦៥",
        "currentNationality": "ខ្មែរ",
        "partnerOriginNationality": "/",
        "expiredDate": "",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2Fde26fa2d985196b324de0b52a76c5081e875c5563d24031da2ac7af5fa8539ea.png?alt=media&token=6cc28e6c-356a-4067-a136-810f626f4677",
        "fatherCurrentNationality": "ខ្មែរ",
        "name": "សៀវ ហេង",
        "nickname": "/",
        "confirmationNote": "ឈ្មោះខាងលើនេះ (  សៀវ  ហេង  ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕"
    }
]

const expireList2 = [
    {
        "currentAddress": "ភូមិ៣ សង្កាត់ច្រាំងចំរេះទី១ ខណ្ឌឫស្សីកែវ រាជធានីភ្នំពេញ",
        "partnerDateOfBirth": "/",
        "motherOriginNationality": "ខ្មែរ",
        "name": "ម៉ៃ សុលិសា",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F189916fb5fa23b4c9273127af77c19841d492dcaa213f9b94f68f0e7ef85f08e.png?alt=media&token=54e79f4c-cb62-4b32-93e8-a67075fff76a",
        "motherName": "ម៉ៃ សាន់ឌិ",
        "motherCurrentNationality": "ខ្មែរ",
        "verify_url": "https://verify.gov.kh/verify/EUaLpenmk9RodgY7pYVa341Kt95Capsq?key=189916fb5fa23b4c9273127af77c19841d492dcaa213f9b94f68f0e7ef85f08e",
        "expiredDate": "",
        "occupation": "បុគ្គលិកធនាគារ",
        "fatherDateOfBirth": "១៩៦៨",
        "gender": "ស្រី",
        "issueDate": "២ មិថុនា ២០២៦",
        "fatherOriginNationality": "ខ្មែរ",
        "dateOfBirth": "៦ តុលា ២០០១",
        "verify_expire_at": {
            "seconds": 1788572622,
            "nanoseconds": 686000000
        },
        "key": "ZhECbfYFlNacRMYxaKRX",
        "fatherCurrentNationality": "ខ្មែរ",
        "nickname": "/",
        "currentNationality": "ខ្មែរ",
        "created_at": {
            "seconds": 1780368477,
            "nanoseconds": 554000000
        },
        "criminal_header_key": "S468QGuTO3rWVgH8B8G0",
        "fatherName": "គឹម វាសនា",
        "partnerCurrentNationality": "/",
        "placeOfBirth": " សង្កាត់ទួលស្វាយព្រៃទី២ ខណ្ឌចំការមន ក្រុងភ្នំពេញ",
        "verify_key": "189916fb5fa23b4c9273127af77c19841d492dcaa213f9b94f68f0e7ef85f08e",
        "fatherPlaceOfBirth": "ស្រុកព្រៃវែង ខេត្តព្រៃវែង",
        "partnerOccupation": "/",
        "motherPlaceOfBirth": "សង្កាត់លេខ៣ ក្រុងព្រះសីហនុ",
        "created_by": {
            "photoUrl": null,
            "display_name": "ផុន សុខលាភ",
            "key": "XSMEQTA4ZD15gwXaIvEd"
        },
        "revoke_at": {
            "seconds": 1785227161,
            "nanoseconds": 960000000
        },
        "motherDateOfBirth": "៨ មីនា ១៩៨១",
        "partnerName": "/",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( ម៉ៃ  សុលិសា ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕",
        "originNationality": "ខ្មែរ",
        "partnerOriginNationality": "/",
        "criminal_language_key": 1
    },
    {
        "criminal_language_key": 1,
        "motherDateOfBirth": "៨ មិថុនា ១៩៨១",
        "partnerDateOfBirth": "/",
        "key": "4BwOTiZzjeU8Zz3obc5Z",
        "motherOriginNationality": "ខ្មែរ",
        "issueDate": "៨ មិថុនា ២០២៦",
        "created_at": {
            "seconds": 1780892108,
            "nanoseconds": 583000000
        },
        "gender": "ស្រី",
        "originNationality": "ខ្មែរ",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( សៀក  ចន្ធី ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទ នៃការចេញព្រឹត្តិបត្រនេះ ៕",
        "fatherName": "សុខ សៀក",
        "fatherCurrentNationality": "ខ្មែរ",
        "fatherOriginNationality": "ខ្មែរ",
        "name": "សៀក ចន្ធី",
        "partnerName": "/",
        "verify_url": "https://verify.gov.kh/verify/aTXQE8bN-vzKucEnUqHq4LBakNVkPKAz?key=587187c82830428f101cb7c3969f0a88d1ac6a8fb91ac93af20cb9e8c627e9bd",
        "currentNationality": "ខ្មែរ",
        "motherName": "សារឿន នឿន",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F587187c82830428f101cb7c3969f0a88d1ac6a8fb91ac93af20cb9e8c627e9bd.png?alt=media&token=48089857-dc40-48f5-9e19-b0791da02352",
        "partnerOccupation": "/",
        "motherCurrentNationality": "ខ្មែរ",
        "criminal_header_key": "BbqbaR09TDxGKDEsi0GH",
        "occupation": "គិលានុបដ្ឋាយិកា",
        "revoke_at": {
            "seconds": 1785225409,
            "nanoseconds": 526000000
        },
        "verify_expire_at": {
            "seconds": 1789187254,
            "nanoseconds": 877000000
        },
        "fatherPlaceOfBirth": "ស្រុកកោះធំ ខេត្តកណ្តាល",
        "expiredDate": "",
        "partnerOriginNationality": "/",
        "motherPlaceOfBirth": "ស្រុកកោះធំ ខេត្តកណ្តាល",
        "dateOfBirth": "៥ មករា ២០០២",
        "placeOfBirth": "ភូមិព្រែកតាមេម ឃុំព្រែកស្តី ស្រុកកោះធំ ខេត្តកណ្តាល",
        "nickname": "/",
        "partnerCurrentNationality": "/",
        "currentAddress": "ភូមិចំការជ្រៃខាងត្បូង ឃុំអន្លង់រាប ស្រុកវាលវែង ខេត្តពោធិ៍សាត់",
        "verify_key": "587187c82830428f101cb7c3969f0a88d1ac6a8fb91ac93af20cb9e8c627e9bd",
        "created_by": {
            "photoUrl": null,
            "display_name": "ផុន សុខលាភ",
            "key": "XSMEQTA4ZD15gwXaIvEd"
        },
        "fatherDateOfBirth": "១៧ មេសា ១៩៨០"
    },
    {
        "created_at": {
            "seconds": 1780887504,
            "nanoseconds": 117000000
        },
        "motherPlaceOfBirth": "ស្រុកជីក្រែង ខេត្តសៀមរាប",
        "criminal_header_key": "iJ6OPYhJG6FB9zfoyWch",
        "fatherPlaceOfBirth": "ស្រុកជីក្រែង ខេត្តសៀមរាប",
        "fatherName": "ទឹម ឡា",
        "fatherOriginNationality": "ខ្មែរ",
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2Fc03ee577958213336d72b099a67ba1d843fa1cae1930121e3b6b9d9b47310096.png?alt=media&token=e0813232-5db9-442a-b47a-4151d0285e71",
        "fatherDateOfBirth": "៧ មិថុនា ១៩៧៦",
        "motherCurrentNationality": "ខ្មែរ",
        "partnerName": "រុន គឹមស៊ុន",
        "verify_url": "https://verify.gov.kh/verify/uSsP0SD_1CbRu4W-0BYC1seKkp8HVYKg?key=c03ee577958213336d72b099a67ba1d843fa1cae1930121e3b6b9d9b47310096",
        "placeOfBirth": "ភូមិស្ពានត្នោត២ ឃុំស្ពានត្នោត ស្រុកជីក្រែង ខេត្តសៀមរាប",
        "motherOriginNationality": "ខ្មែរ",
        "motherName": "ឈន ប៉ិច",
        "occupation": "មន្ត្រីឥណទាន",
        "issueDate": "៨ មិថុនា ២០២៦",
        "currentAddress": "ភូមិស្ពានត្នោត ឃុំស្ពានត្នោត ស្រុកជីក្រែង ខេត្តសៀមរាប",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( លួន  លិ ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕",
        "fatherCurrentNationality": "ខ្មែរ",
        "gender": "ស្រី",
        "nickname": "/",
        "key": "CNhkVzkdIRnkdCdALPPv",
        "partnerCurrentNationality": "ខ្មែរ",
        "partnerDateOfBirth": "២០ កុម្ភៈ ២០០០",
        "partnerOccupation": "គ្មាន",
        "expiredDate": "",
        "motherDateOfBirth": "១០ មិថុនា ១៩៧៧",
        "verify_key": "c03ee577958213336d72b099a67ba1d843fa1cae1930121e3b6b9d9b47310096",
        "currentNationality": "ខ្មែរ",
        "created_by": {
            "key": "XSMEQTA4ZD15gwXaIvEd",
            "display_name": "ផុន សុខលាភ",
            "photoUrl": null
        },
        "dateOfBirth": "១ មីនា ២០០១",
        "revoke_at": {
            "seconds": 1784878956,
            "nanoseconds": 354000000
        },
        "originNationality": "ខ្មែរ",
        "verify_expire_at": {
            "seconds": 1789460913,
            "nanoseconds": 241000000
        },
        "criminal_language_key": 1,
        "name": "លួន  លិ",
        "partnerOriginNationality": "ខ្មែរ"
    },
    {
        "motherName": "នេត​ ភឿន",
        "verify_url": "https://verify.gov.kh/verify/j3qDnIu1N3QiXXqS1lj8C3IFOs037ycy?key=8656642cf2c049c559fe33137aeadfad3b09350578f069c96a37e4871d935051",
        "partnerOriginNationality": "/",
        "placeOfBirth": "ភូមិវត្ដ ឃុំខ្នារឆ្មារ ស្រុកសាមគ្គីមានជ័យ ខេត្តកំពង់ឆ្នាំង",
        "occupation": "ពលករ",
        "partnerOccupation": "/",
        "name": "ជន បណ្ឌិត",
        "fatherOriginNationality": "ខ្មែរ",
        "partnerName": "/",
        "confirmationNote": "ឈ្មោះខាងលើនេះ ( ជន  បណ្ឌិត ) ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕",
        "nickname": "/",
        "created_at": {
            "seconds": 1781250549,
            "nanoseconds": 403000000
        },
        "revoke_at": {
            "seconds": 1784600768,
            "nanoseconds": 221000000
        },
        "motherDateOfBirth": "១២ មករា ១៩៧៩",
        "fatherName": "ជ័រ រិទ្ធ",
        "motherOriginNationality": "ខ្មែរ",
        "partnerCurrentNationality": "/",
        "fatherPlaceOfBirth": " ស្រុកកំពង់ត្រឡាច ខេត្តកំពង់ឆ្នាំង",
        "motherPlaceOfBirth": " ស្រុកកំពង់ត្រឡាច ខេត្តកំពង់ឆ្នាំង",
        "originNationality": "ខ្មែរ",
        "fatherCurrentNationality": "ខ្មែរ",
        "verify_key": "8656642cf2c049c559fe33137aeadfad3b09350578f069c96a37e4871d935051",
        "gender": "ប្រុស",
        "created_by": {
            "key": "nXtOOeAIh5b86L7Q0xZQ",
            "display_name": "ឡុង សាមមុឺឌី",
            "photoUrl": null
        },
        "dateOfBirth": "២២ វិច្ឆិកា ២០០៤",
        "fatherDateOfBirth": "១៤ មេសា ១៩៧៤",
        "currentNationality": "ខ្មែរ",
        "verify_expire_at": {
            "seconds": 1789550801,
            "nanoseconds": 30000000
        },
        "verify_qr": "https://firebasestorage.googleapis.com/v0/b/criminal-letter.appspot.com/o/verify_qr%2Fverify_qr%2F8656642cf2c049c559fe33137aeadfad3b09350578f069c96a37e4871d935051.png?alt=media&token=ae390b37-ed44-4091-be9e-726289d59494",
        "partnerDateOfBirth": "/",
        "expiredDate": "",
        "key": "uf3vSEx4z9b6v5TFan9y",
        "motherCurrentNationality": "ខ្មែរ",
        "issueDate": "១២ មិថុនា ២០២៦",
        "criminal_language_key": 1,
        "currentAddress": "ភូមិវត្ដ ឃុំខ្នារឆ្មារ ស្រុកសាមគ្គីមានជ័យ ខេត្តកំពង់ឆ្នាំង",
        "criminal_header_key": "KaRjrcyuaRx9AFdyfrjB"
    }
]

const pending = [
    {
        "verify_expire_at": {
            "seconds": 1788311366,
            "nanoseconds": 612000000
        },
        "currentNationality": "Khmer",
        "created_at": {
            "seconds": 1779180295,
            "nanoseconds": 978000000
        },
        "currentAddress": "Srayong Tbaung village, Srayong commune, Kulen district, Preah Vihear province",
        "dateOfBirth": "April 1, 2007",
        "nickname": "/",
        "motherOriginNationality": "Khmer",
        "criminal_language_key": 3,
        "partnerOriginNationality": "/",
        "partnerOccupation": "/",
        "issueDate": "May 20, 2026",
        "motherPlaceOfBirth": "Kien Svay district, Kandal province",
        "partnerDateOfBirth": "/",
        "key": "DSdkuO4LnPDW6BW7QdiX",
        "fatherCurrentNationality": "Khmer",
        "created_by": {
            "photoUrl": null,
            "key": "XSMEQTA4ZD15gwXaIvEd",
            "display_name": "ផុន សុខលាភ"
        },
        "partnerName": "/",
        "originNationality": "Khmer",
        "occupation": "Farmer",
        "fatherOriginNationality": "Khmer",
        "criminal_header_key": "Q9iElZ2313U0eg1bQqX6",
        "motherCurrentNationality": "Khmer",
        "fatherName": "CHEUT NAT",
        "fatherPlaceOfBirth": "Koh Thom district, Kandal province",
        "motherName": "RET SOMALY",
        "fatherDateOfBirth": "July 15, 1978",
        "expiredDate": "",
        "placeOfBirth": "Srayong Tbaung village, Srayong commune, Kulen district, Preah Vihear province",
        "name": "CHEUT SREYLIN",
        "gender": "Female",
        "confirmationNote": "The above-mentioned person (CHEUT SREYLIN) does not have any imprisonment record that shall be registered in Bulletin Number 3 of criminal record held by the Ministry of Justice until  the date of issuance of this Bulletin.",
        "partnerCurrentNationality": "/",
        "motherDateOfBirth": "November 20, 1983"
    },
    {
        "criminal_language_key": 3,
        "partnerOriginNationality": "Khmer",
        "motherPlaceOfBirth": "Sangker district, Battambang province",
        "issueDate": "June 3, 2026",
        "partnerOccupation": "Student",
        "partnerDateOfBirth": "July 20, 1997",
        "fatherCurrentNationality": "Khmer",
        "key": "8vESnQfS81lPoSr8mIn6",
        "verify_expire_at": {
            "seconds": 1788936310,
            "nanoseconds": 564000000
        },
        "currentNationality": "Khmer",
        "created_at": {
            "seconds": 1780452594,
            "nanoseconds": 861000000
        },
        "currentAddress": "No. 390, Tapon village, Tapon commune, Sangker district, Battambang province",
        "dateOfBirth": "July 7, 2002",
        "nickname": "/",
        "motherOriginNationality": "Khmer",
        "fatherDateOfBirth": "June 2, 1973",
        "expiredDate": "",
        "placeOfBirth": "Tapon village, Tapon commune, Sangker district, Battambang province",
        "name": "KI SOPHANIN",
        "confirmationNote": "The above-mentioned person (KI SOPHANIN) does not have any imprisonment record that shall be registered in Bulletin Number 3 of criminal record held by the Ministry of Justice until  the date of issuance of this Bulletin.",
        "gender": "Female",
        "partnerCurrentNationality": "Khmer",
        "motherDateOfBirth": "June 4, 1964",
        "partnerName": "HORM TONGHAN",
        "originNationality": "Khmer",
        "created_by": {
            "key": "XSMEQTA4ZD15gwXaIvEd",
            "display_name": "ផុន សុខលាភ",
            "photoUrl": null
        },
        "occupation": "Pharmacist ",
        "fatherOriginNationality": "Khmer",
        "criminal_header_key": "UdGQBOpE7Js0i0aPXjDf",
        "motherCurrentNationality": "Khmer",
        "fatherName": "dieb ky",
        "fatherPlaceOfBirth": "Sangker district, Battambang province",
        "motherName": "orm sophea"
    }
]