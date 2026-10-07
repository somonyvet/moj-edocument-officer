import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criticizes-listing',
    templateUrl: './criticizes-listing.component.html',
    styleUrls: ['./criticizes-listing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriticizesListingComponent implements OnInit {
  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ពាក្យស្នើសុំ`;
  status: any = null;
  urgent:boolean=false;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
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

}