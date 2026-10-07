import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { tabs } from 'src/app/dummy/tabs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { addDays, toYearKey } from 'src/app/shared/services/mapping.service';
import { MatDialog } from '@angular/material/dialog';
import { StartProcessDocDialogComponent } from 'src/app/shared/components/start-process-doc-dialog/start-process-doc-dialog.component';

@Component({
    selector: 'app-criminal-record-paid-online',
    templateUrl: './criminal-record-paid-online.component.html',
    styleUrls: ['./criminal-record-paid-online.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordPaidOnlineComponent implements OnInit {
  tabs = tabs.process_doc_online
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `បង់ប្រាក់ Online`;
  STATUS_OBJ = STATUS_OBJ;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  focusSearch: boolean;
  statusMoreThan: string = null;
  isScanQrCode = false;
  holidays: any = [];
  searchResult = [];

  search_name: boolean = false
  tabKey: string = 'paid';

  constructor(
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private router: Router,
    private db: DatabaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.criminal.firstParams = { key: 'paid' }
    const { serverDateTime } = this.auth
    this.holidays = await this.store.fetchHoliday(toYearKey(serverDateTime))
    if(serverDateTime.getMonth() == 11){
      const nextYearHoliday = await this.store.fetchHoliday(toYearKey(serverDateTime)+1)
      this.holidays = this.holidays?.concat(nextYearHoliday?.length ? nextYearHoliday : [])
    }
    this.route.params.subscribe(async params => {
      this.loading = true;
      const { recipient } = this.auth;
      this.criminal.newButtonName = recipient ? 'ចេញបង្កាន់ដៃ' : `បញ្ចូលពាក្យស្នើសុំ`;
      this.title = recipient ? 'បញ្ជីបង់ប្រាក់ Online' : 'បញ្ជីបង់ប្រាក់ Online'
      this.criminal.componentDialog = recipient ? CriminalPaymentComponent : CriminalLatterOfficerChooseNationalityComponent;
      this.criminal.params = { key: 'application-payment' }
      const { tabKey } = params;
      this.tabKey = tabKey;
      this.tabs = tabs?.process_doc_online?.map(m => ({ ...m, path: `/criminal-record/applications/payment-online/${m?.key}` }))
      const statusMoreThan = tabKey === 'process';
      this.statusMoreThan = statusMoreThan ? '>=' : '==';
      const displayStatus = tabKey === 'paid' ? STATUS_OBJ.PAID : STATUS_OBJ.START_PROCESS;
      this.criminal.displayStatus = displayStatus;

      let startPeriod = new Date(serverDateTime)
      startPeriod?.setHours(7);
      startPeriod?.setMinutes(0);
      startPeriod?.setSeconds(0);
      startPeriod?.setMilliseconds(0);

      const endPeriod = new Date(serverDateTime)
      endPeriod?.setHours(16);
      endPeriod?.setMinutes(0);
      endPeriod?.setSeconds(0);
      endPeriod?.setMilliseconds(0);

      if( tabKey == 'paid-today'){
        await this.store.fetchPaidOnlinePeriod(new Date(startPeriod), new Date(endPeriod),res=>{
          this.loading = false;
        })
      }else{
        await this.store.fetchCriminalPaidOnline(displayStatus, null, null, null, this.statusMoreThan, res => {
          this.loading = false;
        })
      }
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.searchSubscription?.unsubscribe()
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

    const { serverDateTime } = this.auth

    const endPeriod = new Date(serverDateTime)
    endPeriod?.setHours(16);
    endPeriod?.setMinutes(0);
    endPeriod?.setSeconds(0);
    endPeriod?.setMilliseconds(0);

    if(this.tabKey === 'paid-today'){
      this.store.fetchMoreCriminalPaidOnlinePeriod(endPeriod, res => {
        this.loadingMore = false;
      })
    }else{
      this.store.fetchMoreCriminalPaidOnline(displayStatus, null, null, null, this.statusMoreThan, res => {
        this.loadingMore = false;
      })
    }
  }

  trackByIdx(i) {
    return i;
  }

  searchSubscription: any = null
  async onSearch(value) {
    this.searchSubscription?.unsubscribe()
    this.searchString = value;
    this.searchResult = [];
    if(this.search_name){
      this.searchSubscription = this.store.searchPaidOnlineApplicationKeyword(value?.toUpperCase()).valueChanges().subscribe(res=>{
        this.searchResult = res
      })
    }else{
      if(value?.length > 8){
        this.searchSubscription = this.store.searchPaidOnlineApplication(value).valueChanges().subscribe(res=>{
          this.searchResult = res
        })
      }
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

  startProcessDoc(item){
    const dialogRef= this.dialog.open(StartProcessDocDialogComponent,{
      data: {
        selectedCriminal: item,
        holidays: this.holidays,
      },
      autoFocus: false,
      disableClose: true,
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      role: 'dialog',
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  async checkAmount(){
    const docs = await this.store?.getPaidOnlineNotYetProcess()
    alert(`ចំនួនពាក្យស្នើសុំបង់ប្រាក់ Online រួចមិនទាន់បានដាក់ដំណើរការឯកសារ ${docs?.length}`)
  }

}