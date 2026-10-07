import { Timestamp } from 'firebase/firestore';
import { ILeaveRequest } from 'src/app/interfaces/attendance';
import { HrMissionStore } from './../../../stores/hr-mission.store';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PHOTO_LIB, } from 'src/app/dummy/appinfo';
import { getDayDifference } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { Subscription } from 'rxjs';
import { observable } from 'mobx';
import { IOfficer } from 'functions/src/interfaces/interface';

@Component({
    selector: 'app-human-resource-missions-form',
    templateUrl: './human-resource-missions-form.component.html',
    styleUrls: ['./human-resource-missions-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HrMissionsFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតបេសកកម្ម";
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
    public store: HrMissionStore,
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
      description: [null, Validators.compose([Validators.required])],
      startDate: [null, Validators.compose([Validators.required, this.setDuration()]),],
      endDate: [null, Validators.compose([Validators.required, this.setDuration(true)]),],
      duration: [{ value: '', disabled: true }],
    })
    if (this.data?.item) {
      this.title = "កែប្រែបេសកកម្ម";
      const item = this.data.item as ILeaveRequest;
      const { description, startDate, endDate, duration } = item;

      this.selectedOfficerArr = this.store.officersMission.map(item => item);
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
      let toBeRemovedIndex = this.selectedOfficerArr?.findIndex(({ key }) => key === event?.key);
      this.selectedOfficerArr.splice(toBeRemovedIndex, 1);
    } else {
      let toBeRemovedIndex = this.selectedOfficerArr?.findIndex(({ key }) => key === event?.key);
      if (toBeRemovedIndex !== -1) {
        this.selectedOfficerArr.splice(toBeRemovedIndex, 1);
      } else {
        this.selectedOfficerArr = [...this.selectedOfficerArr, event];
      }
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

      if (this.store.officersMission.length !== 0 && this.store.officersMission.length !== data.officerKeys.length) {
        this.store.fetchOfficersFromMission(data.officerKeys);
      }
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
