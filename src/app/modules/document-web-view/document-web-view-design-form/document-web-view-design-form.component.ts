import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { headerDocItem, footerDocItem, bodyDocItem, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { docStatusObj } from 'src/app/dummy/status';
import { IComment, IDocument, IDocumentComment, IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { ConvertService, orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentApplicationItemFormComponent } from '../../../shared/components/document-application-item-form/document-application-item-form.component';
import { DocumentApplicationItemHeaderFormComponent } from '../../../shared/components/document-application-item-header-form/document-application-item-header-form.component';
import { DocumentApplicationItemSectionFormComponent } from '../../../shared/components/document-application-item-section-form/document-application-item-section-form.component';
import * as customBuild from 'src/ckeditor5/build/ckeditor';
import { generateKeywords, groupBy, pageKey } from 'src/app/shared/services/mapping.service';
import { DocumentAppApproverFormComponent } from 'src/app/shared/components/document-app-approver-form/document-app-approver-form.component';

@Component({
  selector: 'app-document-web-view-design-form',
  templateUrl: './document-web-view-design-form.component.html',
  styleUrls: ['./document-web-view-design-form.component.scss']
})
export class DocumentWebViewDesignFormComponent implements OnInit {

  @ViewChild('docAttachFile') docAttachFile: ElementRef;
  //comment
  @ViewChild('photoComment') photoComment: ElementRef;
  @ViewChild('fileComment') fileComment: ElementRef;
  @ViewChildren("elReference") elReference: QueryList<ElementRef>;
  @ViewChild('screen') screen: ElementRef;

  SELECTED_PHOTO: any = null;
  START_UPLOAD: boolean = false;
  URLPhoto: any = '';
  uploadPercent: any;

  SELECTED_FILES: any[] = [];
  SELECTED_DOC_FILES: any[] = [];
  START_UPLOAD_FILES: boolean = false;
  URLFile: any = '';
  uploadPercentFile: any;

  comment: AbstractControl;
  formComment: FormGroup;
  ownerKeyP: string = ''
  outputRecording: any;
  //comment

  DOC_STATUS = docStatusObj

  public Editor = customBuild;
  public config = {
    // placeholder: "",
    toolbar: [
      'fontfamily',
      'fontsize',
      'alignment',
      'fontColor',
      'fontBackgroundColor', '|',
      'bold',
      'italic',
      'strikethrough',
      'underline',
      'subscript',
      'superscript', '|',
      'link', '|',
      'outdent', 'indent', '|',
      'removeFormat',
      'bulletedList', 'numberedList', '|',
      // 'code', 'codeBlock', '|',
      'insertTable', '|',
      'blockQuote', '|',
      'undo', 'redo', '|',
      'heading', '|',
      'todoList',
    ],
    fontSize: {
      options: [
        'default',
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        22,
        24,
        26,
        28,
        30,
        32,
      ]
    },
    fontFamily: {
      options: [
        'default',
        // 'khmer_mool1, khmer_mool1regular',
        'khmer os muol, khmeros_muol',
        'khmer os muol light, khmer_os_muol_light',
        'khmer os battambang, khmeros_battambang',
        'khmer os siemreap, khmeros_siemreap',
        'tacteinga'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells',
        'tableProperties', 'tableCellProperties'
      ],
      tableProperties: {},
      tableCellProperties: {}
    }
  }
  public lessToolConfig = {
    // placeholder: "",
    toolbar: [
      'fontfamily',
      'fontsize',
      'alignment',
      'fontColor',
      'bold',
      'italic',
      'strikethrough',
      'underline',
      'bulletedList', 'numberedList', '|',
      'removeFormat',
      'undo', 'redo', '|',
      // 'heading', '|',
    ],
    fontSize: {
      options: [
        'default',
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        22,
        24,
        26,
        28,
        30,
        32,
      ]
    },
    fontFamily: {
      options: [
        'default',
        // 'khmer_mool1, khmer_mool1regular',
        'khmer os muol, khmeros_muol',
        'khmer os muol light, khmer_os_muol_light',
        'khmer os battambang, khmeros_battambang',
        'khmer os siemreap, khmeros_siemreap',
        'tacteinga'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells',
        'tableProperties', 'tableCellProperties'
      ],
      tableProperties: {},
      tableCellProperties: {}
    }
  }

  form: FormGroup;
  commentForm: FormGroup;

  headerDocItem = headerDocItem;
  footerDocItem = footerDocItem;
  bodyDocItem = bodyDocItem;

  Item: IDocument = null;
  documentTitle: string;
  header = [];
  footer = [];
  section = [];

  dateBoxString = `<p style="text-align:center;">ថ្ងៃ........ខែ........ឆ្នាំឆ្លូវ ត្រីស័ក ព.ស 2565</p> <p style="text-align:center;">រាជធានីភ្នំពេញ ថ្ងៃទី.......ខែ........ឆ្នាំ.........</p>`

  filterOffice: Observable<any[]>[] = [];
  officeData;
  office: AbstractControl;
  filteredOfficeList;
  officeLists = []
  filteredInstitutionList;
  institutionLists = []

  process: boolean = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  defaultImg = PHOTO_LIB.EMPTY;
  imageAttachments = [];
  docAttachments = [];
  constructor(
    private fb: FormBuilder,
    public ds: DataService,
    public store: DocumentStore,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public storeDocumentComment: DocumentStore,
    public storage: FireStorageService,
    private ps: PrintService,
    private router: Router,

  ) {

  }


  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      documentTitle: [],
      header: this.fb.array([]),
      footer: this.fb.array([]),
      section: this.fb.array([]),
    })

    this.commentForm = this.fb.group({
      comment: [null, Validators.required]
    })
    const { documentDataDoc, headerDocument, documentSections } = this.store;
    this.SELECTED_DOC_FILES = [];
    const { files } = headerDocument;
    this.imageAttachments = files.filter(f => f.type === 'image');
    this.docAttachments = files.filter(f => f.type === 'application');
    this.Item = documentDataDoc;
    const { title, header, footer } = this.Item;
    this.documentTitle = title;
    this.header = header;
    this.section = documentSections;
    this.footer = footer;

    if (header && header.length > 0) {
      header.map(m => {
        this.addHeaderSheet(m);
      })
    }
    if (footer && footer.length > 0) {
      footer.map(m => {
        this.addFooterSheet(m);
      })
    }
    if (documentSections && documentSections.length > 0) {
      const groupSections = orderBy(groupBy(documentSections, 'sectionKey'), 'page_key');
      groupSections.map(m => {
        this.addSessionSheet(m);
      })
    }
    this.form.patchValue({
      documentTitle: title,
    })

    this.store.fetchDepartments(data => {
      if (data) {
        this.officeData = data;
        this.officeLists = data;
        this.filteredOfficeList = this.officeLists.slice();
      }
    });



    this.formComment = this.fb.group({
      comment: [null, [Validators.required]],
    });
    this.comment = this.formComment.controls['comment']
    this.ownerKeyP = this.Item?.key;
  }


  disabledDoc() {
    const item = this.store.headerDocument
    const ref = this.dialog.open(ConfirmDeleteComponent, {
      data: { title: `មោឃៈឯកសារ (${item?.documentTitle})`, memo: `តើលោកអ្នកចង់មោឃៈឯកសារនោះចេញពីប្រព័ន្ធមែនទេ` },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        // this.store.voidDocument(item, this.auth.uid, (success, error) => {
        //   if (success) {
        //     this.snackBar.open(`Document has been removed successful.`, "Done", { duration: 1000 });
        //   } else {
        //     alert(error)
        //   }
        // })
      }
    })
  }




  async onSelectedDocumentFile(event) {
    if (event && event.target.files.length > 0) {
      this.process = true;
      this.SELECTED_DOC_FILES = await this.storage.upload(event.target.files)
      if (this.SELECTED_DOC_FILES.length > 0) {
        this.onSave()
      }
      this.docAttachFile.nativeElement.value = "";
    }
  }

  async onDeleteFile(file: any) {
    const ref = this.dialog.open(DeleteComponent, {
      data: { isDelete: true, name: file?.name, memo: `តើលោកអ្នកចង់លុបឯកសារនោះចេញពីប្រព័ន្ធមែនទេ` },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        const { headerDocument } = this.store;
        headerDocument.files = headerDocument.files?.filter(m => m?.key !== file?.key);
        this.store.deleteFile(headerDocument, file, this.auth.uid, (success, error) => {
          if (success) {
            this.imageAttachments = headerDocument.files.filter(f => f.type === 'image');
            this.docAttachments = headerDocument.files.filter(f => f.type === 'application');
            this.snackBar.open(`File has been deleted successful.`, "Done", { duration: 1000 });
          } else {
            alert(error)
          }
        })
      }
    })
  }

  trackByIdx(i) {
    return i;
  }

  print() {
    this.ps.print('#print', 'a4')
  }

  //comment

  onPreview(item) {
    this.router.navigate(['/document/' + item?.key], {
      queryParams: {
        preview: true,
      }
    })
  }


  isReply: boolean = false;
  replyData = null;
  onReply(item) {
    this.replyData = item;
  }

  onCancelReply() {
    this.replyData = null;
  }
  onComment(f) {
    if (this.form.valid || this.SELECTED_FILES.length > 0) {
      const { comment } = f;
      const data: IComment = {
        key: this.ds.createId(),
        created_at: this.ds.serverTimestamp(),
        created_by: this.auth?.profile?.key,
        // updated_by: this.auth?.profile?.key,
        updated_at: this.ds.serverTimestamp(),
        date_key: this.auth?.profile?.key,
        page_key: pageKey(),
        isHeader: this.replyData ? false : true,
        headerKey: this.replyData?.key ?? null,
        text: comment ?? null,
        files: [],
        hasSent: false,
        displayName: this.auth?.profile?.displayName,
        status: STATUS_OBJ.ACTIVE,
      }

      this.store.onComment(this.store.headerDocument, data, this.SELECTED_FILES, success => {
        if (success) {
          this.SELECTED_FILES = [];
          this.replyData = null;
          this.commentForm.reset();
        } else {
          alert('error')
        }
      })
    }

  }


  _removePhoto() {
    this.URLFile = '';
  }
  _removeFile(file) {
    this.SELECTED_FILES = this.SELECTED_FILES.filter(m => m.name !== file.name);
  }

  onSelectedPhoto(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_PHOTO = event.target.files[0];
      if (this.photoComment) this.photoComment.nativeElement.value = "";
      const reader = new FileReader();
      reader.readAsDataURL(this.SELECTED_PHOTO);
      reader.onload = (event) => {
        this.URLPhoto = event.target.result;
      }
    }
  }

  onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      for (let index = 0; index < event.target.files.length; index++) {
        const element = event.target.files[index];
        this.SELECTED_FILES.push(element);
      }
      if (this.fileComment) this.fileComment.nativeElement.value = "";
    }
  }

  async _onSaveComment(f: any) {
    this.formComment.disable();
    const { comment } = f;
    const data: IDocumentComment = {
      key: this.ds.createId(),
      status: STATUS_OBJ.ACTIVE,
      created_at: this.ds.serverTimestamp(),
      created_by: this.auth?.profile?.key,
      updated_by: this.auth?.profile?.key,
      updated_at: this.ds.serverTimestamp(),
      deleted_by: this.auth?.profile?.key,
      deleted_at: this.auth?.profile?.key,
      date_key: this.auth?.profile?.key,
      page_key: pageKey(),
      keyword: this.auth?.profile?.key,
      businessData: this.auth?.profile?.key,
      ownerData: this.auth?.profile?.key,
      displayName: this.auth?.profile?.displayName,
      ownerKey: this.ownerKeyP,
      photoComment: this.photoComment || null,
      voice: [],
      files: this.fileComment || [],
      comment: comment || null,
    };
    if (this.SELECTED_PHOTO) {
      this.START_UPLOAD = true;
      const file = this.SELECTED_PHOTO;
      const soundPath = `/document_photo/${this.ds.createId()}_${file.name}`;
      const soundTask = this.storage.uploadSelectedFile(file, soundPath);
      this.uploadPercent = soundTask.percentageChanges();
      const downloadURL: any = await soundTask.then(async (f) => {
        return f.ref.getDownloadURL();
      });
      let fileType = file.type.split('/').slice(0, -1).join('/');
      const files = {
        key: this.ds.createId(),
        filename: soundPath,
        name: file.name,
        downloadUrl: downloadURL,
        fileType: file.type,
        type: fileType,
        fileSize: file.size,
      };
      data.photoComment = files;
      this.START_UPLOAD = false;
    }

    if (this.SELECTED_FILES.length > 0) {
      const selectedFiles: any[] = [];
      for (let index = 0; index < this.SELECTED_FILES.length; index++) {
        this.START_UPLOAD = true;
        const file = this.SELECTED_FILES[index];
        const soundPath = `/document_file/${this.ds.createId()}_${file.name}`;
        const soundTask = this.storage.uploadSelectedFile(file, soundPath);
        this.uploadPercent = soundTask.percentageChanges();
        const downloadURL: any = (await soundTask.then(async (f) => {
          return f.ref.getDownloadURL()
        }));
        let fileType = file.type.split('/').slice(0, -1).join('/');
        const files = {
          key: this.ds.createId(),
          filename: soundPath,
          name: file.name,
          downloadUrl: downloadURL,
          fileType: file.type,
          type: fileType,
          fileSize: file.size,
        }
        selectedFiles.push(files)
      }
      data.files = selectedFiles;
      this.START_UPLOAD = false;
    }

    this.store.saveComments(data, (success, res) => {
      this.formComment.enable();
      if (success) {
        this.URLPhoto = '';
        this.snackBar.open(`យោបល់របស់អ្នកត្រូវបានបញ្ជូល`, "ជោគជ័យ", { duration: 1000 });
        this.formComment.reset();
      } else {
        this.snackBar.open(`យោបល់របស់អ្នកមិនត្រូវបានបញ្ជូល`, "ជោគជ័យ", { duration: 1000 });
      }
    })

  }

  // end comments


  onCreateDocumentHeaderItem(docType, index) {
    const item = this.headerForm().controls[index].value;
    let dialogRef = this.dialog.open(DocumentApplicationItemHeaderFormComponent, {
      data: item,
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== 'no') {
        const { office, content, key, type } = result;
        this.headerForm().controls[index].patchValue({
          office: office,
        })
        this.onSave()
      }
    })
  }


  onCreateDocumentItem(docType, index) {
    let item: any = null;
    if (docType.type === 'Header') {
      item = this.headerForm().controls[index].value;
    }
    if (docType.type === 'Body') {
      item = this.sessionForm().controls[index].value;
    }
    let dialogRef = this.dialog.open(DocumentApplicationItemFormComponent, {
      data: item,
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== 'no') {
        const { office, content, key, type, removedOffice } = result;
        if (docType.type === 'Header') {
          this.headerForm().controls[index].patchValue({
            office: office,
          })
          this.onSave()
        }
        if (docType.type === 'Body') {
          if (removedOffice && removedOffice.length > 0) {
            this.store.deleteSubArrayDocument('sections', this.Item.key, key, removedOffice, this.auth.uid, (success, res) => {
              if (success) { } else { }
            })
          }
          this.sessionForm().controls[index].patchValue({
            office: office,
          })
          this.onSave()
        }

      }
    })
  }

  onCreateDocumentSectionItem(docType, index) {
    const item = this.sessionForm().controls[index].value;
    let dialogRef = this.dialog.open(DocumentApplicationItemSectionFormComponent, {
      data: item,
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== 'no') {
        if (item && item.office && item.office.key !== result.key) {
          this.store.deleteSubDocument('sections', this.Item.key, item, (success, res) => {
            this.form.enable();
            if (success) {
              // this.snackBar.open(`Document has been saved successful.`, "Done", { duration: 1000 });
            } else {
              // alert(res)
            }
          })
        }
        this.sessionForm().controls[index].patchValue({
          office: result,
        })
        this.onSave()
      }
    })
  }

  onCreateDocumentFooterItem(field, index) {
    const item = this.footerForm().controls[index].value;
    let dialogRef = this.dialog.open(DocumentAppApproverFormComponent, {
      data: { Item: item, Approver: this.store.userPermission, Field: field },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result && result !== 'no') {

      if (result !== 'no') {
        if (field === 'approvedByLeftBox') {
          this.footerForm().controls[index].patchValue({
            approvedByLeftBox: result,
          })
        }
        if (field === 'approvedByRightBox') {
          this.footerForm().controls[index].patchValue({
            approvedByRightBox: result,
          })
        }

        if (field === 'approvedByCenterBox') {
          this.footerForm().controls[index].patchValue({
            approvedByCenterBox: result,
          })
        }

        this.onSave()
      }
    })
  }


  changeIsInfo(event, index) {
    // const { checked } = event;
    // const arrayControl = this.form.get('section') as FormArray;
    // if (checked) {
    //   arrayControl.at(index).get('remark').disable()
    // } else {
    //   arrayControl.at(index).get('remark').enable()
    // }
  }

  compareWithFn(item1: any, item2: any) {
    return item1 && item2 ? item1.key === item2.key : item1 === item2;
  }
  headerForm() {
    return this.form.controls["header"] as FormArray
  }

  footerForm() {
    return this.form.controls["footer"] as FormArray
  }

  sessionForm() {
    return this.form.controls["section"] as FormArray
  }

  onTitleBlur(event) {
    const { documentTitle } = this.form.value;
    if (documentTitle !== this.documentTitle) {
      this.onSave();
    }
  }

  // onContentBlur(event) {
  //   const { documentTitle } = this.form.value;
  //   if (documentTitle !== this.documentTitle) {
  //     this.onSave();
  //   }
  // }

  onSectionBlur(event, i) {
    const { section } = this.form.value;
    const current = this.section && this.section.length > 0 && this.section[i]?.remark;
    const { remark } = section[i];
    // if (remark !== null && remark !== current) {
    this.section[i] = section[i];
    this.onSave();
    // }
  }

  selectionChange(event, i) {
    this.onSave();
  }

  onHeaderBlur(event, i) {
    const { header } = this.form.value;
    const current = this.header && this.header.length > 0 && this.header[i]?.content;
    const { content } = header[i];
    if (content !== null && content !== current) {
      this.header[i] = header[i];
      this.onSave();
    }
  }


  onFooterBlur(event, i) {
    const { footer } = this.form.value;
    const current = this.footer[i]?.content;
    const currentContentTitle = this.footer[i]?.contentTitle;
    const currentContentTitleLeft = this.footer[i]?.contentTitleLeft;
    const currentContentTitleRight = this.footer[i]?.contentTitleRight;
    const { content, contentTitle, contentTitleLeft, contentTitleRight } = footer[i];
    // if (content !== null && content !== current || contentTitle !== null && contentTitle !== currentContentTitle) {
    this.footer[i] = footer[i];
    this.onSave();
    // }
  }
  //
  addHeaderSheet(item: any) {
    this.headerForm().push(this.newHeaderSheet(item));
  }
  newHeaderSheet(item: any): FormGroup {
    const { type, content, key, office, isInfo, remark, contentTitle } = item;
    return this.fb.group({
      key: [key || this.ds.createId()],
      contentTitle: [contentTitle],
      content: [content],
      office: [office],
      remark: [remark],
      isInfo: [isInfo],
      type: [type]
    })
  }

  addFooterSheet(item: any) {
    this.footerForm().push(this.newFooterSheet(item));
  }
  newFooterSheet(item: any): FormGroup {
    const { type, content, key, contentTitle, contentTitleLeft, contentTitleRight, contentTitleCenter, approvedByCenterBox, approvedByLeftBox, approvedByRightBox } = item;
    return this.fb.group({
      key: [key || this.ds.createId()],
      content: [content],
      contentTitle: [contentTitle],
      contentTitleLeft: [contentTitleLeft],
      contentTitleCenter: [contentTitleCenter],
      contentTitleRight: [contentTitleRight],
      approvedByLeftBox: [approvedByLeftBox],
      approvedByCenterBox: [approvedByCenterBox],
      approvedByRightBox: [approvedByRightBox],
      type: [type]
    })
  }

  addSessionSheet(item: any) {
    this.sessionForm().push(this.newSessionSheet(item));
  }
  newSessionSheet(item: any): FormGroup {
    const { type, content, remark, office, key, isInfo, contentTitle, sectionKey, page_key } = item;
    const { documentSections } = this.store;
    let officeForm: any = office;

    if (type?.key === 6) {
      const officeItems = documentSections.filter(m => m?.type?.key === 6 && m?.sectionKey === item?.sectionKey && m.isHeader === false);
      officeForm = officeItems;
    }
    if (type?.key === 7) {
      const officeItems = documentSections.filter(m => m?.type?.key === 7 && m?.sectionKey === item?.sectionKey && m.isHeader === false);
      officeForm = officeItems;
    }
    if (type?.key === 8) {
      const officeItems = documentSections.filter(m => m?.type?.key === 8 && m?.sectionKey === item?.sectionKey && m.isHeader === false);
      officeForm = officeItems;
    }
    if (type?.key === 9) {
      const officeItems = documentSections.filter(m => m?.type?.key === 9 && m?.sectionKey === item?.sectionKey && m.isHeader === false);
      officeForm = officeItems;
    }
    if (type?.key === 12) {
      const officeItems = documentSections.filter(m => m?.type?.key === 12 && m?.sectionKey === item?.sectionKey && m.isHeader === false);
      officeForm = officeItems;
    }

    return this.fb.group({
      key: [sectionKey || this.ds.createId()],
      content: [content],
      remark: [remark],
      office: [officeForm],
      contentTitle: [contentTitle ?? 'ស្ថាប័ន :'],
      isInfo: [isInfo],
      type: [type],
      page_key: [page_key || ConvertService.pageKey()]
    })
  }

  //
  addNewHeaderGroup(type) {
    const add = this.headerForm()
    add.push(this.fb.group({
      key: [this.ds.createId()],
      contentTitle: [type.name + ':'],
      content: [null],
      office: [null],
      isInfo: [false],
      remark: [null],
      type: [type]
    }))
  }


  deleteHeaderGroup(index: number) {
    const add = this.headerForm();
    add.removeAt(index);
    this.onSave();
  }

  addNewSessionGroup(type) {
    const add = this.sessionForm()
    add.push(this.fb.group({
      key: [this.ds.createId()],
      content: [null],
      remark: [null],
      isInfo: [false],
      office: [null, Validators.required],
      contentTitle: [type?.name + ':'],
      type: [type],
      page_key: [ConvertService.pageKey()]
    }))
  }


  displayFn(item?: any): string | undefined {
    return item ? item.name : undefined;
  }


  deleteSessionGroup(item, index: number) {
    const add = this.sessionForm();
    this.store.deleteSubDocument('sections', this.Item.key, item, (success, res) => {
      this.form.enable();
      if (success) {
        // this.snackBar.open(`Document has been saved successful.`, "Done", { duration: 1000 });
      } else {
        // alert(res)
      }
    })
    add.removeAt(index);
    this.onSave();
  }



  addNewFooterGroup(type) {
    const add = this.footerForm()
    add.push(this.fb.group({
      key: [this.ds.createId()],
      content: [(type.key == 15) ? this.dateBoxString : null],
      contentTitle: [null],
      contentTitleLeft: [null],
      contentTitleCenter: [null],
      contentTitleRight: [null],
      approvedByLeftBox: [null],
      approvedByCenterBox: [null],
      approvedByRightBox: [null],
      type: [type],
    }))
  }

  deleteFooterGroup(index: number) {
    const add = this.footerForm();
    add.removeAt(index);
    this.onSave();
  }

  onReady(editor, i, type) {
    const el = document.getElementById('editor' + i);
    editor.editing.view.focus();
    el.scrollIntoView();
  }

  async onSave() {
    // if (this.form.valid) {
    this.process = true;
    const { documentTitle, header, footer, section } = this.form.value;
    const sectionData: any[] = section.map((f: any) => {
      const { office, type } = f;
      if (type?.key === 6 || type?.key === 7 || type?.key === 8 || type?.key === 9 || type?.key === 12) {
        return {
          ...f,
          office: office ? office.map(f => {
            return {
              key: f.office?.key,
              name: f.office?.name,
              code: f.office?.code ?? null,
              headerOfficer: f.office?.headerOfficer || [],
              order: f?.office?.ranking?.order ?? null,
            }
          }) : [],
        }
      } else if (type?.key === 10) {
        return {
          ...f,
          office: office ? {
            key: office.key,
            name: office.name,
            code: office.code ?? null,
            headerOfficer: office.headerOfficer || [],
            order: office?.ranking?.order ?? null,

          } : null,
        }
      } else {
        return f
      }
    }).filter(m => m);
    const headerData = header.map(f => {
      const { office } = f;
      return {
        ...f,
        office: office ? office.map(f => {
          return {
            key: f.key,
            name: f.name,
            code: f.code ?? null,
            headerOfficer: f.headerOfficer || [],
            order: f?.ranking?.order ?? null,
          }
        }) : [],
      }
    }).filter(m => m);


    const footerData: any[] = footer.map(f => {
      const { approvedByRightBox, approvedByLeftBox } = f;
      return {
        ...f,
        approvedByRightBox: approvedByRightBox ? {
          key: approvedByRightBox?.key,
          profile: approvedByRightBox?.profile,
          accountKey: approvedByRightBox?.accountKey
        } : null,

        approvedByLeftBox: approvedByLeftBox ? {
          key: approvedByLeftBox?.key,
          profile: approvedByLeftBox?.profile,
          accountKey: approvedByLeftBox?.accountKey
        } : null,

      }
    }).filter(m => m);
    const key = this.Item ? this.Item.key : this.ds.createId();
    const item = this.Item;
    const { headerDocument } = this.store;
    const { files } = headerDocument || {};
    const headerDocumentData: IHeaderInformation = headerDocument;
    if (this.SELECTED_DOC_FILES?.length > 0) {
      headerDocumentData.files = files?.length > 0 ? files.concat(this.SELECTED_DOC_FILES) : this.SELECTED_DOC_FILES;
    }
    const data: IDocument = {
      key: key,
      status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
      created_at: item?.created_at || this.ds.serverTimestamp(),
      created_by: item?.created_by || this.auth.uid,
      updated_by: this.auth.uid,
      updated_at: this.ds.serverTimestamp(),
      page_key: item?.page_key || ConvertService.pageKey(),
      isDelete: false,
      keyword: generateKeywords([item?.name, item?.documentNo]),
      title: documentTitle,
      name: item?.name,
      displayName: item?.name,
      files: item?.files || [],
      docFile: item?.docFile || null,
      objective: item?.objective || null,
      reference: item?.reference || null,
      description: item?.description || null,
      documentNo: item ? item.documentNo : null,
      header: headerData,
      footer: footerData,
      headerInformationRef: item?.headerInformationRef || null,
      doc_parent: item?.doc_parent || null,
      hashtag: headerDocument?.hashtag ?? [],
    }
    this.store.addDocument(data, headerDocumentData, [], sectionData, null, null, (success, res) => {
      this.form.enable();
      this.process = false;
      if (success) {
        this.SELECTED_DOC_FILES = [];
        this.imageAttachments = headerDocumentData?.files?.filter(f => f.type === 'image');
        this.docAttachments = headerDocumentData?.files?.filter(f => f.type === 'application');
        this.snackBar.open(`Document has been saved successful.`, "Done", {
          duration: 1000,
          verticalPosition: 'bottom',
          horizontalPosition: 'end',
        });
      } else {
        alert(res)
      }
    })
  }

}
