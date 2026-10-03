import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { bodyDocItem, footerDocItem, headerDocItem, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IDocument } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import * as customBuild from 'src/ckeditor5/build/ckeditor';
@Component({
  selector: 'app-document-application-department-content',
  templateUrl: './document-application-department-content.component.html',
  styleUrls: ['./document-application-department-content.component.scss']
})
export class DocumentApplicationDepartmentContentComponent implements OnInit {
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
        'default, khmeros_siemreap',
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

  @ViewChildren("elReference") elReference: QueryList<ElementRef>;
  form: FormGroup;

  headerDocItem = headerDocItem;
  footerDocItem = footerDocItem;
  bodyDocItem = bodyDocItem;

  Item;
  documentTitle;
  header;
  footer;
  section;

  dateBoxString = `<p style="text-align:center;">ថ្ងៃ........ខែ........ឆ្នាំឆ្លូវ ត្រីស័ក ព.ស 2565</p> <p style="text-align:center;">រាជធានីភ្នំពេញ ថ្ងៃទី.......ខែ........ឆ្នាំ.........</p>`
  public filteredOfficeList;
  officeLists = []
  constructor(
    private fb: FormBuilder,
    public ds: DataService,
    public store: DocumentStore,
    private route: ActivatedRoute,
    private auth: AuthStore,
    private snackBar: MatSnackBar,

  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      documentTitle: [],
      hashtag: [],
      header: this.fb.array([]),
      footer: this.fb.array([]),
      section: this.fb.array([]),
    })
    const { childDataDoc } = this.store;
    this.Item = childDataDoc;
    if (this.Item) {
      const { title, header, footer, section } = this.Item;
      this.documentTitle = title;
      this.header = header || [];
      this.section = section || [];
      this.footer = footer || [];

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
      if (section && section.length > 0) {
        section.map(m => {
          this.addSessionSheet(m);
        })
      }
      this.form.patchValue({
        documentTitle: title,
      })

    }

    this.store.fetchDepartments(data => {
      this.officeLists = data;
      this.filteredOfficeList = this.officeLists.slice();
    });
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

  onSectionBlur(event, i) {
    const { section } = this.form.value;
    const current = this.section && this.section.length > 0 && this.section[i]?.remark;
    const { remark } = section[i];

    if (remark !== null && remark !== current) {
      this.section[i] = section[i];
      this.onSave();
    }
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
    const { content } = footer[i];
    if (content !== null && content !== current) {
      this.footer[i] = footer[i];
      this.onSave();
    }
  }
  //
  addHeaderSheet(item: any) {
    this.headerForm().push(this.newHeaderSheet(item));
  }
  newHeaderSheet(item: any): FormGroup {
    const { type, content, key } = item;
    return this.fb.group({
      key: [key || this.ds.createId()],
      content: [content],
      type: [type]
    })
  }

  addFooterSheet(item: any) {
    this.footerForm().push(this.newFooterSheet(item));
  }
  newFooterSheet(item: any): FormGroup {
    const { type, content, key } = item;
    return this.fb.group({
      key: [key || this.ds.createId()],
      content: [content],
      type: [type]
    })
  }

  addSessionSheet(item: any) {
    this.sessionForm().push(this.newSessionSheet(item));
  }
  newSessionSheet(item: any): FormGroup {
    const { type, content, remark, office, key } = item;
    return this.fb.group({
      key: [key || this.ds.createId()],
      content: [content],
      remark: [remark],
      office: [office],
      type: [type]
    })
  }

  //
  addNewHeaderGroup(type) {
    const add = this.headerForm()
    add.push(this.fb.group({
      key: [this.ds.createId()],
      content: [type.name + ':'],
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
      // office: [null, Validators.required],
      type: [type]
    }))
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
      content: [(type.key == 3) ? this.dateBoxString : null],
      type: [type],
      approvedByLeftBox: [null],
      approvedByRightBox: [null],
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

  onSave() {
    if (this.form.valid) {
      const { documentTitle, header, footer, section } = this.form.value;
      const sectionData = section.map(f => {
        const { office } = f;
        return {
          ...f,
          office: office ? { key: office.key, name: office.name, code: office.code } : null,
        }
      })
      const key = this.Item ? this.Item.key : this.ds.createId();
      const item = this.Item;

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
        files: null,
        objective: null,
        reference: null,
        description: null,
        documentNo: item ? item.documentNo : null,
        header: header,
        footer: footer,
        headerInformationRef: null,
        doc_parent: null,
      }

      this.store.addDocument(data, null, [], [], this.store.selectedDocument,null, (success, res) => {
        this.form.enable();
        if (success) {
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

}




