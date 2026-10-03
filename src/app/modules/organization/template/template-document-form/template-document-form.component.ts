import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { generateKeywords, toDepartmentNoWorkplace, toUniq } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
  selector: 'app-template-document-form',
  templateUrl: './template-document-form.component.html',
  styleUrls: ['./template-document-form.component.scss']
})
export class TemplateDocumentFormComponent implements OnInit {
  form: FormGroup;
  process: boolean = false;
  title: string = 'បង្កើតគំរូឯកសារ'
  constructor(
    public dialogRef: MatDialogRef<TemplateDocumentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private auth: AuthStore,
    private fb: FormBuilder,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private router: Router,
    public store: DocumentStore,

  ) { }

  ngOnInit(): void {
    const Item = this.data.ITEM
    this.form = this.fb.group({
      documentName: [Item ? Item.documentName : null, [Validators.required]],
      documentNo: [Item ? Item.documentNo : null, [Validators.required]],
    })
    this.title = 'កែព័ត៌មានគំរូឯកសារ'
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      this.process = true;
      let document = this.data?.ITEM;
      const { documentName, documentNo } = f;
      const key = document?.key || this.ds.createId();
      const { currentDepartment } = this.auth;
      let keywords = generateKeywords([documentNo, name]);
      const data = {
        key: key,
        status: document ? (document.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: document?.created_at || this.ds.serverTimestamp(),
        created_by: document?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: document?.page_key || ConvertService.pageKey(),
        isDelete: false,
        workplace: toDepartmentNoWorkplace(currentDepartment),
        keyword: toUniq(keywords),
        documentName: documentName,
        documentNo: documentNo,
      }
      this.store.addTemplateDocument(data, (success, res) => {
        this.form.enable();
        this.process = false;
        if (success) {
          this.snackBar.open(`Document template has been saved successful.`, "Done", {
            duration: 1000,
            verticalPosition: 'bottom',
            horizontalPosition: 'end',
          });
          this.form.reset();
          if (this.data.ITEM) {
            this.dialogRef.close(data);
          } else {
            this.router.navigate([`/document-template/form/${data?.key}`])
            this.dialogRef.close(data)
          }
        } else {
          alert(res)
        }
      })
    }
  }
}
