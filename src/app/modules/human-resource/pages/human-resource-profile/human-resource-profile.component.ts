import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-human-resource-profile',
    templateUrl: './human-resource-profile.component.html',
    styleUrls: ['./human-resource-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceProfileComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
