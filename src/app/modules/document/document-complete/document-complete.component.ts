import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { docStatusObj } from 'src/app/dummy/status';

@Component({
    selector: 'app-document-complete',
    templateUrl: './document-complete.component.html',
    styleUrls: ['./document-complete.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentCompleteComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('docAttachFile') docAttachFile: ElementRef;

  titleForm: any = "បិទបញ្ចប់ឯកសារ";
  form: UntypedFormGroup;

  process: boolean = false;

  SELECTED_FILES: any[] = [];
  SELECTED_DOC_FILES: any[] = [];
  START_UPLOAD_FILES: boolean = false;
  URLFile: any = '';
  uploadPercentFile: any;

  constructor(
    public dialogRef: MatDialogRef<DocumentCompleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
    public store: DocumentStore,

  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      completed_date: [new Date(), [Validators.required]],
      completed_note: [null,],
    })
    const { headerDocument } = this.store
    if (headerDocument) {
      this.form.patchValue({
        completed_date: headerDocument.completed_date && headerDocument.completed_date.toDate() || new Date(),
        completed_note: headerDocument.completed_note && headerDocument.completed_note || null,
      })
    }
  }

  async onSelectedDocumentFile(event) {
    if (event && event.target.files.length > 0) {
      this.process = true;
      this.SELECTED_DOC_FILES = await this.storage.upload(event.target.files)
      if (this.SELECTED_DOC_FILES.length > 0) {
        this._onSave(this.form.value)
      }
      this.docAttachFile.nativeElement.value = "";
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { completed_date, completed_note, } = f;
      const { uid } = this.auth;
      const { headerDocument } = this.store
      const data: any = {
        key: headerDocument.key,
        completed_date: completed_date,
        completed_date_key: ConvertService.toDateKey(completed_date),
        completed_note: completed_note,
        completed_by: uid,
        doc_status: docStatusObj.final,
      }

      const { completed_files } = headerDocument || {};
      if (this.SELECTED_DOC_FILES?.length > 0) {
        data.completed_files = completed_files?.length > 0 ? completed_files.concat(this.SELECTED_DOC_FILES) : this.SELECTED_DOC_FILES;
      }

      this.store.completedDocument(data, (success, res) => {
        this.form.enable();
        if (success) {
          headerDocument.completed_files = data.completed_files
          this.snackBar.open(`បិទបញ្ចប់ឯកសារដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.form.reset();
          this.dialogRef.close();
        } else {
          alert(res);
        }
      })
    }
  }
}
