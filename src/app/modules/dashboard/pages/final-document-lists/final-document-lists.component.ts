import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-final-document-lists',
    templateUrl: './final-document-lists.component.html',
    styleUrls: ['./final-document-lists.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FinalDocumentListsComponent implements OnInit {
  queryParams: any = { periodKey: 'all' };
  loading: boolean = true;
  constructor(
    public store: DocumentStore,
    public auth: AuthStore,
    private route: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    const { uid } = this.auth;
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams || { periodKey: 'all' };
      this.store.fetchHeaderFinalDocuments(uid, this.queryParams?.periodKey);
    })
  }


}
