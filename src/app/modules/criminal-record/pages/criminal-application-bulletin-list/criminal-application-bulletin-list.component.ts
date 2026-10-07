import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { APPLICATION_TYPE_OBJ, programArrayObj } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalLatterOfficerChooseNationalityComponent } from '../../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalLatterOfficerChooseNationalityKhmerComponent } from '../../components/criminal-latter-officer-choose-nationality-khmer/criminal-latter-officer-choose-nationality-khmer.component';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { tabs } from 'src/app/dummy/tabs';
import { CriminalLetterPrintByLanguageComponent } from '../../components/criminal-letter-print-by-language/criminal-letter-print-by-language.component';
import { MatDialog } from '@angular/material/dialog';
import { CriminalApplyExcelImportComponent } from '../../components/criminal-apply-excel-import/criminal-apply-excel-import.component';
import { DecreeConfirmDialogComponent } from '../../components/decree-confirm-dialog/decree-confirm-dialog.component';
@Component({
    selector: 'app-criminal-application-bulletin-list',
    templateUrl: './criminal-application-bulletin-list.component.html',
    styleUrls: ['./criminal-application-bulletin-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationBulletinListComponent implements OnInit, OnDestroy {
  tab = tabs?.laborEntry
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;
  isScanQrCode = false;

  tabParam: string = ''
  selectedKeys: string[] = [];

  constructor(
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
  }

  async ngOnInit(): Promise<void> {
    const { dataEntryOnly, assistantUser, laborHandler, isEmbassyUser, dataEntryMinistry } = this.auth;
    if(dataEntryOnly){
      this.tab = [ { ...this.tab[1], label: dataEntryMinistry?.text || this.tab[1].label } ]
      this.router.navigate(['/criminal-record/applications/bulletin-list/labor']);
    }else if(assistantUser){
      this.tab = [ { path: '/criminal-record/applications/bulletin-list/all', label: 'ឯកឧត្តមរដ្ឋលេខាធិការ', key: 'all' } ]
      this.router.navigate(['/criminal-record/applications/bulletin-list/all']);
    }else if(laborHandler){
      this.tab = [ this.tab[1],this.tab[2]]
      this.router.navigate(['/criminal-record/applications/bulletin-list/labor']);
    }else if(isEmbassyUser){
      this.tab = tabs.embassyUser
      this.router.navigate(['/criminal-record/applications/bulletin-list/all']);
    }else{
      this.tab = [this.tab[0]]
      this.router.navigate(['/criminal-record/applications/bulletin-list/all']);
    }
    this.route.params.subscribe(async params => {
      this.loading = true;
      const { recipient, isEmbassyUser } = this.auth;
      const { tabKey } = params;
      this.params = params;
      this.store.data = null
      this.criminal.newButtonName = recipient ? 'ចេញបង្កាន់ដៃ' : `បញ្ចូលពាក្យស្នើសុំ`;
      this.title = recipient ? 'បញ្ជីចេញបង្កាន់ដៃ' : 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស'
      this.criminal.componentDialog = recipient
        ? CriminalPaymentComponent
        : (this.auth.dataEntryMinistry?.key === programArrayObj.ministry_of_defense.key
          ? CriminalLatterOfficerChooseNationalityKhmerComponent
          : CriminalLatterOfficerChooseNationalityComponent);
      this.criminal.params = { key: 'apply-in-place' }
      this.tabParam = tabKey;
      if(assistantUser){
        const { uid } = this.auth;
        await this.store.fetchAssistantListing(STATUS_OBJ?.DRAFT, uid,null, true, res => {
        })
        this.loading = false;
      }else if(laborHandler){
        const { uid } = this.auth;
        const userKey = this.auth.laborHandler ? null : uid
        if(tabKey === 'labor'){
          this.store.fetchEntryType = 2;
          await this.store.fetchCriminalLaborListing(STATUS_OBJ?.APPLY, userKey, true, res => {
          })
          this.loading = false;
        }else{
          await this.store.fetchAssistantListing(STATUS_OBJ?.APPLY, null,3, true, res => {
          })
          this.loading = false;
        }
      }else if(dataEntryOnly){
        this.store.fetchEntryType = 3;
        const { uid } = this.auth;
        const userKey = this.auth.laborHandler ? null : uid
        await this.store.fetchCriminalLaborListing(STATUS_OBJ?.DRAFT, userKey, true, res => {
        })
        this.loading = false;
      }else if(isEmbassyUser){
        if(tabKey === 'all'){
          this.store.fetchEntryType = 1;
          let status = null;
          status = STATUS_OBJ?.PAID
          await this.store.fetchCriminalListing(null, null, null, status, null, null, null,true, res => {
          })
          this.loading = false;
        }else if(tabKey === 'embassy-withdraw'){
          this.store.fetchEntryType = 1;
          let status = null;
          status = STATUS_OBJ?.RECEIVED
          await this.store.fetchCriminalListing(null, null, null, status, '==', null, null,true, res => {
          })
          this.loading = false;
        }else if(tabKey === 'embassy-done'){
          this.store.fetchEntryType = 1;
          let status = null;
          status = STATUS_OBJ?.DONE
          await this.store.fetchCriminalListing(null, null, null, status, '==', null, null,true, res => {
          })
          this.loading = false;
        }
      }else{
        if(tabKey === 'all'){
          this.store.fetchEntryType = 1;
          let status = null;
          await this.store.fetchCriminalListing(null, null, null, status, null, null, null,false, res => {
          })
          this.loading = false;
        }else if(tabKey === 'labor'){
          this.store.fetchEntryType = 2;
          const { uid } = this.auth;
          const userKey = this.auth.laborHandler ? null : uid
          await this.store.fetchCriminalLaborListing(STATUS_OBJ?.APPLY, userKey, true, res => {
          })
          this.loading = false;
        }else if(tabKey === 'assistant'){
          this.store.fetchEntryType = 3;
          await this.store.fetchAssistantListing(STATUS_OBJ?.APPLY, null,3, true, res => {
          })
          this.loading = false;
        }
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
    if(this.loadingMore) return;
    const { dataEntryOnly,assistantUser,laborHandler,isEmbassyUser } = this.auth;
    this.loadingMore = true;
    const { recipient, employee } = this.auth;
    const entryByKey = recipient ? employee?.key : null;
    if(assistantUser){
      this.store.fetchEntryType = 3;
      const { uid } = this.auth;
      await this.store.fetchMoreAssistantListing(STATUS_OBJ?.DRAFT, uid, null ,true, res => {
      })
      this.loadingMore = false;
    }else if(laborHandler){
      const { uid } = this.auth;
      const userKey = this.auth.laborHandler ? null : uid
      if(this.tabParam === 'labor'){
        this.store.fetchEntryType = 2;
        await this.store.fetchMoreLaborListing(STATUS_OBJ?.DRAFT, userKey, true, res => {
        })
        this.loadingMore = false;
      }else{
        await this.store.fetchMoreAssistantListing(STATUS_OBJ?.APPLY, null, 3,true, res => {
        })
        this.loadingMore = false;
      }
    }else if(dataEntryOnly){
      this.store.fetchEntryType = 2;
      const { uid } = this.auth;
      const userKey = this.auth.laborHandler ? null : uid
      await this.store.fetchMoreLaborListing(STATUS_OBJ?.DRAFT,userKey,true, res => {
      })
      this.loadingMore = false;
    } else if(isEmbassyUser){
      if(this.tabParam === 'all'){
        this.store.fetchEntryType = 1;
        let status = null;
        status = STATUS_OBJ?.PAID
        await this.store.fetchMoreCriminalListing(null, null, null, status,null, null, null,true, res => {
        })
        this.loadingMore = false;
      }else if(this.tabParam === 'embassy-withdraw'){
        this.store.fetchEntryType = 1;
        let status = null;
        status = STATUS_OBJ?.RECEIVED
        await this.store.fetchMoreCriminalListing(null, null, null, status,'==', null, null,true, res => {
        })
        this.loadingMore = false;
      }else if(this.tabParam === 'embassy-done'){
        this.store.fetchEntryType = 1;
        let status = null;
        status = STATUS_OBJ?.DONE
        await this.store.fetchMoreCriminalListing(null, null, null, status,'==', null, null,true, res => {
        })
        this.loadingMore = false;
      }
    }else{
      if(this.tabParam === 'all'){
        this.store.fetchEntryType = 1;
        let status = null;
        await this.store.fetchMoreCriminalListing(null, null, null, null,null, entryByKey, null,false, res => {
        })
        this.loadingMore = false;
      }else if(this.tabParam === 'labor'){
        this.store.fetchEntryType = 2;
        const { uid } = this.auth;
        const userKey = this.auth.laborHandler ? null : uid
        await this.store.fetchCriminalLaborListing(STATUS_OBJ?.DRAFT,userKey,true, res => {
        })
        this.loadingMore = false;
      }else if(this.tabParam === 'assistant'){
        await this.store.fetchMoreAssistantListing(STATUS_OBJ?.APPLY, null, 3,true, res => {
        })
        this.loadingMore = false;
      }
    }
  }

  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    this.isScanQrCode = false
    if (value && !this.isScanQrCode) {
      const { assistantUser,laborHandler,uid ,config, isEmbassyUser} = this.auth;
      if(assistantUser){
        this.store.fetchSearchAssistantListing(value.toUpperCase(),uid, res => {})
      }else if(laborHandler){
        this.store.fetchSearchLaborHandlerListing(value.toUpperCase(),config.department_labor?.key, res => {})
      }else if(isEmbassyUser){
        this.store.fetchSearchCriminalListing(null, null, null,value.toUpperCase(),null, res => {
        })
      }else{
        this.store.fetchSearchCriminalListing(null, null, null,value.toUpperCase(),null, res => {
        })
      }
    }
  }

  onScanQrCode(value) {
    this.isScanQrCode = false
    if(value){
      this.isScanQrCode = true
      this.searchString = null;
      this.store.emptySearch = false
      this.router.navigate([`/criminal-record/applications/bulletin-list/all/${value}/criminal-record`])
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

  openExcelImport() {
    const { uid, laborHandler } = this.auth;
    this.dialog.open(CriminalApplyExcelImportComponent, {
      width: '80vw',
      maxWidth: '80vw',
      height: '90vh',
      maxHeight: '90vh',
      disableClose: true,
      role: 'dialog',
      panelClass: 'cs-dialog-wrapper',
      position: {
        left: '10%',
        right: '0',
      },
      data: { tabKey: this.tabParam },
    }).afterClosed().subscribe(async res => {
      if (res === 'refresh') {
        this.loading = true;
        const userKey = laborHandler ? null : uid;
        this.store.fetchEntryType = 3;
        await this.store.fetchCriminalLaborListing(STATUS_OBJ?.DRAFT, userKey, true, () => {
          this.loading = false;
        })
      }
    })
  }

  canBatchApply(item: any): boolean {
    return item?.status?.key === STATUS_OBJ.DRAFT.key && item?.application_type?.key === APPLICATION_TYPE_OBJ['application-no-ii']?.key;
  }

  isSelected(item: any): boolean {
    return this.selectedKeys.includes(item?.key);
  }

  toggleSelect(item: any, checked: boolean) {
    if (checked) {
      if (!this.selectedKeys.includes(item?.key)) this.selectedKeys.push(item?.key);
      this.submitSelectedBatchletter2();
    } else {
      this.selectedKeys = this.selectedKeys.filter(k => k !== item?.key);
    }
  }

  submitSelectedBatchletter2() {
    if (!this.selectedKeys.length) return;
    const items = this.store.data?.filter((m: any) => this.selectedKeys.includes(m?.key)) || [];
    const names = items.map((m: any) => `${m?.last_name || ''} ${m?.first_name || ''}`.trim()).filter(Boolean);
    const memo = names.length === 1
      ? `សូមបញ្ជាក់ថាអ្នកចង់ដាក់ស្នើសុំសម្រាប់ <strong>${names[0]}</strong> ?`
      : `សូមបញ្ជាក់ថាអ្នកចង់ដាក់ស្នើសុំសម្រាប់ <strong>${names.join(', ')}</strong> ?`;
    const dialogRef = this.dialog.open(DecreeConfirmDialogComponent, {
      width: '420px',
      panelClass: 'cs-dialog-wrapper',
      data: { title: 'ដាក់ពាក្យស្នើសុំ', memo },
    });
    dialogRef.afterClosed().subscribe(async res => {
      if (res === 'yes') {
        await this.store.updateStatusBatch(items, STATUS_OBJ.APPLY);
        this.store.data = this.store.data?.filter((m: any) => !this.selectedKeys.includes(m?.key));
        this.selectedKeys = [];
      } else {
        this.selectedKeys = [];
      }
    });
  }

  printLetter3(item){
    const dialogRef = this.dialog.open(CriminalLetterPrintByLanguageComponent, {
      data: { criminalRecords: [item] },
      panelClass: 'cs-dialog-doc',
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      role: 'dialog',
    });
  }
}