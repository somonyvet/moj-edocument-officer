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
    selector: 'app-document-void',
    templateUrl: './document-void.component.html',
    styleUrls: ['./document-void.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentVoidComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('docAttachFile') docAttachFile: ElementRef;

  titleForm: any = "មោឃៈឯកសារ";
  form: UntypedFormGroup;

  process: boolean = false;

  SELECTED_FILES: any[] = [];
  SELECTED_DOC_FILES: any[] = [];
  START_UPLOAD_FILES: boolean = false;
  URLFile: any = '';
  uploadPercentFile: any;

  constructor(
    public dialogRef: MatDialogRef<DocumentVoidComponent>,
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
      void_date: [new Date(), [Validators.required]],
      void_note: [null,],
    })
    const { headerDocument } = this.store
    if (headerDocument) {
      this.form.patchValue({
        void_date: headerDocument.void_date && headerDocument.void_date.toDate() || new Date(),
        void_note: headerDocument.void_note && headerDocument.void_note || null,
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
      const { void_date, void_note, } = f;
      const { uid } = this.auth;
      const { headerDocument } = this.store
      const data: any = {
        key: headerDocument.key,
        void_date: void_date,
        void_date_key: ConvertService.toDateKey(void_date),
        void_note: void_note,
        void_by: uid,
        doc_status: docStatusObj.void,
      }

      this.store.voidDocument(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`មោឃៈឯកសារដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.form.reset();
          this.dialogRef.close();
        } else {
          alert(res);
        }
      })
    }
  }
}
