import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { APPLICATION_TYPE } from 'src/app/dummy/status';

const LETTER3_GENERAL_PATH = '/criminal-record/decree-record/application/letter3-general';
const DEFAULT_PERIOD_KEY = 'period12';

// what each :status tab queries, shared by the first page and by the scroll paging
const STATUS_QUERY = {
  // every application of this letter type that has not been decreed yet
  decree: { status: STATUS_OBJ.DECREE, statusMoreThan: '<' },
  reviewed: { status: STATUS_OBJ.CONFIRM_APPLICATION, statusMoreThan: false },
  done: { status: STATUS_OBJ.DECREE, statusMoreThan: '>=' },
}

@Component({
  selector: 'app-criminal-application-direct-letter3-general',
  templateUrl: './criminal-application-direct-letter3-general.component.html',
  styleUrls: ['./criminal-application-direct-letter3-general.component.scss']
})
export class CriminalApplicationDirectLetter3GeneralComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  tab = tabs?.decrees3General
  // period comes from the :period route param, ១២ថ្ងៃ is the default
  status: string = null;
  periodKey: string = DEFAULT_PERIOD_KEY;
  period: number = null;
  isScanQrCode = false;

  unClassify: boolean = false;
  MOL_workplace_key: string = null;
  constructor(public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const { config } = this.auth;
    this.MOL_workplace_key = config.department_labor?.key
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const { recipient } = this.auth;
    this.criminal.newButtonName = recipient ? 'ចេញបង្កាន់ដៃ' : `បញ្ចូលពាក្យស្នើសុំ`;
    this.title = recipient ? 'បញ្ជីចេញបង្កាន់ដៃ' : 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស'
    this.criminal.componentDialog = recipient ? CriminalPaymentComponent : CriminalLatterOfficerChooseNationalityComponent;
    this.criminal.params = { key: 'apply-direct' }

    this.route.params.subscribe(async params => {
      this.loading = true;
      this.status = params?.status;
      this.periodKey = params?.period;
      this.period = this.tab?.find(m => m?.key === this.periodKey)?.period;
      const query = this.query;
      if (!query) {
        this.router.navigate(['/page-not-found'])
        return;
      }
      if (!this.period) {
        this.router.navigate([LETTER3_GENERAL_PATH, this.status, DEFAULT_PERIOD_KEY], { replaceUrl: true })
        return;
      }
      this.store.fetchCriminalRecordsByPeriod(query.status, APPLICATION_TYPE[2], this.period, query.statusMoreThan, res => {
        this.loading = false;
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

  // the listing is already queried for the active status + period
  get items() {
    return this.store?.data || [];
  }

  get query() {
    return STATUS_QUERY[this.status];
  }

  periodLink(link: any) {
    return [LETTER3_GENERAL_PATH, this.status, link?.key];
  }

  async scrollHandler(e) {
    if (e.endIndex !== this.items?.length - 1) return
    this.loadingMore = true;
    if(this.unClassify){
      this.store.fetchMoreCriminalUnClassify(res => {
        this.loadingMore = false;
      })
    }else{
      // keep paging on the same query the status + period tabs loaded
      const { status, statusMoreThan } = this.query || {} as any;
      this.store.fetchMoreCriminalRecordsByPeriod(status, APPLICATION_TYPE[2], this.period, statusMoreThan, res => {
        this.loadingMore = false;
      })
    }
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value && !this.isScanQrCode) {
      this.store.fetchSearchCriminalListing(APPLICATION_TYPE[2], null, null, value.toUpperCase(), null, res => {
      })
    }
  }

  onScanQrCode(value) {
    this.isScanQrCode = false
    if(value){
      this.isScanQrCode = true
      this.searchString = null;
      this.store.emptySearch = false
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

}
