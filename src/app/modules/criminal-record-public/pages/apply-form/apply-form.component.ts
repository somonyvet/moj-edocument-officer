import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { days, DOCUMENT_ATTACHMENT_TYPES, monthOfYear } from 'src/app/dummy/report';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';
import { getYearsList, todayDate } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-apply-form',
  templateUrl: './apply-form.component.html',
  styleUrls: ['./apply-form.component.scss']
})
export class ApplyFormComponent implements OnInit {
  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/digitization-documents.json',
  };
  isKhmerForm: boolean = false;
  DOCUMENT_ATTACHMENT_TYPES: any[] = DOCUMENT_ATTACHMENT_TYPES

  incomplete_criminal_record: boolean = false;
  incomplete_profile: boolean = false;
  incomplete_attachment: boolean = false;
  process: boolean = false;
  canSave:boolean = false;
  CRIMINAL_APPLICATION_LANGUAGE_ARRAY = CRIMINAL_APPLICATION_LANGUAGE_ARRAY;

  form: FormGroup;
  STATUS_OBJ = STATUS_OBJ;
  URGENT_OBJ_ARRAY = URGENT_OBJ_ARRAY;

  urgent_obj = null

  constructor(
    public store: CriminalApplicationStore,
    public auth: AuthStore,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb : FormBuilder
  ) { }

  ngOnInit(): void {
    if(!this.store?.applicationConfig) this.router.navigate(['/ecosystem/criminal-record-latter/create'])

    this.form = this.fb.group({
      khmer_form: [{ value: true, disabled: true }],
      khmer_amount: [1, [Validators.required, Validators.min(1)]],
      france_form: [false],
      france_amount: [null, [Validators.required, Validators.min(1)]],
      english_form: [false],
      english_amount: [null, [Validators.required, Validators.min(1)]],
      urgent_obj: [URGENT_OBJ_ARRAY[0], [Validators.required]],
      isStudent: [false],
    })
    const { selectedCriminalRecord, selectedCitizenProfile, attachment_files } = this.store;

    this.urgent_obj = selectedCriminalRecord?.urgent_obj

    this.canSave = selectedCriminalRecord?.status?.key === STATUS_OBJ.DRAFT?.key;
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
      urgent_obj: URGENT_OBJ_ARRAY?.find(m => m?.key === (item?.urgent_obj?.key || item?.duration?.key)) || URGENT_OBJ_ARRAY[1],
      khmer_amount: item?.criminal_language?.find(f => f.key === 1)?.amount || item?.khmer_amount || 1,
      france_form: (item?.criminal_language?.find(f => f.key === 2) || item?.france_form) ? true : false,
      france_amount: item?.criminal_language?.find(f => f.key === 2)?.amount || item?.france_amount || null,
      english_form: (item?.criminal_language?.find(f => f.key === 3) || item?.english_form) ? true : false,
      english_amount: item?.criminal_language?.find(f => f.key === 3)?.amount || item?.english_amount || null,
      isStudent: item?.isStudent || false,
    })

    if(selectedCriminalRecord?.status?.key && selectedCriminalRecord?.status?.key !== STATUS_OBJ.DRAFT?.key){
      this.form?.disable();
    }
    this.incomplete_attachment = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.required && !m?.completed)?.length > 0 ? true : false;
  }

  _onSubmit(f) {
    if(!this.form?.valid) return;
    const { selectedCriminalRecord, selectedCitizenProfile, attachment_files } = this.store;
    if (this.incomplete_criminal_record || !selectedCriminalRecord || !selectedCitizenProfile) {
      alert('Invalid some information!')
    } else {
      const ref = this.dialog.open(ConfirmSuccessComponent, {
        // data: { title: 'ដាក់ស្នើសុំពិនិត្យ', memo: `តើលោកអ្នកចង់លុបសំណើរសុំព្រឹត្តិបត្រថ្កោលទោសចេញពីប្រព័ន្ធមែនទេ` },
        data: { title: 'ដាក់ស្នើសុំពិនិត្យ', memo: `តើលោកអ្នកពិតជាចង់ដាក់ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសមែនទេ?` },
        panelClass: 'cs-dialog-doc',
        width: '580px',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'yes') {
          if(!this.canSave) return;
          this.process = true;
          // const selectedLanguages = f?.formArray?.filter(f=>f.check).map(m=>m.language)
          const DAYS = days?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: this.isKhmerForm, name_en: `${m}` } })
          const date = todayDate(this.auth.serverDateTime, DAYS, MONTHS, years);

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
            status: STATUS_OBJ.APPLY,
            apply_at: this.auth.serverDateTime,
            apply_by: this.store.getMappedProfilePublic(),
            criminal_language : selected_language,
            urgent_obj: urgent_obj || null,
            isStudent: f?.isStudent || false,
          }
          this.store.saveCri(item).then(() => {
            this.snackBar.open(`ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសបានដាក់បញ្ជូនទៅក្រសួងដើម្បីពិនិត្យដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
            this.router.navigate(['/'])
            this.process = false;
          })
        }
      })
    }
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
  const validator: ValidatorFn = (formArray: FormArray) => {
    const totalSelected = formArray.controls
      .filter(control => control.value?.check)
    return totalSelected?.length >= min ? null : { required: true };
  };
  return validator;
}
