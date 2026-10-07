import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-application-record',
    templateUrl: './criminal-application-record.component.html',
    styleUrls: ['./criminal-application-record.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationRecordComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.applications;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `កំពុងព្រៀងសំណើរសុំ`;
  onlineApplication: boolean = false;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;
  isScanQrCode = false

  constructor(
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private router: Router

  ) { }

  ngOnInit(): void {
    this.criminal.newButtonName = `បញ្ចូលពាក្យស្នើសុំ`;
    this.criminal.routerCreate = `/criminal-record/form/khmer/application-no-iii`;
    this.route.parent.params.subscribe(parentParams => {
      this.loading = true;
      const { module } = this.criminal;
      let item: any = null;
      let urgent = false;
      if (parentParams?.statusKey === 'urgent') {
        item = STATUS_OBJ.APPLY;
        urgent = true;
      }
      else {
        const statusKey = `${parentParams?.statusKey}`.toUpperCase();
        item = STATUS_OBJ[statusKey];
      }
      this.statusKey = parentParams?.statusKey;
      let tabName = urgent ? 'urgent' : `${item?.name_en}`?.toLocaleLowerCase()
      this.tabs = criminal_tabs.applications?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/list/${tabName}/${m?.key}` }))
      this.route.params.subscribe(async params => {
        const { displayStatus, urgent } = this.criminal;
        this.params = params;
        this.onlineApplication = params?.tabKey === 'online';
        await this.store.fetchCriminalRecords(displayStatus, null, urgent, this.onlineApplication, false, res => {
          this.loading = false;
        })
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
    this.searchString = null;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { displayStatus, urgent } = this.criminal
    this.store.fetchMoreCriminalRecords(displayStatus, null, urgent, this.onlineApplication, false, res => {
      this.loading = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    const status = STATUS_OBJ["DRAFT"] as any
    this.searchString = value;
    if (value && !this.isScanQrCode) {
      this.store.fetchSearchCriminalRecords(this.searchString, status?.key, res => {
        this.isEmptyResult = !(res?.length > 0)
      });
    }

  }

  onScanQrCode(value) {
    this.isScanQrCode = false
    if (value) {
      this.isScanQrCode = true
      this.searchString = null;
      this.store.emptySearch = false
      this.router.navigate([`/criminal-record/applications/bulletin-list/${value}/criminal-record`])
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

}
