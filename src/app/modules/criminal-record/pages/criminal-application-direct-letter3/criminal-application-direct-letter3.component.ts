import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { APPLICATION_TYPE } from 'src/app/dummy/status';

@Component({
    selector: 'app-criminal-application-direct-letter3',
    templateUrl: './criminal-application-direct-letter3.component.html',
    styleUrls: ['./criminal-application-direct-letter3.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationDirectLetter3Component implements OnInit, OnDestroy {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  tab = tabs?.decrees3
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
      if (params?.status === 'decree') {
        // every application of this letter type that has not been decreed yet
        this.store.fetchCriminalRecords(STATUS_OBJ.DECREE, APPLICATION_TYPE[2], false, false, "<", res => {
          this.loading = false;
        })
      }
      else if (params?.status === 'reviewed') {
        this.store.fetchCriminalRecords(STATUS_OBJ.CONFIRM_APPLICATION, APPLICATION_TYPE[2], false, false, false, res => {
          this.loading = false;
        })
      }
      else if (params?.status === 'done') {
        this.store.fetchCriminalRecords(STATUS_OBJ.DECREE, APPLICATION_TYPE[2], false, false, ">=", res => {
          this.loading = false;
        })
      }else {
        this.router.navigate(['/page-not-found'])
      }
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

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    if(this.unClassify){
      this.store.fetchMoreCriminalUnClassify(res => {
        this.loadingMore = false;
      })
    }else{
      const { displayStatus } = this.criminal
      this.store.fetchMoreCriminalRecordsByOfficer(displayStatus, APPLICATION_TYPE[2], false, null, null, res => {
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
