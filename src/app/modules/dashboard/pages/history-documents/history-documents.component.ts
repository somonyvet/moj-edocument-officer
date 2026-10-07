import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-history-documents',
    templateUrl: './history-documents.component.html',
    styleUrls: ['./history-documents.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HistoryDocumentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
