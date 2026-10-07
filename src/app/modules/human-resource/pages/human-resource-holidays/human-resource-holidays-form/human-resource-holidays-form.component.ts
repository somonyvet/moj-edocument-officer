import { Timestamp } from 'firebase/firestore';
import { HrHolidayStore } from '../../../stores/hr-holiday.store';
import { IHoliday } from '../../../../../interfaces/attendance';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getDayDifference } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-human-resource-holidays-form',
    templateUrl: './human-resource-holidays-form.component.html',
    styleUrls: ['./human-resource-holidays-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HrHolidayFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតថ្ងៃឈប់សម្រាក";
  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<HrHolidayFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: HrHolidayStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      nameKh: [null, Validators.compose([Validators.required])],
      nameEng: [null],
      startDate: [null, Validators.compose([Validators.required, this.setDuration()]),],
      endDate: [null, Validators.compose([Validators.required, this.setDuration(true)]),],
      duration: [{ value: '', disabled: true }],
    })
    if (this.data?.item) {
      this.title = "កែប្រែថ្ងៃឈប់សម្រាក";
      const item = this.data.item as IHoliday;

      const { nameKh, nameEng, startDate, endDate } = item;

      this.form.patchValue({
        nameKh,
        nameEng,
        startDate: (startDate as Timestamp).toDate(),
        endDate: (endDate as Timestamp).toDate()
      });
    }
  }

  setDuration(isEndDate = false): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control) return null;

      if (isEndDate && control.value && this.form.get('startDate').value) {
        this.form.get('duration').patchValue(getDayDifference(this.form.get('startDate').value, control.value));
      }
      else if (!isEndDate && control.value && this.form.get('endDate').value) {
        this.form.get('duration').patchValue(getDayDifference(control.value, control.value && this.form.get('endDate').value));
      }

      return null;
    }
  }



  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { nameEng, nameKh, startDate, endDate } = f;
      const duration = this.form.get('duration').value;

      const data: IHoliday = {
        keyword: generateKeywords([f.nameKh ?? '', f.nameEng ?? '']),
        nameKh,
        nameEng,
        startDate,
        endDate,
        duration,
      }

      if (this.data.item) {
        data.key = this.data.item.key;
        data.updatedAt = new Date();
        data.updatedBy = this.auth.User;
      } else {
        data.key = this.ds.createId();
        data.isDeleted = false;
        data.createdAt = new Date();
        data.createdBy = this.auth.User;
      }

      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`ថ្ងៃឈប់សម្រាកត្រូវបានរក្សាទុក.`, "បិទ", { duration: 3000 });
          this.form.reset();
          this.form.get('duration').disable();

          this.inputRef?.nativeElement.focus();
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
