import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { tabs } from 'src/app/dummy/tabs';
import { isValidUrl } from '../../../../shared/services/mapping.service';
import { APPLICATION_TYPE_OBJ } from 'src/app/dummy/status';

@Component({
    selector: 'app-print-verified',
    templateUrl: './print-verified.component.html',
    styleUrls: ['./print-verified.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrintVerifiedComponent implements OnInit {
  tabs = tabs.criminalApplication
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `បញ្ជីបានចុះថ្ងៃផុតកំណត់`;
  STATUS_OBJ = STATUS_OBJ;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  focusSearch: boolean;
  statusMoreThan: string = '>=';
  isScanQrCode = false
  processRouteUrl: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private router: Router

  ) { }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.criminal.params = { key: 'apply-in-place' }
      const { tabKey } = params;
      this.tabs = tabs?.criminalApplication?.map(m => ({ ...m, path: `/criminal-record/applications/apply-in-place/${m?.key}` }))
      this.criminal.newButtonName = `បញ្ចូលពាក្យស្នើសុំ`;
      this.criminal.componentDialog = CriminalLatterOfficerChooseNationalityComponent;
      await this.store.fetchCriminalDoExpireListing(APPLICATION_TYPE_OBJ['application-no-iii'].key, res => {
      })
      this.loading = false;
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

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    await this.store.fetchMoreCriminalDoExpireListing(APPLICATION_TYPE_OBJ['application-no-iii'].key, res => {
    })
    this.loadingMore = false;
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value && !this.isScanQrCode) {
      this.store.fetchSearchDoExpireListing(null, false, null, value.toUpperCase(), res => {
      })
    }
  }

  async onScanQrCode(value) {
    this.processRouteUrl = true;
    this.isScanQrCode = false
    if(!isValidUrl(value)) {
      this.processRouteUrl = false;
      return;
    }
    const url = new URL(value);
    const verify_key = url.searchParams.get('key')
    if (verify_key) {
      const doc = await this.store?.getDocumentVerify(verify_key)
      if(doc?.key){    
        this.isScanQrCode = true;
        this.searchString = null;
        this.store.emptySearch = false
        this.router.navigate([`/criminal-record/applications/print-verify/all/${doc?.criminal_header_key}/criminal-record`])
        this.processRouteUrl = false;
      }
    }else{
      this.processRouteUrl = false;
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }
}
