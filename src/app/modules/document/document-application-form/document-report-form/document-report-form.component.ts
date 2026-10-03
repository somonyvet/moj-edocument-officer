import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService, pushObjArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { IReportDocument } from 'src/app/interfaces/document/document.interface';
import { docStatusObj } from 'src/app/dummy/status';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';

@Component({
  selector: 'app-document-report-form',
  templateUrl: './document-report-form.component.html',
  styleUrls: ['./document-report-form.component.scss']
})
export class DocumentReportFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('docAttachFile') docAttachFile: ElementRef;

  titleForm: any = "បិទបញ្ចប់ឯកសារ";
  form: FormGroup;

  process: boolean = false;

  SELECTED_DOC_FILES: any[] = [];
  START_UPLOAD_FILES: boolean = false;
  URLFile: any = '';
  uploadPercentFile: any;

  report: IReportDocument = null;
  constructor(
    public dialogRef: MatDialogRef<DocumentReportFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    public store: DocumentStore,

  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      completed_date: [new Date(), [Validators.required]],
      completed_note: [null],
    })
    const { headerDocument } = this.store
    if (headerDocument) {
      const report = headerDocument?.receivedWorkplaceCompletedByDocKeys?.find(m => m?.workplaceKey === this.data?.office?.key) as IReportDocument;
      this.report = report;
      this.form.patchValue({
        completed_date: report?.completed_date?.toDate() || new Date(),
        completed_note: report?.completed_note || null,
      })
    }
  }

  async onSelectedDocumentFile(event) {
    if (event && event.target.files.length > 0) {
      this.process = true;
      this.START_UPLOAD_FILES = true;
      this.SELECTED_DOC_FILES = await this.storage.upload(event.target.files)
      this._onSave(this.form.value)
      this.docAttachFile.nativeElement.value = "";
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.process = true;
      this.form.disable();
      const { completed_date, completed_note, } = f;
      const { uid } = this.auth;
      let { headerDocument } = this.store;
      const report = headerDocument?.receivedWorkplaceCompletedByDocKeys?.find(m => m?.workplaceKey === this.data?.office?.key) as IReportDocument;
      const data: IReportDocument = {
        key: report?.key || this.ds.createId(),
        created_at: report?.created_at || new Date(),
        created_by: report?.created_by || uid,
        workplaceKey: report?.workplaceKey || this.data?.office?.key,
        files: report?.files ? report?.files.concat(this.SELECTED_DOC_FILES) : this.SELECTED_DOC_FILES,
        received_by: uid,
        received_date: new Date(),
        completed_date: completed_date,
        completed_note: completed_note,
      }
      const { receivedWorkplaceCompletedByDocKeys } = headerDocument || {};
      const item = pushObjArray(receivedWorkplaceCompletedByDocKeys || [], data)
      headerDocument.receivedWorkplaceCompletedByDocKeys = item;
      const isIncomplete = item?.find(m => !m?.received_by);
      if (!isIncomplete) {
        headerDocument = {
          ...headerDocument,
          completed_date: this.ds.serverTimestamp(),
          completed_date_key: ConvertService.toDateKey(new Date()),
          completed_by: uid,
          doc_status: docStatusObj.final,
        }
      }
      const oldFile = this.store.headerDocument?.coverFile?.filename || null;
      if (oldFile) {
        this.storage.storageRef(oldFile).delete()
      }
      const node: any = document.getElementById('doc-template-wrapper');
      const dataUrl = await toJpeg(node, { quality: 0.95, backgroundColor: "#fff", skipFonts: true });
      const filename = `${headerDocument?.documentNo}`;
      const downloadURL = await this.store.uploadBase64(dataUrl.split(',')[1], filename);
      headerDocument.coverFile = {
        filename: `/documents_covers/${filename}`, downloadURL
      }
      this.store.receiveReportDocument(headerDocument, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`ទទួលរបាយការណ៍ដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.form.reset();
          this.dialogRef.close('yes');
          this.SELECTED_DOC_FILES = [];
          this.START_UPLOAD_FILES = false;
          this.process = false;
        } else {
          alert(res);
        }
      })
    }
  }
}
