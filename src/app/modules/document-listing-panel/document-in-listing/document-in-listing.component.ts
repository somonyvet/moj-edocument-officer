
import { Component, Inject, OnInit, DOCUMENT, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { LIST_TYPE } from 'src/app/dummy/status';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocListingStore } from 'src/app/stores/document/doc-listing.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-in-listing',
    templateUrl: './document-in-listing.component.html',
    styleUrls: ['./document-in-listing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentInListingComponent implements OnInit {

  id;
  listTypeDoc;
  tabs = tabs.approveDoc;
  isApproveDoc:boolean = false;
  currentRoute: string;
  constructor(
    @Inject(DOCUMENT) public document: Document,
    public store: DocListingStore,
    public docStore: DocumentStore,
    private auth: AuthStore,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.currentRoute = this.router.url;
    if(this.currentRoute === '/document-panel-lists/not_yet_approved_doc' || this.currentRoute === '/document-panel-lists/already_approved_doc'){
      this.isApproveDoc = true;
    }else{
      this.isApproveDoc = false;
    }
    this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationStart) {
        }

        if (event instanceof NavigationEnd) {
            this.currentRoute = event.url;          
            if(this.currentRoute === '/document-panel-lists/not_yet_approved_doc' || this.currentRoute === '/document-panel-lists/already_approved_doc'){
              this.isApproveDoc = true;
            }else{
              this.isApproveDoc = false;
            }
        }

        if (event instanceof NavigationError) {
        }
    });
  }

  ngOnInit(): void {
    const { profile, currentDepartment } = this.auth
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.listTypeDoc = LIST_TYPE[`${this.id}`]
      this.store.fetchData(profile, currentDepartment, this.listTypeDoc)
    });

    // this.store.updateTestData();
  }

  viewDoc(item){
    // if(this.isApproveDoc){
    //   this.router.navigate(['/document/'+ item?.key])
    // }else{
    //   this.router.navigate(['/documents/form/'+ item?.key + '/' + this.docStore?.selectedDepartment?.key +'/design'])
    // }
    const {currentDepartment} = this.auth;

    this.router.navigate(['/documents/form/'+ item?.key + '/' + currentDepartment?.key +'/design'])

  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    const { profile, currentDepartment } = this.auth
    this.store.fetchMore(profile, currentDepartment, this.listTypeDoc)
  }

}
