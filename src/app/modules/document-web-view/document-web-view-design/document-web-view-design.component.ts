import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { PRIORITY_OBJECT_ARR } from 'src/app/dummy/config';
import { docStatusObj } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-web-view-design',
    templateUrl: './document-web-view-design.component.html',
    styleUrls: ['./document-web-view-design.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentWebViewDesignComponent implements OnInit {

  param: any = null;
  loading: boolean = true;
  PRIORITY_DATA = PRIORITY_OBJECT_ARR;
  loadingHeader: boolean = false;
  loadingSection: boolean = false;
  loadingPermission: boolean = false;

  canRelease: boolean;
  workPlaces = []
  pendingJobs = []
  process: boolean = false;
  constructor(
    private route: ActivatedRoute,
    public store: DocumentStore,
    public auth: AuthStore,
    private router: Router,
    public authService: AuthService,
    private fun: AngularFireFunctions,

  ) { }



  ngOnInit(): void {
    // generate token for test params
    // this.authService.authRef().currentUser.then(res => console.log(`res.getIdTokenResult()`, res.getIdTokenResult()))

    this.route.queryParams.subscribe(param => {
      const { token } = param;
      if (token) {
        this.fun
          .httpsCallable('loginWithToken')({ token })
          .toPromise()
          .then((success) => {
            if (success != 'Unauthorized') {
              this.authService.authRef().signInWithCustomToken(success).then((res) => {
                const { user } = res;
                this.auth.uid = user.uid;
                this.auth.user = user;
                this.fetchInit();
              });
            }
          });
      } else {
        // for link no token
        // this.fetchInit();
      }
    })
  }

  fetchInit = () => {
    this.route.params.subscribe(async param => {
      const { id } = param;
      this.param = param;
      this.loadingPermission = true;
      const { uid, employee, config,root } = this.auth;
      this.store.fetchHeader(id, uid, async res => {
        const { headerDocument } = this.store;
        this.canRelease = headerDocument?.doc_status?.key === docStatusObj.hold?.key;
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
      })
      this.store.fetchDocumentsDoc(id, res => {
        this.loading = false;
      })
      // this.store.fetchWorkplaceReceivedJob(id, data => { })
      // this.store.fetchDocumentSections(id, res => {
      //   this.loadingSection = false;
      // })
      // this.store.fetchDocumentComment(id, data => { })
      // this.store.fetchDocumentViewers(id, data => { })

    })
  }

  ngOnDestroy() {
    const { fetchDocumentHeaderRef, fetchDocumentRef, fetchDocumentAccountPermissionRef, fetchWorkplaceReceivedJobRef, fetchDocumentSectionRef
      , fetchDocumentCommentRef, fetchDocumentViewersRef } = this.store;
    fetchDocumentHeaderRef && fetchDocumentHeaderRef.unsubscribe()
    fetchDocumentRef && fetchDocumentRef.unsubscribe()
    fetchDocumentAccountPermissionRef && fetchDocumentAccountPermissionRef.unsubscribe()
    fetchWorkplaceReceivedJobRef && fetchWorkplaceReceivedJobRef.unsubscribe()
    fetchDocumentSectionRef && fetchDocumentSectionRef.unsubscribe()
    fetchDocumentCommentRef && fetchDocumentCommentRef.unsubscribe()
    fetchDocumentViewersRef && fetchDocumentViewersRef.unsubscribe()
  }

}
