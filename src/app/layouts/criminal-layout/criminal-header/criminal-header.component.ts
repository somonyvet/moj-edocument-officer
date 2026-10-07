import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { Subscription } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { LanguageStore } from 'src/app/languages/translate.store';
import { ChangePasswordComponent } from 'src/app/shared/components/change-password/change-password.component';
import { removeObjArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ChatStore } from 'src/app/stores/chat.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { NotificationStore } from 'src/app/stores/document/notification.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { FileManager } from 'src/app/stores/fileDrive.store';

@Component({
    selector: 'app-criminal-header',
    templateUrl: './criminal-header.component.html',
    styleUrls: ['./criminal-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalHeaderComponent implements OnInit, OnDestroy {
  @Input() activeAccount: boolean;
  @ViewChild('fileInput') fileInput: ElementRef;


  languages = [
    { key: 'kh', name: 'ភាសាខ្មែរ', icon: '../../../../assets/logo/cambodia_flag.svg' },
    { key: 'en', name: 'English', icon: '../../../../assets/logo/english_flag.svg' },
  ]

  uploadPercent: any;
  form: UntypedFormGroup;
  search: AbstractControl;
  subscriptionRef: Subscription = null;
  START_UPLOAD: boolean = false;
  SELECTED_PHOTO: any = null;
  changeSwitchDepartment: boolean = false;
  routerKey: string = null;
  defaultImg = '../../../../assets/images/GDI-Doc-Cover-2.jpg';
  searching: boolean = false;
  searchData: any[] = [];
  isCompany = false;

  photoUrl:any=null;

  constructor(
    public lang: LanguageStore,
    private fb: UntypedFormBuilder,
    private router: Router,
    private chat: ChatStore,
    public notify: NotificationStore,
    public auth: AuthStore,
    public store: DocumentStore,
    public storage: FireStorageService,
    public ds: DataService,
    private officerStore: OfficerStore,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public fileStore: FileManager,
  ) { }

  async ngOnInit(): Promise<void> {
    // const { uid, root, isCompany } = this.auth;
    // this.isCompany = isCompany;
    // this.form = this.fb.group({
    //   search: [null, [Validators.required]]
    // })
    // this.search = this.form.controls['search'];
    // await this.store.fetchRecentSearchData(uid);
    // this.subscriptionRef = this.search?.valueChanges
    //   .pipe(
    //     debounceTime(300),
    //     tap(() => false),
    //     switchMap(value => this.store.fetchSearch(value, root, uid, data => {
    //       if (value) {
    //         this.searching = true;
    //         this.searchData = data;
    //       } else {
    //         this.searchData = [];
    //         this.searching = false;
    //       }
    //     }))
    //   ).subscribe();
  }

  ngOnDestroy() {
    const { fetchNotificationRef } = this.notify;
    this.subscriptionRef && this.subscriptionRef.unsubscribe()
    fetchNotificationRef && fetchNotificationRef.unsubscribe()
  }

  onChangeLanguage(language) {
    this.lang.chooseLanguage(language?.key)
  }

  onNotification(type: string) {
    this.auth.updateNotify(type)
  }

  _onFetchDocument() {
    const { uid, currentDepartment } = this.auth;
    this.store.fetchDocumentInWorkPlace(uid, currentDepartment?.key, res => { })
  }

  fetchMore(event: IPageInfo) {
    if (event.endIndex !== this.notify?.notifications.length - 1) return;
    else {
      this.notify.fetchMore(this.auth.uid, this.auth.currentDepartment?.key);
    }
  }

  async onDocument(item: any) {
    const { uid } = this.auth;
    const { transactionKey, type } = item;
    const doc = await this.store.fetchDocument(transactionKey)
    const receivedWorkplaceKeys = doc?.receivedWorkplaceKeys || [];

    if (receivedWorkplaceKeys.find(m => m === uid)) {
      this.router.navigate([`/document/preview/${transactionKey}/${doc?.workplace?.key}/1/design`])
    } else {
      this.router.navigate([`/document/${transactionKey}`])
    }

    // if (!type && doc) {
    //   if (doc?.peopleKeys?.find(m => m === uid)) {
    //     // this.router.navigate([`/documents/form/${transactionKey}/${doc?.workplace?.key}/design`])
    //     this.router.navigate([`/documents/form/${transactionKey}/comments`])
    //   } else if (doc?.receivedWorkplaceKeys?.find(m => m === uid)) {
    //     this.router.navigate([`/inbox/${transactionKey}`])
    //   }
    // }
  }

  async onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_PHOTO = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.photoUrl = event.target.result;
      }
      const file = await this.storage.upload([this.SELECTED_PHOTO])
      const { uid } = this.auth;
      const data: any = {
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        photo: file[0]
      }
      this.officerStore.saveUpdatePhoto(uid, data, async (success, res) => {
        if (success) {
          this.snackBar.open(`Avatar has been updated successful.`, "Done", { duration: 3000 });
          if (this.auth?.profile?.photo?.downloadUrl) {
            await this.storage.deleteFile(this.auth?.profile?.photo?.downloadUrl);
          }
          this.SELECTED_PHOTO = null;
        } else {
          alert(res);
        }
      })
      this.fileInput.nativeElement.value = "";
    }
  }


  goSearchDetail(item) {
    const { uid } = this.auth;
    if (item) {
      this.store.setRecentUserSearch(item, uid);
    }
  }

  goShowDetail(item) {
    const strArr = item?.children_docs?.join(",") || []
    this.router.navigate([`/file-manager/my_files/${item.key}`], {
      queryParams:
      {
        children_docs: strArr || null,
      }
    })
  }

  removeRecentSearch(item) {
    const { uid } = this.auth;
    if (item) {
      this.store.removeRecentUserSearch(item, uid);
      this.store.documentRecentSearch = removeObjArray(this.store.documentRecentSearch, item.key);
      // this.store.fetchRecentSearchData(uid);
    }
  }



  onLogOut() {
    this.chat.conversations = [];
    this.chat.selectedPeople = [];
    this.chat.chatRoom = [];
    this.chat.chatRoom = null;
    this.chat.conversations = null;
    this.chat.selectedPeople = null;
    this.auth.signOut(() => {
      this.router.navigate([this.auth.logoutRoute])
    });
  }

  onChangeApps(item: any) {
    if (item?.key === this.auth?.currentDepartment?.key) return;
    this.auth.changeDepartment(item, (success, error) => {
      // if (success) {
      //   if (this.changeSwitchDepartment) {
      //     switch (this.routerKey) {
      //       case 'workplace':
      //         this.router.navigate([`/${this.routerKey}/${item.key}/docs`])
      //         break;
      //       case 'inbox':
      //         this.router.navigate([`/${this.routerKey}/${item.key}/all/last7docs`])
      //         break;
      //       case 'documents':
      //         this.router.navigate([`/documents/memo/${item?.key}/all/me/all`], { queryParams: { periodKey: 'all' } })
      //         break;
      //       default:
      //         break;
      //     }
      //   }
      // }
    })
  }



  changePassword() {
    let dialogRef = this.dialog.open(ChangePasswordComponent, {
      data: null,
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  onCreateCompany() {
    this.router.navigate([`/company/${this.auth?.uid}`])
  }

}
