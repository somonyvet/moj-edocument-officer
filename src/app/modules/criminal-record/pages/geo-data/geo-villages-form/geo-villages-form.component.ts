import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import firebase from 'firebase/compat/app';

@Component({
    selector: 'app-geo-villages-form',
    templateUrl: './geo-villages-form.component.html',
    styleUrls: ['./geo-villages-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoVillagesFormComponent implements OnInit {
  title: any = "បង្កើតភូមិ";

  @ViewChild("focusInput") inputEl: ElementRef;

  form: UntypedFormGroup
  name: AbstractControl
  description: AbstractControl
  en_name: AbstractControl
  fr_name: AbstractControl
  id: AbstractControl

  campusList = [];
  campusid: string;
  process: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<GeoVillagesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public fs: GeoStore,
    public ds: GeoService,

  ) { }

  buildForm(): void {
    const { item } = this.data;
    this.form = this.fb.group({
      id: [item ? item.id : null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      description: [item ? item.description : null],
      name: [item ? item.name : null, [Validators.required]],
      en_name: [item ? item.en_name : null],
      fr_name: [item ? item.fr_name : null],
      Latitude: [this.data.item && this.data.item.location ? this.data.item.location.latitude : null],
      Longitude: [this.data.item && this.data.item.location ? this.data.item.location.longitude : null],
      color: [this.data.item ? this.data.item.color : null],
    })
    this.name = this.form.controls['name'];
    this.description = this.form.controls['description'];
    this.en_name = this.form.controls['en_name'];
    this.fr_name = this.form.controls['fr_name'];
    this.id = this.form.controls['id'];
  }


  ngOnInit() {
    this.buildForm();
    this.title = this.data.item ? 'កែប្រែភូមិ' : 'បង្កើតភូមិ';
  }
  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { value } = control
      if (!value) return null;
      if (this.data.item) {
        const { id } = this.data.item;
        if (id !== value) {
          const doc = await this.ds.checkExistRegisterRef(value, 'geo_villages', 'id').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.ds.checkExistRegisterRef(value, 'geo_villages', 'id').get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }
  create(f: any, isNew) {
    if (this.form.valid) {
      this.process = true
      const { item } = this.data;
      const locationData = new firebase.firestore.GeoPoint(f.Latitude, f.Longitude);
      const key = item ? item.key : this.afs.createId();
      const formData: IVillage = {
        key: key,
        commune: MappingService.provinceObj(this.fs.selectedCommune),
        commune_id: item?.commune_id ? item?.commune_id : this.fs.selectedCommune?.id,
        district: item?.district ? MappingService.provinceObj(item?.district) : MappingService.provinceObj(this.fs.selectedDistrict),
        district_id: item?.district_id ? item?.district_id : this.fs.selectedDistrict?.id,
        province: MappingService.provinceObj(this.fs.selectedProvince),
        province_id: item?.province_id ? item?.province_id : this.fs.selectedProvince?.id,
        status: STATUS_OBJ.ACTIVE,
        created_at: new Date(),
        created_by: this.auth.uid,
        created_byRef: this.afs.collection('users').doc(this.auth.uid).ref,
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
        fr_name: f.fr_name,
        description: f.description,
      }
      this.fs.addVillage(formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Village has been created.', 'done', { duration: 2000 });
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
