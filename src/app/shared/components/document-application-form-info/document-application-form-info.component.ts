import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-application-form-info',
    templateUrl: './document-application-form-info.component.html',
    styleUrls: ['./document-application-form-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationFormInfoComponent implements OnInit {

  constructor(  public store: DocumentStore,) { }

  ngOnInit(): void {
  }

}
