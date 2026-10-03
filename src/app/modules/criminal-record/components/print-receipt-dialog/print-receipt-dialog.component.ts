import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { days, monthOfYear } from 'src/app/dummy/report';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';
import { formatFormDate, getYearsList, todayDate } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-print-receipt-dialog',
  templateUrl: './print-receipt-dialog.component.html',
  styleUrls: ['./print-receipt-dialog.component.scss']
})
export class PrintReceiptDialogComponent implements OnInit {
  selectionDoc: any = null;
  issue_date: any = null;
  criminalWorkingHours: any = null

  khmer_amount = 0
  france_amount = 0
  english_amount = 0

  userData: any = null
  constructor(
    public dialogRef: MatDialogRef<PrintReceiptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: CriminalApplicationStore,
    private ps: PrintService,
    public auth: AuthStore
  ) {}

  ngOnInit() {
    const { selectedCriminalRecord } = this.data;
    const { withdraw_date, review_at, national_application, paid_at } = selectedCriminalRecord;
    // const review_date = formatFormDate(review_at);
    const paid_date = formatFormDate(paid_at);
    const isKhmerForm = national_application?.key === 'khmer';
    const DAYS = days?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: isKhmerForm, name_en: `${m}` } })
    // const date = todayDate(review_date, DAYS, MONTHS, years);
    const date = todayDate(paid_date, DAYS, MONTHS, years);
    this.issue_date = date;
    this.selectionDoc = {
      ...selectedCriminalRecord,
      withdraw_date: formatFormDate(withdraw_date)
    }

    const { config } = this.auth
    const { criminal_working_hours } = config
    this.criminalWorkingHours = criminal_working_hours

    this.khmer_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 1)?.amount || 1
    this.france_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 2)?.amount || 0
    this.english_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 3)?.amount || 0


    this.store.fetchSelectedCitizenDoc(this?.selectionDoc?.citizen_ref, user=> {
      this.userData = user
    })
  }

  print() {
    this.ps.print("#printDD", "a5l");
  }

}
