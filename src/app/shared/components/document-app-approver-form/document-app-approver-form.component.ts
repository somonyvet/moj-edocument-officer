import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DatabaseService } from '../../services/database.service';
import { FireStorageService } from '../../services/fireStorage.service';
import { MappingService } from '../../services/mapping.service';

@Component({
    selector: 'app-document-app-approver-form',
    templateUrl: './document-app-approver-form.component.html',
    styleUrls: ['./document-app-approver-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentAppApproverFormComponent implements OnInit {

  @ViewChild('inputRef') inputRef: ElementRef;
  title: any = "បង្កើតឯកសារ";

  form: UntypedFormGroup;
  hashtagItems: string[];
  filteredOfficeList;
  officeLists = [];
  filteredInstitutionList;
  institutionLists = [];
  office: AbstractControl;
  filterOffice: Observable<any[]>;
  filterInstitution: Observable<any[]>;

  optionType = [
    { key: 1, name: 'ការិយាល័យ' },
    { key: 2, name: 'ស្ថាប័ន' },
  ]
  selectedOptionType = this.optionType[0]

  constructor(
    public dialogRef: MatDialogRef<DocumentAppApproverFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    public ds: DatabaseService,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    const { Item, Approver, Field } = this.data;
    const { headerDocument } = this.store

    const { approvedByRightBox, approvedByLeftBox, approvedByCenterBox } = Item;
    let item = null;
    if (Field === 'approvedByRightBox') {
      item = approvedByRightBox
    }
    if (Field === 'approvedByLeftBox') {
      item = approvedByLeftBox
    }

    if (Field === 'approvedByCenterBox') {
      item = approvedByCenterBox
    }
    this.form = this.fb.group({
      office: [item],
      isApprove_date: [null],
    })
    this.office = this.form.controls['office'];
    const approverData = Approver.filter(m => m.permission.key === 2 || m.key === headerDocument?.created_by);

    this.filterOffice = MappingService.autoComplete(this.office, approverData, "last_name");

    this.form.patchValue({
      isApprove_date: item?.isApprove_date,
    })
  }

  selectionChange(ev) {
    const { value } = ev;
    this.selectedOptionType = value;
  }

  optionSelectedPosition(event) {
    const { value } = event.option;
  }


  removePosition(item: any) {
    const { office } = this.data;
    this.data.office = office.filter(m => m.key !== item.key)
  }

  _onSave(f: any): void {
    if (this.form.valid) {
      const { office, isApprove_date } = f;
      const data = {
        ...office,
        isApprove_date,
      }
      this.dialogRef.close(data);
    }
  }

}
