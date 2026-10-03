import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-human-resource-my-files',
  templateUrl: './human-resource-my-files.component.html',
  styleUrls: ['./human-resource-my-files.component.scss']
})
export class HumanResourceMyFilesComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/animate/25943-nodata.json',
  };
  constructor() { }

  ngOnInit(): void {
  }

}
