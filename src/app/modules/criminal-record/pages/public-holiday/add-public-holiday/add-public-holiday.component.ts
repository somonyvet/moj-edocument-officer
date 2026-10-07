import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { STATUS_OBJ, YEAR_CALENDER_LIST } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { getOnlyYear, MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { HolidayStore } from '../../../stores/holiday.store';

@Component({
    selector: 'app-add-public-holiday',
    templateUrl: './add-public-holiday.component.html',
    styleUrls: ['./add-public-holiday.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddPublicHolidayComponent implements OnInit {
  @ViewChild("focusInput") inputEl: ElementRef;
  title: any = "បង្កើតថ្ងៃឈប់​សំរាក";

  form: UntypedFormGroup;
  name: AbstractControl;
  description: AbstractControl;
  from_date: AbstractControl;
  year: AbstractControl;

  process: boolean = false;
  filteredStateEducationLevel: Observable<any[]>;

  constructor(
    public dialogRef: MatDialogRef<AddPublicHolidayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    public store: HolidayStore,
    private ds: DataService,
    public auth: AuthStore
  ) { }

  buildForm(): void {
    const year = getOnlyYear(this.auth.serverDateTime)
    this.form = this.fb.group({
      name: [null, Validators.required],
      khName: [null, Validators.required],
      description: [null],
      from_date: [new Date(), Validators.required],
      year: [YEAR_CALENDER_LIST?.find(m => m?.key === year), Validators.required],
    })
    this.name = this.form.controls['name'];
    this.description = this.form.controls['description'];
    this.from_date = this.form.controls['from_date'];
    this.year = this.form.controls['year'];
  }

  ngOnInit() {
    this.buildForm();
    if (this.data) {
      console.log('data',this.data)
      this.title = "កែសម្រួលថ្ងៃឈប់​សំរាក";
      const { name, description, from_date, khName, year } = this.data?.item || {};
      const yearNum: number = year?.key || getOnlyYear(this.auth.serverDateTime)
      this.form.patchValue({
        name, description, khName,
        from_date: from_date?.toDate(),
        year: YEAR_CALENDER_LIST?.find(m => m?.key === yearNum)
      })
    }
    this.filteredStateEducationLevel = MappingService.autoComplete(this.year, YEAR_CALENDER_LIST, "text");
  }

  displayItem(item: any): string {
    return item ? item.text : item;
  }

  create(f: any, isNew: boolean) {
    if (this.form.valid) {
      this.process = true
      const { name, description, from_date, khName, year } = f;
      const { item } = this.data
      const formData: any = {
        key: item?.key || this.afs.createId(),
        year,
        name,
        khName,
        description: description || null,
        from_date,
        from_date_key: ConvertService.toDateKey(from_date),
        date: from_date,
        date_key: ConvertService.toDateKey(from_date),
        status: STATUS_OBJ.ACTIVE,
        create_date: item ? item?.create_date : this.auth.serverDateTime,
        create_by: item ? item?.create_by : this.auth.getMappedProfile(),
        update_by: this.auth.getMappedProfile(),
        update_date: this.ds.serverTimestamp(),
      }

      this.store.addNew(this.ds.publicHolidayRef(), formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Public Holiday has been created.', 'done', { duration: 2000 });
          this.form.reset();
          this.form.patchValue({
            from_date,
            year,
          })
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
