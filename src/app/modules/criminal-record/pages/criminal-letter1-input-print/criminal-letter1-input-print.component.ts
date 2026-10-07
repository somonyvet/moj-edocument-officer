import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalStore } from '../../stores/criminal.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';

@Component({
    selector: 'app-criminal-letter1-input-print',
    templateUrl: './criminal-letter1-input-print.component.html',
    styleUrls: ['./criminal-letter1-input-print.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalLetter1InputPrintComponent implements OnInit {
  tabs = tabs.letter3InputPrint
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ព្រឹត្តិបត្រលេខ ១`;
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
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.criminal.params = { key: 'letter3-input-print' }
      const { tabKey } = params;
      this.tabs = tabs?.letter3InputPrint?.map(m => ({ ...m, path: `/criminal-record/applications/letter1/${m?.key}` }))
      this.criminal.newButtonName = `បញ្ចូលពាក្យស្នើសុំ`;
      this.criminal.componentDialog = CriminalLatterOfficerChooseNationalityComponent;
      this.store.fetchCriminalRecords1InputPrintOfficer(res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.criminal.displayStatus = null;
    this.store.unsubscribeSearch();
    await this.store.unsubscribe();
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { displayStatus } = this.criminal
    this.store.fetchMoreCriminalRecords1InputPrintOfficer(res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value && !this.isScanQrCode) {
      this.store.fetchSearchLetter1CriminalListing(value.toUpperCase(), res => {
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
