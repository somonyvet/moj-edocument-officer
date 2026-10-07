import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IInstitution } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { InstitutionStore } from 'src/app/stores/document/institution.store';
import { generateKeywords, toNameKey } from 'src/app/shared/services/mapping.service';

@Component({
    selector: 'app-institution-form',
    templateUrl: './institution-form.component.html',
    styleUrls: ['./institution-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class InstitutionFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  titleForm: any = "បង្កើតស្ថាប័ន";
  form: UntypedFormGroup;


  SELECTED_PHOTO: any = null;
  START_UPLOAD: boolean = false;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;


  constructor(
    public dialogRef: MatDialogRef<InstitutionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: InstitutionStore,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      name_en: [null, [Validators.required]],
      email: [null,],
      website: [null,],
    })
    if (this.data?.item) {
      this.titleForm = "កែប្រែស្ថាប័ន"
      const item = this.data.item as IInstitution
      const { name, name_en, file, email, website } = item
      this.form.patchValue({
        name, name_en, email, website
      })
      this.URL = file?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
    }
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

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name,name_en,email,website } = f;
      const item: IInstitution = (this.data && this.data.item) || null;
      const { uid} = this.auth;
      const data: IInstitution = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([name,name_en]),
        isDelete: item?.isDelete || false,
        //fields
        name: name,
        name_en: name_en,
        displayName: name,
        email: email,
        website: website,
        nameKey: toNameKey(name),
      }
      if (this.SELECTED_PHOTO) {
        const file = await this.storage.upload([this.SELECTED_PHOTO])
        data.file = file[0]
      }
      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Institution has been saved successful.`, "Done", { duration: 3000 });
          this.form.reset();
          this.SELECTED_PHOTO = null;
          this.inputRef.nativeElement.focus();
          if (this.data.req || this.data.item) {
            this.dialogRef.close(data);
          }
        } else {
          alert(res);
        }
      })
    }
  }
}
