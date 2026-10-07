import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
    selector: 'app-human-resource-my-files',
    templateUrl: './human-resource-my-files.component.html',
    styleUrls: ['./human-resource-my-files.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceMyFilesComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/animate/25943-nodata.json',
  };
  constructor() { }

  ngOnInit(): void {
  }

}
