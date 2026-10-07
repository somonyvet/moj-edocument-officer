import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-record-letter-en',
    templateUrl: './criminal-record-letter-en.component.html',
    styleUrls: ['./criminal-record-letter-en.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLetterEnComponent implements OnInit {
  today = new Date();

  constructor(
    public store : CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
  }

}
