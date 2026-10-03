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

@Component({
  selector: 'app-criminal-application-direct-letter2',
  templateUrl: './criminal-application-direct-letter2.component.html',
  styleUrls: ['./criminal-application-direct-letter2.component.scss']
})
export class CriminalApplicationDirectLetter2Component implements OnInit, OnDestroy {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  tab = tabs?.decrees2
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
      this.params = params;
      if (params?.status === 'decree') {
        // every application of this letter type that has not been decreed yet
        this.store.fetchCriminalRecords(STATUS_OBJ.DECREE, APPLICATION_TYPE[1], false, false, "<", res => {
          this.loading = false;
        })
      }
      else if (params?.status === 'reviewed') {
        this.store.fetchCriminalRecords(STATUS_OBJ.CONFIRM_APPLICATION, APPLICATION_TYPE[1], false, false, false, res => {
          this.loading = false;
        })
      }
      else if (params?.status === 'done') {
        this.store.fetchCriminalRecords(STATUS_OBJ.DECREE, APPLICATION_TYPE[1], false, false, ">=", res => {
          this.loading = false;
        })
      }
      // sent back by a later approver: the decree officer corrects it and re-submits the flow
      else if (params?.status === 'rejected') {
        const { currentDepartment } = this.auth;
        this.store.fetchCriminalRejectedToWorkplaceData(currentDepartment?.key, res => {
          this.loading = false;
        }, APPLICATION_TYPE[1]?.key)
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
    if(this.params?.status === 'rejected'){
      const { currentDepartment } = this.auth;
      this.store.fetchMoreCriminalRejectedToWorkplaceData(currentDepartment?.key, res => {
        this.loadingMore = false;
      }, APPLICATION_TYPE[1]?.key)
    }else if(this.unClassify){
      this.store.fetchMoreCriminalUnClassifyLetter2(res => {
        this.loadingMore = false;
      })
    }else{
      const { displayStatus } = this.criminal
      this.store.fetchMoreCriminalRecordsByOfficerLetter2(displayStatus, false, null, null, res => {
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
      this.store.fetchSearchCriminalListingLetter2(null, null, value.toUpperCase(), null, res => {
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
