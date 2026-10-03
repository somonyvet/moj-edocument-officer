import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { tabs } from 'src/app/dummy/tabs';

@Component({
  selector: 'app-criminal-online-application-route',
  templateUrl: './criminal-online-application-route.component.html',
  styleUrls: ['./criminal-online-application-route.component.scss']
})
export class CriminalOnlineApplicationRouteComponent implements OnInit {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;
  isScanQrCode = false;
  tabs = tabs.criminalReviewApplication
  statusMoreThan = null;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private router: Router

  ) { }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.criminal.params = { key: 'apply-online' }
      const { recipient } = this.auth;
      this.criminal.newButtonName = recipient ? 'ចេញបង្កាន់ដៃ' : `បញ្ចូលពាក្យស្នើសុំ`;
      this.title = recipient ? 'បញ្ជីចេញបង្កាន់ដៃ' : 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស'
      this.criminal.componentDialog = recipient ? CriminalPaymentComponent : CriminalLatterOfficerChooseNationalityComponent;
      const { tabKey } = params;
      const { uid } = this.auth;
      let displayStatus = STATUS_OBJ['APPLY']
      this.statusMoreThan = null;
      if(tabKey==='unverified'){
        displayStatus = STATUS_OBJ['APPLY']
      }else if(tabKey==='verified'){
        displayStatus = STATUS_OBJ['CONFIRM_APPLICATION']
        this.statusMoreThan = '>=';
      }else{
        displayStatus = STATUS_OBJ['APPLY']
        this.statusMoreThan = '>=';
      }
      this.criminal.displayStatus = displayStatus;
      await this.store.fetchCriminalRecordsByOfficer(displayStatus, null, false, null, this.statusMoreThan, res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.criminal.displayStatus = null;
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
    const { displayStatus } = this.criminal
    this.store.fetchMoreCriminalRecordsByOfficer(displayStatus, null, false, false, this.statusMoreThan, res => {
      this.loading = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    const status = STATUS_OBJ["APPLY"] as any
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
