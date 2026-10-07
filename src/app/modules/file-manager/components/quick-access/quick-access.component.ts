import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'quick-access',
    templateUrl: './quick-access.component.html',
    styleUrls: ['./quick-access.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class QuickAccessComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
