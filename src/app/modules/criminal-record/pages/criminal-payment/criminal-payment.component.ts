import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, CRIMINAL_APPLICATION_LANGUAGE_OBJECT, GENDER_DATA, PHOTO_LIB, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { APPLICATION_TYPE_OBJ, NATIONALITY_APPLICAITON } from 'src/app/dummy/status';
import { LanguageStore } from 'src/app/languages/translate.store';
import { DataService } from 'src/app/shared/services/data.service';
import { addDays, generateKeywords, getYearsList, MappingService, toDateKey, todayDate, toDepartmentNoWorkplace, toKhDate, toNumber, toYearKey, workingDay } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { addDay, checkIsSatORSun, ConvertService, orderBy, pushToArray, pushToObject, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { days, KHMER_DAY, monthOfYear } from 'src/app/dummy/report';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrintReceiptDialogComponent } from '../../components/print-receipt-dialog/print-receipt-dialog.component';

@Component({
    selector: 'app-criminal-payment',
    templateUrl: './criminal-payment.component.html',
    styleUrls: ['./criminal-payment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalPaymentComponent implements OnInit {
  @ViewChild('searchFilter') searchFilter: ElementRef;
  process: boolean = false;
  loading: boolean = true;
  holidays: any[] = [];

  data = NATIONALITY_APPLICAITON
  durationArray = URGENT_OBJ_ARRAY
  form: UntypedFormGroup
  footer_phone: AbstractControl;
  duration: AbstractControl;
  filteredPhone: Observable<Array<any>>;
  GENDER_KH: any[] = [];
  selectedCitizen: any = null;
  selectedCriminal: any = null;
  DAYS: any[] = [];
  KHDAYS = KHMER_DAY;
  MONTHS: any[] = [];
  years: any[] = [];
  date: string = null;
  focusSearch: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CriminalPaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public formData: any,
    public auth: AuthStore,
    private fb: UntypedFormBuilder,
    private router: Router,
    public tran: LanguageStore,
    public ds: DataService,
    private snackBar: MatSnackBar,
    public criminalStore: CriminalApplicationStore,
    private dialog: MatDialog,
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.auth.getServerTime();
    this.DAYS = days?.map(m => ({ ...m, isKhmer: true }))
    this.MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: true }))
    const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: true, name_en: `${m}` } })
    this.GENDER_KH = GENDER_DATA?.map(m => ({ ...m, isKhmer: true }))
    this.years = years
    const { serverDateTime } = this.auth;

    this.form = this.fb.group({
      searchFilter: [null],
      first_name_kh: [null, [Validators.required]],
      last_name_kh: [null, [Validators.required]],
      gender: [null, [Validators.required, MappingService.validSelected.bind(this)],],
      footer_phone: [null],
      isStudent: [false],
      withdraw_date: [null, [Validators.required]],

      nationality: [this.data[0], Validators?.required],
      duration: [this.durationArray[1], Validators.required],
      khmer_form: [{ value: true, disabled: true }],
      khmer_amount: [1, [Validators.required, Validators.min(1)]],
      france_form: [false],
      france_amount: [null, [Validators.required, Validators.min(1)]],
      english_form: [false],
      english_amount: [null, [Validators.required, Validators.min(1)]],
      paid_at: [serverDateTime, Validators?.required],
    })
    this.footer_phone = this.form.controls['footer_phone']
    this.duration = this.form.controls['duration']

    // this.holidays = await this.criminalStore.fetchHoliday(toYearKey(serverDateTime))
    // const withdrawDate = workingDay(this.holidays, serverDateTime, this.durationArray[1]?.key)

    // this.form.patchValue({ withdraw_date: withdrawDate })
    // this.date = toKhDate(this.form.value?.withdraw_date)

    this.GENDER_KH = GENDER_DATA?.map(m => ({ ...m, isKhmer: true }))
    this.form.patchValue({
      gender: this.GENDER_KH[0]
    })
    const item = this.formData?.item || this.auth?.profile?.criminal_application || null;
    if (item) {
      this.form.patchValue({
        nationality: this.data?.find(m => m?.key === (item?.national_application?.key || item?.nationality?.key)) || this.data[0],
        duration: this.durationArray?.find(m => m?.key === (item?.urgent_obj?.key || item?.duration?.key)) || this.durationArray[1],
        khmer_amount: item?.criminal_language?.find(f => f.key === 1)?.amount || item?.khmer_amount || 1,
        france_form: (item?.criminal_language?.find(f => f.key === 2) || item?.france_form) ? true : false,
        france_amount: item?.criminal_language?.find(f => f.key === 2)?.amount || item?.france_amount || null,
        english_form: (item?.criminal_language?.find(f => f.key === 3) || item?.english_form) ? true : false,
        english_amount: item?.criminal_language?.find(f => f.key === 3)?.amount || item?.english_amount || null,

        first_name_kh: item?.first_name || null,
        last_name_kh: item?.last_name || null,
        gender: this.GENDER_KH?.find(m => m?.key === item?.gender?.key) || null,
        footer_phone: item?.phoneNumber || null,
        isStudent: item?.isStudent || false,
        withdraw_date: item?.withdraw_date?.toDate() || null,
        paid_at: item?.paid_at?.toDate() || null,
      })
      this.date = toKhDate(item?.withdraw_date?.toDate());

      if (this.criminalStore.selectedCitizenProfile) {
        const items = [this.criminalStore.selectedCitizenProfile]
        this.filteredPhone = MappingService.autoComplete(this.footer_phone, items, 'phoneNumber')
        this.form.patchValue({
          footer_phone: items[0]
        })
      }
    } else {
      const _withdrawDate20 = localStorage.getItem("withdraw_date_20_day");
      const defaultDurationKey = 20;
      const dt = JSON.parse(_withdrawDate20);

      const withdrawDate = new Date();

      this.date = toKhDate(withdrawDate);

      if (dt) {
        withdrawDate.setFullYear(dt.year, dt.month, dt.day);
        this.date = toKhDate(withdrawDate);
      }

      this.form.patchValue({
        duration: this.durationArray?.find(m => m?.key === defaultDurationKey),
        withdraw_date: withdrawDate
      })
    }
    this.form.controls['france_amount'].disable();
    this.form.controls['english_amount'].disable();
    if (this.form?.value?.france_form) {
      this.form.controls['france_amount'].enable();
    }
    if (this.form?.value?.english_form) {
      this.form.controls['english_amount'].enable();
    }
    this.loading = false;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }
  _onSelectedCalendar(event) {
    const { value } = event;
    this.date = toKhDate(value);
    const durationKey = this.duration.value.key;
    if (durationKey === 12) {
      localStorage.setItem("withdraw_date_12_day", JSON.stringify({
        day: (value as Date).getDate(),
        month: (value as Date).getMonth(),
        year: (value as Date).getFullYear(),
      }))
    } else if (durationKey === 20) {
      localStorage.setItem("withdraw_date_20_day", JSON.stringify({
        day: (value as Date).getDate(),
        month: (value as Date).getMonth(),
        year: (value as Date).getFullYear(),
      }))
    }
  }

  onDateChange(event) {
    // const { value } = event
    // const { duration } = this.form.value

    // if (value && duration) {
    //   const serverDateTime = value;
    //   const withdrawDate = workingDay(this.holidays, serverDateTime, duration?.key)
    //   this.form.patchValue({
    //     withdraw_date: withdrawDate,
    //   })
    //   this.date = toKhDate(this.form.value?.withdraw_date)
    // }
  }

  changePeriod(event) {
    const { value } = event;
    let dt;
    if (value.key === 12) {
      const _withdrawDate12 = localStorage.getItem("withdraw_date_12_day");
      dt = JSON.parse(_withdrawDate12);

    } else if (value.key === 20) {
      const _withdrawDate20 = localStorage.getItem("withdraw_date_20_day");
      dt = JSON.parse(_withdrawDate20);
    }

    const withdrawDate = new Date();
    if (dt) {
      withdrawDate.setFullYear(dt.year, dt.month, dt.day);
      this.date = toKhDate(withdrawDate);
    }
    this.form.patchValue({ withdraw_date: withdrawDate })
    // const value = event?.value;
    // const serverDateTime = this.form?.value?.paid_at || this.auth.serverDateTime;
    // const withdrawDate = workingDay(this.holidays, serverDateTime, value?.key)
    // this.form.patchValue({
    //   withdraw_date: withdrawDate,
    // })
    // this.date = toKhDate(this.form.value?.withdraw_date)
  }

  // checkPhoneNumberRef() {
  //   return (control: AbstractControl) => {
  //     const value = control?.value || null;
  //     if (value !== null && value !== "" && value !== undefined) {
  //       const phoneNumber = `0${toNumber(`${value}`.trim())}`;
  //       return this.ds.citizensRef(ref => ref.where('phoneNumber', '==', phoneNumber)).get()
  //         .pipe(
  //           debounceTime(300),
  //           take(1),
  //           map(arr => {
  //             const items = pushToArray(arr)?.map(m => ({ ...m, file_uri: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : null }))
  //             this.filteredPhone = MappingService.autoComplete(this.footer_phone, items, 'phoneNumber')
  //             return null;
  //           })
  //         );
  //     }
  //   };
  // }

  async optionSelectedCitizen(event: MatAutocompleteSelectedEvent) {
    const { first_name, last_name, gender, key, isStudent } = event.option.value;
    this.loading = true;
    const criminalDoc = await this.ds.criminalRecordRef(ref => ref.where('citizen_ref', '==', key)).get().toPromise();
    const criminal = orderBy(pushToArray(criminalDoc), 'created_at', 'desc')?.filter(m => m?.status?.key <= STATUS_OBJ.PAID.key)
    this.selectedCriminal = criminal?.length > 0 ? criminal[0] : null;
    this.selectedCitizen = event.option.value;

    this.form.patchValue({
      first_name_kh: first_name || null,
      last_name_kh: last_name || null,
      gender: this.GENDER_KH?.find(m => m?.key === gender?.key) || null,
      isStudent: isStudent || false,
    })
    if (this.selectedCriminal) {
      const { national_application, urgent_obj, criminal_language } = this.selectedCriminal;
      criminal_language?.map(m => {
        if (m?.key === CRIMINAL_APPLICATION_LANGUAGE_OBJECT.khmer?.key) {
          this.form.controls['khmer_amount'].enable();
          this.form.patchValue({
            khmer_form: true,
            khmer_amount: m?.amount || 1,
          })
        }
        if (m?.key === CRIMINAL_APPLICATION_LANGUAGE_OBJECT.english?.key) {
          this.form.controls['english_amount'].enable();
          this.form.patchValue({
            english_form: true,
            english_amount: m?.amount || 1,
          })
        } else {
          this.form.controls['english_amount'].disable();
        }
        if (m?.key === CRIMINAL_APPLICATION_LANGUAGE_OBJECT.france?.key) {
          this.form.controls['france_amount'].enable();
          this.form.patchValue({
            france_form: true,
            france_amount: m?.amount || 1,
          })
        } else {
          this.form.controls['france_amount'].disable();
        }
      })
      this.form.patchValue({
        nationality: NATIONALITY_APPLICAITON?.find(m => m?.key === national_application?.key),
        duration: this.durationArray?.find(m => m?.key === urgent_obj?.key),
        isStudent: isStudent || false,
      })
      this.loading = false;
    } else {
      this.loading = false;
    }
  }

  displayFn(user: any): string {
    // return user && user.phoneNumber ? user.phoneNumber : '';
    return user?.phoneNumber || user?.footer_phone || null;
  }

  onChangeLanguage(event: MatCheckboxChange, type: string) {
    if (event?.checked) {
      this.form.controls[type].enable();
    } else {
      this.form.controls[type].disable();
    }
  }

  async create(f: any) {
    if (this.form.valid) {
      await this.auth.getServerTime();
      this.process = true;
      const { config, publicApplication, dataEntryOnly, currentDepartment, serverDateTime } = this.auth;
      const shift_name = config.criminal_working_hours?.afternoon_shift;
      const oldReceipt = this.formData?.item?.criminal_folder_no || null;
      const { paid_at, first_name_kh, last_name_kh, gender, footer_phone, nationality, duration, khmer_amount, france_form, france_amount, english_form, english_amount, isStudent, withdraw_date } = f

      await this.criminalStore.getFolderKeyRef(serverDateTime, config, duration, async criminal_folder_no => {
        const citizenKey = footer_phone?.key || this.ds.createId();
        const criminalKey = this.formData?.item?.key || this.selectedCriminal?.key || this.ds.createId();

        const item = this.formData?.item || this.selectedCriminal || null;
        let selected_language = []
        const khmer_language_obj = {
          ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[0],
          amount: khmer_amount,
        }
        selected_language.push(khmer_language_obj);
        if (france_form) {
          const france_language_obj = {
            ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[1],
            amount: france_amount,
          }
          selected_language.push(france_language_obj);
        }
        if (english_form) {
          const english_language_obj = {
            ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[2],
            amount: english_amount,
          }
          selected_language.push(english_language_obj);
        }
        const urgent_obj = duration;
        const phoneNumber = footer_phone?.phoneNumber ? `0${toNumber(`${footer_phone?.phoneNumber || footer_phone}`.trim())}` : null;
        const khmerFullName = last_name_kh + ' ' + first_name_kh;
        const date = todayDate(this.auth.serverDateTime, this.DAYS, this.MONTHS, this.years);

        let data: any = {
          key: criminalKey,
          status: this.formData?.item?.status || STATUS_OBJ.PAID_UN_FILLED,
          created_at: item?.created_at || this.ds.serverTimestamp(),
          created_by: item?.created_by || this.criminalStore.getMappedProfile(),

          date_key: item?.date_key || ConvertService.dateKey(),
          page_key: item?.page_key || ConvertService.pageKey(),
          isDelete: item?.isDelete || false,
          apply: publicApplication || false,//separate between user and officer
          updated_by: this.criminalStore.getMappedProfile(),
          updated_at: this.ds.serverTimestamp(),
          keyword: generateKeywords([khmerFullName]).concat([`${phoneNumber}`]),
          application_type: APPLICATION_TYPE_OBJ['application-no-iii'] || null,
          photo: item?.photo || null,
          criminal_record_category: config?.criminal_record_category || null,
          day_header: date?.day,
          month_header: date?.month,
          year_header: date.year,

          paid_at: paid_at,
          paid_by: this.criminalStore?.getMappedProfile(),

          issued_at: this.formData?.item?.issued_at || this.selectedCriminal?.issued_at || this.ds.serverTimestamp(),

          phoneNumber: phoneNumber || null,
          citizen_ref: citizenKey,
          first_name: first_name_kh,
          last_name: last_name_kh,
          gender: gender,
          criminal_language: selected_language,
          urgent_obj: urgent_obj,
          urgent: false,
          urgentStatus: false,
          national_application: nationality,
          isStudent: isStudent || false,
          workplace_entry: dataEntryOnly ? toDepartmentNoWorkplace(currentDepartment) : (item?.workplace_entry || (publicApplication ? null : toDepartmentNoWorkplace(currentDepartment))),
          labor_form: dataEntryOnly || item?.labor_form || false,

          withdraw_date: withdraw_date,
          withdraw_date_key: ConvertService.toDateKey(withdraw_date),
          shift_name: shift_name || null,
          criminal_folder_no: criminal_folder_no,
          folder_key_ref: null,
          internal_status: null,
          created_by_officer: true,
          tran_at: this.ds.serverTimestamp(),
          tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
        }
        let citizenData = {
          ...data,
          created_by: this.criminalStore.getMappedProfile(),
          created_at: this.ds.serverTimestamp(),
          updated_by: this.criminalStore.getMappedProfile(),
          updated_at: this.ds.serverTimestamp(),
          criminal_record_ref: criminalKey,
          key: citizenKey,
        }
        if (this.selectedCriminal) {
          data = {
            ...this.selectedCriminal,
            key: criminalKey,
            status: this.formData?.item?.status || STATUS_OBJ.PAID_UN_FILLED,
            created_at: item?.created_at || this.ds.serverTimestamp(),
            created_by: item?.created_by || this.criminalStore.getMappedProfile(),
            date_key: item?.date_key || ConvertService.dateKey(),
            page_key: item?.page_key || ConvertService.pageKey(),
            isDelete: item?.isDelete || false,
            apply: publicApplication || false,//separate between user and officer
            updated_by: this.criminalStore.getMappedProfile(),
            updated_at: this.ds.serverTimestamp(),
            keyword: generateKeywords([khmerFullName]).concat([`${phoneNumber}`]),
            application_type: APPLICATION_TYPE_OBJ['application-no-iii'] || null,
            photo: item?.photo || null,
            criminal_record_category: config?.criminal_record_category || null,
            day_header: date?.day,
            month_header: date?.month,
            year_header: date.year,
            phoneNumber: phoneNumber || null,

            paid_at: paid_at,
            paid_by: this.criminalStore?.getMappedProfile(),

            citizen_ref: citizenKey,
            first_name: first_name_kh,
            last_name: last_name_kh,
            gender: gender,
            criminal_language: selected_language,
            urgent_obj: urgent_obj,
            urgent: false,
            urgentStatus: false,
            national_application: nationality,
            isStudent: isStudent || false,
            workplace_entry: dataEntryOnly ? toDepartmentNoWorkplace(currentDepartment) : (item?.workplace_entry || (publicApplication ? null : toDepartmentNoWorkplace(currentDepartment))),
            labor_form: dataEntryOnly || item?.labor_form || false,

            withdraw_date: withdraw_date,
            withdraw_date_key: ConvertService.toDateKey(withdraw_date),
            shift_name: shift_name || null,
            criminal_folder_no: criminal_folder_no,
            folder_key_ref: null,
            internal_status: null,
            tran_at: this.ds.serverTimestamp(),
            tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
            created_by_officer: true,
          }
          citizenData = {
            ...data,
            updated_by: this.criminalStore.getMappedProfile(),
            updated_at: this.ds.serverTimestamp(),
            criminal_record_ref: criminalKey,
            key: citizenKey,
          }
        }
        const invalidCitizen = this.selectedCitizen?.key ? false : true;
        await this.criminalStore.approvedCriminal(data, citizenData, true, invalidCitizen).then(() => {
          this.snackBar.open(`ប្រតិបត្តិការបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.dialogRef.close('yes')
          this._onPrint(data)
        })
          .catch(err => {
            alert(err)
          })
          .finally(() => {
            this.process = false;
          })
      })
    }
  }

  _onPrint(item) {
    this.dialog.open(PrintReceiptDialogComponent, {
      data: { selectedCriminalRecord: item },
      width: '80vw',
      height: '85vh',
      disableClose: true
    });
  }

  getValueAndPatchToForm(key: string) {
    this.ds.offline_register().doc(key).get().toPromise().then(doc => {
      let data = pushToObject(doc)
      data = {
        ...data,
        phoneNumber: data?.phoneNumber || data?.footer_phone,
      }
      if (data) {
        const gender = this.GENDER_KH.find(f => f.key === data?.gender?.key)
        this.form.patchValue({
          first_name_kh: data?.first_name_kh,
          last_name_kh: data?.last_name_kh,
          footer_phone: data?.phoneNumber || data?.footer_phone,
          gender: gender
        })
      }
    })
  }

  // searchDATA(){
  //   const value = this.form.get('searchFilter')?.value
  //   this.getValueAndPatchToForm(value);
  // }

  onKeydownMain(event): void {
    if (event.keyCode === 13) {
      const value = this.form.get('searchFilter')?.value
      this.form.get('searchFilter').setValue(null)
      this.getValueAndPatchToForm(value);
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
    this.searchFilter?.nativeElement.focus()
  }
  onOutFocusSearch() {
    this.focusSearch = false;
  }

  onCloseSearch() {
    this.searchFilter = null
    this.form.get('searchFilter').patchValue(null);
    this.focusSearch = false;
  }

  setStyleBtnCancel() {
    if (this.focusSearch || this.form.get('searchFilter').value) {
      return {
        transform: 'translateX(-27px)',
        opacity: 1,
      }
    } else {
      return {
        transform: 'translateX(0)',
        opacity: 0,
      }
    }
  }

}

