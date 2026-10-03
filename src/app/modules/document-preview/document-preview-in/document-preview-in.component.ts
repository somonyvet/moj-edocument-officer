import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { DOCUMENT_ACTION_TYPE_OBJ } from 'src/app/dummy/config';
import { IComment, IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { groupBy, pageKey } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentApprovalComponent } from '../../document/document-approval/document-approval.component';
import { DocumentFormComponent } from '../../document/document-form/document-form.component';

@Component({
  selector: 'app-document-preview-in',
  templateUrl: './document-preview-in.component.html',
  styleUrls: ['./document-preview-in.component.scss']
})
export class DocumentPreviewInComponent implements OnInit, OnDestroy {
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
  form: FormGroup;
  groupSections = [];
  canCreateDocument: boolean = false;
  checkDocRef: IHeaderInformation = null;

  constructor(
    public store: DocumentStore,
    public auth: AuthStore,
    private route: ActivatedRoute,
    private router: Router,
    private ps: PrintService,
    private dialog: MatDialog,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,

  ) { }

  workPlaces = []
  workPlacesParentDoc = []
  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      comment: [null, Validators.required]
    })
    this.route.params.subscribe(async param => {
      const { id } = param;
      this.param = param;
      this.loadingPermission = true;
      const { uid, currentDepartment, employee, root, config } = this.auth;
      this.store.userPermission = [];
      this.disabledOption = currentDepartment?.ranking?.order > 2
      this.store.fetchHeaderDocumentStatistic(id)
      this.store.saveViewer(employee, id)
      await this.store.fetchHeader(id, uid, async res => {
        const { headerDocument } = this.store;
        const { workplaces, completedWorkplaceKeys, receivedWorkplaceKeys, receivedWorkplaceCompletedByDocKeys, files } = headerDocument;
        const createdReport = receivedWorkplaceCompletedByDocKeys?.find(m => m?.workplaceKey === currentDepartment?.key) || null;
        this.canCreateDocument = (receivedWorkplaceKeys.includes(uid) && !createdReport) || false;
        const findUserKey = headerDocument?.accountKeys.find(m => m === uid)
        if (!root && !findUserKey) {
          this.router.navigate(['/error/access-denied'])
          return;
        }
        await this.store.fetchDocument(createdReport?.key || null);
        this.store.fetchDocumentAccountPermission(headerDocument, config, data => {})

        this.imageAttachments = files.filter(f => f.type === 'image');
        this.docAttachments = files.filter(f => f.type === 'application');

        const workPlaceCheck = Array.isArray(workplaces) && workplaces?.filter(m => m?.allowUsed && m?.showInHeader && m?.isWorkplace).map(m => {
          const completed = completedWorkplaceKeys.includes(m?.key)
          return { ...m, completed }
        }) || [];
        this.workPlaces = workPlaceCheck
        this.workPlacesParentDoc = Array.isArray(workplaces) && workplaces?.filter(m => m?.allowUsed).map(m => {
          const completed = completedWorkplaceKeys.includes(m?.key)
          return { ...m, completed }
        }) || [];
        this.loadingHeader = false;
      })
      this.store.fetchDocumentsDoc(id, res => {
        this.loading = false;
      })
      this.store.fetchDocumentSections(id, param, res => {
        this.groupSections = orderBy(groupBy(res.filter(f => f.isHeader === false), 'sectionKey'), 'page_key');
      })
      this.store.fetchDocumentViewers(id, data => { })
      this.store.fetchDocumentStreamOfficers(id, data => {
      })

    })
  }

  ngOnDestroy() {
    const { fetchDocumentHeaderRef, fetchDocumentRef, fetchDocumentCommentRef, fetchDocumentViewersRef } = this.store;
    fetchDocumentHeaderRef && fetchDocumentHeaderRef.unsubscribe()
    fetchDocumentRef && fetchDocumentRef.unsubscribe()
    fetchDocumentCommentRef && fetchDocumentCommentRef.unsubscribe()
    fetchDocumentViewersRef && fetchDocumentViewersRef.unsubscribe()
  }


  userPermission;
  goBack() {
    const param = this.route.snapshot.queryParams
    if (param) {
      const { preview, url } = param;
      if (url) {
        this.router.navigate([url])
      } else if (preview) {
        this.router.navigate(['/documents/form/' + this.store.headerDocument?.key + '/' + this.store?.headerDocument?.workplace?.key + '/design'])
      } else {
        this.router.navigate(['/'])
      }
    } else {
      this.router.navigate(['/'])
    }
  }

  onEdit() {
    const { currentDepartment } = this.auth
    this.router.navigate(['/documents/form/' + this.store.headerDocument?.key + '/' + currentDepartment?.key + '/design'])
  }

  @ViewChild('fileComment', { static: true }) fileComment: ElementRef;
  SELECTED_FILES: any[] = [];
  onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      for (let index = 0; index < event.target.files.length; index++) {
        const element = event.target.files[index];
        this.SELECTED_FILES.push(element);
      }
      if (this.fileComment) this.fileComment.nativeElement.value = "";
    }
  }

  isReply: boolean = false;
  replyData = null;
  onReply(item) {
    this.replyData = item;
  }

  onCancelReply() {
    this.replyData = null;
  }
  onComment(f) {
    if (this.form.valid || this.SELECTED_FILES.length > 0) {
      const { comment } = f;
      const data: IComment = {
        key: this.ds.createId(),
        created_at: this.ds.serverTimestamp(),
        created_by: this.auth?.profile?.key,
        // updated_by: this.auth?.profile?.key,
        updated_at: this.ds.serverTimestamp(),
        date_key: this.auth?.profile?.key,
        page_key: pageKey(),
        isHeader: this.replyData ? false : true,
        headerKey: this.replyData?.key ?? null,
        text: comment ?? null,
        files: [],
        hasSent: false,
        displayName: this.auth?.profile?.displayName,
        status: STATUS_OBJ.ACTIVE,
      }

      this.store.onComment(this.store.headerDocument, data, this.SELECTED_FILES, success => {
        if (success) {
          this.SELECTED_FILES = [];
          this.replyData = null;
          this.form.reset();
        } else {
          alert('error')
        }
      })
    }
  }
  _removeFile(file) {
    this.SELECTED_FILES = this.SELECTED_FILES.filter(m => m.name !== file.name);
  }


  trackByIdx(i: number) {
    return i;
  }

  print() {
    this.ps.print('#print', 'a4')
  }

  selectionChangeReceivedJob(event) {
    const { selected, value } = event.option;
    const { uid } = this.auth;
    this.store.sectionRejectStatusChanged(uid, selected, value, (success, error) => {
      if (!success) alert(error)
      else {
        this.snackBar.open(`Document has been saved successful.`, "Done", {
          duration: 1000,
          verticalPosition: 'bottom',
          horizontalPosition: 'end',
        });
      }
    })
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
    this.dialog.open(DocumentFormComponent, {
      data: { headerDocument: this.store?.headerDocument, item: null },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '780px',
      height: '580px',
      disableClose: true,
    })
    // dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _confirmStreamDocument(status: any) {
    // const dialogRef = this.dialog.open(DocumentConfirmSubmittedComponent, {
    //   data: status,
    //   panelClass: 'cs-dialog-doc',
    //   width: '500px',
    //   disableClose: true,
    //   role: 'dialog',
    // })
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result === 'yes') {
    //     const { uid, employee, currentDepartment } = this.auth;
    //     const { headerDocument } = this.store;
    //     const item: IStreamDocument = {
    //       key: uid,
    //       created_at: this.ds.serverTimestamp(),
    //       created_by: uid,
    //       date_key: ConvertService.dateKey(),
    //       page_key: ConvertService.pageKey(),
    //       profile: toOfficer(employee),
    //       workplace: toDepartmentNoWorkplace(currentDepartment),
    //       streamStatus: status,
    //       documentHeaderKey: headerDocument.key,
    //       isOfficer: false,
    //     }
    //     this.store.streamDocument(item, (success, error) => {
    //       if (!success) alert(error)
    //       else {
    //         this.snackBar.open(`Document has been saved successful.`, "Done", {
    //           duration: 1000,
    //           verticalPosition: 'bottom',
    //           horizontalPosition: 'end',
    //         });
    //       }
    //     })
    //   }
    // })
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

