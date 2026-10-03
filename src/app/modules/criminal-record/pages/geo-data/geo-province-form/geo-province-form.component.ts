import { IProvince } from 'src/app/interfaces/document/document.interface';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { GeoStore } from '../../../stores/geo.store';
import { GeoService } from 'src/app/modules/organization/geo-data/services/geo.service';
import { IGeo } from 'src/app/modules/organization/geo-data/interfaces/geo';
import firebase from 'firebase/compat/app';
@Component({
  selector: 'app-geo-province-form',
  templateUrl: './geo-province-form.component.html',
  styleUrls: ['./geo-province-form.component.scss']
})
export class GeoProvinceFormComponent implements OnInit {

  title: any = "បង្កើតទិន្នន័យខេត្ត/ក្រុង";

  @ViewChild("focusInput") inputEl: ElementRef;
  form: FormGroup
  name: AbstractControl
  description: AbstractControl
  en_name: AbstractControl
  fr_name: AbstractControl
  id: AbstractControl
  process;
  constructor(
    public dialogRef: MatDialogRef<GeoProvinceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    private auth: AuthStore,
    // public fs: Geo,
    public ds: GeoService,
    public fs: GeoStore,

  ) { }

  buildForm(): void {
    this.form = this.fb.group({
      id: [this.data.item ? this.data.item.id : null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      description: [this.data.item ? this.data.item.id : null],
      name: [this.data.item ? this.data.item.name : null, [Validators.required]],
      en_name: [this.data.item ? this.data.item.en_name : null],
      fr_name: [this.data.item ? this.data.item.fr_name : null],
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
    this.title = this.data.item ? 'កែប្រែទិន្នន័យខេត្ត/ក្រុង' : 'បង្កើតទិន្នន័យខេត្ត/ក្រុង';

  }

  _onSave(f: any) {
    if (this.form.valid) {
      const key = this.data.item ? this.data.item.key : this.afs.createId();
      const locationData = new firebase.firestore.GeoPoint(f.Latitude, f.Longitude);
      const formData: IGeo = {
        key: key,
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
        fr_name: f.fr_name,
        description: f.description,

      }
      this.fs.addProvince(formData, (success, error) => {
        if (success) {
          this.dialogRef.close();
          this.snackBar.open('Province has been created.', 'done', { duration: 5000 });
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
