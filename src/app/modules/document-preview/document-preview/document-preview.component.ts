import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { toJS } from 'mobx';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { DOCUMENT_ACTION_TYPE_OBJ } from 'src/app/dummy/config';
import { IComment, IStreamDocument } from 'src/app/interfaces/document/document.interface';
import { ConvertService, orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { getDocStatusKeyByUser, getPermission, groupBy, pageKey, toDepartmentNoWorkplace, toOfficer } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentApprovalComponent } from '../../document/document-approval/document-approval.component';
import { DocumentConfirmSubmittedComponent } from '../document-confirm-submitted/document-confirm-submitted.component';

@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.scss']
})
export class DocumentPreviewComponent implements OnInit, OnDestroy {
  param: any = null;
  loadingHeader: boolean = true;
  loading: boolean = true;
  defaultImg = PHOTO_LIB.EMPTY;

  DOCUMENT_ACTION_TYPE_OBJ = DOCUMENT_ACTION_TYPE_OBJ;
  canRelease: boolean = false;
  canApprove: boolean = false;

  disabled: boolean = false;
  workplaces: any[] = [];
  disabledOption: boolean = false;
  loadingPermission: boolean = false;

  workplacesApproved: any[] = [];
  form: FormGroup;
  groupSections = [];

  openSideComment:boolean = false;

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
  pendingJobs = []

  userOption;
  userPermission;

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      comment: [null, Validators.required]
    })

    this.route.params.subscribe(async param => {
      const { id } = param;
      this.param = param;
      this.loadingPermission = true;
      const { uid, currentDepartment, employee, config, root } = this.auth;
      this.store.saveViewer(employee, id)
      this.disabledOption = currentDepartment?.ranking?.order > 2
      this.store.fetchHeaderDocumentStatistic(id)
      await this.store.fetchHeader(id, uid, async res => {
        const { workplaces, completedWorkplaceKeys, accountKeys } = this.store.headerDocument
        this.store.fetchDocumentAccountPermission(this.store.headerDocument, config, data => {
          this.userPermission = data.find(m => m.key === uid)
          this.userOption = getPermission(this.userPermission, data, currentDepartment, this.store.headerDocument)
        })

        const workPlaceCheck = Array.isArray(workplaces) && workplaces?.filter(m => m?.allowUsed && m?.isWorkplace).map(m => {
          const completed = completedWorkplaceKeys.includes(m?.key)
          return { ...m, completed }
        }) || [];
        this.workPlaces = orderBy(workPlaceCheck, "ranking.order", "desc")
        this.calStatus()
        if (!root && accountKeys.filter(m => m === uid).length === 0 && !root) {
          this.router.navigate(['/error/access-denied'])
          this.loadingPermission = false;
          return;
        }
        this.store.fetchDocumentStreamOfficers(id, data => {
          if (this.store.headerDocument) {
            this.calStatus()
          }
        })
        this.loadingHeader = false;
      })
      this.store.fetchDocumentsDoc(id, res => {
        this.loading = false;
      })
      this.store.fetchDocumentSections(id, param, res => {
        this.groupSections = orderBy(groupBy(res.filter(f => f.isRejected === false), 'sectionKey'), 'page_key');
      })
      this.store.fetchWorkplaceReceivedJob(id, data => { })
      this.store.fetchDocumentViewers(id, data => { })
    })

  }


  ngOnDestroy() {
    const { fetchDocumentHeaderRef, fetchDocumentRef, fetchDocumentCommentRef, fetchDocumentViewersRef, subscribeDocumentStatisticRef } = this.store;
    fetchDocumentHeaderRef && fetchDocumentHeaderRef.unsubscribe()
    fetchDocumentRef && fetchDocumentRef.unsubscribe()
    fetchDocumentCommentRef && fetchDocumentCommentRef.unsubscribe()
    fetchDocumentViewersRef && fetchDocumentViewersRef.unsubscribe()
    subscribeDocumentStatisticRef && subscribeDocumentStatisticRef.unsubscribe()
  }


  // const permissionApproval = () => {
  //   const { verifyFromAssistantDepartment, verifyFromAssistantGeneral, doc_status } = props.document || {}
  //   const permission = props.userPermission?.permission

  //   let hasSign = props.userPermissionData.find(m => (m.workplaceKey === props.currentDepartment?.key && m.head && props.userPermission?.completedTask))
  //   if (props.userPermission?.head && verifyFromAssistantDepartment && props.currentDepartment?.ranking?.order === 2) {
  //     const signedAssistance = props.userPermissionData.find((m) => m.workplaceKey === props.currentDepartment?.key && m.assistant && m.completedTask)
  //     hasSign = !signedAssistance
  //   }

  //   if (props.userPermission?.head && verifyFromAssistantGeneral && props.currentDepartment?.ranking?.order === 1) {
  //     const signedAssistance = props.userPermissionData.find((m) => m.workplaceKey === props.currentDepartment?.key && m.assistant && m.completedTask)
  //     hasSign = !signedAssistance
  //   }

  //   const userOption = {
  //     disabledBtn: permission?.key === 1 || props.userPermission?.completedTask || hasSign || doc_status?.key < getDocStatusKeyByUser(props.currentDepartment),
  //   }
  //   return userOption;
  // }

  // userPermission;
  // permissionApproval() {
  //   const { headerDocument } = this.store
  //   const { verifyFromAssistantDepartment, verifyFromAssistantGeneral, doc_status } = headerDocument
  //   const { uid, currentDepartment } = this.auth
  //   const docs = this.store.userPermission
  //   const userPermission = docs.find(m => m.key === uid)
  //   this.userPermission = userPermission;
  //   const permission = userPermission && userPermission.permission || null
  //   let hasSign: any = docs.find(m => (m.workplaceKey === currentDepartment?.key && m.head && userPermission?.completedTask))
  //   if (userPermission?.head && verifyFromAssistantDepartment && currentDepartment?.ranking?.order === 2) {
  //     const signedAssistance = docs.find((m) => m.workplaceKey === currentDepartment?.key && m.assistant && m.completedTask)
  //     hasSign = !signedAssistance
  //   }
  //   if (userPermission?.head && verifyFromAssistantGeneral && currentDepartment?.ranking?.order === 1) {
  //     const signedAssistance = docs.find((m) => m.workplaceKey === currentDepartment?.key && m.assistant && m.completedTask)
  //     hasSign = !signedAssistance
  //   }
  //   this.userOption = {
  //     disabledBtn: permission?.key === 1 || userPermission?.completedTask || hasSign || doc_status?.key < getDocStatusKeyByUser(currentDepartment),
  //   }
  // }

  goBack() {
    const param = this.route.snapshot.queryParams;
    if (param && param?.preview) {
      this.router.navigate(['/documents/form/' + this.store.headerDocument?.key + '/' + this.store?.headerDocument?.workplace?.key + '/design'])
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

  calStatus() {
    const { uid, currentDepartment } = this.auth;
    const { documentStreamOfficers } = this.store;
    const workplaces = this.store?.headerDocument?.workplaces?.filter(m => m?.requestApproved) || [];
    const headerOfficer = currentDepartment?.headerOfficer;
    const headOfWorkplace = headerOfficer?.find(m => m?.key === uid)
    const signOfDocument = documentStreamOfficers.find(m => m?.key === uid);
    this.disabled = signOfDocument ? true : false;
    this.workplacesApproved = workplaces;
    this.workplaces = this.store?.headerDocument?.workplaces?.filter(m => m?.order > 0.5);
    const doc_status = this.store?.headerDocument?.doc_status;

    if (signOfDocument) {
      this.canApprove = signOfDocument?.streamStatus?.key !== 1;
      this.canRelease = signOfDocument?.streamStatus?.key === 1;
    } else {
      this.canApprove = headOfWorkplace && workplaces.find(m => m?.key === currentDepartment?.key) ? true : false;
      switch (currentDepartment?.ranking?.order) {
        case 3:
          this.canRelease = doc_status?.key === 2 && headerOfficer && !workplaces.find(m => m?.key === currentDepartment?.key) ? true : false;
          break;
        default:
          break;
      }
    }
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

  _confirmStreamDocument(status: any) {
    const dialogRef = this.dialog.open(DocumentConfirmSubmittedComponent, {
      data: status,
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        const { uid, employee, currentDepartment } = this.auth;
        const { headerDocument } = this.store;
        const item: IStreamDocument = {
          key: uid,
          created_at: this.ds.serverTimestamp(),
          created_by: uid,
          date_key: ConvertService.dateKey(),
          page_key: ConvertService.pageKey(),
          profile: toOfficer(employee),
          workplace: toDepartmentNoWorkplace(currentDepartment),
          streamStatus: status,
          documentHeaderKey: headerDocument.key,
          isOfficer: false,
        }
        this.store.streamDocument(item, (success, error) => {
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
    })
  }


  setStyleSidebar(bol:boolean){
    if(!bol)
      return {
        right:'-500px'
      }
    else
      return {
        right:0
      }
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
