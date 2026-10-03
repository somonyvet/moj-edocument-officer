import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { config } from 'src/app/dummy/config';
import * as customBuild from 'src/ckeditor5/build/ckeditor';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';


@Component({
  selector: 'app-citizen-profile-criminal-form',
  templateUrl: './citizen-profile-criminal-form.component.html',
  styleUrls: ['./citizen-profile-criminal-form.component.scss']
})
export class CitizenProfileCriminalFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  public Editor = customBuild;
  public config = {
    ...config,
    placeholder: "សូមបញ្ចូលសាច់រឿងសង្ខេបព្រឹត្តិបត្រថ្កោលទោសនៅទីនេះ"
  };
  process: boolean = false;
  title: any = "សង្ខេបសាច់រឿង";
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CitizenProfileCriminalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: CriminalApplicationStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    const { selectedCitizenProfile } = this.store;
    this.form = this.fb.group({
      storyboard: [selectedCitizenProfile?.storyboard || null, [Validators.required]],
    })
  }

  onReady(editor) {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
  }

  _onSubmit(f: any) {
    if (this.form.valid) {
      const dialogRef = this.dialog.open(ConfirmSuccessComponent, {
        data: { title: 'បានត្រួតពិនិត្យ និងសង្ខេបសាច់រឿងត្រឹមត្រូវ', memo: `តើលោកអ្នកពិតជាចង់ដាក់ដាក់អនុម័តលើព្រឹត្តិបត្រថ្កោលទោស?` },
        panelClass: 'cs-dialog-wrapper',
        width: '680px',
        disableClose: false,
        role: 'dialog',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === "yes") {
          this.process = true;
          const { storyboard } = f;
          const { uid } = this.auth;
          const { selectedCitizenProfile } = this.store;
          const item = {
            ...selectedCitizenProfile,
            storyboard: storyboard || null,
            updated_at: this.ds.serverTimestamp(),
            updated_by: uid,
          }
          this.store.saveStoryboard(item,true).then(() => {
            this.form.enable();
            this.snackBar.open(`Storyboard has been submitted successful.`, "Done", { duration: 3000 });
            this.process = false;
            this.dialogRef.close(item);
          }).catch(err => {
            alert(err)
          })
        }
      })
    }
  }

  async _onSave(f: any, isClose: boolean) {
    if (this.form.valid) {
      this.form.disable();
      this.process = true;
      const { storyboard } = f;
      const { uid } = this.auth;
      const { selectedCitizenProfile } = this.store;
      const item = {
        ...selectedCitizenProfile,
        storyboard: storyboard || null,
        updated_at: this.ds.serverTimestamp(),
        updated_by: uid,
      }
      this.store.saveStoryboard(item,false).then(() => {
        this.form.enable();
        this.snackBar.open(`សង្ខេបសាច់រឿងត្រូវបានរក្សាទុកដោយជោគជ័យ`, "រួចរាល់", { duration: 3000 });
        this.process = false;
        if (isClose) {
          this.dialogRef.close(item);
        }
      }).catch(err => {
        alert(err)
      })
    }
  }

}
