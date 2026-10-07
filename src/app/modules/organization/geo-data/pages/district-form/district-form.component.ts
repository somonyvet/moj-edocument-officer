import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { IDistrict } from '../../interfaces/geo';
import { Geo } from '../../stores/geo.store';
import { GeoService } from '../../services/geo.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { STATUS_OBJ, DISTRICT_ARRAY_PREFIX } from 'src/app/dummy/appinfo';
import firebase from 'firebase/compat/app';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Component({
    selector: 'app-district-form',
    templateUrl: './district-form.component.html',
    styleUrls: ['./district-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DistrictFormComponent implements OnInit {
  title: any = "បង្កើតស្រុក";

  @ViewChild("focusInput") inputEl: ElementRef;
  form: UntypedFormGroup
  name: AbstractControl
  en_name: AbstractControl
  id: AbstractControl
  geo_prefix: AbstractControl

  process;
  filteredOptions: any; 

  constructor(
    public dialogRef: MatDialogRef<DistrictFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public fs: Geo,
    public ds: GeoService,
    public dd: DatabaseService,

  ) { }

  buildForm(): void {
    this.form = this.fb.group({
      id: [this.data.item ? this.data.item.id : null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      name: [this.data.item ? this.data.item.name : null, [Validators.required]],
      en_name: [this.data.item ? this.data.item.en_name : null],
      Latitude: [this.data.item && this.data.item.location ? this.data.item.location.latitude : null],
      Longitude: [this.data.item && this.data.item.location ? this.data.item.location.longitude : null],
      color: [this.data.item ? this.data.item.color : null],
      geo_prefix: [this.data.item && this.data.item.geo_prefix ? this.data.item.geo_prefix || null : null],

    })
    this.name = this.form.controls['name'];
    this.en_name = this.form.controls['en_name'];
    this.id = this.form.controls['id'];
    this.geo_prefix = this.form.controls['geo_prefix'];
  }
  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { value } = control
      if (!value) return null;
      if (this.data.item) {
        const { id } = this.data.item;
        if (id !== value) {
          const doc = await this.ds.checkExistRegisterRef(value, 'geo_districts', 'id').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.ds.checkExistRegisterRef(value, 'geo_districts', 'id').get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  ngOnInit() {
    this.buildForm();
    this.title = this.data.item ? 'កែប្រែស្រុក' : 'បង្កើតស្រុក';
    this.filteredOptions = MappingService.autoComplete(this.geo_prefix, DISTRICT_ARRAY_PREFIX, 'name')

  }

  create(f: any, isNew) {
    if (this.form.valid) {
      const key = this.data.item ? this.data.item.key : this.afs.createId();
      const locationData = new firebase.firestore.GeoPoint(f.Latitude, f.Longitude);
      const formData: IDistrict = {
        key: key,
        province: MappingService.provinceObj(this.fs.selectedProvince),
        province_id: this.fs.selectedProvince.id,
        status: STATUS_OBJ.ACTIVE,
        created_at: this.data.item && this.data.item.created_at ? this.data.item.created_at : new Date(),
        created_by: this.data.item && this.data.item.created_by ? this.data.item.created_by : this.auth.uid,
        created_byRef: this.data.item && this.data.item.created_byRef ? this.data.item.created_byRef : this.afs.collection('users').doc(this.auth.uid).ref,
        updated_by: this.auth.uid,
        updated_byRef: this.afs.collection('users').doc(this.auth.uid).ref,
        updated_at: new Date(),
        // deleted_by?: any;
        // deleted_byRef?: any;
        // deleted_at?: any;

        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
        keyword: f.name.toLowerCase(),

        location: locationData,
        color: f.color,
        id: f.id,
        name: f.name,
        en_name: f.en_name,
        geo_prefix: f.geo_prefix || null

      }
      this.fs.addDistrict(formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('District has been created.', 'done', { duration: 2000 });
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
