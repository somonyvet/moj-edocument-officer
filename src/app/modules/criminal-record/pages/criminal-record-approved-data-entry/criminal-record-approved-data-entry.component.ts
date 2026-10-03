import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-approved-data-entry',
  templateUrl: './criminal-record-approved-data-entry.component.html',
  styleUrls: ['./criminal-record-approved-data-entry.component.scss']
})
export class CriminalRecordApprovedDataEntryComponent implements OnInit {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,

  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.criminal.newButtonName = `បញ្ចូលពាក្យស្នើសុំ`;
    this.criminal.componentDialog = CriminalLatterOfficerChooseNationalityComponent;

    this.criminal.params = { key: 'apply-in-place' }
    this.store.fetchEntryType = 2;
    await this.store.fetchCriminalListing(null, null, null, STATUS_OBJ.RECEIVED,null,null,null,false, res => {
      this.loading = false;
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

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    this.store.fetchMoreCriminalListing(null, null, null, STATUS_OBJ.RECEIVED,null,null,null,false, res => {
      this.loading = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value) {
      this.store.fetchSearchCriminalListing(null, null, null, value.toUpperCase(), res => {
      })
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

}
