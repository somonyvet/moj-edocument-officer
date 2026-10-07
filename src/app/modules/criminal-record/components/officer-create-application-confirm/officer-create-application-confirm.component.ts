import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subscription } from 'rxjs';
import { debounceTime, map, take } from 'rxjs/operators';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { days, DOCUMENT_ATTACHMENT_TYPES, monthOfYear } from 'src/app/dummy/report';
import { NATIONALITY_APPLICAITON } from 'src/app/dummy/status';
import { PrintReceiptDialogComponent } from 'src/app/modules/criminal-record/components/print-receipt-dialog/print-receipt-dialog.component';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { getYearsList, toCodeKey, toDateKey, todayDate, } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
@Component({
    selector: 'app-officer-create-application-confirm',
    templateUrl: './officer-create-application-confirm.component.html',
    styleUrls: ['./officer-create-application-confirm.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerCreateApplicationConfirmComponent implements OnInit, OnDestroy {
  lottie: AnimationOptions = {
    path: '../../../../assets/animate/61718-install.json',
  };
  form: UntypedFormGroup;
  DOCUMENT_ATTACHMENT_TYPES: any[] = DOCUMENT_ATTACHMENT_TYPES
  incomplete_criminal_record: boolean = false;
  incomplete_profile: boolean = false;
  incomplete_attachment: boolean = false;
  process: boolean = false;
  isKhmerForm: boolean = false;
  CRIMINAL_APPLICATION_LANGUAGE_ARRAY = CRIMINAL_APPLICATION_LANGUAGE_ARRAY;

  subscribe_criminal_application_ref: Subscription;
  languageSelected: boolean = true;

  URGENT_OBJ_ARRAY = URGENT_OBJ_ARRAY
  NATIONALITY_APPLICAITON = NATIONALITY_APPLICAITON
  isEntryOnly: boolean = false;

  STATUS_OBJ = STATUS_OBJ

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
    private router: Router,
  ) {
    this.isEntryOnly = this.auth?.dataEntryOnly
  }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      // formArray : new FormArray([], minSelectedCheckboxes(1))
      khmer_form: [{ value: true, disabled: true }],
      khmer_amount: [1, [Validators.required, Validators.min(1)]],
      france_form: [false],
      france_amount: [null, [Validators.required, Validators.min(1)]],
      english_form: [false],
      english_amount: [null, [Validators.required, Validators.min(1)]],
      urgent_obj: [URGENT_OBJ_ARRAY[0], [Validators.required]],
      isStudent: [false],
    })

    await this.auth.getServerTime();

    this.subscribe_criminal_application_ref?.unsubscribe()
    this.subscribe_criminal_application_ref = this.criminalStore?.subscribeStatus.subscribe(res => {
      const { selectedCriminalRecord, attachment_files } = this.criminalStore;
      this.isKhmerForm = selectedCriminalRecord?.national_application?.key === 'khmer';
      this.DOCUMENT_ATTACHMENT_TYPES = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === this.isKhmerForm);
      const criminalAttachmentKeys = attachment_files?.map(m => (`${m?.docType?.key}`));
      this.DOCUMENT_ATTACHMENT_TYPES = DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === this.isKhmerForm)?.map(m => {
        const completed = criminalAttachmentKeys?.find((r: any) => r == m?.key) ? true : false;
        return { ...m, completed }
      })

      const item = selectedCriminalRecord || this.auth?.profile?.criminal_application || null;

      this.form.patchValue({
        // nationality: this.NATIONALITY_APPLICAITON?.find(m => m?.key === (item?.national_application?.key || item?.nationality?.key)) || this.NATIONALITY_APPLICAITON[0],
        duration: this.URGENT_OBJ_ARRAY?.find(m => m?.key === (item?.urgent_obj?.key || item?.duration?.key)) || this.URGENT_OBJ_ARRAY[1],
        khmer_amount: item?.criminal_language?.find(f => f.key === 1)?.amount || item?.khmer_amount || 1,
        france_form: (item?.criminal_language?.find(f => f.key === 2) || item?.france_form) ? true : false,
        france_amount: item?.criminal_language?.find(f => f.key === 2)?.amount || item?.france_amount || null,
        english_form: (item?.criminal_language?.find(f => f.key === 3) || item?.english_form) ? true : false,
        english_amount: item?.criminal_language?.find(f => f.key === 3)?.amount || item?.english_amount || null,
        isStudent: item?.isStudent || false,
      })

      this.form.controls['france_amount'].disable();
      this.form.controls['english_amount'].disable();
      if (this.form?.value?.france_form) {
        this.form.controls['france_amount'].enable();
      }
      if (this.form?.value?.english_form) {
        this.form.controls['english_amount'].enable();
      }

      // this.patchForm();
      this.languageSelected = this.criminalStore?.selectedCriminalRecord?.criminal_language?.length > 0;
      this.incomplete_attachment = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.required && !m?.completed)?.length > 0 ? true : false;
    })

  }

  onChangeLanguage(event: MatCheckboxChange, type: string) {
    if (event?.checked) {
      this.form.controls[type].enable();
    } else {
      this.form.controls[type].disable();
    }
  }

  get totalCopies(): number {
    const v = this.form?.value;
    if (!v) return 0;
    let total = Number(v?.khmer_amount) || 0;
    if (v?.france_form) total += Number(v?.france_amount) || 0;
    if (v?.english_form) total += Number(v?.english_amount) || 0;
    return total;
  }

  bumpAmount(controlName: string, delta: number) {
    const control = this.form?.controls?.[controlName];
    if (!control || control.disabled) return;
    const next = (Number(control.value) || 0) + delta;
    control.setValue(Math.max(1, next));
  }

  ngOnDestroy() {
    this.subscribe_criminal_application_ref?.unsubscribe();
  }


  _onSubmit(f: any) {
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;
    if(selectedCriminalRecord?.status?.key >= STATUS_OBJ?.APPLY?.key) return;
    if (this.incomplete_criminal_record || !selectedCriminalRecord || !selectedCitizenProfile) {
      alert('សូមបញ្ចូលព័ត៌មានពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស និងឯកសារភ្ជាប់ឲ្យបានត្រឹមត្រូវ')
    } else {
      const ref = this.dialog.open(ConfirmSuccessComponent, {
        data: { title: this.isEntryOnly ? 'ដាក់ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស' : 'ទទួលស្នើសុំពិនិត្យ', memo: this.isEntryOnly ? `តើលោកអ្នកពិតជាចង់ដាក់ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសមែនទេ?` : `តើលោកអ្នកពិតជាចង់ទទួលពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសមែនទេ?` },
        panelClass: 'cs-dialog-doc',
        width: '580px',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.process = true;
          this.form.disable()
          const DAYS = days?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: this.isKhmerForm, name_en: `${m}` } })
          const date = todayDate(this.auth.serverDateTime, DAYS, MONTHS, years);
          const keyword = (selectedCriminalRecord?.keyword || [])

          let selected_language = []
          const khmer_language_obj = {
            ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[0],
            amount: f?.khmer_amount,
          }
          selected_language.push(khmer_language_obj);
          if (f?.france_form) {
            const france_language_obj = {
              ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[1],
              amount: f?.france_amount,
            }
            selected_language.push(france_language_obj);
          }
          if (f?.english_form) {
            const english_language_obj = {
              ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[2],
              amount: f?.english_amount,
            }
            selected_language.push(english_language_obj);
          }

          const urgent_obj = f?.urgent_obj;

          const item = {
            ...selectedCriminalRecord,
            day_header: date?.day,
            month_header: date?.month,
            year_header: date.year,
            updated_by: this.criminalStore?.getMappedProfile(),
            updated_at: this.ds.serverTimestamp(),
            apply_at: this.ds.serverTimestamp(),
            apply_by: this.criminalStore?.getMappedProfile(),
            confirm_at: this.ds.serverTimestamp(),
            confirm_by: this.criminalStore?.getMappedProfile(),
            review_at: this.ds.serverTimestamp(),
            review_by: this.criminalStore?.getMappedProfile(),
            tran_at: this.ds.serverTimestamp(),
            tran_date_key: toDateKey(this.auth.serverDateTime),
            // status: this.auth?.dataEntryOnly ? STATUS_OBJ?.APPLY : STATUS_OBJ.REVIEW,
            status: (selectedCriminalRecord?.status?.key >  STATUS_OBJ?.APPLY?.key) ? selectedCriminalRecord?.status : STATUS_OBJ?.APPLY,
            internal_status: null,

            criminal_language: selected_language,
            urgent_obj: urgent_obj || null,
            isStudent: f?.isStudent || false,
          }
          this.criminalStore.approvedCriminal(item, selectedCitizenProfile, true).then(() => {
            this.snackBar.open(`ប្រតិបត្តិការត្រូវបានរក្សាទុកដោយជោគជ័យ`, "រួចរាល់", { duration: 3000 });
            let url = `/criminal-record/form/${item?.national_application?.key || 'khmer'}/application-no-iii`;
            this.form.enable()
            if(this.auth?.dataEntryOnly){
              url = '/criminal-record/applications/bulletin-list/labor/'+item?.key
            }
            this.router.navigate([url])
            this.process = false;
          })
        }
      })
    }
  }

  patchForm() {
    let selectedLanguages = [];

    if (Array.isArray(this.criminalStore?.selectedCriminalRecord?.criminal_language)) {
      selectedLanguages = this.criminalStore?.selectedCriminalRecord?.criminal_language
    }
    const formArray = this.form.get('formArray') as UntypedFormArray;
    while (formArray.length > 0) {
      formArray.removeAt(0)
    }
    this.CRIMINAL_APPLICATION_LANGUAGE_ARRAY?.forEach((m, i) => {
      const bol = selectedLanguages?.find(r => r?.key === m?.key) ? true : false;
      formArray.push(this.fb.group({
        language: m,
        check: bol,
      }))
    })
  }

  checkExistCodeKhRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.criminalRecordRef(ref => ref.where('code_kh_key', '==', toCodeKey(value))).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  checkExistCodeEnRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.criminalRecordRef(ref => ref.where('code_en_key', '==', toCodeKey(value))).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  _onPrint() {
    const { selectedCriminalRecord } = this.criminalStore;
    this.dialog.open(PrintReceiptDialogComponent, {
      data: { selectedCriminalRecord: selectedCriminalRecord },
      width: '90vw',
      height: '80vh',
      disableClose: true
    })
  }
}

function minSelectedCheckboxes(min = 1) {
  const validator: ValidatorFn = (formArray: UntypedFormArray) => {
    const totalSelected = formArray.controls
      .filter(control => control.value?.check)
    return totalSelected?.length >= min ? null : { required: true };
  };
  return validator;
}
