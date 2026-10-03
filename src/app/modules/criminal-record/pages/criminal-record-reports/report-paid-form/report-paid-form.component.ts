import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import * as XLSX from 'xlsx';
import { ReportPaidForm } from 'src/app/stores/report-paid-form.store';
import { DataService } from 'src/app/shared/services/data.service';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-report-paid-form',
  templateUrl: './report-paid-form.component.html',
  styleUrls: ['./report-paid-form.component.scss']
})
export class ReportPaidFormComponent implements OnInit {
  @ViewChild('table') table: ElementRef;

  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;
  MOL_workplace_key: string = null

  constructor(
    private route: ActivatedRoute,
    public store: ReportPaidForm,
    public auth: AuthStore,
    private ps: PrintService,
    private ds: DataService,
    private criminalStore: CriminalApplicationStore,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialog,
  ) {
    const { config } = this.auth;
    this.MOL_workplace_key = config.department_labor?.key
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async queryParams => {
      await this.store.fetchData(queryParams)
      // console.log(this.store.data?.map(m=>({withdraw_date:m.withdraw_date, key: m.key})))
      this.loading = false;
    })
  }

  async ngOnDestroy(): Promise<void> {

  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {}

  trackByIdx(i) {
    return i;
  }

  print() {
    this.ps.print('#print', 'a4-2');
  }

  logRow(item){
    this.resolve(item)
  }

  async resolve(item){

    // const refData = {
    //   withdraw_date : {  seconds: 1778058000,  nanoseconds: 1},
    //   withdraw_date_key: 20260506
    // }

    // const data = {
    //   ...item,
    //   withdraw_date : this.ds.timestampFromDate(refData.withdraw_date.seconds,refData.withdraw_date.nanoseconds),
    //   withdraw_date_key: refData?.withdraw_date_key
    // }
    // console.log('data',data)
    // this.criminalStore.updateCriminalRecord(data);

    // const docsForUpdate = this.store?.data?.filter( f => f?.withdraw_date_key == 20260505)
    // console.log('docForUpdate',docsForUpdate?.map(m=>m?.key))
    // console.log('docForUpdate',docsForUpdate?.length)
    // for await(let item of docsForUpdate){
    //   const data = {
    //     ...item,
    //     withdraw_date : this.ds.timestampFromDate(refData.withdraw_date.seconds,refData.withdraw_date.nanoseconds),
    //     withdraw_date_key: refData?.withdraw_date_key
    //   }
    //   this.criminalStore.updateCriminalRecord(data);
    //   await this.sleep(1500)
    // }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement, { raw: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'បញ្ជី.xlsx');
  }

  onSetToApply(item){
    const sub = this.dialogRef.open(ConfirmDeleteComponent,{
      data: {
        memo:'តើលោកអ្នកពិតជាចង់ប្ដូរស្ថានភាពឯកសារទៅដាក់ស្នើមែនដែរឬទេ?',
        title: 'ប្ដូរស្ថានភាពឯកសារទៅដាក់ស្នើ'
      } 
    }).afterClosed().subscribe((res)=>{
      sub?.unsubscribe();
      console.log('res',res);
      if(res==="yes"){
        const data = {
          key: item?.key,
          status: STATUS_OBJ.APPLY,
          updated_at: this.auth.serverDateTime,
          updated_by: this.criminalStore?.getMappedProfile(),
          paid_at: null,
        }
        this.criminalStore.updateCriminalRecord(data).then(()=>{
          this.snackBar.open(`បានប្ដូរពាក្យស្នើសុំទៅដាក់ស្នើរួចរាល់`, "យល់ព្រម", { duration: 10000 });
        })
      }
    })
  }



  // criminalKeys: any = []
  // pushKey(item){
  //   this.criminalKeys.push(item?.key)
  //   console.log('criminalKeys',this.criminalKeys)
  // }

  // resolveReport(){
  //   const keys = resolveKeys
  //   const batch = this.ds.batch()
  //   keys.map(m=>{
  //     const ref = this.ds.criminalRecordRef().doc(m).ref
  //     batch.update(ref,{status: STATUS_OBJ.DELETED})
  //   })
  //   batch.commit().then(()=>{
  //     console.log('done')
  //   })
  // }
}

// const resolveKeys = [
//   "7BSsu2lJ4f1oskPeRPEw",
//   "YRaxZ4gxbNFEE9GohYfL",
//   "Azvl3nsnE4iTaEZYSaCN",
//   "dlb5oPzbS8HESlZuMwEp",
//   "wIKFxgc8iyOta8HgQ1UI",
//   "t0EREByV9sjR2IMqY9nP",
//   "vM0TSQSsyVdgxjRpCFvE",
//   "V5YGdyShG66pUUrzrbUj",
//   "gcjwCOYDb6eUhNUmwDjL",
//   "gF45rQBrMSbW9FOc7MBf",
//   "7WCIgqK6tU8DXYHIS6UN",
//   "jAwx0JKebayqBgObtzFx",
//   "2E6WYDSA4SYMzxcH4oFK"
// ]