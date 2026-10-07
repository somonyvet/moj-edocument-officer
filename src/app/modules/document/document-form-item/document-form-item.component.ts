import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import CustomEditor from 'src/app/shared/ckeditor/custom-editor';

@Component({
    selector: 'app-document-form-item',
    templateUrl: './document-form-item.component.html',
    styleUrls: ['./document-form-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentFormItemComponent implements OnInit {

  public Editor = CustomEditor;

  title: any = "បង្កើតឯកសារ";
  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<DocumentFormItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public ds: DatabaseService,
    public storage: FireStorageService,
    public dialog: MatDialog,

  ) { }

  async ngOnInit(): Promise<void> {
    const item = this.data?.item;
    this.form = this.fb.group({
      type: [item ? item.type : null, Validators.required],
      name: [item ? item.name : null, Validators.required],
      // files: [],
      // objective: [item ? item.objective : null],
      // reference: [item ? item.reference : null],
      // description: [item ? item.description : null],
      // documentNo: [item ? item.documentNo : null, Validators.required],
    })
  }

  ngOnDestroy(): void {
  }



  async _onSave(f: any) {
    if (this.form.valid) {
     
    }
  }

}
