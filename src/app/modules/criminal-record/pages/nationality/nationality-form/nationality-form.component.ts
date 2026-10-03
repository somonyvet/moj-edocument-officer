import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IVillage } from 'src/app/modules/organization/geo-data/interfaces/geo';
import { GeoService } from 'src/app/modules/organization/geo-data/services/geo.service';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { FireValidatorsService } from 'src/app/shared/services/fire-validators.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { GeoStore } from '../../../stores/geo.store';
import { NationalityStore } from '../../../stores/nationality.store';

@Component({
  selector: 'app-nationality-form',
  templateUrl: './nationality-form.component.html',
  styleUrls: ['./nationality-form.component.scss']
})
export class NationalityFormComponent implements OnInit {
  title: any = "បង្កើតសញ្ជាតិ";

  @ViewChild("focusInput") inputEl: ElementRef;

  form: FormGroup
  kh_short_name: AbstractControl
  description: AbstractControl
  en_short_name: AbstractControl
  fr_short_name: AbstractControl
  id: AbstractControl

  campusList = [];
  campusid: string;
  process: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<NationalityFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public fs: NationalityStore,
    public ds: GeoService,

  ) { }

  buildForm(): void {
    const { item } = this.data;
    this.form = this.fb.group({
      id: [item ? item?.id : null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      kh_nationality: [item ? item?.kh_nationality : null, [Validators.required]],
      kh_short_name: [item ? item?.kh_short_name : null, [Validators.required]],
      en_nationality: [item ? item?.en_nationality : null, [Validators.required]],
      en_short_name: [item ? item?.en_short_name : null, [Validators.required]],
      fr_nationality: [item ? item?.fr_nationality : null, [Validators.required]],
      fr_short_name: [item ? item?.fr_short_name : null, [Validators.required]],
      description: [item ? item?.description : null],
    })
    this.kh_short_name = this.form.controls['kh_short_name'];
    this.description = this.form.controls['description'];
    this.en_short_name = this.form.controls['en_short_name'];
    this.fr_short_name = this.form.controls['fr_short_name'];
    this.id = this.form.controls['id'];
  }

  ngOnInit() {
    this.buildForm();
    this.title = this.data.item ? 'កែប្រែសញ្ជាតិ' : 'បង្កើតសញ្ជាតិ';

  }
  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { value } = control
      if (!value) return null;
      if (this.data.item) {
        const { id } = this.data.item;
        if (id !== value) {
          const doc = await this.ds.checkExistRegisterRef(value, 'countries', 'id').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.ds.checkExistRegisterRef(value, 'countries', 'id').get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }
  create(f: any, isNew) {
    if (this.form.valid) {
      this.process = true
      const { item } = this.data;

      const key = item ? item.key : this.afs.createId();
      const formData: any = {
        key: key,
        status: STATUS_OBJ.ACTIVE,
        created_at: new Date(),
        created_by: this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: new Date(),
        // deleted_by?: any;
        // deleted_byRef?: any;
        // deleted_at?: any;

        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
        keyword: f.kh_nationality.toLowerCase(),

        id: f.id,
        kh_nationality: f.kh_nationality,
        kh_short_name: f.kh_short_name,
        en_nationality: f.en_nationality,
        en_short_name: f.en_short_name,
        fr_nationality: f.fr_nationality,
        fr_short_name: f.fr_short_name,
        description: f.description,
      }
      this.fs.addNationality(formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Nationality has been created.', 'done', { duration: 2000 });
          this.form.reset();
          // this.inputEl.nativeElement.focus();
          this.process = false
        }
        else {
          alert(error)
          this.process = false
        }
      })
    }
  }

}
