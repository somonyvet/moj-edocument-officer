import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { NATIONALITY_APPLICAITON } from 'src/app/dummy/status';
import { LanguageStore } from 'src/app/languages/translate.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-criminal-latter-officer-choose-nationality',
  templateUrl: './criminal-latter-officer-choose-nationality.component.html',
  styleUrls: ['./criminal-latter-officer-choose-nationality.component.scss']
})
export class CriminalLatterOfficerChooseNationalityComponent implements OnInit {
  data = NATIONALITY_APPLICAITON
  duration = URGENT_OBJ_ARRAY
  form: FormGroup

  constructor(
    public dialogRef: MatDialogRef<CriminalLatterOfficerChooseNationalityComponent>,
    @Inject(MAT_DIALOG_DATA) public formData: any,
    public auth: AuthStore,
    private fb: FormBuilder,
    private router: Router,
    public tran: LanguageStore,
    public ds: DataService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      nationality: [this.data[0], Validators?.required],
      duration: [this.duration[1], Validators.required],
      khmer_form: [{ value: true, disabled: true }],
      khmer_amount: [1, [Validators.required, Validators.min(1)]],
      france_form: [false],
      france_amount: [null, [Validators.required, Validators.min(1)]],
      english_form: [false],
      english_amount: [null, [Validators.required, Validators.min(1)]],
    })

    const item = this.formData?.item || this.auth?.profile?.criminal_application || null;
    if (item) {
      this.form.patchValue({
        nationality: this.data?.find(m => m?.key === (item?.national_application?.key || item?.nationality?.key)) || this.data[0],
        duration: this.duration?.find(m => m?.key === (item?.urgent_obj?.key || item?.duration?.key)) || this.duration[1],
        khmer_amount: item?.criminal_language?.find(f => f.key === 1)?.amount || item?.khmer_amount || 1,
        france_form: (item?.criminal_language?.find(f => f.key === 2) || item?.france_form) ? true : false,
        france_amount: item?.criminal_language?.find(f => f.key === 2)?.amount || item?.france_amount || null,
        english_form: (item?.criminal_language?.find(f => f.key === 3) || item?.english_form) ? true : false,
        english_amount: item?.criminal_language?.find(f => f.key === 3)?.amount || item?.english_amount || null,
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

  proccess: boolean = false;
  create(f) {
    if (this.form.valid) {
      this.proccess = true;
      this.form.disable();
      const item = this.formData?.item;
      if (!item) {
        const doc = this.auth?.profile?.criminal_application || null;
        const key = doc?.key || this.ds.createId();
        const data = {
          ...f,
          key,
        }
        this.ds.userRef().doc(this.auth.uid).set({
          criminal_application: data
        }, { merge: true }).then(() => {
          this.router.navigate([`/criminal-record/form/${f?.nationality?.key}/application-no-iii/na/draft`])
          this.dialogRef.close('yes')
        }).catch(err => {
          alert(err)
        }).finally(() => {
          this.form.enable();
          this.proccess = false;
        })
      } else {
        this.router.navigate([`/criminal-record/form/${item?.national_application?.key}/${item?.application_type?.route}/${item?.citizen_ref}/${item?.key}`])
        this.dialogRef.close('yes')
      }
    }
  }

}
