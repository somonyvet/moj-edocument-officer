import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { programArrayObj } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalLatterOfficerChooseNationalityKhmerComponent } from '../../components/criminal-latter-officer-choose-nationality-khmer/criminal-latter-officer-choose-nationality-khmer.component';
import { DecreeConfirmDialogComponent } from '../../components/decree-confirm-dialog/decree-confirm-dialog.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-record-appy-data-entry',
    templateUrl: './criminal-record-appy-data-entry.component.html',
    styleUrls: ['./criminal-record-appy-data-entry.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordAppyDataEntryComponent implements OnInit {
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
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.criminal.newButtonName = `បញ្ចូលពាក្យស្នើសុំ`;
    this.criminal.componentDialog = this.auth.dataEntryMinistry?.key === programArrayObj.ministry_of_defense.key ? CriminalLatterOfficerChooseNationalityKhmerComponent : CriminalLatterOfficerChooseNationalityComponent;
    this.criminal.params = { key: 'apply-in-place' }
    this.store.fetchEntryType = 1;
    await this.store.fetchCriminalListing(null, null, null,STATUS_OBJ.APPLY,null,null,null,false, res => {
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

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    await this.store.fetchMoreCriminalListing(null, null, null,STATUS_OBJ.APPLY,null,null,null,false, res => {
      this.loadingMore = false;
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

  rejectApplication(item: any) {
    const dialogRef = this.dialog.open(DecreeConfirmDialogComponent, {
      width: '420px',
      panelClass: 'cs-dialog-wrapper',
      data: { title: 'បដិសេធពាក្យស្នើសុំ', memo: `សូមបញ្ជាក់ថាអ្នកចង់បដិសេធពាក្យស្នើសុំរបស់ <strong>${item?.last_name} ${item?.first_name}</strong> ?` },
    });
    dialogRef.afterClosed().subscribe(async res => {
      if (res === 'yes') {
        await this.store.updateStatus(item, STATUS_OBJ.REJECTED);
        this.store.data = this.store.data?.filter((m: any) => m?.key !== item?.key);
      }
    });
  }

}
