import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-data-report',
    templateUrl: './data-report.component.html',
    styleUrls: ['./data-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DataReportComponent implements OnInit {
  @ViewChild('table') table: ElementRef;

  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private ps: PrintService,
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលប្រវត្តិរូប`;
    this.criminal.routerCreate = `/criminal-record/criticizes/profile/form/draft`;

    this.tabs = criminal_tabs.request_latter?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/request-latter/${m?.key}` }))
    this.route.params.subscribe(async params => {
      this.loading = false;
      this.params = params;
      // this.onlineApplication = params?.tabKey === 'online';
      // this.status = status;
      // await this.store.fetchCriminalRecords(status, null,this.urgent, res => {
      //   this.loading = false;
      // })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    // this.store.fetchMoreCriminalRecords(this.status, null,this.urgent, res => {
    //   this.loadingMore = false;
    // })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    // this.loadingSearch = true;
    // const { currentDepartment } = this.auth
    // this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
    //       this.loadingSearch = false;
    // })
  }

  print() {
    this.ps.print('#print', 'a4l');
  }
  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement, { raw: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'បញ្ជីទិន្នន័យអ្នកបើកបរ និងអ្នករួមដំណើរ.xlsx');
  }
}
