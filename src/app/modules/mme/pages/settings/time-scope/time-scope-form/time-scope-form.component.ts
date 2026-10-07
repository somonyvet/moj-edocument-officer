import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { generateKeywords, MappingService, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { map, take, debounceTime } from "rxjs/operators";
import { DatabaseService } from 'src/app/shared/services/database.service';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { TimeScopeStore } from 'src/app/modules/mme/store/time_scope.store';
import { MONTHS_ARRAY, SEMESTER_ARRAY } from 'src/app/dummy/config';
import { IQuarter } from 'src/app/modules/mme/interfaces/document.interface';

@Component({
    selector: 'app-time-scope-form',
    templateUrl: './time-scope-form.component.html',
    styleUrls: ['./time-scope-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TimeScopeFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  title: string = "បង្កើតត្រីមាស";
  form: UntypedFormGroup;
  MONTHS_ARRAY: any[] = MappingService.orderBy(MONTHS_ARRAY, 'id');
  SEMESTER_ARRAY: any[] = SEMESTER_ARRAY;

  constructor(
    public dialogRef: MatDialogRef<TimeScopeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: TimeScopeStore,
    public ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required], this.checkExistCodeRef()],
      name_en: [null],
      order: [null, [Validators.required], this.checkExistRef()],
      semester: [SEMESTER_ARRAY[0], [Validators.required]],
      months: [, [Validators.required]],
      endQuarter: [null],
      endSemester: [null],
    })
    const item = this.data?.item as IQuarter;
    if (item) {
      this.title = "កែប្រែត្រីមាស"
      const { name, name_en, order, month, semester, endSemester, endQuarter } = item;
      const monthKeys: string[] = month?.map(m => m?.key)
      this.form.patchValue({
        name, name_en, order, months: this.MONTHS_ARRAY?.filter(m => monthKeys.includes(m?.key)), semester,
        endSemester: endSemester || false,
        endQuarter: endQuarter || false,
      })
    }
  }

  checkExistCodeRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      const selectedItem = this.data?.item as IQuarter;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.quarterRef(ref => ref.where('name', '==', toNameKey(value))).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const oldValue = selectedItem ? selectedItem.nameKey : null;
              if (oldValue && oldValue === toNameKey(value)) {
                return null;
              }
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }
  checkExistRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      const selectedItem = this.data?.item as IQuarter;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.quarterRef(ref => ref.where('order', '==', value)).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const oldValue = selectedItem ? selectedItem.order : null;
              if (oldValue && oldValue === value) {
                return null;
              }
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable()
      const { name, name_en, order, months, semester, endSemester, endQuarter } = f;
      const item = this.data?.item as IQuarter;
      const { uid } = this.auth;
      const data: IQuarter = {
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

        name: name,
        nameKey: toNameKey(name),
        name_en: name_en || null,
        order: order,
        semester: semester,
        month: months,
        endSemester: endSemester || false,
        endQuarter: endQuarter || false,
      }
      this.ds.quarterRef().doc(data?.key).set(data, { merge: true }).then(() => {
        this.snackBar.open(`ត្រីមាសត្រូវបានរក្សាទុកដោយជោគជ័យ`, 'ជោគជ័យ', { duration: 3000 })
        if (item) {
          this.dialogRef.close('yes')
        }
        this.form.reset();
        this.form.patchValue({
          semester: semester,
        })
      }).catch(err => {
        alert(err)
      }).finally(() => {
        this.form.enable()
      })
    }
  }
}
