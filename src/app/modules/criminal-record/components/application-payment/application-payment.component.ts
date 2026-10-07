import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-application-payment',
    templateUrl: './application-payment.component.html',
    styleUrls: ['./application-payment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ApplicationPaymentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
