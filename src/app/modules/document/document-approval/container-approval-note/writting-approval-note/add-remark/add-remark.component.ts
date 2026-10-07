import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/shared/services/data.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
    selector: 'app-add-remark',
    templateUrl: './add-remark.component.html',
    styleUrls: ['./add-remark.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddRemarkComponent implements OnInit {
  form: UntypedFormGroup;
  loading: boolean = false;
  titleForm = 'បង្កើតចំណារ'
  constructor(
    public dialogRef: MatDialogRef<AddRemarkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private ds: DataService,
    private db: DatabaseService,
    private store: OfficerStore,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      remarkText: [null, Validators.required]
    })
  }

  _onSave(f) {
    const uid = this.data?.uid;
    const { remarkText } = f;
    const key = this.ds.createId();
    let data = {
      key: key,
      remarkText,
      created_at: new Date()
    }

    this.store.saveRemark(this.db.remarkTextRef().doc(uid).collection('remarkTexts'), data, (success, error) => {
      if (success) {
        this.snackBar.open(`ចំណារបានបង្កើតដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.form.reset();
        this.dialogRef.close({text: "yes", form: data});
      } else {
        this.snackBar.open(error, "យល់ព្រម");
      }
    })

  }
}
