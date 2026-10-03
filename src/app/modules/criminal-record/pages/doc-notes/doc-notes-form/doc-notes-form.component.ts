import { NationalityStore } from './../../../stores/nationality.store';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DOCUMENT_NOTE_TYPE_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DataService } from 'src/app/shared/services/data.service';
import * as customBuild from 'src/ckeditor5/build/ckeditor';

@Component({
  selector: 'app-doc-notes-form',
  templateUrl: './doc-notes-form.component.html',
  styleUrls: ['./doc-notes-form.component.scss']
})

export class DocNotesFormComponent implements OnInit {
  title: any = "បង្កើតចំណារ";
  @ViewChild("focusInput") inputEl: ElementRef;
  form: FormGroup
  process: boolean = false;

  name: any = null;
  name_en: any = null;
  name_fr: any = null;

  note_type = DOCUMENT_NOTE_TYPE_ARRAY;
  quillModules

  public Editor = customBuild;
  public config = {
    toolbar: [
      'fontfamily',
      'fontsize',
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
    ],
    fontSize: {
      options: [
        'default',
        12,
        14,
        16,
        18,
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
        'Fasthand ,Fasthand',
        'Times New Roman',
        'khmer os muol, khmeros_muol',
        'khmer os muol light, khmer_os_muol_light',
        'khmer os battambang, khmeros_battambang',
        'khmer os siemreap, khmeros_siemreap'
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

  constructor(
    public dialogRef: MatDialogRef<DocNotesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public ds: DataService,
    private store: NationalityStore
  ) { }

  buildForm(): void {
    const { item } = this.data;
    this.form = this.fb.group({
      name: [item ? item.name : null, [Validators.required]],
      name_en: [item ? item.name_en : null, [Validators.required]],
      name_fr: [item ? item.name_fr : null, [Validators.required]],
      type: [DOCUMENT_NOTE_TYPE_ARRAY[0], [Validators.required]]
    })
  }

  ngOnInit() {
    this.buildForm();
    this.title = this.data.item ? 'កែប្រែចំណារ' : 'បង្កើតចំណារ';
  }

  create(f: any, isNew) {
    if (this.form.valid) {
      this.process = true
      const { item } = this.data || {};
      const key = item ? item.key : this.ds.createId();
      const { name, name_en, name_fr, type } = f;
      const formData: any = {
        key: key,
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        type: type,
        name: name,
        name_en, name_fr
      }
      this.store.addCrimNotes(formData, (success, error) => {
        if (success) {
          if (!isNew)
            this.dialogRef.close();
          this.snackBar.open('Criminal Notes has been created.', 'done', { duration: 2000 });
          this.form.reset();
          this.process = false
        }
        else {
          alert(error)
          this.process = false
        }
      })
    }
  }

}
