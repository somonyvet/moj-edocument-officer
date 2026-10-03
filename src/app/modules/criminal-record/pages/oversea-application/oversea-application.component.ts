import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';

@Component({
  selector: 'app-oversea-application',
  templateUrl: './oversea-application.component.html',
  styleUrls: ['./oversea-application.component.scss']
})
export class OverseaApplicationComponent implements OnInit {

  tabs = tabs.applicationOversea
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `បញ្ជីស្នើសុំក្រៅប្រទេស`;
  STATUS_OBJ = STATUS_OBJ;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  focusSearch: boolean;
  statusMoreThan: string = null;
  isScanQrCode = false;
  orderDESC: boolean = false;

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
      this.store.data = []
      this.criminal.componentDialog = CriminalLatterOfficerChooseNationalityComponent;
      this.criminal.params = { key: 'applications-oversea' }
      const { tabKey } = params;
      this.tabs = tabs?.applicationOversea?.map(m => ({ ...m, path: `/criminal-record/applications/applications-oversea/${m?.key}` }))
      const statusMoreThan = tabKey === 'done';
      this.statusMoreThan = statusMoreThan ? '>=' : '==';
      switch(tabKey){
        case 'paid':
          this.criminal.displayStatus = STATUS_OBJ?.PAID;
          break;
        case 'decree':
          this.criminal.displayStatus = STATUS_OBJ?.DECREE;
          break;
        case 'done':
          this.criminal.displayStatus = STATUS_OBJ?.RECEIVED;
          break;
      }
      await this.store.fetchOverseaApplication(this.criminal.displayStatus, this.statusMoreThan, res => {
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
    this.store.fetchOverseaApplicationMore(displayStatus,this.statusMoreThan, res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value && !this.isScanQrCode) {
      this.store.getSearchMolPayment(this.criminal.displayStatus, this.statusMoreThan, value.toUpperCase())
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
