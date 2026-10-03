import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ, COMMUNE_ARRAY_PREFIX } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireValidatorsService } from 'src/app/shared/services/fire-validators.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ICommunes, IVillage } from '../../interfaces/geo';
import { GeoService } from '../../services/geo.service';
import { Geo } from '../../stores/geo.store';

@Component({
  selector: 'app-village-change-commune-form',
  templateUrl: './village-change-commune-form.component.html',
  styleUrls: ['./village-change-commune-form.component.scss']
})
export class VillageChangeCommuneFormComponent implements OnInit {
  title: any = "ភូមិផ្លាស់ប្តូរ ឃុំ/សង្កាត់";

  @ViewChild("focusInput") inputEl: ElementRef;

  form: FormGroup
  commune: AbstractControl

  process: boolean = false;
  filteredOptions: any; 

  constructor(
    public dialogRef: MatDialogRef<VillageChangeCommuneFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public fs: Geo,
    public ds: GeoService,
    public dd: DatabaseService,

  ) { }

  buildForm(): void {
    const { item } = this.data;

    this.form = this.fb.group({
      commune: [null],
    })
    this.commune = this.form.controls['commune'];
  }


  ngOnInit() {
    this.buildForm();
    const { districtKey } = this.data
    this.fs.fetchCommunesCallback(districtKey, (docs) => {
      this.filteredOptions = MappingService.autoComplete(this.commune, docs, 'name')
    })

  }

  create(f: any, isNew) {
    if (this.form.valid) {
      this.process = true
      const { item } = this.data;
      const { commune } = f
      const formData: IVillage = {
        ...item,
        key: item.key,
        commune: MappingService.provinceObj(commune),
        commune_id: commune.id,

      }
      
      this.fs.updateVillage(formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Village change commune.', 'done', { duration: 2000 });
          this.form.reset();
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
