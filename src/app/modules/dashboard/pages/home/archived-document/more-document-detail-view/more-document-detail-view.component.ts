import { Component, Input, OnInit } from '@angular/core';
import { PrintService } from 'src/app/shared/services/print.service';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
  selector: 'app-more-document-detail-view',
  templateUrl: './more-document-detail-view.component.html',
  styleUrls: ['./more-document-detail-view.component.scss']
})
export class MoreDocumentDetailViewComponent implements OnInit {

  @Input() headerKey : string

  loading: boolean = false;
  headerDocumentData: any = [];

  constructor(
    public store: DocumentStore,
    private ps: PrintService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.headerDocumentData = await this.store.getDocumentMoreReport(this.headerKey)
    this.headerDocumentData = this.headerDocumentData.filter(f => f?.key !== this.headerKey )
    this.loading = false;
  }

  print(id:string) {
    this.ps.print('#'+id, 'a4')
  }
}
