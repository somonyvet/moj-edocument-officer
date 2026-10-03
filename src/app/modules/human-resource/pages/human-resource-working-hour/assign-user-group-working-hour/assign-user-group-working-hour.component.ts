import { WorkingHourStore } from './../../../stores/working-hour.store';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';

@Component({
  selector: 'app-assign-user-group-working-hour',
  templateUrl: './assign-user-group-working-hour.component.html',
  styleUrls: ['./assign-user-group-working-hour.component.scss']
})
export class AssignUserGroupWorkingHourComponent implements OnInit {
  form: FormGroup;
  process: boolean = false;
  departmentKey = '';

  constructor(
    public dialogRef: MatDialogRef<AssignUserGroupWorkingHourComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: WorkingHourStore,
    public departmentStore: DepartmentStore,
    private snackBar: MatSnackBar,

  ) { }

  get selectedArr() {
    return this.form?.controls["selectedArr"] as FormArray;
  }

  async ngOnInit(): Promise<void> {
    const Item = { departmentName: null };
    this.form = this.fb.group({
      departmentName: [Item ? Item.departmentName : null, [Validators.required]],
      selectedArr: this.fb.array([]),
    });
    await this.departmentStore.fetchDepartmentsForWorkingHour();
  }

  formControlCheckbox(items: Array<any>) {

    items.map((m: any) => {
      if (m?.workingHourKey && m.workingHourKey !== this.store.activeKey) {
        let index = this.store.tmpOfficers.findIndex(({ key }) => key === m.key);
        this.store.tmpOfficers.splice(index, 1);
        return;
      }

      const isSelected = m?.workingHourKey ? true : false;
      this.selectedArr.push(
        this.fb.group({
          key: [m.key],
          photoUrl: [m?.photoUrl],
          officerId: [m?.officerId],
          file: [m?.file],
          title: [m?.title],
          last_name: [m?.last_name],
          first_name: [m?.first_name],
          isSelected: [isSelected],
          rowIndex: [m?.rowIndex],
        })
      );
    });
  }

  checkAll(e) {
    this.selectedArr.controls.map((m) => {
      m.patchValue({
        isSelected: e?.checked || false,
      })
    })
  }

  displayDepartment(item: any): string {
    if (!item) return '';
    return item['name'] ?? item;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async getOfficer(key: string) {
    this.departmentKey = key;
    this.selectedArr.clear();
    await this.store.fetchOfficersByDepartment(key);
    this.formControlCheckbox(this.store.tmpOfficers || []);
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();

      this.store.addWorkingHourToOfficers(f.selectedArr, this.store.activeKey, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`ការបញ្ចូលម៉ោងធ្វើការឲ្យមន្ត្រីបានជោគជ័យ.`, "បិទ", { duration: 1000 });
          this.form.reset();
          this.dialogRef.close('close');
        } else {
          alert(res)
        }
      })
    }
  }
}
