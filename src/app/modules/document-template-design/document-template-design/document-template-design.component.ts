import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIORITY_OBJECT_ARR } from 'src/app/dummy/config';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-template-design',
    templateUrl: './document-template-design.component.html',
    styleUrls: ['./document-template-design.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentTemplateDesignComponent implements OnInit {

  param: any = null;
  loading: boolean = false;
  PRIORITY_DATA = PRIORITY_OBJECT_ARR;
  loadingHeader: boolean = false;
  loadingSection: boolean = true;
  loadingPermission: boolean = false;

  canRelease: boolean;
  workPlaces = []
  pendingJobs = []
  process: boolean = false;
  finalDocument: boolean = false;
  editDocument: boolean = false;
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
    this.route.params.subscribe(async param => {
      const { id } = param;
      this.param = param;
      const { uid, employee, config, root } = this.auth;
      this.store.fetchTemplateHeader(id, uid, async res => {
        const { headerDocument } = this.store;
      })
      await this.store.fetchDocumentTemplateSections(id, res => {
        this.loadingSection = false;
      })
    })
  }

  ngOnDestroy() {
    const { fetchDocumentHeaderRef, fetchDocumentRef, fetchDocumentAccountPermissionRef, fetchWorkplaceReceivedJobRef, fetchDocumentSectionRef
      , fetchDocumentCommentRef, fetchDocumentViewersRef,subscribeDocumentStatisticRef } = this.store;
    fetchDocumentHeaderRef && fetchDocumentHeaderRef.unsubscribe()
    fetchDocumentRef && fetchDocumentRef.unsubscribe()
    fetchDocumentAccountPermissionRef && fetchDocumentAccountPermissionRef.unsubscribe()
    fetchWorkplaceReceivedJobRef && fetchWorkplaceReceivedJobRef.unsubscribe()
    fetchDocumentSectionRef && fetchDocumentSectionRef.unsubscribe()
    fetchDocumentCommentRef && fetchDocumentCommentRef.unsubscribe()
    fetchDocumentViewersRef && fetchDocumentViewersRef.unsubscribe()
    subscribeDocumentStatisticRef && subscribeDocumentStatisticRef.unsubscribe()
    this.store.subscribeFetchDocumentComment()
  }

  goBack(){
    this.router.navigate(['/apps/templates'])
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



  async _onPinDoc() {
    const { uid } = this.auth;
    await this.store.pinAndUnpinDocument(uid,this.store.headerDocument, (success, error) => {

    })
  }




}
