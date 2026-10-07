import { NationalityStore } from './../../../stores/nationality.store';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { GeoService } from 'src/app/modules/organization/geo-data/services/geo.service';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { GeoStore } from '../../../stores/geo.store';

@Component({
    selector: 'app-criminal-record-categories-form',
    templateUrl: './criminal-record-categories-form.component.html',
    styleUrls: ['./criminal-record-categories-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordCategoriesFormComponent implements OnInit {
  title: any = "បង្កើតប្រភេទព្រឹត្តប័ត្រ";

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
    public dialogRef: MatDialogRef<CriminalRecordCategoriesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public fs: GeoStore,
    public ds: GeoService,
    private store: NationalityStore

  ) { }

  buildForm(): void {
    const { item } = this.data;
    this.form = this.fb.group({
      description: [item ? item.description : null],
      name: [item ? item.name : null, [Validators.required]],
      en_name: [item ? item.en_name : null],
      direct: [item ? item.direct : true],
    })
    this.name = this.form.controls['name'];
    this.description = this.form.controls['description'];
    this.en_name = this.form.controls['en_name'];
    this.fr_name = this.form.controls['fr_name'];
    this.id = this.form.controls['id'];
  }


  ngOnInit() {
    this.buildForm();
    this.title = this.data.item ? 'កែប្រែប្រភេទព្រឹត្តប័ត្រ' : 'បង្កើតប្រភេទព្រឹត្តប័ត្រ';
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
      const formData: any = {
        key: key,
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

        name: f.name,
        en_name: f.en_name,
        direct: f?.direct
      }
      this.store.addcrimRecCate(formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Criminal Record Category has been created.', 'done', { duration: 2000 });
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
