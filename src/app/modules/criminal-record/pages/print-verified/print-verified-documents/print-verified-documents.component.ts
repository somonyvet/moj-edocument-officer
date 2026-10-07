import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-print-verified-documents',
    templateUrl: './print-verified-documents.component.html',
    styleUrls: ['./print-verified-documents.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrintVerifiedDocumentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
