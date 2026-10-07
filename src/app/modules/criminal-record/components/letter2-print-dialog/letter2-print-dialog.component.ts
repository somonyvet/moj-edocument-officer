import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-letter2-print-dialog',
    templateUrl: './letter2-print-dialog.component.html',
    styleUrls: ['./letter2-print-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class Letter2PrintDialogComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
