import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { pushObjArray, toUniq, updateObjArray } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-document-application-item-form',
  templateUrl: './document-application-item-form.component.html',
  styleUrls: ['./document-application-item-form.component.scss']
})
export class DocumentApplicationItemFormComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;
  title: any = "បង្កើតឯកសារ";

  form: FormGroup;
  hashtagItems: string[];
  filteredOfficeList;
  officeLists = [];
  filteredInstitutionList;
  institutionLists = [];
  office: AbstractControl;
  filterOffice: Observable<any[]>;
  filterInstitution: Observable<any[]>;
  optionType = [
    { key: 1, name: 'ក្នុងស្ថាប័ន' },
    { key: 2, name: 'ក្រៅស្ថាប័ន' },
  ]
  selectedOptionType = this.optionType[0]
  Office: any[] = [];
  removedOffice = [];
  constructor(
    public dialogRef: MatDialogRef<DocumentApplicationItemFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    public ds: DatabaseService,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    const item = this.data;
    this.Office = this.data.office || [];
    this.form = this.fb.group({
      office: [null],
      optionType: [this.selectedOptionType],
      isInfo: [item ? item?.isInfo : false],
      remark: [item ? item?.remark : null],
    })
    this.office = this.form.controls['office'];
    const { config } = this.auth;
    this.store.fetchWorkplaces(data => {
      if (data) {
        const { startFromLevel } = config || {}
        this.officeLists = data?.filter(m => m?.ranking?.order >= startFromLevel?.order);
        this.filterOffice = MappingService.autoComplete(this.office, this.officeLists, "name");
      }
    });
    this.store.fetchInstitutions(data => {
      if (data) {
        this.institutionLists = data;
        this.filterInstitution = MappingService.autoComplete(this.office, this.institutionLists, "name");
      }
    });
    if (item && item.isInfo) {
      this.form.controls['remark'].disable()
    } else {
      this.form.controls['remark'].enable()
    }
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeWorkplace()
  }

  changeIsInfo(event) {
    const { checked } = event;
    if (checked) {
      this.form.controls['remark'].disable()
    } else {
      this.form.controls['remark'].enable()
    }
  }

  selectionChange(ev) {
    const { value } = ev;
    this.selectedOptionType = value;
  }

  optionSelectedPosition(event) {
    const { value } = event.option;
    const { type } = this.data;
    const { isInfo, remark } = this.form.value;

    const item = {
      office: value,
      isInfo: isInfo || false,
      remark: remark || null,
      key: value.key,
      type: type,
    }

    this.Office = updateObjArray(this.Office, item)
    this.form.controls['office'].reset()

  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.Office, event.previousIndex, event.currentIndex);
  }

  removePosition(item: any) {
    this.removedOffice = toUniq(this.removedOffice.concat(item))
    this.Office = this.Office.filter(m => m.key !== item.key)
  }



  async _onSave(f: any) {
    if (this.form.valid) {
      this.data.removedOffice = this.removedOffice;
      this.data.office = this.Office;
      this.dialogRef.close(this.data);
    }
  }

}
