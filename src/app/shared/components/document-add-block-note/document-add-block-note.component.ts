import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IBlockNote } from 'src/app/interfaces/document/document.interface';
import { AddRemarkComponent } from 'src/app/modules/document/document-approval/container-approval-note/writting-approval-note/add-remark/add-remark.component';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, MappingService, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-add-block-note',
    templateUrl: './document-add-block-note.component.html',
    styleUrls: ['./document-add-block-note.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentAddBlockNoteComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "ជូនចំណាត់ការផ្សេងៗ";
  form: UntypedFormGroup;
  remark_officer: AbstractControl;
  remarkOfficer: Observable<Array<any>>;
  constructor(
    public dialogRef: MatDialogRef<DocumentAddBlockNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      remark_officer: [null],
      description: [null, Validators.required],
    })
    this.remark_officer = this.form.controls['remark_officer']
    this.store.fetchRemarkTextOfficer(this.auth.uid, res => {
      this.remarkOfficer = MappingService.autoComplete(this.remark_officer, res, 'remarkText');
    });

    if (this.data) {
      this.title = "កែប្រែជូនចំណាត់ការ"
      const item = this.data as IBlockNote;
      const { description, } = item;
      this.form.patchValue({
        description
      })
    }
  }

  addRemarkText(item?: any) {
    const dialogRef = this.dialog.open(AddRemarkComponent, {
      data: { item: item, uid: this.auth.uid },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '92vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '30px', right: '26px', bottom: '30px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.text === 'yes') {
        this.form.patchValue({
          description: result?.form?.remarkText || null,
          remark_officer: result?.form || null
        })
      }
    })
  }

  selectedRemark(event) {
    if (event && event.option.value) {
      const value = event.option.value.remarkText;
      this.form.patchValue({
        description: value
      })
    }
  }

  getText(e) {
    if (e) {
      this.form.patchValue({
        description: e
      })
    }
  }

  displayName(item: any): string {
    return item ? item.remarkText : item;
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { description } = f;
      const item: IBlockNote = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const { currentDepartment } = this.auth
      const { headerDocument } = this.store
      const data: IBlockNote = {
        key: currentDepartment?.key,
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: item?.isDelete || false,
        //fields
        description,
        departmentKey: currentDepartment?.key,
        transactionKey: headerDocument?.key,
      }

      this.store.saveBlockNote(data, headerDocument, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`BlockNote has been saved successful.`, "Done", { duration: 3000 });
          this.form.reset();
          this.dialogRef.close();
        } else {
          alert(res);
        }
      })
    }
  }

}
