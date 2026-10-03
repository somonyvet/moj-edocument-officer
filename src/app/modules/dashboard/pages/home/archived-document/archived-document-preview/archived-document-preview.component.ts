import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { pushToObject } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
  selector: 'app-archived-document-preview',
  templateUrl: './archived-document-preview.component.html',
  styleUrls: ['./archived-document-preview.component.scss']
})
export class ArchivedDocumentPreviewComponent implements OnInit, OnDestroy {

  fetchDocsRef : Subscription;
  docsData : any = null;
  loading : boolean = false;
  rootDoc : any = null;

  constructor(
    private activatedRoute : ActivatedRoute,
    public store : MemoStore,
    private auth: AuthStore,
    private ds : DatabaseService,
    private ps: PrintService,
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }


  print(id:string) {
    this.ps.print('#'+id, 'a4')
  }

}
