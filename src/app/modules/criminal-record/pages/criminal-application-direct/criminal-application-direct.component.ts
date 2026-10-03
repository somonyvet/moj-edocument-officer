import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';

@Component({
  selector: 'app-criminal-application-direct',
  templateUrl: './criminal-application-direct.component.html',
  styleUrls: ['./criminal-application-direct.component.scss']
})
export class CriminalApplicationDirectComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  tab = tabs?.data_entry_input_data;
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
      if (this.criminal?.firstParams?.key === 'decree') {
        this.tab = tabs?.data_entry_input_data?.map(m => ({ ...m, path: `/criminal-record/decree-record/application/app/${m?.key}` }))
      }

      if (this.criminal?.firstParams?.key === 'folder') {
        this.tab = tabs?.data_entry_input_data?.map(m => ({ ...m, path: `/criminal-record/folder/out-of-folder/${m?.key}` }))
        this.tab = this.tab.filter(m=> m.key === 'fill-decree')
      }

      if (params?.status === 'unfill') {
        this.unClassify = false;
        this.criminal.displayStatus =  STATUS_OBJ.PAID_UN_FILLED;
        await this.store.fetchCriminalRecordsByOfficer( STATUS_OBJ.PAID_UN_FILLED, null, false, null, null, res => {
          this.loading = false;
        })
      }
      else if (params?.status === 'fill') {
        this.unClassify = false;
        this.criminal.displayStatus =  STATUS_OBJ.PAID;
        await this.store.fetchCriminalRecordsByOfficer( STATUS_OBJ.PAID, null, false, null, null, res => {
          this.loading = false;
        })
      } else if (params?.status === 'fill-decree') {
        this.unClassify = true;
        this.store.fetchCriminalUnClassify(res => {
          this.loading = false;
        })
      } else {
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
      this.store.fetchMoreCriminalRecordsByOfficer(displayStatus, null, false, null, null, res => {
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
      this.store.fetchSearchCriminalListing(null, null, null, value.toUpperCase(), res => {
      })
    }
  }

  onScanQrCode(value) {
    this.isScanQrCode = false
    if(value){
      this.isScanQrCode = true
      this.searchString = null;
      this.store.emptySearch = false
      // this.router.navigate([`/criminal-record/applications/bulletin-list/${value}/criminal-record`])
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

}
