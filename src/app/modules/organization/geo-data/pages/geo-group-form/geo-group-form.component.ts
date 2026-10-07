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
import { Geo } from '../../stores/geo.store';

@Component({
    selector: 'app-geo-group-form',
    templateUrl: './geo-group-form.component.html',
    styleUrls: ['./geo-group-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoGroupFormComponent implements OnInit {
  title: any = "បង្កើតក្រុម";

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
    public dialogRef: MatDialogRef<GeoGroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public fs: Geo
  ) { }

  buildForm(): void {
    this.form = this.fb.group({
      // id: [null, Validators.compose([Validators.required]), FireValidatorsService.checkExist(this.afs, 'geo_groups', 'id')],
      description: [null],
      en_name: [null, [Validators.required]],
      name: [null, [Validators.required]],
    })
    this.name = this.form.controls['name'];
    this.description = this.form.controls['description'];
    this.en_name = this.form.controls['en_name'];
    this.id = this.form.controls['id'];
  }


  ngOnInit() {
    this.buildForm();
    this.title = this.data.item ? 'កែប្រែក្រុម' : 'បង្កើតក្រុម';

  }

  create(f: any, isNew) {
    if (this.form.valid) {
      this.process = true
      const key = this.afs.createId();
      const formData: any = {
        key: key,
        commune: this.fs.selectedVillage.commune,
        commune_id: this.fs.selectedVillage.commune.id,
        district: this.fs.selectedVillage.district,
        district_id:this.fs.selectedVillage.district.id,
        province: this.fs.selectedVillage.province,
        province_id: this.fs.selectedVillage.province.id,
        village: MappingService.provinceObj(this.fs.selectedVillage),
        village_id:   this.fs.selectedVillage.id,
        status: STATUS_OBJ.ACTIVE,
        created_at: new Date(),
        created_by: this.auth.uid,
        created_byRef: this.afs.collection('users').doc(this.auth.uid).ref,
        updated_by: this.auth.uid,
        updated_byRef: this.afs.collection('users').doc(this.auth.uid).ref,
        updated_at: new Date(),
        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
        keyword: f.name.toLowerCase(),
        id: f.id,
        name: f.name,
        en_name: f.en_name,
        description: f.description,
      }
      this.fs.addGroup(formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Group has been created.', 'done', { duration: 2000 });
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
