import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
    selector: 'app-rename-file',
    templateUrl: './rename-file.component.html',
    styleUrls: ['./rename-file.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RenameFileComponent implements OnInit {

  @ViewChild('focusInput') inputEl: ElementRef;

  form: UntypedFormGroup;
  name: AbstractControl;
  nameChange: boolean = false;
  exist: boolean = false;
  extension: any;
  msg: any;
  id;

  constructor(public dialogRef: MatDialogRef<RenameFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: FileManager,
    public afs: AngularFirestore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DataService,
  ) { }

  async ngOnInit() {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required])],
    })
    this.name = this.form.controls['name'];

    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
      })
    }
  }

  onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name } = f;
      const { key } = this.data;
      const item = {
        key: key,
        name: name,
        keyword: ConvertService.toCapitalize(name),
        updated_at: this.ds.serverTimestamp(),
        updated_by: this.auth.user,
      }
      this.store.RenameFile(item, this.auth.user, (success, res) => {
        if (success) {
          this.dialogRef.close();
          switch (this.data.type.key) {
            case 'file':
              this.snackBar.open("File has been renamed successfully.", "Done", { duration: 3000 });
              return;
            case 'folder':
              if (item.key == this.store.pathData[this.store.pathData.length - 1].key) {
                this.store.pathData[this.store.pathData.length - 1].name = item.name
              } else {
                this.store.selectedItem.name = item.name
              }
              this.snackBar.open("Folder has been renamed successfully.", "Done", { duration: 3000 });
              return;
            default:
              this.snackBar.open("File has been renamed successfully.", "Done", { duration: 3000 });
              return;
          }
        }
        else {
          this.snackBar.open("Fail to renamed file.", "Done", { duration: 3000 });
          return;
        }
      })
    }
  }

}
