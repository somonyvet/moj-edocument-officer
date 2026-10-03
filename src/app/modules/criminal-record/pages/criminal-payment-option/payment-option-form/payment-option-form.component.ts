import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { APPLY_OBJECT_ARRAY, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { NATIONALITY_APPLICAITON } from 'src/app/dummy/status';
import { LanguageStore } from 'src/app/languages/translate.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { paymentOptionStore } from '../../../stores/paymentOption.store';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-option-form',
  templateUrl: './payment-option-form.component.html',
  styleUrls: ['./payment-option-form.component.scss']
})
export class PaymentOptionFormComponent implements OnInit {

  data = NATIONALITY_APPLICAITON;
  duration = URGENT_OBJ_ARRAY;
  APPLY_OBJECT_ARRAY = APPLY_OBJECT_ARRAY;

  form: FormGroup;
  title = "បង្កើតជម្រើសបង់ប្រាក់";
  item: any;
  totalPrice: number = 0;

  constructor(
    public dialogRef: MatDialogRef<PaymentOptionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public formData: any,
    public auth: AuthStore,
    private fb: FormBuilder,
    private router: Router,
    public tran: LanguageStore,
    public ds: DataService,
    public store: paymentOptionStore,
    private snackBar: MatSnackBar,

  ) { }

  async ngOnInit(): Promise<void> {

    this.form = this.fb.group({
      nationality: [this.data[0], Validators?.required],
      duration: [this.duration[1], Validators.required],
      apply_from: [this.APPLY_OBJECT_ARRAY[0], Validators.required],
      isStudent: [false,[Validators.required]],
      khmer_price: [1, [Validators.required]],
      france_price: [null, [Validators.required]],
      english_price: [null, [Validators.required]],
      tran_fee: [null, [Validators.required]],
    })

    const item = this.formData?.item || this.auth?.profile?.criminal_application || null;
    if (item) {
      this.form.patchValue({
        nationality: this.data?.find(m => m?.key === (item?.national_application?.key || item?.nationality?.key)) || this.data[0],
        duration: this.duration?.find(m => m?.key === (item?.urgent_obj?.key || item?.duration?.key)) || this.duration[1],
        apply_from: this.APPLY_OBJECT_ARRAY?.find(f=>f?.key === item?.apply_from?.key) || this.APPLY_OBJECT_ARRAY[0],
        isStudent: item?.isStudent || false,
        khmer_price: item?.khmer_price || 1,
        france_price: item?.france_price || null,
        english_price: item?.english_price || null,
        tran_fee: item?.tran_fee || null,
      })
    }
  }

  // async calcPrice(control: AbstractControl) {
  //   if (control) {
  //     const cntName = this.getControlName(control);
  //     const { english_price, france_price, khmer_price } = this.form.getRawValue();
  //     const { value } = control;
  //     if (cntName === 'khmer_price') {
  //       this.totalPrice = value + english_price + france_price;
  //     }
  //     if (cntName === 'france_price') {
  //       this.totalPrice = value + english_price + khmer_price;
  //     }
  //     if (cntName === 'english_price') {
  //       this.totalPrice = value + khmer_price + france_price;
  //     }
  //   } return null
  // }

  getControlName(control: AbstractControl): string | null {
    const formGroup = control.parent?.controls;
    return Object.keys(formGroup || {}).find(name => control === formGroup[name]) || null;
  }

  onChangeLanguage(event: MatCheckboxChange, type: string) {
    this.form.controls[type].setValue(0);
    const { english_price, france_price, khmer_price } = this.form.getRawValue();
    this.totalPrice = france_price + english_price + khmer_price;
    if (event?.checked) {
      this.form.controls[type].enable();
    } else {
      this.form.controls[type].disable();
    }
  }

  process: boolean = false;
  create(f, isNew: boolean) {
    if (this.form.valid) {
      this.process = true;
      this.form.disable();
      const item = this.formData?.item;
      const key = item?.key || this.ds.createId();
      const formData = {
        ...f,
        key,
        status: STATUS_OBJ.ACTIVE,
        isDelete: false,
        created_at: item?.created_at || this.auth.serverDateTime,
        create_by: item?.create_by || this.auth.getMappedProfile(),
        update_by: this.auth.getMappedProfile(),
        update_at: this.ds.serverTimestamp(),
      }
      this.store.addNew(this.ds.paymentOptionsRef(), formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Payment option has been created.', 'done', { duration: 2000 });
          this.form.reset();
          this.process = false;
        }
        else {
          this.snackBar.open(error, 'Error')
          this.process = false
        }
      })
    }
  }


}
