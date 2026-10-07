import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-remark-application',
    templateUrl: './remark-application.component.html',
    styleUrls: ['./remark-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RemarkApplicationComponent implements OnInit {

  form: UntypedFormGroup;
  get isReject(): boolean {
    return this.data?.mode === 'reject';
  }

  presetReasons: string[] = [
    'ស្ថានភាពមិនត្រឹមត្រូវ',
    'ព័ត៌មានមិនត្រឹមត្រូវ',
    'ខ្វះឯកសារភ្ជាប់',
    'រូបថតមិនច្បាស់',
    'ស្ទួនពាក្យស្នើសុំ',
    'កំហុសក្នុងទម្រង់បែបបទ',
  ];

  constructor(
    public dialogRef: MatDialogRef<RemarkApplicationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private auth: AuthStore,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      remark_application: [this.data?.selectedCriminal?.remark_application, this.isReject ? [Validators.required] : []],
    })
  }

  selectedReasons: string[] = [];

  togglePreset(reason: string){
    const idx = this.selectedReasons.indexOf(reason);
    if (idx > -1) {
      this.selectedReasons.splice(idx, 1);
    } else {
      this.selectedReasons.push(reason);
    }
    this.form.patchValue({ remark_application: this.selectedReasons.join(', ') || null });
  }

  isPresetSelected(reason: string): boolean {
    return this.selectedReasons.includes(reason);
  }

  save(){
    const { selectedCriminal } = this.data
    const { remark_application } = this.form.value
    const docRef = this.ds.criminalRecordRef().doc(selectedCriminal?.key)
    const update: any = { remark_application: remark_application || null };
    if (this.isReject) {
      const workplaceKey = this.auth.config?.department_defense?.key || this.auth.currentDepartment?.key;
      update.status = STATUS_OBJ.REJECTED;
      update.internal_status = STATUS_OBJ.INTERNAL_PROCESS_REJECT;
      update.last_approved_at = this.ds.serverTimestamp();
      if (workplaceKey) {
        update.request_approval_workplace_keys = this.ds.fireFieldValue().arrayUnion(workplaceKey);
      }
    }
    docRef.update(update).then(()=>{
      this.snackBar.open(`រក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.dialogRef.close(this.isReject ? { status: STATUS_OBJ.REJECTED, remark_application } : null);
    })
  }
}
