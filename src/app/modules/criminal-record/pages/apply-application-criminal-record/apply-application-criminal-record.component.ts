import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, DOCUMENT_ATTACHMENT_TYPES, monthOfYear } from 'src/app/dummy/report';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';
import { getYearsList, todayDate } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-apply-application-criminal-record',
    templateUrl: './apply-application-criminal-record.component.html',
    styleUrls: ['./apply-application-criminal-record.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ApplyApplicationCriminalRecordComponent implements OnInit {
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

  form: UntypedFormGroup;

  constructor(
    public store: CriminalApplicationStore,
    public auth: AuthStore,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb : UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      formArray : new UntypedFormArray([], minSelectedCheckboxes(1))
    })
    const { selectedCriminalRecord, selectedCitizenProfile, attachment_files } = this.store;
    this.canSave = selectedCriminalRecord?.status?.key === STATUS_OBJ.DRAFT?.key || selectedCriminalRecord?.status?.key === STATUS_OBJ.APPLY?.key;
    this.isKhmerForm = selectedCriminalRecord?.national_application?.key === 'khmer';
    this.DOCUMENT_ATTACHMENT_TYPES = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === this.isKhmerForm);
    const criminalAttachmentKeys = attachment_files?.map(m => (`${m?.docType?.key}`));
    const validRequiredFiles = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.required && criminalAttachmentKeys.includes(`${m.key}`))
    this.DOCUMENT_ATTACHMENT_TYPES = DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === this.isKhmerForm)?.map(m => {
      const completed = validRequiredFiles?.find(r => r?.key === m?.key) ? true : false;
      return { ...m, completed }
    })
    this.patchForm();
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
      ref.afterClosed().subscribe(async result => {
        if (result === 'yes') {
          if(!this.canSave) return;
          this.process = true;
          await this.auth.getServerTime();
          const selectedLanguages = f?.formArray?.filter(f=>f.check).map(m=>m.language)
          const DAYS = days?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: this.isKhmerForm, name_en: `${m}` } })
          const date = todayDate(this.auth.serverDateTime, DAYS, MONTHS, years);
          const item = {
            ...selectedCriminalRecord,
            day_header: date?.day,
            month_header: date?.month,
            year_header: date.year,
            status: STATUS_OBJ.APPLY,
            apply_at: this.auth.serverDateTime,
            apply_by: this.store.getMappedProfile(),
            criminal_language : selectedLanguages,
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

  patchForm(){
    const formArray = this.form.get('formArray') as UntypedFormArray;
    this.CRIMINAL_APPLICATION_LANGUAGE_ARRAY?.forEach((m, i) => {
      formArray.push(this.fb.group({
        language : m,
        check: i===0?true:false,
      }))
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
