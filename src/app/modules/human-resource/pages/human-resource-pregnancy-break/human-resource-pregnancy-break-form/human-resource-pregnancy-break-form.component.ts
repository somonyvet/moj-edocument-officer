import { Timestamp } from 'firebase/firestore';
import { HrPregnancyBreakStore } from '../../../stores/hr-pregnancy-break.store';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { observable } from 'mobx';
import { Subscription } from 'rxjs';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { ILeaveRequest } from 'src/app/interfaces/attendance';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { getDayDifference } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { HrMissionsFormComponent } from '../../human-resource-missions/human-resource-missions-form/human-resource-missions-form.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';

@Component({
    selector: 'app-human-resource-pregnancy-break-form',
    templateUrl: './human-resource-pregnancy-break-form.component.html',
    styleUrls: ['./human-resource-pregnancy-break-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HRPregnancyBreakFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើត";
  form: UntypedFormGroup;
  @observable selectedOfficerArr = [];

  search: AbstractControl;
  loading: boolean = true;

  URL: any = PHOTO_LIB.EMPTY;
  _subscription: Subscription = null;
  showErr = false;
  constructor(
    public dialogRef: MatDialogRef<HrMissionsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: HrPregnancyBreakStore,
    public docStore: DocumentStore,
    public officer: OfficerStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {

    this.form = this.fb.group({
      search: [null],
      description: [null],
      startDate: [null, Validators.compose([Validators.required, this.setDuration()]),],
      endDate: [null, Validators.compose([Validators.required, this.setDuration(true)]),],
      duration: [{ value: '', disabled: true }],
    })
    if (this.data?.item) {
      this.title = "កែប្រែ";
      const item = this.data.item as ILeaveRequest;
      const { description, startDate, endDate, duration } = item;

      this.selectedOfficerArr = [item['officer']];

      this.form.patchValue({
        description,
        duration,
        startDate: (startDate as Timestamp).toDate(),
        endDate: (endDate as Timestamp).toDate()
      });
    }

    await this.officer.fetchOfficers();
    this.search = this.form.controls['search'];
    this._subscription = this.search.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (false)),
        switchMap(value => this.officer.fetchSearchOfficers(value, null, null, data => {
          this.loading = false;
        }))
      )
      .subscribe(res => { });
    this.loading = false;
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  _onRemoveDocumentAccount(event: any, isDelete: boolean): void {
    if (isDelete) {
      this.selectedOfficerArr.splice(0, 1);
    } else {
      this.selectedOfficerArr = [event];
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

  checkIfOfficerExist(officerKey: string, arr: IOfficer[]): any {
    let isExist = arr.find(({ key }) => key === officerKey);
    if (isExist) {
      return true;
    } else {
      return false;
    }
  }



  async _onSave(f: any) {
    if (this.form.valid) {
      if (this.selectedOfficerArr.length === 0) {
        this.showErr = true;
        return;
      }
      this.form.disable();
      const { startDate, endDate, description } = f;
      const duration = this.form.get('duration').value;

      const data: ILeaveRequest = {
        keyword: generateKeywords([f.description ?? '']),
        startDate,
        endDate,
        duration,
        description,
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
      data.officerKeys = this.selectedOfficerArr.map((officer) => officer.key);

      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`បេសកកម្មត្រូវបានរក្សាទុក.`, "បិទ", { duration: 3000 });
          this.form.reset();
          this.form.get('duration').disable();
          this.selectedOfficerArr = [];
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
