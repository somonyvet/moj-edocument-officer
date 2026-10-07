import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PageNotFoundComponent implements OnInit {

  
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
