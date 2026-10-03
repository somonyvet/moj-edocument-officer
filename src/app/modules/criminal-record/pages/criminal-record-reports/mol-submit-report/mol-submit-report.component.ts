import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import * as XLSX from 'xlsx';
import { DataService } from 'src/app/shared/services/data.service';
import { ReportMolSubmitStore } from 'src/app/stores/report-mol-submit.store';

@Component({
  selector: 'app-mol-submit-report',
  templateUrl: './mol-submit-report.component.html',
  styleUrls: ['./mol-submit-report.component.scss']
})
export class MolSubmitReportComponent implements OnInit {
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
    public store: ReportMolSubmitStore,
    public auth: AuthStore,
    private ps: PrintService,
    private ds: DataService
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async queryParams => {
      await this.store.fetchData(queryParams)
      this.loading = false;
    })
  }

  async ngOnDestroy(): Promise<void> {

  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {

  }

  trackByIdx(i) {
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

  // resolveStatus(data){
  //   console.log(data?.map(m=>m?.status?.name))
  //   const batch = this.ds.batch()
  //   this.store?.data?.map(m=>{
  //     const docRef= this.ds.criminalRecordRef().doc(m.key)?.ref
  //     batch.update(docRef,{ status: STATUS_OBJ.APPLY })
  //   })
  //   batch.commit().then(res=>{
  //     console.log('done')
  //   })
  // }

  // updateIssuedAt() {
  //   const batch = this.ds.batch()
  //   this.store?.data?.map(m=>{
  //     const docRef= this.ds.criminalRecordRef().doc(m.key)?.ref
  //     batch.update(docRef,{issued_at: m?.tran_at})
  //   })
  //   batch.commit().then(res=>{
  //     console.log('done')
  //   })
  // }
}
