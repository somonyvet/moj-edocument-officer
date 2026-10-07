import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-record-letter-fr',
    templateUrl: './criminal-record-letter-fr.component.html',
    styleUrls: ['./criminal-record-letter-fr.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLetterFrComponent implements OnInit {
  today = new Date();

  constructor(
    public store : CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
  }

}
