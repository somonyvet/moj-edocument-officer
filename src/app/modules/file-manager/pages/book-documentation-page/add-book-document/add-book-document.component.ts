import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { statusLists, tagTypeLists } from 'src/app/dummy/status';

import { AuthStore } from 'src/app/stores/auth.store';

import { ConvertService } from 'src/app/shared/services/convert.service';
import { FirestorageFilesUploadService } from 'src/app/shared/services/firestorage-files-upload.service';
import { PosterStore } from 'src/app/stores/poster.store';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { BookDocumentStore } from 'src/app/stores/book-document.store';

@Component({
  selector: 'app-add-book-document',
  templateUrl: './add-book-document.component.html',
  styleUrls: ['./add-book-document.component.scss']
})
export class AddBookDocumentComponent implements OnInit {

  @ViewChild('focusInput') inputEl: ElementRef;

  status_lists = statusLists
  tagType_Lists = tagTypeLists
  form: FormGroup;
  name: AbstractControl;
  color: AbstractControl;
  order: number;

  processNew: boolean = false;
  processClose: boolean = false;

  data: any = null;
  error: any = null;
  isCreate: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public auth: AuthStore,
    public store: BookDocumentStore,
    public afs: AngularFirestore,
    private snackBar: MatSnackBar,
    private firestorageFilesUploadService: FirestorageFilesUploadService
  ) {
    this.form = this.fb.group({
      title: [null, [Validators.required]],
      description: [null, [Validators.required]]
    })
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      const { key } = params;
      if (!key) return;
      this.store.fetchBookDocumentByKeyCallback(key, (bookDocumentData) => {
        this.data = bookDocumentData;
        this.uploadedFiles = bookDocumentData?.files;
        this.form.patchValue({
          title: bookDocumentData.title,
          description: bookDocumentData.description
        });
      })
    })
  }

  goBack() {
    this.router.navigate(['/file-manager/book-documentation'])
  }

  async onSave(f: any, isNew: boolean) {
    this.processClose = isNew ? false : true;
    this.processNew = isNew;
    this.error = null;
    this.isCreate = true;

    if (this.form.valid) {
      this.form.disable();

      const { title, description } = f;
      const key = this.data?.key || this.afs.createId();

      let uploadedResult = [];
      if(this.selectedFiles)
        uploadedResult = await this.firestorageFilesUploadService.uploadFilesToFirebase(this.selectedFiles, 'book-documents');

      if(this.deletedFiles)
        Promise.all(this.deletedFiles.map(async (item) => {
          await this.firestorageFilesUploadService.deleteRefFromFirebase(null, item?.imageFilePath);
        }))

      const item = {
        key,
        isDeleted: this.data?.isDeleted || false,
        isPublished: this.data?.isPublished || false,
        createdAt: this.data?.createdAt || new Date(),
        createdBy: this.data?.createdBy || this.auth.User,
        updatedAt: this.data?.updatedAt || new Date(),
        updatedBy: this.data?.updatedBy || this.auth.User,
        deletedBy: this.data?.deletedBy || null,
        deletedAt: this.data?.deletedAt || null,
        dateKey: this.data?.dateKey || ConvertService.dateKey(),
        pageKey: this.data?.pageKey || ConvertService.pageKey(),
        keyword: generateKeywords([title]),

        title,
        description,
        files: [ ...uploadedResult, ...this.uploadedFiles ]
      }

      this.store.addBookDocument(item, (success, res) => {
        this.snackBar.open("Book has been created successful.", "Done", { duration: 100 });

        if (!isNew) {
          this.goBack();
          return;
        }

        this.form.reset();
        this.form.enable();
        this.form.patchValue({ title, description });

        this.inputEl.nativeElement.focus();
        this.processNew = false;
        this.processClose = false;
        this.isCreate = false;
      })
    }
    else {
      this.inputEl.nativeElement.focus();
      this.processNew = false;
      this.processClose = false;
      this.isCreate = false;
    }
  }

  toggleSidebar;

  togglesidebar() {
    let body = document.getElementsByClassName("page-wrapper")[0];
    body.classList.toggle("toggled-sidebar");
    this.toggleSidebar = !this.toggleSidebar;
    localStorage.setItem("toggleSidebar", this.toggleSidebar)
  }

  selectedFiles: Array<File> = [];
  uploadedFiles: Array<any> = [];
  deletedFiles: Array<any> = [];

  onSelectedFile(event) {
    this.selectedFiles = event.target.files;
  }

  onDeleteSelctedFile(index) {
    this.selectedFiles = Array.from(this.selectedFiles);
    this.selectedFiles.splice(index, 1);
  }

  onDeleteUploadedFile(index) {
    this.deletedFiles.push(this.uploadedFiles[index]);
    this.uploadedFiles.splice(index, 1);
  }

}
