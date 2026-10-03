import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { embassyStore } from '../../../stores/embassy.store';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'functions/src/services/data';
import { Observable } from 'rxjs';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { autoComplete, validSelected } from 'src/app/shared/services/mapping.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';

@Component({
  selector: 'app-embassy-form',
  templateUrl: './embassy-form.component.html',
  styleUrls: ['./embassy-form.component.scss']
})
export class EmbassyFormComponent implements OnInit {
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild("focusInput") inputEl: ElementRef;
  title: any = "បង្កើតស្ថានទូត";

  form: FormGroup;
  name: AbstractControl;
  description: AbstractControl;

  process: boolean = false;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  SELECTED_PHOTO: any = null;
  filteredCountryOptions: Observable<any[]>;
  constructor(
    public dialogRef: MatDialogRef<EmbassyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public store: embassyStore,
    private ds: DataService,
    public auth: AuthStore,
    public storage: FireStorageService,

  ) { }

  buildForm(): void {
    this.form = this.fb.group({
      logo: [null],
      name: [null, Validators.required],
      khName: [null, Validators.required],
      address: [null],
      latitude: [null],
      longitude: [null],
      country: [null, [validSelected.bind(this)]],
      contact: [null],
      description: [null],
    })
    this.name = this.form.controls['name'];
    this.description = this.form.controls['description'];
  }

  async ngOnInit() {
    this.buildForm();
    this.process = true;
    const country = await this.store.getNational();
    this.filteredCountryOptions = autoComplete(this.form.get('country'), country, 'en_short_name');
    this.process = false;

    if (this.data?.item) {
      this.title = "កែសម្រួលស្ថានទូត";
      const { file } = this.data?.item || {};
      this.URL = file?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
      this.form.patchValue({
        ...this.data?.item 
      })
    }


  }
  displayName(item: any): string {
    return item ? item.en_short_name : item;
  }
  onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_PHOTO = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.URL = event.target.result;
      }
      this.photoFile.nativeElement.value = "";
    }
  }
  displayItem(item: any): string {
    return item ? item.text : item;
  }

  async create(f: any, isNew: boolean) {
    if (this.form.valid) {
      this.process = true
      const {
        name,
        description,
        khName,
        latitude,
        longitude,
        country,
        contact,
        address
      } = f;
      const { item } = this.data
      const formData: any = {
        key: item?.key || this.afs.createId(),
        name,
        khName,
        latitude: latitude || null,
        longitude: longitude || null,
        address:address || null,
        contact: contact || null,
        description: description || null,
        country: country ? {
          key: country?.key,
          en_short_name: country?.en_short_name,
          kh_short_name: country?.kh_short_name,
          alpha_3_code: country?.alpha_3_code,
        } : null,
        file:item?.file || null,

        status: STATUS_OBJ.ACTIVE,
        create_date: item ? item?.create_date : this.auth.serverDateTime,
        create_by: item ? item?.create_by : this.auth.getMappedProfile(),
        update_by: this.auth.getMappedProfile(),
        update_date: this.ds.serverTimestamp(),
      }
      if (this.SELECTED_PHOTO) {
        if (item?.file) {
          await this.storage.deleteFile(item.file);
        }
        const file = await this.storage.upload([this.SELECTED_PHOTO])
        formData.file = file[0]
      }

      this.store.addNew(this.ds.embassyRef(), formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Embassy has been created.', 'done', { duration: 2000 });
          this.form.reset();
          this.process = false;
        }
        else {
          this.snackBar.open(error, 'Error')
          this.process = false
        }
      })
    }

  }

}