import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
  selector: 'app-document-overview',
  templateUrl: './document-overview.component.html',
  styleUrls: ['./document-overview.component.scss']
})
export class DocumentOverviewComponent implements OnInit, OnDestroy {
  constructor(
    public store: DocumentStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    // const { uid,currentDepartment } = this.auth;
    // this.store.fetchUrgentDocument(uid);
    // this.store.fetchPinedDocument(uid);
    // this.store.fetchFinalDocument(uid);

  }

  ngOnDestroy(): void {
    this.store.subscriptionFetchPinedUrgentAndFinal()
  }


}
