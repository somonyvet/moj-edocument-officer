import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-officer-title',
    templateUrl: './officer-title.component.html',
    styleUrls: ['./officer-title.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerTitleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
