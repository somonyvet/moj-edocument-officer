import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { addDays, generateKeywords, getYearsList, MappingService, toDateKey, todayDate, toDepartmentNoWorkplace, toKhDate, toNumber, toYearKey, workingDay } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-start-process-doc-dialog',
    templateUrl: './start-process-doc-dialog.component.html',
    styleUrls: ['./start-process-doc-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StartProcessDocDialogComponent implements OnInit {

  report_date : any = null;
  withdraw_date : any = null;

  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<StartProcessDocDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: CriminalApplicationStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
  ) { 
    const _report = localStorage.getItem('report_start_process_doc_date')
    const dt_report = JSON.parse(_report);
    let reportDate = new Date();
    this.report_date = new Date();
    if (dt_report) {
      reportDate.setFullYear(dt_report.year, dt_report.month, dt_report.day);
      this.report_date = toKhDate(reportDate);
    }

    const _withdraw_date = data.selectedCriminal?.urgent_obj?.key === 12 ? localStorage.getItem('withdraw_date_12_day_process') : localStorage.getItem('withdraw_date_20_day_process')
    const dt_withdraw = JSON.parse(_withdraw_date);
    const { serverDateTime } = this.auth
    let withdrawDate =  workingDay(this.data.holidays, serverDateTime, data.selectedCriminal?.urgent_obj?.key || 20)
    this.withdraw_date = toKhDate(withdrawDate)
    if (dt_withdraw) {
      withdrawDate.setFullYear(dt_withdraw.year, dt_withdraw.month, dt_withdraw.day);
      this.withdraw_date = toKhDate(withdrawDate);
    }
    this.form = this.fb.group({
      report_date: [reportDate],
      // withdraw_date: [withdrawDate]
    })
  }

  ngOnInit(): void {

  }

  _onSelectedCalendar(event) {
    const { value } = event;
    this.report_date = toKhDate(value);
    localStorage.setItem("report_start_process_doc_date", JSON.stringify({
      day: (value as Date).getDate(),
      month: (value as Date).getMonth(),
      year: (value as Date).getFullYear(),
    }))
  }

  _onSelectedCalendarWithdraw(event){
    const { selectedCriminal } = this.data;
    const { value } = event;
    const durationKey = selectedCriminal?.urgent_obj?.key;
    if (durationKey === 12) {
      localStorage.setItem("withdraw_date_12_day_process", JSON.stringify({
        day: (value as Date).getDate(),
        month: (value as Date).getMonth(),
        year: (value as Date).getFullYear(),
      }))
    } else if (durationKey === 20) {
      localStorage.setItem("withdraw_date_20_day_process", JSON.stringify({
        day: (value as Date).getDate(),
        month: (value as Date).getMonth(),
        year: (value as Date).getFullYear(),
      }))
    }
  }

  save(){
    if(this.form?.invalid) {
      alert('Invalid form.');
      return;
    }
    const { selectedCriminal } = this.data;
    const { report_date } = this.form?.value;

    this.store.saveCriminalStartProcess(selectedCriminal,report_date).then(()=>{
      this.snackBar.open(`រក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.dialogRef.close();
    })
  }
}