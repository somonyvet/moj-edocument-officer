import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { APPLICATION_TYPE } from 'src/app/dummy/status';

/** the listing header follows the sub panel the officer is on */
const TITLE_OF_STATUS = {
  listing: `ព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច`,
  reviewed: `បានពិនិត្យរួចរាល់`,
  done: `ចុះនិទ្ទេសរួច`,
  rejected: `បដិសេធត្រឡប់មកវិញ`,
}

@Component({
    selector: 'app-criminal-application-direct-letter3-business',
    templateUrl: './criminal-application-direct-letter3-business.component.html',
    styleUrls: ['./criminal-application-direct-letter3-business.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationDirectLetter3BusinessComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  loadingMore: boolean = false;
  title: string = `ព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច`;

  params: any = null;
  searchString: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  isScanQrCode = false;

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
    this.criminal.componentDialog = recipient ? CriminalPaymentComponent : CriminalLatterOfficerChooseNationalityComponent;
    this.criminal.params = { key: 'apply-direct' }

    this.route.params.subscribe(params => {
      this.loading = true;
      this.params = params;
      this.title = TITLE_OF_STATUS[params?.status] || `ព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច`;
      if (params?.status === 'listing') {
        // ធុរកិច្ច listing: criminal_record_category = business & application_type = 3, paid only
        this.store.fetchCriminalBusinessDecree(res => {
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
      }
      // sent back by a later approver: the officer corrects it and re-submits the flow
      else if (params?.status === 'rejected') {
        const { currentDepartment } = this.auth;
        this.store.fetchCriminalRejectedToWorkplaceData(currentDepartment?.key, res => {
          this.loading = false;
        }, APPLICATION_TYPE[2]?.key)
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
    if (this.params?.status === 'rejected') {
      const { currentDepartment } = this.auth;
      this.store.fetchMoreCriminalRejectedToWorkplaceData(currentDepartment?.key, res => {
        this.loadingMore = false;
      }, APPLICATION_TYPE[2]?.key)
    } else if (this.params?.status === 'reviewed' || this.params?.status === 'done') {
      const { displayStatus } = this.criminal;
      this.store.fetchMoreCriminalRecordsByOfficer(displayStatus, APPLICATION_TYPE[2], false, null, null, res => {
        this.loadingMore = false;
      })
    } else {
      this.store.fetchMoreCriminalBusinessDecree(res => {
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
