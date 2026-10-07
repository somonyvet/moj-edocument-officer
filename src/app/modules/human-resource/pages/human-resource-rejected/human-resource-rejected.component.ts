import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-human-resource-rejected',
    templateUrl: './human-resource-rejected.component.html',
    styleUrls: ['./human-resource-rejected.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceRejectedComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
