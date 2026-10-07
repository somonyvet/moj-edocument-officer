import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportPaidForm } from 'src/app/stores/report-paid-form.store';
import * as XLSX from 'xlsx';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { groupBy } from 'src/app/shared/services/mapping.service';

@Component({
    selector: 'app-verify-online-report',
    templateUrl: './verify-online-report.component.html',
    styleUrls: ['./verify-online-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class VerifyOnlineReportComponent implements OnInit {
  onlinePaymentRowFromFile: any[]=[];
  creditCardTransactions: any[]=[];
  fileName: any = null;
  fileCreditCardName: any = null;
  processing: boolean = false;
  queryParams;
  reportProcessDocumentFromSystem;
  tranFromFileNotFoundInSystem: any[] = [];
  notFoundFromSystem: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public store: ReportPaidForm,
    private criminalStore: CriminalApplicationStore,
  ) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(async queryParams => {
      this.queryParams = queryParams
      if(this.onlinePaymentRowFromFile?.length && !this.processing){
        // this.getReportAndProcess();
      }
    })
  }

  onSelectedFile(event){
    if(this.processing) return;
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Please upload a single file.');
    }

    this.fileName = [];
    this.onlinePaymentRowFromFile= [];

    const file: File = target.files[0];
    this.fileName = file.name; 

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryData = e.target.result;
      // Read workbook
      const workbook: XLSX.WorkBook = XLSX.read(binaryData, { type: 'binary' });
      // Get first sheet name
      const sheetName: string = workbook.SheetNames[0];
      // Get worksheet
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      data.forEach((f: any)=>{
        console.log("f: any",f)
        if(this.isFirebasePushId(f?.[4])){
          const key: string | null = f?.[4]||null
          const obj = {
            key,
            amount: f?.[6]
          }
          this.onlinePaymentRowFromFile.push(obj)
        }
        // else if(f?.[2] == "eCom"){
        //   const key = this.extractTranIdFromCreditCard(f?.[4])
        //   const obj = {
        //     key,
        //     amount: f?.[6]
        //   }
        //   this.onlinePaymentRowFromFile.push(obj)
        // }
      })
      // this.getReportAndProcess();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  onSelectedFileCard(event){
    if(this.processing) return;
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Please upload a single file.');
    }

    const file: File = target.files[0];
    this.fileCreditCardName = file.name; 

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryData = e.target.result;
      // Read workbook
      const workbook: XLSX.WorkBook = XLSX.read(binaryData, { type: 'binary' });
      // Get first sheet name
      const sheetName: string = workbook.SheetNames[0];
      // Get worksheet
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      data.forEach((f: any)=>{

      })

    };
    reader.readAsBinaryString(target.files[0]);
  }

  async findApplication(receipt_ref: string){
    const res = await this.criminalStore.findApplicationFromReceiptKey(receipt_ref);
    if(!res?.key){
      alert("Record not found in the system.");
      return;
    }
    this.router.navigate([`/criminal-record/applications/bulletin-list/all/${res?.key}/criminal-record`])
  }

  async processVerify(){
    this.tranFromFileNotFoundInSystem = []
    this.notFoundFromSystem = []

    this.onlinePaymentRowFromFile?.forEach(f=>{
      if(!this.reportProcessDocumentFromSystem?.find(f2=>f2?.receipt_ref == f?.key)){
        this.tranFromFileNotFoundInSystem.push(f)
      }
    })

    if(this.tranFromFileNotFoundInSystem?.length){
      const keys = this.tranFromFileNotFoundInSystem.map(m=>m?.key)
      const receipts = await this.criminalStore.getReceipts(keys)
      this.tranFromFileNotFoundInSystem = this.tranFromFileNotFoundInSystem.map(m=>{
        const found = receipts.find(f=>f?.key == m?.key);
        if(found){
          return {
            ...m,
            applicationKey: found?.criminalRef
          }
        }else{
          return {
            ...m,
            applicationKey: null,
          }
        }
      })

      const applicationKeys = this.tranFromFileNotFoundInSystem.map(m=>m?.applicationKey)
      const applications = await this.criminalStore.getCriminalRecords(applicationKeys);
      this.tranFromFileNotFoundInSystem = this.tranFromFileNotFoundInSystem.map(m=>{
        const found = applications.find(f=>f?.key == m?.applicationKey);
        if(found){
          return {
            ...found,
            ...m,
          }
        }else{
          return {
            ...m,
          }
        }
      })

    }

    this.reportProcessDocumentFromSystem.forEach(f=>{
      if(!this.onlinePaymentRowFromFile?.find(f2=>f2?.key==f?.receipt_ref)){
        this.notFoundFromSystem.push(f)
      }
    })

    const Khqr = this.notFoundFromSystem?.filter(f=>((f?.payment_option?.name === 'Credit/Debit Card') || ( f?.pay_option?.name === 'ប័ណ្ណឥណទាន')) ? false : true)
    const Credit = this.notFoundFromSystem?.filter(f=>((f?.payment_option?.name === 'Credit/Debit Card') || ( f?.pay_option?.name === 'ប័ណ្ណឥណទាន')) ? true : false)

    this.notFoundFromSystem = [...Credit, ...Khqr];
  }

  async getReportAndProcess(){
    if(!this?.fileCreditCardName && !this.fileName){
      alert("Please select excel report first before proceed the verify process.");
      return
    }
    this.processing = true;
    this.reportProcessDocumentFromSystem = await this.store?.fetchReportProcessedDoc(this.queryParams)
    await this.processVerify();
    this.processing = false;
  }

  isUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
  isFirebasePushId(id: string): boolean {
    const re = /^[-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz]{20}$/;
    return re.test(id);
  }

  extractTranIdFromCreditCard(str: string){
    return str.slice(-20)
  }
}
