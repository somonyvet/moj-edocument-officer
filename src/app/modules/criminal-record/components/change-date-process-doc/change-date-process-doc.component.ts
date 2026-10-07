import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { toKhDate } from 'src/app/shared/services/mapping.service';

@Component({
    selector: 'app-change-date-process-doc',
    templateUrl: './change-date-process-doc.component.html',
    styleUrls: ['./change-date-process-doc.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChangeDateProcessDocComponent implements OnInit {

  report_date : any = null;
  withdraw_date : any = null;
  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<ChangeDateProcessDocComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: CriminalApplicationStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
  ) { 
  }

  ngOnInit(): void {
    this.report_date = toKhDate(this.data?.selectedCriminal?.start_process_at?.toDate()) 
    this.withdraw_date = toKhDate(this.data?.selectedCriminal?.withdraw_date?.toDate())
    this.form = this.fb.group({
      report_date: [this.data?.selectedCriminal?.start_process_at?.toDate()],
      withdraw_date: [this.data?.selectedCriminal?.withdraw_date?.toDate()]
    })
  }


  save(){
    if(this.form?.invalid) {
      alert('Invalid form.');
      return;
    }
    const { selectedCriminal } = this.data;
    const { withdraw_date, report_date } = this.form?.value;
    this.store.updateDateProcessDoc(selectedCriminal,report_date,withdraw_date).then(()=>{
      this.snackBar.open(`រក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.dialogRef.close();
    })
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

}