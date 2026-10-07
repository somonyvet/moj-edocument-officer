import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-human-resource-archived',
    templateUrl: './human-resource-archived.component.html',
    styleUrls: ['./human-resource-archived.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceArchivedComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
