import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { docStatusObj } from 'src/app/dummy/status';
import { IDocument } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-add-number-ref-document-application-department',
    templateUrl: './add-number-ref-document-application-department.component.html',
    styleUrls: ['./add-number-ref-document-application-department.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddNumberRefDocumentApplicationDepartmentComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បញ្ចូលលេខយោង";
  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddNumberRefDocumentApplicationDepartmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      number_ref: [null, Validators.compose([Validators.required])],
    })

    const { childDataDoc } = this.store

    if (childDataDoc) {
      this.title = "កែប្រែលេខយោង"
      const { number_ref } = childDataDoc;
      this.form.patchValue({
        number_ref
      })
    }
  }

  // async checkExistRef(control: AbstractControl) {
  //   if (control) {
  //     const { item } = this.data;
  //     const { value } = control
  //     if (!value) return null;
  //     if (item) {
  //       const { nameKey } = item;
  //       if (nameKey !== toNameKey(value)) {
  //         const doc = await this.store.checkExist(toNameKey(value),'nameKey').get().toPromise();
  //         if (doc.empty) return null;
  //         return { nameAvailable: true }
  //       }
  //       return null;
  //     }
  //     else {
  //       const doc = await this.store.checkExist(toNameKey(value),"nameKey").get().toPromise();
  //       if (doc.empty) return null;
  //       return { nameAvailable: true }
  //     }
  //   }
  // }


  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { number_ref } = this.form.value;
      const { childDataDoc, documentDataDoc } = this.store
      const item = childDataDoc || null;

      const data: IDocument = {
        key: item ? item.key : this.ds.createId(),
        status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: false,
        keyword: generateKeywords([item?.name, item?.documentNo]),


        title: null,
        name: documentDataDoc?.name,
        displayName: documentDataDoc?.name,
        files: null,
        objective: null,
        reference: null,
        description: null,
        documentNo: null,
        header: childDataDoc ? childDataDoc.header : [],
        footer: childDataDoc ? childDataDoc.footer : [],
        headerInformationRef: null,

        doc_parent: documentDataDoc.key,
        number_ref: number_ref,

      }

      this.store.addDepartmentDocument(data, documentDataDoc, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`បញ្ចូលលេខយោងបានជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.form.reset();
          this.router.navigate([`/documents/department-form/${documentDataDoc.key}/${data.key}/setup/`])
          this.dialogRef.close(data);
        } else {
          alert(res);
        }
      })
    }
  }

}
