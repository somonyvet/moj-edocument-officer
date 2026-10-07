import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-criminal-application-decree-form',
    templateUrl: './criminal-application-decree-form.component.html',
    styleUrls: ['./criminal-application-decree-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationDecreeFormComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
