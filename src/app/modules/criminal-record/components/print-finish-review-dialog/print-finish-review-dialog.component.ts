import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { days, monthOfYear } from 'src/app/dummy/report';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';
import { formatFormDate, getYearsList, todayDate } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-print-finish-review-dialog',
  templateUrl: './print-finish-review-dialog.component.html',
  styleUrls: ['./print-finish-review-dialog.component.scss']
})
export class PrintFinishReviewDialogComponent implements OnInit {
  selectionDoc: any = null;
  issue_date: any = null;
  form: FormGroup;
  khmer_form: AbstractControl;
  khmer_amount: AbstractControl;
  france_form: AbstractControl;
  france_amount: AbstractControl;
  english_form: AbstractControl;
  english_amount: AbstractControl;

  constructor(
    public dialogRef: MatDialogRef<PrintFinishReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: CriminalApplicationStore,
    private ps: PrintService,
    public auth: AuthStore,
    private fb: FormBuilder,

  ) { }

  ngOnInit() {
    const { selectedCriminalRecord } = this.data;
    const { withdraw_date, review_at, national_application } = selectedCriminalRecord;
    const review_date = formatFormDate(review_at);
    const isKhmerForm = national_application?.key === 'khmer';
    const DAYS = days?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: isKhmerForm, name_en: `${m}` } })
    const date = todayDate(review_date, DAYS, MONTHS, years);
    this.issue_date = date;
    this.selectionDoc = {
      ...selectedCriminalRecord,
      withdraw_date: formatFormDate(withdraw_date)
    }

    this.form = this.fb.group({
      khmer_form: [true],
      khmer_amount: [null],
      france_form: [false],
      france_amount: [null],
      english_form: [false],
      english_amount: [null],
    })

    this.khmer_form = this.form.controls['khmer_form'];
    this.khmer_amount = this.form.controls['khmer_amount'];
    this.france_form = this.form.controls['france_form'];
    this.france_amount = this.form.controls['france_amount'];
    this.english_form = this.form.controls['english_form'];
    this.english_amount = this.form.controls['english_amount'];

    this.form.patchValue({
      khmer_amount: selectedCriminalRecord?.criminal_language?.find(f => f.key === 1)?.amount || 1,
      france_form: selectedCriminalRecord?.criminal_language?.find(f => f.key === 2) ? true : false,
      france_amount: selectedCriminalRecord?.criminal_language?.find(f => f.key === 2)?.amount || null,
      english_form: selectedCriminalRecord?.criminal_language?.find(f => f.key === 3) ? true : false,
      english_amount: selectedCriminalRecord?.criminal_language?.find(f => f.key === 3)?.amount || null,
    })

    this.khmer_form.disable()
    this.france_form.disable()
    this.english_form.disable()

  }

  print() {
    this.ps.print("#printDD", this.data?.print|| "a5l");
  }

}
