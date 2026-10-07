import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subscription } from 'rxjs';
import { debounceTime, map, take } from 'rxjs/operators';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, PHOTO_LIB, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { days, monthOfYear } from 'src/app/dummy/report';
import { CriminalScanFingerPrintDialogComponent } from 'src/app/modules/criminal-record/components/criminal-scan-finger-print-dialog/criminal-scan-finger-print-dialog.component';
import { PrintFinishReviewDialogComponent } from 'src/app/modules/criminal-record/components/print-finish-review-dialog/print-finish-review-dialog.component';
import { PrintReceiptDialogComponent } from 'src/app/modules/criminal-record/components/print-receipt-dialog/print-receipt-dialog.component';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { DataService } from 'src/app/shared/services/data.service';
import { getYearsList, toCodeKey, toDateKey, todayDate, } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { toLocaleNumber } from '../../services/convert.service';
import { APPLY_OBJECT } from 'src/app/dummy/appinfo';

@Component({
    selector: 'app-review-criminal-application',
    templateUrl: './review-criminal-application.component.html',
    styleUrls: ['./review-criminal-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ReviewCriminalApplicationComponent implements OnInit, OnDestroy {

  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/digitization-documents.json',
  };

  form: UntypedFormGroup;

  DOCUMENT_ATTACHMENT_TYPES: any = [];
  incomplete_criminal_record: boolean = false;
  incomplete_profile: boolean = false;
  incomplete_attachment: boolean = false;
  process: boolean = false;
  isKhmerForm: boolean = false;
  CRIMINAL_APPLICATION_LANGUAGE_ARRAY = CRIMINAL_APPLICATION_LANGUAGE_ARRAY;

  subscribe_criminal_application_ref: Subscription;
  languageSelected: boolean = true;

  EMPTY_PHOTO = PHOTO_LIB?.EMPTY_AVATAR
  URGENT_OBJ_ARRAY = URGENT_OBJ_ARRAY
  STATUS_OBJ = STATUS_OBJ
  CAN_TAKE_FINGER_PRINT = false;
  // enableCanCome = false;

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
    const { selectedCriminalRecord, attachment_files } = this.criminalStore;

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

    this.form.controls['france_amount'].disable();
    this.form.controls['english_amount'].disable();

    this.subscribe_criminal_application_ref?.unsubscribe()
    this.subscribe_criminal_application_ref = this.criminalStore?.subscribeStatus.subscribe(res => {
      this.isKhmerForm = selectedCriminalRecord?.national_application?.key === 'khmer';
      this.DOCUMENT_ATTACHMENT_TYPES = AttachmentForOfficer?.filter(m => m?.forKhmer === this.isKhmerForm);
      const criminalAttachmentKeys = attachment_files?.map(m => (`${m?.docType?.key}`));
      const validRequiredFiles = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.required && criminalAttachmentKeys.includes(`${m.key}`))
      this.DOCUMENT_ATTACHMENT_TYPES = AttachmentForOfficer?.filter(m => m?.forKhmer === this.isKhmerForm)?.map(m => {
        const completed = criminalAttachmentKeys?.find((r: any) => r == m?.key) ? true : false;
        return { ...m, completed }
      })
      this.form.patchValue({
        khmer_amount: selectedCriminalRecord?.criminal_language?.find(f => f.key === 1)?.amount || 1,
        france_form: selectedCriminalRecord?.criminal_language?.find(f => f.key === 2) ? true : false,
        france_amount: selectedCriminalRecord?.criminal_language?.find(f => f.key === 2)?.amount || null,
        english_form: selectedCriminalRecord?.criminal_language?.find(f => f.key === 3) ? true : false,
        english_amount: selectedCriminalRecord?.criminal_language?.find(f => f.key === 3)?.amount || null,
        urgent_obj: this.URGENT_OBJ_ARRAY?.find(m => m?.key === selectedCriminalRecord?.urgent_obj?.key) || null,
        isStudent: selectedCriminalRecord?.isStudent || false,
      })
      if (selectedCriminalRecord?.criminal_language?.find(f => f.key === 2)) {
        this.form.controls['france_amount'].enable();
      } else {
        this.form.controls['france_amount'].disable();
      }

      if (selectedCriminalRecord?.criminal_language?.find(f => f.key === 3)) {
        this.form.controls['english_amount'].enable();
      } else {
        this.form.controls['english_amount'].disable();
      }

      // const { enable_before_canCome,enableCanCome } = this.auth.config
      // const { uid } = this.auth
      // this.enableCanCome = enableCanCome;
      // if(enable_before_canCome){
      //   this.CAN_TAKE_FINGER_PRINT = selectedCriminalRecord?.officerVerifyRef?.key === uid
      // }else{
      //   this.CAN_TAKE_FINGER_PRINT = selectedCriminalRecord?.officerVerifyRef?.key === uid && selectedCriminalRecord?.canCome_at?.toDate() <= new Date();
      // }

      const { canTakeFingerPrintForOnlineApplication } = this.auth
      this.CAN_TAKE_FINGER_PRINT = canTakeFingerPrintForOnlineApplication;
      
      const laborDepartment = this.auth?.config?.department_labor?.key
      if((selectedCriminalRecord?.workplace_entry?.key === laborDepartment) || (selectedCriminalRecord?.entry_officer_type?.key === 3)){
        this.CAN_TAKE_FINGER_PRINT = false;
      }
      if(((selectedCriminalRecord?.workplace_entry?.key && (selectedCriminalRecord?.workplace_entry?.key === laborDepartment)) ||  (selectedCriminalRecord?.entry_officer_type?.key === 3))&& this.auth?.laborHandler){
        this.CAN_TAKE_FINGER_PRINT = true;
      }

      if(selectedCriminalRecord?.status?.key === STATUS_OBJ.DRAFT?.key){
        this.CAN_TAKE_FINGER_PRINT = true;
      }

      if(selectedCriminalRecord?.onlineApplyAtMOJ){
        this.CAN_TAKE_FINGER_PRINT = true;
      }

      this.languageSelected = this.criminalStore?.selectedCriminalRecord?.criminal_language?.length > 0;
      this.incomplete_attachment = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.required && !m?.completed)?.length > 0 ? true : false;
    })

    if(selectedCriminalRecord?.paid_online){
      this.form?.disable()
    }
  }

  onChangeLanguage(event: MatCheckboxChange, type: string) {
    if (event?.checked) {
      this.form.controls[type].enable();
    } else {
      this.form.controls[type].disable();
    }
  }

  ngOnDestroy() {
    this.subscribe_criminal_application_ref?.unsubscribe();
  }


  _onSubmit(f) {
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;
    if (this.incomplete_criminal_record || !selectedCriminalRecord || !selectedCitizenProfile) {
      alert('Invalid some information!')
    } else {
      const ref = this.dialog.open(CriminalScanFingerPrintDialogComponent, {
        data: { title: 'ទទួលស្នើសុំពិនិត្យ', memo: `តើលោកអ្នកពិតជាចង់ទទួលពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសមែនទេ?` },
        panelClass: 'cs-dialog-doc',
        width: '580px',
        height: '72vh',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(result => {
        if (result && result?.dataImg) {
          this.process = true;

          if(selectedCriminalRecord?.paid_online){
            this.takeFingerPrintPaidOnline(result)
            return;
          }

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
            updated_by: this.criminalStore?.getMappedProfile(),
            updated_at: this.ds.serverTimestamp(),
            apply_at: selectedCriminalRecord?.apply_at || this.ds.serverTimestamp(),
            apply_by: selectedCriminalRecord?.apply_by || this.criminalStore?.getMappedProfile(),
            confirm_at: selectedCriminalRecord?.confirm_at || this.ds.serverTimestamp(),
            confirm_by: selectedCriminalRecord?.confirm_by || this.criminalStore?.getMappedProfile(),
            review_at: this.ds.serverTimestamp(),
            review_by: this.criminalStore?.getMappedProfile(),
            tran_at: this.ds.serverTimestamp(),
            tran_date_key: toDateKey(this.auth.serverDateTime),
            status: selectedCriminalRecord?.status?.key > STATUS_OBJ.REVIEW?.key ? selectedCriminalRecord?.status : STATUS_OBJ.REVIEW,
            internal_status: selectedCriminalRecord?.internal_status ||  null,

            criminal_language: selected_language,
            urgent_obj: urgent_obj || null,
            isStudent: f?.isStudent || false,
            canCome_at: null,
          }

          this.criminalStore.approvedCriminalFingerrint(item, selectedCitizenProfile, true, result?.dataImg).then(() => {
            this.snackBar.open(`ប្រតិបត្តិការជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
            this.router.navigate([`/criminal-record/applications/apply-in-place/apply`])
            this.process = false;
            this._onPrintPreview()
          })
        }
      })
    }
  }

  takeFingerPrintPaidOnline(result){
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;
    const item = {
      key: selectedCriminalRecord?.key,

      review_at: this.ds.serverTimestamp(),
      review_by: this.criminalStore?.getMappedProfile(),

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime),

      done_at: this.criminalStore?.selectedCriminalRecord?.done_at || this.ds.serverTimestamp(),
      done_by: this.criminalStore?.selectedCriminalRecord?.done_by || this.criminalStore?.getMappedProfile(),

      withdraw_location: APPLY_OBJECT.local,
      status: STATUS_OBJ.DONE,
    }

    this.criminalStore.approvedCriminalFingerrint(item, selectedCitizenProfile, true, result?.dataImg).then(() => {
      this.snackBar.open(`ប្រតិបត្តិការជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.process = false;
    })
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

  _onPrintPreview() {
    const { selectedCriminalRecord } = this.criminalStore;
    this.dialog.open(PrintFinishReviewDialogComponent, {
      data: { selectedCriminalRecord: selectedCriminalRecord, print: 'rp' },
      width: '90vw',
      height: '80vh',
      disableClose: true
    })
  }

  onSaveForm(f) {
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;
    if (this.incomplete_criminal_record || !selectedCriminalRecord || !selectedCitizenProfile) {
      alert('Invalid some information!')
    }
    this.process = true;
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
      updated_by: this.criminalStore?.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
      criminal_language: selected_language,
      urgent_obj: urgent_obj || null,
      isStudent: f?.isStudent || false,
    }
    this.criminalStore.saveCri(item).then(()=>{
      this.snackBar.open(`ប្រតិបត្តិការជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.process = false;
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


export const AttachmentForOfficer = [
  { key: 1, name: `ប័ណ្ណសម្គាល់ខ្លួន សិស្ស និស្សិត`, name_en: `Student card`, forKhmer: true, required: false, data: [], icon: 'credit_card' },
  { key: 1, name: `ប័ណ្ណសម្គាល់ខ្លួន សិស្ស និស្សិត`, name_en: `Student card`, forKhmer: false, required: false, data: [], icon: 'credit_card' },
  { key: 2, name: `សេចក្ដីចម្លងសំបុត្របញ្ជាក់កំណើត`, name_en: `Birth certificate copy`, forKhmer: true, required: true, data: [], icon: 'description' },
  { key: 3, name: `សៀវភៅស្នាក់នៅ ឬសៀវភៅគ្រួសារច្បាប់ដើមថតចម្លង(ខាងមុខ)`, name_en: `Original copy of residence book and family book(front page)`, forKhmer: true, required: true, data: [], icon: 'article' },
  { key: 3.1, name: `សៀវភៅស្នាក់នៅ ឬសៀវភៅគ្រួសារច្បាប់ដើមថតចម្លង(ខាងក្នុង)`, name_en: `Original copy of residence book and family book(inside)`, forKhmer: true, required: false, data: [], icon: 'article' },
  // { key: 4, name: `លិខិតបញ្ជាក់ទីលំនៅចេញដោយអញ្ញាធរ ឃុំ. សង្កាត់`, name_en: `Proof of residence`, forKhmer: false, required: true, data: [], icon: 'library_books' },
  { key: 4, name: `ទិដ្ឋាការចូលមកប្រទេសកម្ពុជា`, name_en: `Visa to Cambodia`, forKhmer: false, required: true, data: [], icon: 'library_books' },
  { key: 5, name: `លិខិតឆ្លងដែន មានសុពលភាពថតចម្លង`, name_en: `Passport copy`, forKhmer: false, required: true, data: [], icon: 'collections_bookmark' },
]