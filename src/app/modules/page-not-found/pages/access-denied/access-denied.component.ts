import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
    selector: 'app-access-denied',
    templateUrl: './access-denied.component.html',
    styleUrls: ['./access-denied.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AccessDeniedComponent implements OnInit {

  constructor() { }

  options: AnimationOptions = {
    path: '/assets/animate/access-denied.json',
  };

  ngOnInit(): void {
  }

}
