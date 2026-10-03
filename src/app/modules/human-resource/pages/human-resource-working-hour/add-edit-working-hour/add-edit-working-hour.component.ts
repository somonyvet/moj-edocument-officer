import { ATTENDANCE_STATUS_NO_CHECKOUT } from './../../../../../dummy/status';
import { AssignUserGroupWorkingHourComponent } from '../assign-user-group-working-hour/assign-user-group-working-hour.component';
import { WorkingHourStore } from './../../../stores/working-hour.store';
import { Component, Inject, Input, OnInit, } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { generateKeywords, MappingService } from 'src/app/shared/services/mapping.service';
import { ATTENDANCE_SHIFT, ATTENDANCE_STATUS, statusObj, WEEKDAY_ENG, WEEKDAY_KH } from 'src/app/dummy/status';
import { AnimationOptions } from 'ngx-lottie';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-add-edit-working-hour',
  templateUrl: './add-edit-working-hour.component.html',
  styleUrls: ['./add-edit-working-hour.component.scss']
})
export class AddEditWorkingHourComponent implements OnInit {
  // isCreateSuccess = false;
  // isUpdateSuccess = false;
  // isDeleteSuccess = false;
  titleForm = '';

  weekDaysKH = WEEKDAY_KH;
  weekDays = WEEKDAY_ENG;
  shiftKeys = Object.keys(ATTENDANCE_SHIFT);
  shiftObjs = Object.values(ATTENDANCE_SHIFT);

  attendanceStatusArr = Object.values(ATTENDANCE_STATUS_NO_CHECKOUT);

  currentShiftNameIndex = null;
  currentShiftSelectIndex = null;

  form: FormGroup;
  name: AbstractControl
  lottie: AnimationOptions = {
    path: '../../../../assets/animate/109279-checklist.json',
  };

  isDefaultRoute = true;

  constructor(
    public dialogRef: MatDialogRef<AssignUserGroupWorkingHourComponent>,
    private fb: FormBuilder,
    public store: WorkingHourStore,
    public ds: DataService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      name: [this.store.workingHour?.name ?? null, [Validators.required]],
      monday: [this.store.workingHour?.workingDayObj?.Monday ?? true],
      tuesday: [this.store.workingHour?.workingDayObj?.Tuesday ?? true],
      wednesday: [this.store.workingHour?.workingDayObj?.Wednesday ?? true],
      thursday: [this.store.workingHour?.workingDayObj?.Thursday ?? true],
      friday: [this.store.workingHour?.workingDayObj?.Friday ?? true],
      saturday: [this.store.workingHour?.workingDayObj?.Saturday ?? false],
      sunday: [this.store.workingHour?.workingDayObj?.Sunday ?? false],
      workingShifts: this.fb.array([]),
      durationMinuteBeforeStartTime: [this.store.workingHour?.durationMinuteBeforeStartTime ?? null, [Validators.required]],
      durationMinuteAfterStartTime: [this.store.workingHour?.durationMinuteAfterStartTime ?? null, [Validators.required]],
      durationMinuteBeforeEndTime: [this.store.workingHour?.durationMinuteBeforeEndTime ?? null, [Validators.required]],
      missingCheckoutStatus: [this.store.workingHour?.missingCheckoutStatus ?? null, [Validators.required, MappingService.validSelected.bind(this)]],
    });

    this.name = this.form.controls['name'];

    if (this.store.workingHour) {
      this.titleForm = 'កែសម្រួលម៉ោងធ្វើការ';
      for (let index = 0; index < this.store.workingHour?.workingShiftArr.length; index++) {
        const item = this.store.workingHour?.workingShiftArr[index];
        this.workingShifts.push(this.getWorkingShiftFormGroup(item.name, item.startTime, item.endTime));
      }

    } else {
      this.titleForm = 'បង្កើតម៉ោងធ្វើការ';
      this.workingShifts.push(this.getWorkingShiftFormGroup());
    }
  }


  get workingShifts() {
    return this.form?.controls["workingShifts"] as FormArray;
  }

  setCurrentShiftSelectIndex(index: number) {
    this.currentShiftSelectIndex = index;
  }

  selectShift(index: number) {
    this.currentShiftNameIndex = index;
  }

  duplicateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) return null;

      let result = this.workingShifts.value.findIndex(m => m?.name?.key === value?.key);

      if (this.currentShiftNameIndex === result || result === -1 || this.currentShiftNameIndex === null) result = false;
      else result = true;

      return result ? { duplicate: true } : null;
    }
  }

  timeRangeValidator(isStartTime: boolean): ValidatorFn {
    return (formArrControl): ValidationErrors | null => {
      if (!formArrControl.value) return null;
      let isInRange = false;

      for (let index = 0; index < this.workingShifts?.length; index++) {
        const item = this.workingShifts.value[index];
        if (index !== this.currentShiftSelectIndex) {
          if (this.checkIfInTimeRange(formArrControl, isStartTime, item?.startTime, item?.endTime)) {
            isInRange = true;
            break;
          }
        }
      }
      // return { timeRangeErr: true };
      return isInRange ? { timeRangeErr: true } : null;
    }
  }

  timeCompareValidator(isStartTime): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      console.log('start time validator');

      if (!value) return null;

      let result;
      if (isStartTime) {
        let endTime = this.workingShifts.value[this.currentShiftSelectIndex]?.endTime;
        result = this.compareTime(value, endTime);

        console.log('value: ', value);
        console.log('endTime: ', endTime);
      } else {
        let startTime = this.workingShifts.value[this.currentShiftSelectIndex]?.startTime;
        result = this.compareTime(startTime, value);

        console.log('value: ', value);
        console.log('startTime: ', startTime);
      }

      return result ? { compareTimeErr: true } : null;
    }

  }


  compareTime(startTime, endTime) {
    console.log('compare: ', startTime, endTime);
    return (startTime?.hour > endTime?.hour || (startTime?.hour === endTime?.hour && startTime?.minute > endTime?.minute)) ?? false;
  }

  checkIfInTimeRange(time, isStartTime, startTime, endTime) {
    let selectedTime = this.workingShifts.value[this.currentShiftSelectIndex];

    if (selectedTime) {
      if (isStartTime) {
        selectedTime.startTime = time.value;
      } else {
        selectedTime.endTime = time.value;
      }
    }

    let _startTimeInt = startTime?.hour * 60 + startTime?.minute;
    let _endTimeInt = endTime?.hour * 60 + endTime?.minute;
    let _selectedStartTimeInt = selectedTime?.startTime?.hour * 60 + selectedTime?.startTime?.minute;
    let _selectedEndTimeInt = selectedTime?.endTime?.hour * 60 + selectedTime?.endTime?.minute;

    let outBound = (_startTimeInt >= _selectedStartTimeInt && _selectedEndTimeInt >= _endTimeInt);
    let inBound = (_startTimeInt <= _selectedStartTimeInt && _selectedStartTimeInt <= _endTimeInt) || (_startTimeInt <= _selectedEndTimeInt && _selectedEndTimeInt <= _endTimeInt);
    console.log('outBound: ' + outBound + '|| inBound: ' + inBound);

    if (outBound || inBound) return true;

    else return false;
  }

  getWorkingShiftFormGroup(name?: { key: number, text: string }, startTime?: number, endTime?: number) {
    let _startTimeFromSecond = {
      hour: Math.floor(startTime / 3600),
      minute: Math.floor((startTime % 3600) * 60),
    };
    let _endTimeFromSecond = {
      hour: Math.floor(endTime / 3600),
      minute: Math.floor((endTime % 3600) * 60),
    };

    console.log('getWorkingShiftFormGroup: ', startTime, endTime);
    console.log(_startTimeFromSecond, _endTimeFromSecond);

    return this.fb.group({
      name: [name, [Validators.required, MappingService.validSelected.bind(this), this.duplicateValidator(),]],
      startTime: [_startTimeFromSecond, [Validators.required, this.timeCompareValidator(true), this.timeRangeValidator(true)]],
      endTime: [_endTimeFromSecond, [Validators.required, this.timeCompareValidator(false), this.timeRangeValidator(false)]],
    });
  }

  displayMissingCheckOutStatus(item: any): string {
    if (!item) return '';
    return item['text_kh'] ?? item;
  }


  displayShift(item: any): string {
    if (!item) return '';
    return item['text'] ?? item;
  }

  addShift(): void {
    this.workingShifts.push(this.getWorkingShiftFormGroup());
  }

  removeShift(index: number) {
    this.workingShifts.removeAt(index);
  }

  switchStatus(index) {
    switch (index) {
      case 1:
        this.form.setControl('monday', this.fb.control(!this.form.get('monday').value),);
        break;
      case 2:
        this.form.setControl('tuesday', this.fb.control(!this.form.get('tuesday').value),);
        break;
      case 3:
        this.form.setControl('wednesday', this.fb.control(!this.form.get('wednesday').value),);
        break;
      case 4:
        this.form.setControl('thursday', this.fb.control(!this.form.get('thursday').value),);
        break;
      case 5:
        this.form.setControl('friday', this.fb.control(!this.form.get('friday').value),);
        break;
      case 6:
        this.form.setControl('saturday', this.fb.control(!this.form.get('saturday').value),);
        break;
      default:
        this.form.setControl('sunday', this.fb.control(!this.form.get('sunday').value),);
        break;
    }
    this.form.updateValueAndValidity();
  }


  create() {
    console.log('create working hour');
    // assign startTime and endTime here =========
    this.store.workingHour.keyword = generateKeywords([this.store.workingHour.name]);
    this.store.workingHour.status = statusObj.active;
    this.store.workingHour.isDeleted = false;

    this.store.createOrUpdateWorkingHour(this.store.workingHour)
      .then((isSuccess) => {
        isSuccess
          ? this.snackBar.open(`ម៉ោងធ្វើការត្រូវបានបង្កើតដោយជោគជ័យ`, "បិទ", { duration: 3000 })
          : this.snackBar.open(`ម៉ោងធ្វើការមិនអាចបង្កើតបានទេ។​ សូមព្យាយាមម្ដងទៀត!`, "បិទ", { duration: 3000 });
      });
  }

  update() {
    console.log('update working hour');
    this.store.createOrUpdateWorkingHour(this.store.workingHour)
      .then((isSuccess) => {
        isSuccess
          ? this.snackBar.open(`ម៉ោងធ្វើការត្រូវបានកែសម្រួលដោយជោគជ័យ`, "បិទ", { duration: 3000 })
          : this.snackBar.open(`ម៉ោងធ្វើការមិនអាចកែសម្រួលបានទេ។​ សូមព្យាយាមម្ដងទៀត!`, "បិទ", { duration: 3000 });
      });
  }

  assign() {
    this.dialog.open(AssignUserGroupWorkingHourComponent, {
      // data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '600px',
      height: '',
      role: 'dialog',
      disableClose: true,
    });
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      const {
        name,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
        workingShifts,
        durationMinuteBeforeStartTime,
        durationMinuteAfterStartTime,
        durationMinuteBeforeEndTime,
        missingCheckoutStatus
      } = f;
      let _startTime = 86400;
      let _endTime = 0;

      for (let index = 0; index < workingShifts.length; index++) {
        let { startTime, endTime } = workingShifts[index];

        startTime = (startTime.hour * 3600) + startTime.minute * 60;
        endTime = (endTime.hour * 3600) + endTime.minute * 60;

        if (_startTime > startTime) {
          _startTime = startTime;
        }

        if (_endTime < endTime) {
          _endTime = endTime;
        }

        workingShifts[index].startTime = startTime;
        workingShifts[index].endTime = endTime;
      }

      if (this.store.workingHour) {
        if (this.store.workingHour.name !== name) {
          this.store.workingHour.keyword = generateKeywords([name]);
        }
        this.store.workingHour.name = name
        this.store.workingHour.startTime = _startTime;
        this.store.workingHour.endTime = _endTime;
        this.store.workingHour.workingDayObj = {
          Monday: monday,
          Tuesday: tuesday,
          Wednesday: wednesday,
          Thursday: thursday,
          Friday: friday,
          Saturday: saturday,
          Sunday: sunday,
        };
        this.store.workingHour.durationMinuteBeforeStartTime = durationMinuteBeforeStartTime;
        this.store.workingHour.durationMinuteAfterStartTime = durationMinuteAfterStartTime;
        this.store.workingHour.durationMinuteBeforeEndTime = durationMinuteBeforeEndTime;
        this.store.workingHour.missingCheckoutStatus = missingCheckoutStatus;
        this.store.workingHour.workingShiftArr = workingShifts;
        this.update();
      } else {
        this.store.workingHour =
        {
          name,
          workingDayObj: {
            Monday: monday,
            Tuesday: tuesday,
            Wednesday: wednesday,
            Thursday: thursday,
            Friday: friday,
            Saturday: saturday,
            Sunday: sunday,
          },
          workingShiftArr: workingShifts,
          startTime: _startTime,
          endTime: _endTime,
          durationMinuteBeforeStartTime,
          durationMinuteAfterStartTime,
          durationMinuteBeforeEndTime,
          missingCheckoutStatus
        };
        this.create();
      }
      this.form.reset();
      this.dialogRef.close('yes');
      return;
    }
  }
}
