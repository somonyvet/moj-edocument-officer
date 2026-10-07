import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { config } from 'src/app/dummy/config';
import CustomEditor from 'src/app/shared/ckeditor/custom-editor';
import { MmeSubProgramStore } from 'src/app/stores/document/mme-sub-program.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Component({
    selector: 'app-third-quarter',
    templateUrl: './third-quarter.component.html',
    styleUrls: ['./third-quarter.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ThirdQuarterComponent implements OnInit {
  title = 'សូចនាករប្រចាំត្រីមាសទី៣';
  form: UntypedFormGroup;
  ITEM: any;
  public Editor = CustomEditor;
  public config = config;
  constructor(
    public dialogRef: MatDialogRef<ThirdQuarterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: MmeSubProgramStore,
    private ds: DataService,
    private db: DatabaseService,
    private auth: AuthStore,
    private snackbar: MatSnackBar
  ) {
    const { item } = this.data
    this.ITEM = item;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      third_quarter_indicators: [this.ITEM?.third_quarter_indicators || null]
    })
  }

  create(f: any) {
    this.form.disable();
    const { third_quarter_indicators } = f;
    const { uid } = this.auth;

    const item: any = {
      key: this.ITEM?.key,
      updated_by: uid,
      updated_at: this.ds.serverTimestamp(),

      third_quarter_indicators,
      last_child: this.ITEM?.last_child || true,
    }
    this.store.save(this.db.mmeProgramSaveRef(), item, (success, error) => {
      if (success) {
        this.form.reset()
        this.form.enable();
        this.dialogRef.close({})
        this.snackbar.open(`ទិន្នន័យត្រូវបានបង្កើតដោយជោគជ័យ។`, "យល់ព្រម", { duration: 3000 })
      } else {
        this.snackbar.open(error, "យល់ព្រម")
      }
    })
  }
}

