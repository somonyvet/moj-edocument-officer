import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import * as XLSX from 'xlsx';
import { DataService } from 'src/app/shared/services/data.service';
import { ReportPaidMonthly } from 'src/app/stores/report-paid-monthly.store';
import { paymentOptionStore } from '../../../stores/paymentOption.store';

@Component({
  selector: 'app-paid-monthly-report',
  templateUrl: './paid-monthly-report.component.html',
  styleUrls: ['./paid-monthly-report.component.scss']
})
export class PaidMonthlyReportComponent implements OnInit {
  @ViewChild('table') table: ElementRef;

  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;
  paymentOptions: any = [];

  khmerNormal12: any = null;
  khmerNormal20: any = null;
  khmerStudent12: any = null;
  khmerStudent20: any = null;
  foreigner12: any = null;
  foreigner20: any = null;

  constructor(
    private route: ActivatedRoute,
    public store: ReportPaidMonthly,
    public auth: AuthStore,
    private ps: PrintService,
    private ds: DataService,
    private paymentStore: paymentOptionStore,
  ) {
    const { config } = this.auth;
  }

  async ngOnInit(): Promise<void> {
    this.paymentOptions = await this.paymentStore.getData();
    this.paymentOptions = this.paymentOptions?.filter(f=>f?.apply_from?.key=="local");
    this.route.queryParams.subscribe(async queryParams => {
      this.loading = true;
      const obj = { ...queryParams }
      if(Object.keys(obj).length === 0){
        this.loading = false;
        return;
      }
      await this.store.fetchData(obj,this.paymentOptions)
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
    this.ps.print('#print', 'a4-2l');
  }

  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement, { raw: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'បញ្ជី.xlsx');
  }

}
