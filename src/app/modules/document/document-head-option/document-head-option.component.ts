import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ACCOUNT_PERMISSION_OBJECT, ACCOUNT_PERMISSION_OBJECT_ARRAY } from 'src/app/dummy/config';
import { IOfficer, IUserPermission } from 'src/app/interfaces/document/document.interface';
import { DataService } from 'src/app/shared/services/data.service';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
  selector: 'app-document-head-option',
  templateUrl: './document-head-option.component.html',
  styleUrls: ['./document-head-option.component.scss']
})
export class DocumentHeadOptionComponent implements OnInit {
  form: FormGroup;
  title: any = "សិទ្ធិប្រើប្រាស់ឯកសារ";

  ACCOUNT_PERMISSION_OBJECT_ARRAY = ACCOUNT_PERMISSION_OBJECT_ARRAY;

  constructor(public dialogRef: MatDialogRef<DocumentHeadOptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: DocumentStore,
    public ds: DataService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    const item = (this.data?.item || null) as IUserPermission;
    this.form = this.fb.group({
      permission: [item?.permission || ACCOUNT_PERMISSION_OBJECT.readOnly],
      workplace: [null, [Validators.required]]
    })
    const officer = (this.data?.officer || null) as IOfficer;
    const { workplace } = officer;
    if (item) {
      this.form.patchValue({
        workplace: workplace.find(m => m?.key === item?.workplaceKey)
      })
    } else {
      this.form.patchValue({
        workplace: workplace[workplace.length - 1]
      })
    }

  }

  _onSave(f: any) {
    this.dialogRef.close(f)
  }

}
