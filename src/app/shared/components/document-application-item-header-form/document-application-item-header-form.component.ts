import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { pushObjArray } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-application-item-header-form',
    templateUrl: './document-application-item-header-form.component.html',
    styleUrls: ['./document-application-item-header-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationItemHeaderFormComponent implements OnInit {

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
    { key: 1, name: 'ក្នុងស្ថាប័ន' },
    { key: 2, name: 'ក្រៅស្ថាប័ន' },
  ]
  selectedOptionType = this.optionType[0]

  constructor(
    public dialogRef: MatDialogRef<DocumentApplicationItemHeaderFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    public ds: DatabaseService,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    const item = this.data;
    this.form = this.fb.group({
      office: [null],
      optionType: [this.selectedOptionType],
      isInfo: [item ? item?.isInfo : false],
      remark: [item ? item?.remark : null],
    })
    this.office = this.form.controls['office'];

    this.store.fetchWorkplaces(data => {
      if (data) {
        this.officeLists = data;
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
    const { office,type } = this.data;
    const { isInfo, remark } = this.form.value;

    const item = {
      ...value,
      isInfo: isInfo || false,
      remark: remark || null,
      key: value.key,
      type:type,
    }
    this.data.office = pushObjArray(office, item)
    this.form.controls['office'].reset()

  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.data.office, event.previousIndex, event.currentIndex);
  }

  removePosition(item: any) {
    const { office } = this.data;
    this.data.office = office.filter(m => m.key !== item.key)
  }



  async _onSave(f: any) {
    if (this.form.valid) {
      this.dialogRef.close(this.data);
    }
  }
}
