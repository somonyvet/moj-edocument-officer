import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, CRIMINAL_APPLICATION_LANGUAGE_OBJECT } from 'src/app/dummy/appinfo';
import { PrintService } from '../../services/print.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-show-verify-qr',
  templateUrl: './show-verify-qr.component.html',
  styleUrls: ['./show-verify-qr.component.scss']
})
export class ShowVerifyQRComponent implements OnInit {
  CRIMINAL_APPLICATION_LANGUAGE = CRIMINAL_APPLICATION_LANGUAGE_OBJECT
  criminalLanguage = CRIMINAL_APPLICATION_LANGUAGE_ARRAY
  loading: boolean = false;
  ARRAY = Array;

  criminalLetterDate: any = new Date();

  constructor(public dialogRef: MatDialogRef<ShowVerifyQRComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ps: PrintService,
    private fb: FormBuilder,
    private ds: DataService,
    private funs: AngularFireFunctions,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if(this.data){
      this.criminalLetterDate = this.data?.criminalRecords[0]?.criminal_letter_date
    }
    console.log(this.data)
  }

  onClose() {
    this.dialogRef.close()
  }
}
