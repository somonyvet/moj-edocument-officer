import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-criminal-record-by-folder',
    templateUrl: './criminal-record-by-folder.component.html',
    styleUrls: ['./criminal-record-by-folder.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordByFolderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
