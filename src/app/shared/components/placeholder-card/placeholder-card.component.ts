import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-placeholder-card',
    templateUrl: './placeholder-card.component.html',
    styleUrls: ['./placeholder-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PlaceholderCardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
