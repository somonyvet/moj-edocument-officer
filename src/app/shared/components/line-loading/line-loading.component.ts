import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-line-loading',
    templateUrl: './line-loading.component.html',
    styleUrls: ['./line-loading.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LineLoadingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
