import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IPosition } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { PositionStore } from 'src/app/stores/document/position.store';

@Component({
  selector: 'app-position-form',
  templateUrl: './position-form.component.html',
  styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតឋានៈ";
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PositionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: PositionStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      name_en: [null],
      order:[null,[Validators.required],this.checkExistNoRef.bind(this)]
    })
    if (this.data?.item) {
      this.title = "កែប្រែឋានៈ"
      const item = this.data.item as IPosition;
      const { name, name_en,order } = item;
      this.form.patchValue({
        name, name_en,order
      })
    }
  }

  async checkExistNoRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { order } = item;
        if (order !== value) {
          const doc = await this.store.checkExist(value, 'order').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkExist(value, "order").get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { nameKey } = item;
        if (nameKey !== toNameKey(value)) {
          const doc = await this.store.checkExist(toNameKey(value),'nameKey').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkExist(toNameKey(value),"nameKey").get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  
  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name, name_en,order } = f;
      const item: IPosition = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: IPosition = {
        key: item?.key || this.ds.createId(),
        status:item?.status|| STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([f.name]),
        isDelete: item?.isDelete || false,
        //fields
        name: name,
        nameKey: toNameKey(name),
        name_en: name_en,
        displayName: name,
        order
      }
      
      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Position has been saved successful.`, "Done", { duration: 3000 });
          this.form.reset();
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
