import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { headerDocItem, footerDocItem, bodyDocItem, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { DOCUMENT_ACTION_TYPE_OBJ } from 'src/app/dummy/config';
import { docStatusObj } from 'src/app/dummy/status';
import { DocumentAppApproverFormComponent } from 'src/app/shared/components/document-app-approver-form/document-app-approver-form.component';
import { DocumentApplicationItemFormComponent } from 'src/app/shared/components/document-application-item-form/document-application-item-form.component';
import { DocumentApplicationItemHeaderFormComponent } from 'src/app/shared/components/document-application-item-header-form/document-application-item-header-form.component';
import { DocumentApplicationItemSectionFormComponent } from 'src/app/shared/components/document-application-item-section-form/document-application-item-section-form.component';
import { ConvertService, orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, getPermission, groupBy } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentCompleteComponent } from '../../document/document-complete/document-complete.component';
import { DocumentVoidComponent } from '../../document/document-void/document-void.component';
import * as customBuild from 'src/ckeditor5/build/ckeditor';
import { IHeaderInformation, IDocument } from 'src/app/interfaces/document/document.interface';
import { toJpeg } from 'html-to-image';
import { DocumentApplicationWorkplaceFormComponent } from 'src/app/shared/components/document-application-workplace-form/document-application-workplace-form.component';
import { DocumentAddCustomStyleComponent } from '../../document/document-add-custom-style/document-add-custom-style.component';

@Component({
  selector: 'app-document-template-design-form',
  templateUrl: './document-template-design-form.component.html',
  styleUrls: ['./document-template-design-form.component.scss']
})
export class DocumentTemplateDesignFormComponent implements OnInit {

  @ViewChild('docAttachFile') docAttachFile: ElementRef;
  @ViewChild('photoComment') photoComment: ElementRef;
  @ViewChild('fileComment') fileComment: ElementRef;
  @ViewChildren("elReference") elReference: QueryList<ElementRef>;
  @ViewChild('screen') screen: ElementRef;

  SELECTED_PHOTO: any = null;
  START_UPLOAD: boolean = false;
  URLPhoto: any = '';
  uploadPercent: any;

  NO_AVATAR = 'https://firebasestorage.googleapis.com/v0/b/sysanotta.appspot.com/o/no_image.svg?alt=media&token=f25af902-6c62-47e6-bdf3-48e3b0c6fe8c'

  SELECTED_FILES: any[] = [];
  SELECTED_DOC_FILES: any[] = [];
  START_UPLOAD_FILES: boolean = false;
  URLFile: any = '';
  uploadPercentFile: any;

  ownerKeyP: string = ''
  outputRecording: any;
  finalDocument: boolean = false;
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

  headerDocItem = headerDocItem;
  footerDocItem = footerDocItem;
  bodyDocItem = bodyDocItem;

  Item = null;
  documentDataDoc: IDocument = null;
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
  docCompleted = [];

  DOCUMENT_ACTION_TYPE_OBJ = DOCUMENT_ACTION_TYPE_OBJ;

  constructor(
    private fb: FormBuilder,
    public ds: DataService,
    public store: DocumentStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public storeDocumentComment: DocumentStore,
    public storage: FireStorageService,
    private ps: PrintService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  userOption;
  userPermission;

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      documentTitle: [],
      header: this.fb.array([]),
      footer: this.fb.array([]),
      section: this.fb.array([]),
    })
    const { documentDataDoc, headerDocument, documentSections } = this.store;

    this.SELECTED_DOC_FILES = [];
    this.Item = headerDocument;
    const { title, header, footer } = this.Item;
    this.documentTitle = title ?? '';
    this.header = header;
    this.section = documentSections;
    this.footer = footer;
    this.documentDataDoc = documentDataDoc;

    this.store.peoplesInDoc = []
    const practicePlace = this.section.filter(m => !m?.isHeader && !m?.isRejected)
    practicePlace.map(m => {
      this.store.peoplesInDoc = this.store.peoplesInDoc.concat(m?.office?.headerOfficer || [])
    })

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

      const groupSections = orderBy(groupBy(documentSections.filter(f => f.isRejected === false), 'sectionKey'), 'page_key');
      groupSections.map(m => {
        this.addSessionSheet(m);
      })
    }
    this.form.patchValue({
      documentTitle: title ?? '',
    })

    // this.store.fetchDocumentTemplateSections()
    
  }

  ngOnDestroy() {
    this.store.documentSubscribe()
  }

  disabledDoc() {
    const dialogRef = this.dialog.open(DocumentVoidComponent, {
      data: null,
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  completedDoc() {
    const dialogRef = this.dialog.open(DocumentCompleteComponent, {
      data: null,
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
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

  onPreviewFullSet(item) {
    this.router.navigate(['/document-template/' + item?.key + '/full-set-template'], {
      queryParams: {
        preview: true,
      }
    })
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
    // let item: any = null;
    // if (docType.type === 'Header') {
    //   item = this.headerForm().controls[index].value;
    // }
    // if (docType.type === 'Body') {
    //   item = this.sessionForm().controls[index].value;
    // }
    // let dialogRef = this.dialog.open(DocumentApplicationItemFormComponent, {
    //   data: item,
    //   panelClass: 'cs-dialog-doc',
    //   width: '500px',
    //   disableClose: true,
    //   role: 'dialog',
    // });

    let item: any = null;
    let form: any = DocumentApplicationItemFormComponent;
    if (docType.type === 'Header') {
      item = this.headerForm().controls[index].value;
    }
    if (docType.type === 'Body') {
      item = this.sessionForm().controls[index].value;
      form = DocumentApplicationWorkplaceFormComponent
    }
    let dialogRef = this.dialog.open(form, {
      data: item,
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== 'no') {
        const { office, content, key, type, removedOffice } = result;
        if (docType.type === 'Header') {
          this.headerForm().controls[index].patchValue({
            office: office,
          })
          this.onSave()
        }
        // if (docType.type === 'Body') {
        //   if (removedOffice && removedOffice.length > 0) {
        //     this.store.deleteSubArrayDocumentTemplate('sections', this.Item.key, key, removedOffice, this.auth.uid, (success, res) => {
        //       if (success) { } else { }
        //     })
        //   }
        //   this.sessionForm().controls[index].patchValue({
        //     office: office,
        //   })
        //   this.onSave()
        // }

        if (docType.type === 'Body') {
          if (removedOffice && removedOffice.length > 0) {
            this.store.deleteSubArrayDocument('sections', this.Item.key, key, removedOffice, this.auth.uid, (success, res) => {
              if (success) { } else { }
            })
          }
          this.sessionForm().controls[index].patchValue({
            office: this.store.officeInDoc || [],
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

        if (field === 'moj_box1_approvedByLeftBox') {
          this.footerForm().controls[index].patchValue({
            moj_box1_approvedByLeftBox: result,
          })
        }

        if (field === 'moj_box2_approvedByLeftBox') {
          this.footerForm().controls[index].patchValue({
            moj_box2_approvedByLeftBox: result,
          })
        }

        if (field === 'moj_box3_approvedByLeftBox') {
          this.footerForm().controls[index].patchValue({
            moj_box3_approvedByLeftBox: result,
          })
        }

        if (field === 'moj_box4_approvedByRightBox') {
          this.footerForm().controls[index].patchValue({
            moj_box4_approvedByRightBox: result,
          })
        }

        if (field === 'moj_box5_approvedByRightBox') {
          this.footerForm().controls[index].patchValue({
            moj_box5_approvedByRightBox: result,
          })
        }
        
        this.onSave()
      }
    })
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
    // if(!header && header.length < 0) return
    const current = this.header && this.header.length > 0 && this.header[i]?.content;
    const { content } = header[i];
    if (content !== null && content !== current) {
      // this.header[i] = header[i]??[];
      this.onSave();
    }
  }
  
  addCustomStyle(i) {
    const { header } = this.form.value;
    if (header[i]) {
      let dialogRef = this.dialog.open(DocumentAddCustomStyleComponent, {
        data: { item: header[i].customStyles || [] },
        panelClass: 'cs-dialog-doc',
        width: '500px',
        disableClose: true,
        role: 'dialog',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result && result !== 'no') {
          header[i].customStyles = result || []
          this.header[i] = header[i];

          this.headerForm().controls[i].patchValue({
            customStyles: result,
          })

          this.onSave();
        }
      })
    }
  }

  gStyle(customStylesItems: Array<any>) {
    let cs = null
    const customStyles = customStylesItems && customStylesItems.length > 0 ? customStylesItems.filter(m => !m.isNormal) : []
    if (customStyles && customStyles.length > 0) {
      customStyles.map((m, index) => {
        if (index === 0) cs = `{ `
        cs += ` "${m?.code}": "${m?.value}" `
        if (index + 1 < customStyles.length) cs += ` , `
        if (index + 1 === customStyles.length) cs += ` }`
      })

      const obj = JSON.parse(cs);
      return obj
    }
  }

  onFooterBlur(event, i) {
    // const { footer } = this.form.value;
    // const current = this.footer[i]?.content;
    // const currentContentTitle = this.footer[i]?.contentTitle;
    // const currentContentTitleLeft = this.footer[i]?.contentTitleLeft;
    // const currentContentTitleRight = this.footer[i]?.contentTitleRight;
    // const { content, contentTitle, contentTitleLeft, contentTitleRight } = footer[i];
    // if (content !== null && content !== current || contentTitle !== null && contentTitle !== currentContentTitle) {
    // this.footer[i] = footer[i];
    this.onSave();
    // }
  }
  //
  addHeaderSheet(item: any) {
    this.headerForm().push(this.newHeaderSheet(item));
  }
  newHeaderSheet(item: any): FormGroup {
    const { type, content, key, office, isInfo, remark, contentTitle, customStyles } = item;
    return this.fb.group({
      key: [key || this.ds.createId()],
      contentTitle: [contentTitle],
      content: [content],
      office: [office],
      remark: [remark],
      isInfo: [isInfo],
      type: [type],
      customStyles: [customStyles],
    })
  }

  addFooterSheet(item: any) {
    this.footerForm().push(this.newFooterSheet(item));
  }
  newFooterSheet(item: any): FormGroup {
    const { type, content, key, contentTitle, contentTitleLeft, contentTitleRight, contentTitleCenter, approvedByLeftBox, approvedByRightBox, approvedByCenterBox,
      moj_box1_contentTitleLeft, moj_box1_contentSubTitleLeft, moj_box1_approvedByLeftBox, moj_box2_contentTitleLeft, moj_box2_contentSubTitleLeft, moj_box2_approvedByLeftBox,
      moj_box3_contentTitleLeft, moj_box3_contentSubTitleLeft, moj_box3_approvedByLeftBox, 
      moj_box4_contentTitleRight, moj_box4_contentSubTitleRight, moj_box4_approvedByRightBox, moj_box5_contentTitleRight, moj_box5_contentSubTitleRight, moj_box5_approvedByRightBox, 
    } = item;
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
      type: [type],

      moj_box1_contentTitleLeft: [moj_box1_contentTitleLeft],
      moj_box1_contentSubTitleLeft: [moj_box1_contentSubTitleLeft],
      moj_box1_approvedByLeftBox: [moj_box1_approvedByLeftBox],

      moj_box2_contentTitleLeft: [moj_box2_contentTitleLeft],
      moj_box2_contentSubTitleLeft: [moj_box2_contentSubTitleLeft],
      moj_box2_approvedByLeftBox: [moj_box2_approvedByLeftBox],

      moj_box3_contentTitleLeft: [moj_box3_contentTitleLeft],
      moj_box3_contentSubTitleLeft: [moj_box3_contentSubTitleLeft],
      moj_box3_approvedByLeftBox: [moj_box3_approvedByLeftBox],

      moj_box4_contentTitleRight: [moj_box4_contentTitleRight],
      moj_box4_contentSubTitleRight: [moj_box4_contentSubTitleRight],
      moj_box4_approvedByRightBox: [moj_box4_approvedByRightBox],

      moj_box5_contentTitleRight: [moj_box5_contentTitleRight],
      moj_box5_contentSubTitleRight: [moj_box5_contentSubTitleRight],
      moj_box5_approvedByRightBox: [moj_box5_approvedByRightBox],

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
      content: [content,],
      remark: [remark],
      office: [officeForm],
      contentTitle: [contentTitle ?? 'ស្ថាប័ន'],
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
      contentTitle: [type.name],
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

  itemArray8: any[] = [];
  itemKey8: any;
  disKey8: boolean = false;
  addNewSessionGroup(type) {
    const add = this.sessionForm()
    add.push(this.fb.group({
      key: [this.ds.createId()],
      content: [null],
      remark: [null],
      isInfo: [false],
      office: [null, Validators.required],
      contentTitle: [type?.name],
      type: [type],
      page_key: [ConvertService.pageKey()]
    }))

    this.itemKey8 = add.value;
    this.itemKey8.forEach(m => {
      this.itemKey8 = m;
    });
    if (add && this.itemKey8?.type?.key === 8) {
      this.disKey8 = true;
    }
  }


  displayFn(item?: any): string | undefined {
    return item ? item.name : undefined;
  }


  deleteSessionGroup(item, index: number) {
    const add = this.sessionForm();
    this.store.deleteSubDocumentTemplate('sections', this.Item.key, item, (success, res) => {
      this.form.enable();
      if (success) {
        // this.snackBar.open(`Document has been saved successful.`, "Done", { duration: 1000 });
      } else {
        // alert(res)
      }
    })
    add.removeAt(index);
    this.onSave();
    this.itemKey8 = add.value;
    if (this.itemKey8.length === 0) {
      this.disKey8 = false;
    }
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

      moj_box1_contentTitleLeft: [null],
      moj_box1_contentSubTitleLeft: [null],
      moj_box1_approvedByLeftBox: [null],

      moj_box2_contentTitleLeft: [null],
      moj_box2_contentSubTitleLeft: [null],
      moj_box2_approvedByLeftBox: [null],

      moj_box3_contentTitleLeft: [null],
      moj_box3_contentSubTitleLeft: [null],
      moj_box3_approvedByLeftBox: [null],

      moj_box4_contentTitleRight: [null],
      moj_box4_contentSubTitleRight: [null],
      moj_box4_approvedByRightBox: [null],

      moj_box5_contentTitleRight: [null],
      moj_box5_contentSubTitleRight: [null],
      moj_box5_approvedByRightBox: [null],


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

  checkArrayInArray(arr1, arr2) {
    let newArr = []
    arr1.map(m => {
      const isExist = arr2.find(a => a.key === m.key)
      if (isExist) newArr.push(m)
    })
    return newArr
  }

  async onSave() {
    if (!this.finalDocument) {
      this.process = true;
      const { documentTitle, header, footer, section } = this.form.value;
      const sectionData: any[] = section.map((f: any) => {
        const { office, type } = f;
        if (type?.key === 6 || type?.key === 7 || type?.key === 8 || type?.key === 9 || type?.key === 12) {
          return {
            ...f,
            office: office ? office.map(f => {

              let headerOfficer = []
              if (type?.key === 8) {
                headerOfficer = this.checkArrayInArray(f.office?.headerOfficer, this.store.peoplesInDoc)
              } else headerOfficer = f.office?.headerOfficer || []
              return {
                key: f.office?.key,
                name: f.office?.name,
                code: f.office?.code ?? null,
                headerOfficer: headerOfficer,
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
        const { approvedByRightBox, approvedByLeftBox, moj_box1_approvedByLeftBox, moj_box2_approvedByLeftBox, moj_box3_approvedByLeftBox, moj_box4_approvedByRightBox, moj_box5_approvedByRightBox } = f;
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

          moj_box1_approvedByLeftBox: moj_box1_approvedByLeftBox ? {
            key: moj_box1_approvedByLeftBox?.key,
            profile: moj_box1_approvedByLeftBox?.profile,
            accountKey: moj_box1_approvedByLeftBox?.accountKey
          } : null,

          moj_box2_approvedByLeftBox: moj_box2_approvedByLeftBox ? {
            key: moj_box2_approvedByLeftBox?.key,
            profile: moj_box2_approvedByLeftBox?.profile,
            accountKey: moj_box2_approvedByLeftBox?.accountKey
          } : null,

          moj_box3_approvedByLeftBox: moj_box3_approvedByLeftBox ? {
            key: moj_box3_approvedByLeftBox?.key,
            profile: moj_box3_approvedByLeftBox?.profile,
            accountKey: moj_box3_approvedByLeftBox?.accountKey
          } : null,

          moj_box4_approvedByRightBox: moj_box4_approvedByRightBox ? {
            key: moj_box4_approvedByRightBox?.key,
            profile: moj_box4_approvedByRightBox?.profile,
            accountKey: moj_box4_approvedByRightBox?.accountKey
          } : null,

          moj_box5_approvedByRightBox: moj_box5_approvedByRightBox ? {
            key: moj_box5_approvedByRightBox?.key,
            profile: moj_box5_approvedByRightBox?.profile,
            accountKey: moj_box5_approvedByRightBox?.accountKey
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


      // const oldFile = this.store.headerDocument?.coverFile?.filename || null;
      // if (oldFile) {
      //   this.storage.storageRef(oldFile).delete()
      // }
      // const node: any = document.getElementById('doc-template-wrapper');
      // const dataUrl = await toJpeg(node, { quality: 0.95, backgroundColor: "#fff", skipFonts: true });
      // const filename = `${headerDocument?.documentNo}`;
      // const downloadURL = await this.store.uploadBase64(dataUrl.split(',')[1], filename);
      // headerDocument.coverFile = {
      //   filename: `/documents_covers/${filename}`, downloadURL
      // }

      const data: any = {
        ...headerDocument,
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
        documentNo: item ? item.documentNo : null,
        documentName: item?.documentName,
        header: headerData,
        footer: footerData,
        headerInformationRef: item?.headerInformationRef || null,
        doc_parent: item?.doc_parent || null,
        hashtag: headerDocument?.hashtag ?? [],
      }

      this.store.addDocumentTemplate(data, sectionData, (success, res) => {
        this.form.enable();
        this.process = false;
        if (success) {
          this.SELECTED_DOC_FILES = [];
          this.imageAttachments = headerDocumentData?.files?.filter(f => f.type === 'image');
          this.docAttachments = headerDocumentData?.files?.filter(f => f.type === 'application');
          this.snackBar.open(`Document template has been saved successful.`, "Done", {
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

}
