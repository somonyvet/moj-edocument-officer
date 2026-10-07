import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ISupplier } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { BaseStore } from 'src/app/stores/base.store';

@Component({
    selector: 'app-supplier-form',
    templateUrl: './supplier-form.component.html',
    styleUrls: ['./supplier-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SupplierFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតអ្នកផ្គត់ផ្គង់";
  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<SupplierFormComponent>,
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
    })
    if (this.data?.item) {
      this.title = "កែប្រែអ្នកផ្គត់ផ្គង់"
      const item = this.data.item as ISupplier;
      const { name } = item;
      this.form.patchValue({
        name,
      })
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name } = f;
      const item: ISupplier = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: ISupplier = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([name]),
        isDelete: item?.isDelete || false,
        //fields
        name,
      }

      this.store.addNew(this.ds.supplierRef(), data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Supplier has been saved successful.`, "Done", { duration: 3000 });
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
