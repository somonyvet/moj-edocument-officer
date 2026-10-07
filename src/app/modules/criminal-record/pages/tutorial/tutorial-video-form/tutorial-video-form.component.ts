import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-tutorial-video-form',
    templateUrl: './tutorial-video-form.component.html',
    styleUrls: ['./tutorial-video-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TutorialVideoFormComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
