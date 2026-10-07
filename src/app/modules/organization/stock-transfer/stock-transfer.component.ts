import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-stock-transfer',
    templateUrl: './stock-transfer.component.html',
    styleUrls: ['./stock-transfer.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StockTransferComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
