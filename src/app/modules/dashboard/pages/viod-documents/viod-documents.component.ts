import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
  selector: 'app-viod-documents',
  templateUrl: './viod-documents.component.html',
  styleUrls: ['./viod-documents.component.scss']
})
export class ViodDocumentsComponent implements OnInit {
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
      this.store.fetchHeaderVoidDocuments(uid, this.queryParams?.periodKey);
    })
  }

}
