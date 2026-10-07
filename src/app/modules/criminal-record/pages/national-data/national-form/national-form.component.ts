import { C } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IGeo, INationality, IVillage } from 'src/app/modules/organization/geo-data/interfaces/geo';
import { GeoService } from 'src/app/modules/organization/geo-data/services/geo.service';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { FireValidatorsService } from 'src/app/shared/services/fire-validators.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { GeoStore } from '../../../stores/geo.store';


@Component({
    selector: 'app-national-form',
    templateUrl: './national-form.component.html',
    styleUrls: ['./national-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NationalFormComponent implements OnInit {

  title: any = "បង្កើតទិន្នន័យសញ្ជាតិ";

  @ViewChild("focusInput") inputEl: ElementRef;
  form: UntypedFormGroup
  name: AbstractControl
  // description: AbstractControl
  en_name: AbstractControl
  fr_name: AbstractControl
  id: AbstractControl
  process;
  constructor(
    public dialogRef: MatDialogRef<NationalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    private auth: AuthStore,
    // public fs: Geo,
    public ds: GeoService,
    public fs: GeoStore,

  ) { }

  buildForm(): void {
    this.form = this.fb.group({
      id: [this.data.item ? this.data.item.num_code : null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      description: [this.data.item ? this.data.item.id : null],
      name: [this.data.item ? this.data.item.kh_nationality : null, [Validators.required]],
      en_name: [this.data.item ? this.data.item.en_nationality : null],
      fr_name: [this.data.item ? this.data.item.fr_nationality : null],
      
    })
    this.name = this.form.controls['name'];
    // this.description = this.form.controls['description'];
    this.en_name = this.form.controls['en_name'];
    this.fr_name = this.form.controls['fr_name'];
    this.id = this.form.controls['id'];
  }
  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { value } = control
      if (!value) return null;
      if (this.data.item) {
        const { id } = this.data.item;
        if (id !== value) {
          const doc = await this.ds.checkExistRegisterRef(value, 'geo_provinces', 'id').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.ds.checkExistRegisterRef(value, 'geo_provinces', 'id').get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  ngOnInit() {
    this.buildForm();
    this.title = this.data.item ? 'កែប្រែទិន្នន័យសញ្ជាតិ' : 'បង្កើតទិន្នន័យសញ្ជាតិ';

  }

  _onSave(f: any) {
    if (this.form.valid) {
      const key = this.data.item ? this.data.item.key : this.afs.createId();
      let title = this.data.item ? 'updated' : 'created';
      const formData: INationality = {
        key: key,
        status: STATUS_OBJ.ACTIVE,
        created_at: this.data.item && this.data.item.created_at ? this.data.item.created_at : new Date(),
        created_by: this.data.item && this.data.item.created_by ? this.data.item.created_by : this.auth.uid,
        created_byRef: this.data.item && this.data.item.created_byRef ? this.data.item.created_byRef : this.afs.collection('users').doc(this.auth.uid).ref,
        updated_by: this.auth.uid,
        updated_byRef: this.afs.collection('users').doc(this.auth.uid).ref,
        updated_at: new Date(),
        isDelete:null,
        deleted_by:null,
        // deleted_byRef?: any;
        deleted_at: null,

        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
        keyword: f.name.toLowerCase(),
        nationality:f.name,
        num_code: f.id,
        id: f.id,
        kh_nationality: f.name,
        en_nationality: f.en_name,
        fr_nationality: f.fr_name,
      }
      this.fs.addNationality(formData, (success, error) => {
        if (success) {
          this.dialogRef.close();
          this.snackBar.open('Nationality has been'+ title+ '.' + key, 'done', { duration: 5000 });
          this.form.reset();
          // this.inputEl.nativeElement.focus();
        }
        else {
          alert(error)
        }
      })
    }
  }
}
