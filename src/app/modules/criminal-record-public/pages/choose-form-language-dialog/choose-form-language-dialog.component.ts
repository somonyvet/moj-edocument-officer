import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NATIONALITY_APPLICAITON } from 'src/app/dummy/status';

@Component({
  selector: 'app-choose-form-language-dialog',
  templateUrl: './choose-form-language-dialog.component.html',
  styleUrls: ['./choose-form-language-dialog.component.scss']
})
export class ChooseFormLanguageDialogComponent implements OnInit {

  items = NATIONALITY_APPLICAITON

  constructor(
    public dialogRef: MatDialogRef<ChooseFormLanguageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }

}
