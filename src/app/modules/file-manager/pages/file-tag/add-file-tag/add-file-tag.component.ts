import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { statusLists, tagTypeLists } from 'src/app/dummy/status';

import { AuthStore } from 'src/app/stores/auth.store';
import { SettingStore } from 'src/app/stores/settings/setting.store';

import { ConvertService } from 'src/app/shared/services/convert.service';

@Component({
    selector: 'app-add-file-tag',
    templateUrl: './add-file-tag.component.html',
    styleUrls: ['./add-file-tag.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddFileTagComponent implements OnInit {

  @ViewChild('focusInput') inputEl: ElementRef;

  status_lists = statusLists
  tagType_Lists = tagTypeLists
  form: UntypedFormGroup;
  name: AbstractControl;
  color: AbstractControl;
  order: number;

  processNew: boolean = false;
  processClose: boolean = false;

  error: any = null;
  isCreate: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    public auth: AuthStore,
    public store: SettingStore,
    public afs: AngularFirestore,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      color: [null],
      name: [null, Validators.required],
      status: [this.status_lists[0], Validators.required],
      tagtype: [this.tagType_Lists[0], Validators.required],
      order: [null]
    })
  }

  goBack() {
    this.router.navigate(['/file-manager/tags'])
  }

  async onSave(f: any, isNew: boolean) {
    this.processClose = isNew ? false : true;
    this.processNew = isNew;
    this.error = null;
    this.isCreate = true;
    if (this.form.valid) {
      this.form.disable();
      const { name, color, status, tagtype, order } = f;
      const key = this.afs.createId();
      const item = {
        key: key,
        name: name,
        color: color?color.toUpperCase():null,
        order: order ? order : 1,
        status: status,
        tagtype: tagtype,
        created_at: new Date(),
        created_by: this.auth.User,
        updated_at: new Date(),
        updated_by: this.auth.User,
        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
      }
      this.store.addFileTag("file_tags", item, (success, res) => {
        this.snackBar.open("User has been created successful.", "Done", { duration: 100 });
        if (!isNew) {
          this.goBack();
          return;
        }
        this.form.reset();
        this.form.enable();
        this.form.patchValue({
          status: status,
          tagtype: tagtype
        })
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

}
