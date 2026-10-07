import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { VISA_SETTING } from 'src/app/dummy/status';
import { IVisaType } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { BaseStore } from 'src/app/stores/base.store';

@Component({
    selector: 'app-visa-type-form',
    templateUrl: './visa-type-form.component.html',
    styleUrls: ['./visa-type-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class VisaTypeFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតប្រភេទទិដ្ឋាការ";
  form: UntypedFormGroup;

  VISA_SETTING_LIST = VISA_SETTING
  constructor(
    public dialogRef: MatDialogRef<VisaTypeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: BaseStore,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      short_name: [null, Validators.required],
      price: [null],
      category: [null, Validators.required],
      order: [null, [Validators.required]]
    })
    if (this.data?.item) {
      this.title = "កែប្រែប្រភេទទិដ្ឋាការ"
      const item = this.data.item as IVisaType;
      const { name, short_name, order, category, price } = item;
      this.form.patchValue({
        name, short_name, order, category, price
      })
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name, short_name, order, category, price } = f;
      const item: IVisaType = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: IVisaType = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([name, short_name]),
        isDelete: item?.isDelete || false,
        //fields
        name,
        short_name,
        order: toNumber(order),
        category,
        price: toNumber(price),
      }

      this.store.addNew(this.ds.visa_typesRef(), data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Visa Type has been saved successful.`, "Done", { duration: 3000 });
          this.form.reset();
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
