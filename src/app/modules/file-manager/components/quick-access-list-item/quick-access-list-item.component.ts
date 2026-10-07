import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-quick-access-list-item',
    templateUrl: './quick-access-list-item.component.html',
    styleUrls: ['./quick-access-list-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class QuickAccessListItemComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
