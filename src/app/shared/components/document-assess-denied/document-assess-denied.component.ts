import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
    selector: 'app-document-assess-denied',
    templateUrl: './document-assess-denied.component.html',
    styleUrls: ['./document-assess-denied.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentAssessDeniedComponent implements OnInit {

  options: AnimationOptions = {
    path: '/assets/animate/access-denied.json',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
