import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { IPageInfo } from 'ngx-virtual-scroller';
import { LIST_TYPE } from 'src/app/dummy/status';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocListingStore } from 'src/app/stores/document/doc-listing.store';

@Component({
  selector: 'app-approved-docs',
  templateUrl: './approved-docs.component.html',
  styleUrls: ['./approved-docs.component.scss']
})
export class ApprovedDocsComponent implements OnInit {
  tabs = tabs.docApproval;
  listTypeDoc;
  img = "../../../../../../assets/images/doc-cover.jpg"

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public store: DocListingStore,
    private auth: AuthStore,
  ) { }

  ngOnInit(): void {
    const { uid } = this.auth
    this.listTypeDoc = LIST_TYPE.not_yet_approved_doc
    this.store.fetchApprovalDocument(uid, 'completedByKeys',false);
  }

  ngOnDestroy() {
    const { fetchApprovalDocumentRef } = this.store;
    fetchApprovalDocumentRef && fetchApprovalDocumentRef.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    const { uid } = this.auth
    this.store.fetchApprovalDocumentMore(uid, 'completedByKeys',false)
  }

}
