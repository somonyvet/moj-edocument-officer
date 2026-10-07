import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT_TYPE_OBJECT, PRIORITY_OBJECT_ARR } from 'src/app/dummy/config';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentConfirmReleasedComponent } from '../document-confirm-released/document-confirm-released.component';
import { DocumentFormComponent } from '../document-form/document-form.component';
import { DocumentStreamFormComponent } from '../document-stream-form/document-stream-form.component';
import { toJpeg } from 'html-to-image';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { docStatusObj } from 'src/app/dummy/status';
@Component({
    selector: 'app-document-application-design',
    templateUrl: './document-application-design.component.html',
    styleUrls: ['./document-application-design.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationDesignComponent implements OnInit, OnDestroy {
  param: any = null;
  loading: boolean = true;
  PRIORITY_DATA = PRIORITY_OBJECT_ARR;
  loadingHeader: boolean = true;
  loadingSection: boolean = true;
  loadingPermission: boolean = true;

  workPlaces = []
  pendingJobs = []
  process: boolean = false;
  finalDocument: boolean = false;
  editDocument: boolean = false;
  backUrl: string[] = [];
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    public store: DocumentStore,
    public auth: AuthStore,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private storage: FireStorageService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      this.backUrl = queryParams?.backUrl ? JSON.parse(queryParams?.backUrl) : null;
    })
    this.route.params.subscribe(async param => {

      const { id } = param;
      this.param = param;
      this.loadingPermission = true;
      const { uid, employee, config, root } = this.auth;
      // this.store.fetchHeaderDocumentStatistic(id)
      this.store.fetchHeader(id, uid, async res => {
        const { headerDocument } = this.store;

        // const rEditDocument = headerDocument?.is_request_edit || false
        // if (rEditDocument)
        //   this.finalDocument = false


        this.editDocument = headerDocument?.doc_status?.key === 1 ? true : false;
        this.store.fetchDocumentAccountPermission(headerDocument, config, data => {
          if (data.length === 0 && !root) {
            this.router.navigate(['/error/access-denied'])
            return;
          } else if (data.filter(m => m?.accountKey === uid).length === 0 && !root) {
            this.router.navigate(['/error/access-denied'])
            return;
          } else {
            if (this.loadingPermission) {
              this.store.saveViewer(employee, id)
            }
            this.loadingPermission = false;
          }
          this.loadingHeader = false;
        })

        const docParent = headerDocument?.doc_parent || null;
        await this.store.fetchDocument(docParent)
      })
      this.store.fetchDocumentsDoc(id, res => {
        this.loading = false;
      })
      // this.store.fetchWorkplaceReceivedJob(id, data => { })
      await this.store.fetchDocumentSections(id, param, res => {
        this.loadingSection = false;
      })
      this.store.fetchDocumentViewers(id, data => { })

    })
  }

  _goBack() {
    if (this.backUrl?.length > 0) {
      this.router.navigate([this.backUrl[0]])
    } else {
      this.router.navigate([`/edoc`])
    }
  }

  ngOnDestroy() {
    const { fetchDocumentHeaderRef, fetchDocumentRef, fetchDocumentAccountPermissionRef, fetchWorkplaceReceivedJobRef, fetchDocumentSectionRef
      , fetchDocumentCommentRef, fetchDocumentViewersRef, subscribeDocumentStatisticRef } = this.store;
    fetchDocumentHeaderRef && fetchDocumentHeaderRef.unsubscribe()
    fetchDocumentRef && fetchDocumentRef.unsubscribe()
    fetchDocumentAccountPermissionRef && fetchDocumentAccountPermissionRef.unsubscribe()
    fetchWorkplaceReceivedJobRef && fetchWorkplaceReceivedJobRef.unsubscribe()
    fetchDocumentSectionRef && fetchDocumentSectionRef.unsubscribe()
    fetchDocumentCommentRef && fetchDocumentCommentRef.unsubscribe()
    fetchDocumentViewersRef && fetchDocumentViewersRef.unsubscribe()
    subscribeDocumentStatisticRef && subscribeDocumentStatisticRef.unsubscribe()
    this.store.subscribeFetchDocumentComment()
    this.store.userPermission = [];
  }

  onActivate(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
          window.scrollTo(0, pos - 50);
        } else {
          window.clearInterval(scrollToTop);
        }
      }, 16);
    }
  }


  onCreateDocument(item?: IHeaderInformation) {
    let form: any = item?.doc_type?.key === DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO?.key ? DocumentFormComponent : DocumentFormComponent;
    this.dialog.open(form, {
      data: { item: item || null },
      panelClass: 'cs-dialog-doc',
      width: '780px',
      height: '580px',
      disableClose: true,
      role: 'dialog',
    });
  }

  async _onPinDoc() {
    const { uid } = this.auth;
    await this.store.pinAndUnpinDocument(uid, this.store.headerDocument, (success, error) => {

    })
  }

  _onPriorityChanged(status: any) {
    const { uid } = this.auth;
    const { headerDocument } = this.store;
    if (status?.key === headerDocument?.priority?.key) return;
    this.store.priorityDocument(status, uid, (success, error) => {
      if (!success) alert(error)
    })
  }

  _onConfirmRelease() {
    const { workplaces } = this.store;
    const incomplete = workplaces?.find(m => m?.isActive && !m?.hasApproved)
  
    if (incomplete) {
      alert("សូមត្រួតពិនិត្យចរន្តឯកសារឡើងវិញ ចរន្តឯកសារពុំទាន់គ្រប់លក្ខខណ្ឌដើម្បីដាក់ស្នើសុំ")
      return;
    }

    if (this.store?.headerDocument?.isMoreReport && !this.store?.headerDocument?.more_report_isHeader) {
      alert("សូមត្រួតពិនិត្យចរន្តឯកសារឡើងវិញ អ្នកអាចដាក់សំណើលើឯកភាពដើមតែប៉ុណ្ណោះ")
      return
    }

    const dialogRef = this.dialog.open(DocumentConfirmReleasedComponent, {
      data: null,
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    })
    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'yes') {
        this.process = true;
        const { uid, employee, profile } = this.auth;
        const { headerDocument } = this.store;
        const oldFile = this.store.headerDocument?.coverFile?.filename || null;
        if (oldFile) {
          this.storage.storageRef(oldFile).delete()
        }
        const node: any = document.getElementById('doc-template-wrapper');
        const dataUrl = await toJpeg(node, { quality: 0.95, backgroundColor: "#fff", skipFonts: true });
        const filename = `${headerDocument?.documentNo}`;
        const downloadURL = await this.store.uploadBase64(dataUrl.split(',')[1], filename);
        headerDocument.coverFile = {
          filename: `/documents_covers/${filename}`, downloadURL
        }
        this.store.releasedDocument(headerDocument, uid, profile, employee, (success, error) => {
          this.process = false;
          if (!success) alert(error)
          else {

            this.snackbar.open(`Document has been saved successful.`, "Done", {
              duration: 1000,
              verticalPosition: 'bottom',
              horizontalPosition: 'end',
            });
          }
        })
      }
    })
  }

  _onRequestEditDoc() {
    const dialogRef = this.dialog.open(DocumentConfirmReleasedComponent, {
      data: { title: "ស្នើកែសម្រួលខ្លឹមសារ" },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    })
    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'yes') {
        this.process = true;
        const { employee } = this.auth;
        const { headerDocument } = this.store;

        this.store.requestEditDoc(headerDocument, employee, true, (success, res) => {
          this.process = false;
          if (success) {
            this.store.headerDocument = {
              ...headerDocument,
              is_request_edit: res.is_request_edit,
              request_edit_status: res.request_edit_status,
            }
          }
          if (!success) alert(res)
          else {

            this.snackbar.open(`Document is editable.`, "Done", {
              duration: 1000,
              verticalPosition: 'bottom',
              horizontalPosition: 'end',
            });
          }
        })
      }
    })
  }

  _closeEditDoc() {
    const dialogRef = this.dialog.open(DocumentConfirmReleasedComponent, {
      data: { title: "បញ្ចប់ការកែសម្រួលខ្លឹមសារ" },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    })
    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'yes') {
        this.process = true;
        const { employee } = this.auth;
        const { headerDocument } = this.store;

        this.store.requestEditDoc(headerDocument, employee, false, (success, res) => {
          this.process = false;
          if (success) {
            this.store.headerDocument = {
              ...headerDocument,
              is_request_edit: res.is_request_edit,
              request_edit_status: res.request_edit_status,
            }
          }
          if (!success) alert(res)
          else {

            this.snackbar.open(`Document is completed.`, "Done", {
              duration: 1000,
              verticalPosition: 'bottom',
              horizontalPosition: 'end',
            });
          }
        })
      }
    })
  }

  _onConfirmStream() {
    this.dialog.open(DocumentStreamFormComponent, {
      data: null,
      panelClass: 'cs-dialog-doc',
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
  }

}
