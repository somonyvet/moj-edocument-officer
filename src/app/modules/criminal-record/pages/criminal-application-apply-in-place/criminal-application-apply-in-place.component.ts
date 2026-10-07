import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-application-apply-in-place',
    templateUrl: './criminal-application-apply-in-place.component.html',
    styleUrls: ['./criminal-application-apply-in-place.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationApplyInPlaceComponent implements OnInit {
  tabs = tabs.criminalApplication
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;
  STATUS_OBJ = STATUS_OBJ;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  focusSearch: boolean;
  statusMoreThan: string = '>=';
  isScanQrCode = false

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

      const statusMoreThan = tabKey === 'apply';
      this.statusMoreThan = statusMoreThan ? '<=' : '>=';
      const displayStatus = tabKey === 'apply' ? STATUS_OBJ.CONFIRM_APPLICATION : STATUS_OBJ.REVIEW;
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
    this.store.fetchMoreCriminalRecordsByOfficer(displayStatus, null, false, null, this.statusMoreThan, res => {
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
    if (value) {
      this.isScanQrCode = true
      this.searchString = null;
      this.store.emptySearch = false
      this.router.navigate([`/criminal-record/applications/apply-in-place/apply/${value}/criminal-record`])
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

}
