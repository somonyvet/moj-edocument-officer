import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-archived-document-attachment',
    templateUrl: './archived-document-attachment.component.html',
    styleUrls: ['./archived-document-attachment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ArchivedDocumentAttachmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
