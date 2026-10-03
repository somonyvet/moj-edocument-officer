import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { NATIONALITY_APPLICAITON } from 'src/app/dummy/status';
import { LanguageStore } from 'src/app/languages/translate.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-criminal-latter-choose-nationality',
  templateUrl: './criminal-latter-choose-nationality.component.html',
  styleUrls: ['./criminal-latter-choose-nationality.component.scss']
})
export class CriminalLatterChooseNationalityComponent implements OnInit {
  data = NATIONALITY_APPLICAITON
  duration = URGENT_OBJ_ARRAY
  form: FormGroup

  criminalData

  constructor(
    public auth: AuthStore,
    private fb: FormBuilder,
    private router: Router,
    private criminalStore: CriminalApplicationStore,
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

    const { profile } = this.auth;
    if (profile?.criminal_record) {
      this.criminalData = await this.criminalStore.getSelectedCriminalRecord(profile?.criminal_record?.key)
      this.form.patchValue({
        nationality: this.criminalData?.national_application,
        duration: this.criminalData?.urgent_obj,
        khmer_amount: this.criminalData?.criminal_language?.find(f=>f.key===1)?.amount || 1,
        france_form: this.criminalData?.criminal_language?.find(f=>f.key===2)? true : false,
        france_amount: this.criminalData?.criminal_language?.find(f=>f.key===2)?.amount || null,
        english_form: this.criminalData?.criminal_language?.find(f=>f.key===3)? true : false,
        english_amount: this.criminalData?.criminal_language?.find(f=>f.key===3)?.amount || null,
      })
    }
    this.form.controls['france_amount'].disable();
    this.form.controls['english_amount'].disable();

    if(this.criminalData?.criminal_language?.find(f=>f.key===2)){
      this.form.controls['france_amount'].enable();
    }
    if(this.criminalData?.criminal_language?.find(f=>f.key===3)){
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

  create(f) {
    if (this.form.valid) {
      const item = f.nationality
      this.criminalStore.applicationConfig = f;
      this.criminalStore.applicationConfigChange = true;
      this.router.navigate(['/ecosystem/criminal-record-form/' + item?.key + '/' + (this.auth?.profile?.criminal_record?.application_type_key || this.auth?.config?.criminal_application_type?.route) + '/' + this.auth?.uid + '/' + (this.auth?.profile?.criminal_record?.key || 'draft')]
      )
    }
  }

}
