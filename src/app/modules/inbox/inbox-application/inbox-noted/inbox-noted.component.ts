import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPageInfo } from 'ngx-virtual-scroller';
import { AuthStore } from 'src/app/stores/auth.store';
import { InboxStore } from 'src/app/stores/document/index.store';

@Component({
  selector: 'app-inbox-noted',
  templateUrl: './inbox-noted.component.html',
  styleUrls: ['./inbox-noted.component.scss']
})
export class InboxNotedComponent implements OnInit, OnDestroy {
  loading: boolean = true;

  constructor(public auth: AuthStore,
    public store: InboxStore,
    @Inject(DOCUMENT) public document: Document,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const { uid } = this.auth;
    this.route.params.subscribe(params => {
      const { periodKey } = params;
      const { selectedDepartment } = this.store;
      this.store.fetchInboxDocuments(selectedDepartment?.key, uid, periodKey, res => {
        this.loading = false;
      })
    })
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.documents.length - 1) return;
    const { uid, currentDepartment } = this.auth
    this.store.fetchMoreInbox(uid, currentDepartment?.key)
  }
  
  ngOnDestroy() {
    this.store.unsubscribeInbox()
  }

}
