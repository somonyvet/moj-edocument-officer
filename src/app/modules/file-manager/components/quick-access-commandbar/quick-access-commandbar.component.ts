import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-quick-access-commandbar',
    templateUrl: './quick-access-commandbar.component.html',
    styleUrls: ['./quick-access-commandbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class QuickAccessCommandbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
