import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, monthOfYear } from 'src/app/dummy/report';
import { addDay, checkIsSatORSun, ConvertService, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { addDays, getYearsList, toDateKey, todayDate, toKhDate, toYearKey, workingDay } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { PrintReceiptDialogComponent } from '../print-receipt-dialog/print-receipt-dialog.component';

@Component({
  selector: 'app-criminal-receipt-print-dialog',
  templateUrl: './criminal-receipt-print-dialog.component.html',
  styleUrls: ['./criminal-receipt-print-dialog.component.scss']
})
export class CriminalReceiptPrintDialogComponent implements OnInit {
  shift_name: any = null;
  form: FormGroup;
  process: boolean = false;
  date: any = null;
  holidays: any[] = [];

  loading : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CriminalReceiptPrintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: CriminalApplicationStore,
    private auth: AuthStore,
    private fb: FormBuilder,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,

  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.auth.getServerTime();

    const { serverDateTime } = this.auth;
    const { form } = this.data;
    const { selectedCriminalRecord } = this.store;
    this.shift_name = this.getGreetingTime();
    this.form = this.fb.group({
      withdraw_date: [null, [Validators.required]],
      paid_at: [serverDateTime, Validators?.required],
    })

    this.holidays = await this.store.fetchHoliday(toYearKey(serverDateTime))
    if(serverDateTime.getMonth() == 11){
      const nextYearHoliday = await this.store.fetchHoliday(toYearKey(serverDateTime)+1)
      this.holidays = this.holidays?.concat(nextYearHoliday?.length ? nextYearHoliday : [])
    }
    const receivedDate = workingDay(this.holidays, serverDateTime, form?.urgent_obj?.key || selectedCriminalRecord?.urgent_obj?.key || 20)

    this.form.patchValue({ withdraw_date: receivedDate })
    this.date = toKhDate(this.form.value?.withdraw_date)

    this.loading = false;
  }

  onDateChange(event) {
    const { value } = event
    const { form } = this.data;
    const { selectedCriminalRecord } = this.store;

    if (value && form) {
      const serverDateTime = value;
      const withdrawDate = workingDay(this.holidays, serverDateTime, form?.urgent_obj?.key || selectedCriminalRecord?.urgent_obj?.key || 20)
      this.form.patchValue({
        withdraw_date: withdrawDate,
      })
      this.date = toKhDate(this.form.value?.withdraw_date)
    }
  }

  async _onSubmit(f) {
    const { serverDateTime, config } = this.auth;
    this.process = true;
    const { selectedCriminalRecord, selectedCitizenProfile } = this.store;
    this.store.getFolderKeyRef(serverDateTime, config, selectedCriminalRecord?.urgent_obj, criminal_folder_no => {
      const { form } = this.data;
      const { withdraw_date, paid_at } = f;
      const isKhmerForm = this.data?.isKhmerForm || selectedCriminalRecord?.national_application?.key === 'khmer'
      this.process = true;
      const DAYS = days?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: isKhmerForm, name_en: `${m}` } })
      const date = todayDate(this.auth.serverDateTime, DAYS, MONTHS, years);

      let keyword: string[] = (selectedCriminalRecord?.keyword || [])
      if (criminal_folder_no) {
        const date_criminal_no = `${toDateKey(withdraw_date)}_${criminal_folder_no}`
        keyword = keyword.concat([criminal_folder_no, date_criminal_no])
      }

      let selected_language = []
      const khmer_language_obj = {
        ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[0],
        amount: form?.khmer_amount,
      }
      selected_language.push(khmer_language_obj);
      if (form?.france_form) {
        const france_language_obj = {
          ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[1],
          amount: form?.france_amount,
        }
        selected_language.push(france_language_obj);
      }
      if (form?.english_form) {
        const english_language_obj = {
          ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[2],
          amount: form?.english_amount,
        }
        selected_language.push(english_language_obj);
      }
      const item = {
        ...selectedCriminalRecord,
        day_header: date?.day,
        month_header: date?.month,
        year_header: date?.year,
        updated_by: this.store?.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),
        paid_at: paid_at,
        paid_by: this.store?.getMappedProfile(),
        status: STATUS_OBJ.PAID,
        internal_status: null,
        keyword: keyword,
        criminal_language: selected_language,

        issued_at: selectedCriminalRecord?.issued_at || this.ds.serverTimestamp(),

        withdraw_date: withdraw_date,
        withdraw_date_key: ConvertService.toDateKey(withdraw_date),
        shift_name: this.shift_name || null,
        criminal_folder_no: criminal_folder_no,
        folder_key_ref: null,

        tran_at: this.ds.serverTimestamp(),
        tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
      }

      this.store.approvedCriminal(item, selectedCitizenProfile, true).then(() => {
        this.snackBar.open(`ប្រតិបត្តិការបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.dialogRef.close('yes')
        this.process = false;
        this._onPrint(item)
      })
    });
  }

  _onSelectedCalendar(event) {
    const value = event?.value;
    this.date = toKhDate(value)
  }

  _onPrint(item) {
    this.dialog.open(PrintReceiptDialogComponent, {
      data: { selectedCriminalRecord: item },
      width: '80vw',
      height: '85vh',
      disableClose: true
    });
  }

  getGreetingTime(): string {
    const { config } = this.auth;
    return config.criminal_working_hours?.afternoon_shift;
  }

  // _onPrint(item) {
  //   let dialogRef = this.dialog.open(PrintReceiptDialogComponent, {
  //     data: { selectedCriminalRecord: item },
  //     width: '90vw',
  //     height: '80vh',
  //     disableClose: true
  //   });
  //   dialogRef.afterClosed().subscribe(result => {

  //   });
  // }

}
