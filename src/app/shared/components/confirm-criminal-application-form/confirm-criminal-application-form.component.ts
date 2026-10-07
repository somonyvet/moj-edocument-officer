import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { days, DOCUMENT_ATTACHMENT_TYPES, monthOfYear } from 'src/app/dummy/report';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { toLocaleNumber } from '../../services/convert.service';
import { DataService } from '../../services/data.service';
import { getYearsList, toDateKey, todayDate } from '../../services/mapping.service';
import { ConfirmSuccessComponent } from '../confirm-success/confirm-success.component';

@Component({
    selector: 'app-confirm-criminal-application-form',
    templateUrl: './confirm-criminal-application-form.component.html',
    styleUrls: ['./confirm-criminal-application-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ConfirmCriminalApplicationFormComponent implements OnInit {

  form: UntypedFormGroup;

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/45793-confirmed.json',
  };

  DOCUMENT_ATTACHMENT_TYPES: any[] = DOCUMENT_ATTACHMENT_TYPES
  incomplete_criminal_record: boolean = false;
  incomplete_profile: boolean = false;
  incomplete_attachment: boolean = false;
  process: boolean = false;
  isKhmerForm: boolean = false;

  CRIMINAL_APPLICATION_LANGUAGE_ARRAY = CRIMINAL_APPLICATION_LANGUAGE_ARRAY;
  subscribe_criminal_application_ref: any;
  languageSelected: boolean = true;

  URGENT_OBJ_ARRAY = URGENT_OBJ_ARRAY;
  enableCanCome: boolean = false;

  CAN_VERIFIED = false;

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
    // this.form = this.fb.group({
    //   formArray: new FormArray([], minSelectedCheckboxes(1))
    // })
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
      canCome_at: [null, [Validators.required]],
    })

    this.subscribe_criminal_application_ref = this.criminalStore?.subscribeStatus.subscribe(res => {
      const { selectedCriminalRecord, attachment_files } = this.criminalStore;
      this.isKhmerForm = selectedCriminalRecord?.national_application?.key === 'khmer';
      this.DOCUMENT_ATTACHMENT_TYPES = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === this.isKhmerForm);
      const criminalAttachmentKeys = attachment_files?.map(m => (`${m?.docType?.key}`));
      const validRequiredFiles = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.required && criminalAttachmentKeys.includes(`${m.key}`))
      this.DOCUMENT_ATTACHMENT_TYPES = DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === this.isKhmerForm)?.map(m => {
        const completed = criminalAttachmentKeys?.find((r:any) => r == m?.key) ? true : false;
        return { ...m, completed }
      })

      const item = selectedCriminalRecord || null;

      this.form.patchValue({
        // nationality: this.NATIONALITY_APPLICAITON?.find(m => m?.key === (item?.national_application?.key || item?.nationality?.key)) || this.NATIONALITY_APPLICAITON[0],
        urgent_obj: URGENT_OBJ_ARRAY?.find(m => m?.key === (item?.urgent_obj?.key || item?.duration?.key)) || URGENT_OBJ_ARRAY[1],
        khmer_amount: item?.criminal_language?.find(f => f.key === 1)?.amount || item?.khmer_amount || 1,
        france_form: (item?.criminal_language?.find(f => f.key === 2) || item?.france_form) ? true : false,
        france_amount: item?.criminal_language?.find(f => f.key === 2)?.amount || item?.france_amount || null,
        english_form: (item?.criminal_language?.find(f => f.key === 3) || item?.english_form) ? true : false,
        english_amount: item?.criminal_language?.find(f => f.key === 3)?.amount || item?.english_amount || null,
        isStudent: item?.isStudent || false,
        canCome_at: item?.canCome_at || null,
      })

      this.form.controls['france_amount'].disable();
      this.form.controls['english_amount'].disable();
      if (this.form?.value?.france_form) {
        this.form.controls['france_amount'].enable();
      }
      if (this.form?.value?.english_form) {
        this.form.controls['english_amount'].enable();
      }

      const { enableCanCome } = this.auth.config
      const { uid } = this.auth
      this.enableCanCome = enableCanCome;
      this.CAN_VERIFIED = selectedCriminalRecord?.officerVerifyRef?.key === uid

      if(!enableCanCome){
        this.form.controls['canCome_at'].disable();
      }

      this.languageSelected = this.criminalStore?.selectedCriminalRecord?.criminal_language?.length > 0;
      this.incomplete_attachment = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.required && !m?.completed)?.length > 0 ? true : false;
    })

  }

  ngOnDestroy() {
    this.subscribe_criminal_application_ref?.unsubscribe();
  }

  _onSubmit(f) {
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;

    if (this.incomplete_criminal_record || !selectedCriminalRecord || !selectedCitizenProfile) {
      alert('Invalid some information!')
    } else {
      const ref = this.dialog.open(ConfirmSuccessComponent, {
        data: { title: 'ទទួលស្នើសុំពិនិត្យ', memo: `តើលោកអ្នកពិតជាចង់ទទួលពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសមែនទេ?` },
        panelClass: 'cs-dialog-doc',
        width: '580px',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.process = true;

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
            confirm_at: this.ds.serverTimestamp(),
            confirm_by: this.criminalStore?.getMappedProfile(),
            status: STATUS_OBJ.CONFIRM_APPLICATION,
            internal_status: null,
            keyword: keyword,

            criminal_language: selected_language || null,
            urgent_obj: urgent_obj || null,

            tran_at: this.ds.serverTimestamp(),
            tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
            isStudent: f?.isStudent || false,
            canCome_at: f?.canCome_at || null,
          }
          this.criminalStore.approvedCriminal(item, selectedCitizenProfile, true).then(() => {
            this.snackBar.open(`ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសបានដាក់បញ្ជូនទៅក្រសួងដើម្បីពិនិត្យដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
            this.router.navigate([`/criminal-record/applications/apply-online`])
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

  onChangeLanguage(event: MatCheckboxChange, type: string) {
    if (event?.checked) {
      this.form.controls[type].enable();
    } else {
      this.form.controls[type].disable();
    }
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
