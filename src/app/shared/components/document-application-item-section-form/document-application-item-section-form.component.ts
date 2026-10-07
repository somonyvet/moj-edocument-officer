import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-application-item-section-form',
    templateUrl: './document-application-item-section-form.component.html',
    styleUrls: ['./document-application-item-section-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationItemSectionFormComponent implements OnInit {

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
    public dialogRef: MatDialogRef<DocumentApplicationItemSectionFormComponent>,
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
    })
    this.office = this.form.controls['office'];
    let officeVal: any = null;
    this.store.fetchWorkplaces(data => {
      if (data) {
        this.officeLists = data;
        if (item) officeVal = data.find(m => m.key === item?.office?.key)
        this.filterOffice = MappingService.autoComplete(this.office, this.officeLists, "name");
        if (officeVal) {
          this.office.patchValue(officeVal)
        }
      }
    })
    this.store.fetchInstitutions(data => {
      if (data) {
        this.institutionLists = data;
        if (item) officeVal = data.find(m => m.key === item?.office?.key)
        this.filterInstitution = MappingService.autoComplete(this.office, this.institutionLists, "name");
        if (officeVal) {
          this.office.patchValue(officeVal)
        }
      }
    })
  }



  selectionChange(ev) {
    const { value } = ev;
    this.selectedOptionType = value;
  }

  optionSelectedPosition(event) {
    const { value } = event.option;
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.data.office, event.previousIndex, event.currentIndex);
  }

  removePosition(item: any) {
    const { office } = this.data;
    this.data.office = office.filter(m => m.key !== item.key)
  }

  _onSave(f: any):void {
    if (this.form.valid) {
      const { office } = f;
      this.dialogRef.close(office);
    }
  }
}
