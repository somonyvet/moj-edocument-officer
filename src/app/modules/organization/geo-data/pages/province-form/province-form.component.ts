import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IGeo } from '../../interfaces/geo';
import { Geo } from '../../stores/geo.store';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { GeoService } from '../../services/geo.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PROVINCE_ARRAY_PREFIX, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
@Component({
    selector: 'app-province-form',
    templateUrl: './province-form.component.html',
    styleUrls: ['./province-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ProvinceFormComponent implements OnInit {
  title: any = "បង្កើតទិន្នន័យខេត្ត/ក្រុង";

  @ViewChild("focusInput") inputEl: ElementRef;
  form: UntypedFormGroup
  name: AbstractControl
  en_name: AbstractControl
  geo_prefix: AbstractControl
  id: AbstractControl
  process;
  filteredOptions: any; 
  constructor(
    public dialogRef: MatDialogRef<ProvinceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    private auth: AuthStore,
    public fs: Geo,
    public ds: GeoService,
    public dd: DatabaseService,

  ) { }

  buildForm(): void {
    this.form = this.fb.group({
      id: [this.data.item ? this.data.item.id : null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      name: [this.data.item ? this.data.item.name : null, [Validators.required]],
      en_name: [this.data.item ? this.data.item.en_name : null],
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

    this.filteredOptions = MappingService.autoComplete(this.geo_prefix, PROVINCE_ARRAY_PREFIX, 'name')
  }

  _onSave(f: any) {
    if (this.form.valid) {
      const key = this.data.item ? this.data.item.key : this.afs.createId();

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


        id: f.id,
        name: f.name,
        en_name: f.en_name,

        geo_prefix: f.geo_prefix || null
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
