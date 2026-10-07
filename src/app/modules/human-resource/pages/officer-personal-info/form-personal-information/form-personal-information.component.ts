import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-form-personal-information',
    templateUrl: './form-personal-information.component.html',
    styleUrls: ['./form-personal-information.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FormPersonalInformationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
