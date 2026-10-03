import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-under-contruction',
  templateUrl: './under-contruction.component.html',
  styleUrls: ['./under-contruction.component.scss']
})
export class UnderContructionComponent implements OnInit {

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/22830-page-construction.json',
  };
  
  constructor() { }

  ngOnInit(): void {
  }

}
