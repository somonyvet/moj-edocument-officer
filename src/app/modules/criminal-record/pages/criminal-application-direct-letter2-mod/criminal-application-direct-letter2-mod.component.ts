import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityKhmerComponent } from '../../components/criminal-latter-officer-choose-nationality-khmer/criminal-latter-officer-choose-nationality-khmer.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { APPLICATION_TYPE } from 'src/app/dummy/status';

@Component({
  selector: 'app-criminal-application-direct-letter2-mod',
  templateUrl: './criminal-application-direct-letter2-mod.component.html',
  styleUrls: ['./criminal-application-direct-letter2-mod.component.scss']
})
export class CriminalApplicationDirectLetter2ModComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  tab = tabs?.decrees2Mod
  isScanQrCode = false;

  unClassify: boolean = false;
  MOD_workplace_key: string = null;
  constructor(public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const { config } = this.auth;
    this.MOD_workplace_key = config.department_defense?.key
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.title = 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស'
    this.criminal.componentDialog = CriminalLatterOfficerChooseNationalityKhmerComponent;
    this.criminal.params = { key: 'apply-direct' }

    this.route.params.subscribe(async params => {
      this.loading = true;
      this.params = params;
      if (params?.status === 'decree') {
        this.store.fetchCriminalRecords(STATUS_OBJ.DECREE, APPLICATION_TYPE[1], false, false, "<", res => {
          this.loading = false;
        }, this.MOD_workplace_key)
      }
      else if (params?.status === 'reviewed') {
        this.store.fetchCriminalRecords(STATUS_OBJ.CONFIRM_APPLICATION, APPLICATION_TYPE[1], false, false, false, res => {
          this.loading = false;
        }, this.MOD_workplace_key)
      }
      else if (params?.status === 'done') {
        this.store.fetchCriminalRecords(STATUS_OBJ.DECREE, APPLICATION_TYPE[1], false, false, ">=", res => {
          this.loading = false;
        }, this.MOD_workplace_key)
      }
      else if (params?.status === 'rejected') {
        this.store.fetchCriminalRecords(STATUS_OBJ.REJECTED, APPLICATION_TYPE[1], false, false, "==", res => {
          this.loading = false;
        }, this.MOD_workplace_key)
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
      this.store.fetchMoreCriminalRecords(STATUS_OBJ.REJECTED, APPLICATION_TYPE[1], false, false, "==", res => {
        this.loadingMore = false;
      }, this.MOD_workplace_key)
    }else if(this.unClassify){
      this.store.fetchMoreCriminalUnClassifyLetter2(res => {
        this.loadingMore = false;
      })
    }else{
      const { displayStatus } = this.criminal
      this.store.fetchMoreCriminalRecordsByOfficerLetter2(displayStatus, false, null, null, res => {
        this.loadingMore = false;
      }, this.MOD_workplace_key)
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
