import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-sub-program-form',
    templateUrl: './sub-program-form.component.html',
    styleUrls: ['./sub-program-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SubProgramFormComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
