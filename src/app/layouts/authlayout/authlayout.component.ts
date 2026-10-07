import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-authlayout',
    templateUrl: './authlayout.component.html',
    styleUrls: ['./authlayout.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AuthlayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
