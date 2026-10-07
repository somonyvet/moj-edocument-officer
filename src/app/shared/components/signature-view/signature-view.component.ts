import { Component, Input, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-signature-view',
    templateUrl: './signature-view.component.html',
    styleUrls: ['./signature-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SignatureViewComponent implements OnInit {
  @Input() data: any;
  @Input() dataArray: any;
  @Input() storeDoc: any;
  Item;
  dataFooter: any[] = [];
  footer: any;
  constructor(
    public store: DocumentStore,
  ) { }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data && changes.dataArray.currentValue) {
      this.Item = this.dataArray.find(f => f.accountKey === this.data.accountKey);
    }

  }

}
