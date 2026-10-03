import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-page-under-construction',
  templateUrl: './page-under-construction.component.html',
  styleUrls: ['./page-under-construction.component.scss']
})
export class PageUnderConstructionComponent implements OnInit {

  lottie: AnimationOptions = {
    path: '../../../../../assets/animate/22830-page-construction.json',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
