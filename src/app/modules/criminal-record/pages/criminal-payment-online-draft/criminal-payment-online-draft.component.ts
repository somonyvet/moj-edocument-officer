import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { StartProcessDocDialogComponent } from 'src/app/shared/components/start-process-doc-dialog/start-process-doc-dialog.component';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { toYearKey } from 'src/app/shared/services/mapping.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-payment-online-draft',
    templateUrl: './criminal-payment-online-draft.component.html',
    styleUrls: ['./criminal-payment-online-draft.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalPaymentOnlineDraftComponent implements OnInit {
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
    await this.store.unsubscribe();
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

      await this.store.fetchPaidOnlineDraftPeriod(res => {
        this.loading = false;
      })
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
    this.store.fetchMoreCriminalPaidOnlineDraftPeriod(res => {
      this.loading = false;
    })
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

  // onScanQrCode(value) {
  //   console.log('scan qr',value)
  //   this.isScanQrCode = false
  //   this.searchString = value;
  //   this.searchResult = [];
  //   this.searchSubscription?.unsubscribe()
  //   if (value) {
  //     this.isScanQrCode = true;
  //     this.searchSubscription = this.store.searchPaidOnlineApplicationKeyword(value?.toUpperCase()).valueChanges().subscribe(res=>{
  //       this.searchResult = res
  //       console.log('res',res)
  //     })
  //   }
  // }

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

  onSearchReceipt(data: any){
    console.log("onSearchReceipt data",data);
    this.findApplication(data);
  };

  async findApplication(receipt_ref: string){
    const res = await this.store.findApplicationFromReceiptKey(receipt_ref);
    if(!res?.key){
      alert("Record not found in the system.");
      return;
    }
    this.router.navigate([`/criminal-record/applications/bulletin-list/all/${res?.key}/criminal-record`])
  }
}
