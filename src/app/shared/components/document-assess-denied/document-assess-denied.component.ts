import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-document-assess-denied',
  templateUrl: './document-assess-denied.component.html',
  styleUrls: ['./document-assess-denied.component.scss']
})
export class DocumentAssessDeniedComponent implements OnInit {

  options: AnimationOptions = {
    path: '/assets/animate/access-denied.json',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
