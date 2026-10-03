import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import * as XLSX from 'xlsx';
import { ReportPaidForm } from 'src/app/stores/report-paid-form.store';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
  selector: 'app-oversea-completed',
  templateUrl: './oversea-completed.component.html',
  styleUrls: ['./oversea-completed.component.scss']
})
export class OverseaCompletedComponent implements OnInit {
  @ViewChild('table') table: ElementRef;

  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public store: ReportPaidForm,
    public auth: AuthStore,
    private ps: PrintService,
    private ds: DataService
  ) {
    const { config } = this.auth;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async queryParams => {
      await this.store.fetchCompleteOversea(queryParams)
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

  printApplication(){
    this.ps.print("#printApplication", "a4-info-history")
  }

}
