import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';

@Component({
    selector: 'app-criminal-application-payment',
    templateUrl: './criminal-application-payment.component.html',
    styleUrls: ['./criminal-application-payment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationPaymentComponent implements OnInit {
  tabs = tabs.applicationPayment
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;
  STATUS_OBJ = STATUS_OBJ;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  focusSearch: boolean;
  statusMoreThan: string = null;
  isScanQrCode = false

  constructor(
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.criminal.firstParams = { key: 'pay' }
    this.route.params.subscribe(async params => {
      this.loading = true;

      const { recipient } = this.auth;
      this.criminal.newButtonName = recipient ? 'ចេញបង្កាន់ដៃ' : `បញ្ចូលពាក្យស្នើសុំ`;
      this.title = recipient ? 'បញ្ជីចេញបង្កាន់ដៃ' : 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស'
      this.criminal.componentDialog = recipient ? CriminalPaymentComponent : CriminalLatterOfficerChooseNationalityComponent;

      this.criminal.params = { key: 'application-payment' }
      const { tabKey } = params;
      this.tabs = tabs?.applicationPayment?.map(m => ({ ...m, path: `/criminal-record/applications/application-payment/${m?.key}` }))
      const statusMoreThan = tabKey === 'apply';
      this.statusMoreThan = statusMoreThan ? '==' : '>=';
      const displayStatus = tabKey === 'apply' ? STATUS_OBJ.REVIEW : STATUS_OBJ.PAID;
      this.criminal.displayStatus = displayStatus;
      await this.store.fetchCriminalRecords(displayStatus, null, null, null, this.statusMoreThan, res => {
        this.loading = false;
      })
    })

  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
    this.searchString = null;
    this.criminal.firstParams = null;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { displayStatus } = this.criminal
    this.store.fetchMoreCriminalRecords(displayStatus, null, null, null, this.statusMoreThan, res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value && !this.isScanQrCode) {
      this.store.fetchSearchCriminalListing(null, null, null, value.toUpperCase(), res => {
      })
    }
  }

  onScanQrCode(value) {
    this.isScanQrCode = false
    this.searchString = null;
    this.store.emptySearch = false

    if (value) {
      this.isScanQrCode = true
      this.router.navigate([`/criminal-record/applications/application-payment/apply/${value}/criminal-record`])
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

}
