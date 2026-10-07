import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { ConvertService } from 'src/app/shared/services/convert.service';

@Component({
    selector: 'app-update-file-tag',
    templateUrl: './update-file-tag.component.html',
    styleUrls: ['./update-file-tag.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class UpdateFileTagComponent implements OnInit {

  @ViewChild('focusInput') inputEl: ElementRef;

  form: UntypedFormGroup;
  name: AbstractControl;
  color:AbstractControl;
  nameChange: boolean = false;
  exist: boolean = false;
  msg: any;
  id;
  loading: boolean = true;
  tagcolor;

  constructor(
    public dialogRef: MatDialogRef<UpdateFileTagComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: FileManager,
    public afs: AngularFirestore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
  ) { }

   ngOnInit() {
    this.msg = this.data;
    this.tagcolor = this.msg.color;
    this.form = this.fb.group({
      name: [null, Validators.required],
      color: [null]
    });

    this.name = this.form.controls['name'];
    this.color = this.form.controls['color'];

    if (this.data.key) {
      this.store.detailCollection('file_tags', this.data.key, data => {
        // this.store.singleData = data;
        // this.data = data;

        this.form.patchValue({
          name: data.name,
          color: data.color
        });

        this.form.controls['name'].valueChanges.subscribe(name => {
          if (name == data.name) {
            this.nameChange = false;
          } else {
            this.nameChange = true;
          }
        })
      });
    }

  }

  onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name, color } = f;
      const item = {
        key: this.data.key,
        name: name,
        keyword: ConvertService.toCapitalize(name),
        color: color.toUpperCase(),
        updated_at: new Date(),
        updated_by: this.auth.user,
      }

      const db = this.afs.firestore;
      const existRef = db.collection('file_folder').where('name', '==', name);

      if (this.nameChange) {
        existRef.get().then(doc => {
          if (doc.empty) {
            this.exist = false;
            this.store.UpdateTag(item, this.auth.user, (success, res) => {
              if (success) {
                    this.snackBar.open("Tag color has been successfully updated.", "Done", { duration: 3000 });
              }
              else {
                this.snackBar.open("Fail to update tag color.", "Done", { duration: 3000 });
              }
            }
            )
          }
        });
      }

      this.dialogRef.close();
    }
  }

}
