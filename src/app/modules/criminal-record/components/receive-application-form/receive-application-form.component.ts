import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { debounceTime, map, take } from 'rxjs/operators';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, DOCUMENT_ATTACHMENT_TYPES, monthOfYear } from 'src/app/dummy/report';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { ConvertService, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { getYearsList, toCodeKey, todayDate } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';


@Component({
    selector: 'app-receive-application-form',
    templateUrl: './receive-application-form.component.html',
    styleUrls: ['./receive-application-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ReceiveApplicationFormComponent implements OnInit {

  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/digitization-documents.json',
  };

  form: UntypedFormGroup;
  DOCUMENT_ATTACHMENT_TYPES: any[] = DOCUMENT_ATTACHMENT_TYPES
  incomplete_criminal_record: boolean = false;
  incomplete_profile: boolean = false;
  incomplete_attachment: boolean = false;
  process: boolean = false;
  isKhmerForm: boolean = false;
  CRIMINAL_APPLICATION_LANGUAGE_ARRAY = CRIMINAL_APPLICATION_LANGUAGE_ARRAY;

  subscribe_criminal_application_ref: any;
  languageSelected: boolean = true;

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      code_kh: [null, [Validators.required], this.checkExistCodeKhRef()],
      code_en: [null, [Validators.required], this.checkExistCodeEnRef()],
    })
    this.subscribe_criminal_application_ref = this.criminalStore?.subscribeStatus.subscribe(res => {
      this.form.reset();
    });
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
        data: { title: 'ចុះលេខព្រឹត្តិបត្តថ្កោលទោស', memo: `តើលោកអ្នកពិតជាចង់ចុះលេខព្រឹត្តិបត្តថ្កោលទោសមែនទេ?` },
        panelClass: 'cs-dialog-doc',
        width: '580px',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(async result => {
        if (result === 'yes') {
          this.process = true;
          await this.auth.getServerTime();
          const { code_kh, code_en } = f;
          const DAYS = days?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
          const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: this.isKhmerForm, name_en: `${m}` } })
          const date = todayDate(this.auth.serverDateTime, DAYS, MONTHS, years);
          const keyword = (selectedCriminalRecord?.keyword || [])
          const item = {
            ...selectedCriminalRecord,
            updated_by: this.criminalStore?.getMappedProfile(),
            updated_at: this.ds.serverTimestamp(),
            approved_at: this.ds.serverTimestamp(),
            approved_by: this.auth?.getMappedApprover(),
            status: STATUS_OBJ.APPROVED,
            internal_status: STATUS_OBJ.APPROVED,
            keyword: keyword,
            code_kh: code_kh.trim(),
            code_kh_key: toCodeKey(code_kh),
            code_en: code_en.trim(),
            code_en_key: toCodeKey(code_en),
            // expired_date: ConvertService.addMonth(3),
          }
          this.criminalStore.approvedCriminal(item, selectedCitizenProfile, true).then(() => {
            this.snackBar.open(`ប្រតិបត្តិការជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
            this.router.navigate([`/criminal-record/criminal-latter/criminal-iii/`])
            // this.ds.userRef().doc(selectedCriminalRecord?.citizen_ref).set({criminal_record:null},{merge:true}).catch(err=>console.log(err))
            this.process = false;
          })
        }
      })
    }
  }

  patchForm(){
    let selectedLanguages = [];

    if(Array.isArray(this.criminalStore?.selectedCriminalRecord?.criminal_language)){
      selectedLanguages =  this.criminalStore?.selectedCriminalRecord?.criminal_language
    }
    const formArray = this.form.get('formArray') as UntypedFormArray;
    while(formArray.length > 0){
      formArray.removeAt(0)
    }
    this.CRIMINAL_APPLICATION_LANGUAGE_ARRAY?.forEach((m, i) => {
      const bol = selectedLanguages?.find(r => r?.key === m?.key) ? true : false;
      formArray.push(this.fb.group({
        language : m,
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

}

function minSelectedCheckboxes(min = 1) {
  const validator: ValidatorFn = (formArray: UntypedFormArray) => {
    const totalSelected = formArray.controls
      .filter(control => control.value?.check)
    return totalSelected?.length >= min ? null : { required: true };
  };
  return validator;
}
