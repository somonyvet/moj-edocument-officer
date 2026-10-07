import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { FireValidatorsService } from 'src/app/shared/services/fire-validators.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { IVillage } from '../../interfaces/geo';
import { GeoService } from '../../services/geo.service';
import { Geo } from '../../stores/geo.store';

@Component({
    selector: 'app-village-form',
    templateUrl: './village-form.component.html',
    styleUrls: ['./village-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class VillageFormComponent implements OnInit {
  title: any = "បង្កើតភូមិ";

  @ViewChild("focusInput") inputEl: ElementRef;

  form: UntypedFormGroup
  name: AbstractControl
  description: AbstractControl
  en_name: AbstractControl
  id: AbstractControl

  campusList = [];
  campusid: string;
  process: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<VillageFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public fs: Geo,
    public ds: GeoService,

  ) { }

  buildForm(): void {
    const { item } = this.data;
    this.form = this.fb.group({
      id: [item ? item?.id : null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      description: [item ? item?.description : null],
      en_name: [item ? item?.en_name : null],
      name: [item ? item?.name : null, [Validators.required]],
    })
    this.name = this.form.controls['name'];
    this.description = this.form.controls['description'];
    this.en_name = this.form.controls['en_name'];
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

      const key = item ? item.key : this.afs.createId();
      const formData: IVillage = {
        key: key,
        commune: MappingService.provinceObj(this.fs.selectedCommune),
        commune_id: this.fs.selectedCommune.id,
        district: MappingService.provinceObj(this.fs.selectedDistrict),
        district_id: this.fs.selectedDistrict.id,
        province: MappingService.provinceObj(this.fs.selectedProvince),
        province_id: this.fs.selectedProvince.id,
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


        id: f.id,
        name: f.name,
        en_name: f.en_name,
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
