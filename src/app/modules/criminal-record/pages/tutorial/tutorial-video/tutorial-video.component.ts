import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-tutorial-video',
    templateUrl: './tutorial-video.component.html',
    styleUrls: ['./tutorial-video.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TutorialVideoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
