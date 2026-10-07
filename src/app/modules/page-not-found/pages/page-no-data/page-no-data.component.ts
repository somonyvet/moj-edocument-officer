import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';

@Component({
    selector: 'app-page-no-data',
    templateUrl: './page-no-data.component.html',
    styleUrls: ['./page-no-data.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PageNoDataComponent implements OnInit {

  constructor(private router:Router) { }

  options: AnimationOptions = {
    path: '../../../../../assets/logo/page-not-found.json',
  };

  ngOnInit(): void {
  }

  _onSave(){
    this.router.navigate(['/'])
  }
}
