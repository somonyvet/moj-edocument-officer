import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { AngularFireFunctions } from "@angular/fire/compat/functions";

@Component({
    selector: 'app-print-verified-criminal-language-form',
    templateUrl: './print-verified-criminal-language-form.component.html',
    styleUrls: ['./print-verified-criminal-language-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrintVerifiedCriminalLanguageFormComponent implements OnInit {

  form: UntypedFormGroup;
  process: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<PrintVerifiedCriminalLanguageFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private authStore: AuthStore,
    private criminalStore: CriminalApplicationStore,
    private funs: AngularFireFunctions
  ) { }

  ngOnInit(): void {
    const { selectedCriminal } = this.data;
    const { serverDateTime } = this.authStore

    let currentDate = new Date(serverDateTime);
    currentDate.setMonth(currentDate.getMonth() + 3);

    this.form = this.fb.group({
      expired_date: [selectedCriminal?.expired_date?.toDate() || currentDate, Validators.required]
    })
  }


}