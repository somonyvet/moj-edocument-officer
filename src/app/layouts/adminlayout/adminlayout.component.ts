import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-adminlayout',
    templateUrl: './adminlayout.component.html',
    styleUrls: ['./adminlayout.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminlayoutComponent implements OnInit {
  constructor() {}
  
  ngOnInit() {
  }

}
