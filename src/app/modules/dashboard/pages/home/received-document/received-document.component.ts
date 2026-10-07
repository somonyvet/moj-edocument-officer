import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DOCUMENT_ACTION_TYPE_OBJ } from 'src/app/dummy/config';
import { tabs } from 'src/app/dummy/tabs';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { DocumentApprovalComponent } from 'src/app/modules/document/document-approval/document-approval.component';
import { DocumentFormComponent } from 'src/app/modules/document/document-form/document-form.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DocumentAddBlockNoteComponent } from 'src/app/shared/components/document-add-block-note/document-add-block-note.component';
import { WorkplaceAccountFormComponent } from 'src/app/shared/components/workplace-account-form/workplace-account-form.component';
import { orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { groupBy } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
    selector: 'app-received-document',
    templateUrl: './received-document.component.html',
    styleUrls: ['./received-document.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})



export class ReceivedDocumentComponent implements OnInit {
  param: any = null;
  loadingHeader: boolean = true;
  loading: boolean = true;
  defaultImg = PHOTO_LIB.EMPTY;
  emptyCover = PHOTO_LIB.EMPTY_COVER;

  DOCUMENT_ACTION_TYPE_OBJ = DOCUMENT_ACTION_TYPE_OBJ;
  canRelease: boolean = false;
  canApprove: boolean = false;

  disabled: boolean = false;
  workplaces: any[] = [];
  disabledOption: boolean = false;
  loadingPermission: boolean = false;
  docAttachments = [];
  imageAttachments = [];

  workplacesApproved: any[] = [];
  form: UntypedFormGroup;
  groupSections = [];
  canCreateDocument: boolean = false;
  checkDocRef: IHeaderInformation = null;

  openSideComment: boolean = false;

  isAllowRead: boolean = true;

  userPermission
  constructor(
    public store: DocumentStore,
    public auth: AuthStore,
    private route: ActivatedRoute,
    private router: Router,
    private ps: PrintService,
    private dialog: MatDialog,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
    public memoStore: MemoStore,

  ) { }


  workPlaces = []
  workPlacesParentDoc = []

  tab = tabs.documentPreviewTab
  blockNoteItem = null

  ngOnInit(): void {
    this.form = this.fb.group({
      comment: [null, Validators.required]
    })
    this.route.params.subscribe(async param => {
      this.loading = true;
      this.loadingPermission = true;
      this.isAllowRead = true;
      this.openSideComment = false;
      const { docKey } = param;
      this.param = param;
      const parent = this.route.parent?.snapshot?.params || null;
      this.tab = tabs.documentPreviewTab?.map(m => { return { ...m, path: `/edoc/documents/${parent?.tabKey}/${parent?.docTypeKey}/preview/${docKey}/${m?.path}` } })

      const { uid, currentDepartment, employee, root, config } = this.auth;
      this.store.userPermission = [];
      this.disabledOption = currentDepartment?.ranking?.order > 2
      this.store.fetchHeaderDocumentStatistic(docKey)
      this.store.saveViewer(employee, docKey)
      await this.store.fetchHeader(docKey, uid, async res => {
        const { headerDocument } = this.store;
        const { workplaces, completedWorkplaceKeys, receivedWorkplaceCompletedByDocKeys, files, receivedWorkplaceKeys, doc_parent } = headerDocument;
        this.store.fetchDocumentSections(docKey, param, async res => {
          this.groupSections = orderBy(groupBy(res.filter(f => f.isHeader === false), 'sectionKey'), 'page_key');
          const createdReport = receivedWorkplaceCompletedByDocKeys?.find(m => m?.workplaceKey === currentDepartment?.key) || null;
          this.canCreateDocument = (receivedWorkplaceKeys.includes(uid) && !createdReport) || false;
          this.store.checkHaveBlockNote(headerDocument, currentDepartment, uid, res => {
            this.blockNoteItem = res
          })
          this.store.fetchDocumentAccountPermission(headerDocument, config, data => { })
        })
        const findUserKey = headerDocument?.accountKeys.find(m => m === uid)
        this.imageAttachments = files.filter(f => f.type === 'image');
        this.docAttachments = files.filter(f => f.type === 'application');
        if (!root && !findUserKey) {
          this.router.navigate(['/error/access-denied'])
          this.isAllowRead = false
          this.loading = false;
          return;
        }
        const workPlaceCheck = Array.isArray(workplaces) && workplaces?.filter(m => m?.allowUsed && m?.showInHeader && m?.isWorkplace).map(m => {
          const completed = completedWorkplaceKeys.includes(m?.key)
          return { ...m, completed }
        }) || [];
        this.workPlaces = workPlaceCheck
        this.workPlacesParentDoc = Array.isArray(workplaces) && workplaces?.filter(m => m?.allowUsed).map(m => {
          const completed = completedWorkplaceKeys.includes(m?.key)
          return { ...m, completed }
        }) || [];
        const docParent = doc_parent || null;
        await this.store.fetchDocument(docParent)
        this.loadingHeader = false;
      })
      this.store.fetchDocumentsDoc(docKey, res => {
        this.loading = false;
      })

      this.store.fetchDocumentViewers(docKey, data => { })
      this.store.fetchDocumentStreamOfficers(docKey, data => {
      })

    })
  }

  async ngOnDestroy() {
    const { fetchDocumentHeaderRef, fetchDocumentRef, fetchDocumentCommentRef, fetchDocumentViewersRef, checkHaveBlockNoteRef, documentAccountPermissionRef } = this.store;
    fetchDocumentHeaderRef && fetchDocumentHeaderRef.unsubscribe()
    fetchDocumentRef && fetchDocumentRef.unsubscribe()
    fetchDocumentCommentRef && fetchDocumentCommentRef.unsubscribe()
    fetchDocumentViewersRef && fetchDocumentViewersRef.unsubscribe()
    checkHaveBlockNoteRef?.unsubscribe()
    documentAccountPermissionRef?.unsubscribe();
    Promise.resolve()
  }

  _onPreviewDocument() {
    this.router.navigate([`/edoc/preview/${this.store?.selectedDocument?.key}/${this.store?.selectedDocument?.workplace?.key}/1/design`], { queryParams: { backUrl: JSON.stringify([this.router.url]) } })
  }

  trackByIdx(i: number) {
    return i;
  }

  print() {
    this.ps.print('#print', 'a4')
  }

  _onAccount() {
    const dialogRef = this.dialog.open(WorkplaceAccountFormComponent, {
      data: null,
      panelClass: 'cs-dialog-doc',
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
  }

  approvalDoc() {
    const dialogRef = this.dialog.open(DocumentApprovalComponent, {
      data: { item: this.userPermission },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  receivedMemo() {
    if (this.checkDocRef || (this.blockNoteItem && !this.blockNoteItem?.blockNoteDoc && !this.blockNoteItem?.haveBlockNoteExist)) return;
    this.dialog.open(DocumentFormComponent, {
      data: { headerDocument: this.store?.headerDocument, item: null },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '780px',
      height: '580px',
      disableClose: true,
    })
  }

  setStyleSidebar(bol: boolean) {
    if (!bol)
      return {
        right: '-500px'
      }
    else
      return {
        right: 0
      }
  }

  createBlockNote(item?: any) {
    if (!this.blockNoteItem.isOwnDepartment) return
    const dialogRef = this.dialog.open(DocumentAddBlockNoteComponent, {
      data: item,
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  onEdit() {
    const { headerDocument } = this.store;
    this.router.navigate(['/edoc/form/' + headerDocument?.key + '/' + headerDocument?.workplace?.key + '/design'], { queryParams: { backUrl: JSON.stringify([this.router.url]) } })
  }

  _onDelete() {
    const { headerDocument } = this.store;
    if (headerDocument?.doc_status?.key !== 1) return;
    const ref = this.dialog.open(DeleteComponent, {
      data: { isDelete: false, name: headerDocument?.documentTitle, memo: `តើលោកអ្នកចង់លុបឯកសារនោះចេញពីប្រព័ន្ធមែនទេ` },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteDocument(headerDocument, this.auth.uid, (success, error) => {
          if (success) {
            this.snackBar.open(`Document has been deleted successful.`, "Done", { duration: 1000 });
          } else {
            alert(error)
          }
        })
      }
    })
  }

  gStyle(customStylesItems: Array<any>) {
    let cs = null
    const customStyles = customStylesItems && customStylesItems.length > 0 ? customStylesItems.filter(m => !m.isNormal) : []
    if (customStyles && customStyles.length > 0) {
      customStyles.map((m, index) => {
        if (index === 0) cs = `{ `
        cs += ` "${m?.code}": "${m?.value}" `
        if (index + 1 < customStyles.length) cs += ` , `
        if (index + 1 === customStyles.length) cs += ` }`
      })

      const obj = JSON.parse(cs);
      return obj
    }
  }
  
}
