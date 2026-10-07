import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { pushObjArray, toUniq, updateObjArray } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MappingService, toEmployee } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
    selector: 'app-document-add-person-workplace-form',
    templateUrl: './document-add-person-workplace-form.component.html',
    styleUrls: ['./document-add-person-workplace-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentAddPersonWorkplaceFormComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;
  title: any = "បញ្ចូលកន្លែង ឬអ្នកត្រូវទទួលអនុវត្ត";

  form: UntypedFormGroup;
  hashtagItems: string[];
  filteredOfficeList;
  officeLists = [];
  filteredInstitutionList;
  institutionLists = [];
  office: AbstractControl;
  filterOffice: Observable<any[]>;
  filterInstitution: Observable<any[]>;

  OfficeLists: any[] = [];

  people: any[] = [];
  removedPeople = [];
  constructor(
    public dialogRef: MatDialogRef<DocumentAddPersonWorkplaceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    public ds: DatabaseService,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    const { item } = this.data;
    this.people = this.data.office || [];
    this.form = this.fb.group({
      office: [null],
      selectAll: [false],

    })
    this.office = this.form.controls['office'];
    this.store.fetchOfficerWorkplaces(item, data => {
      if (data) {
        this.OfficeLists = data
        this.filterOffice = MappingService.autoComplete(this.office, this.OfficeLists, "displayName");
        if (item.isWorkplace) {
          this.people = this.OfficeLists.map(m => {
            return {
              ...toEmployee(m),
              workPlaceKey: this.data.item.key,
            }
          })
        }
      }
    });

    this.people = this.data.people.filter(m => m.workPlaceKey === this.data.item.key) || [];

  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeWorkplace()
  }

  optionSelectedPosition(event) {
    const { value } = event.option;
    this.people = updateObjArray(this.people, { ...toEmployee(value), workPlaceKey: this.data.item.key, })
    this.form.controls['office'].reset()
  }

  showOptions(event: MatCheckboxChange): void {
    if (event.checked) {
      this.people = this.OfficeLists.map(m => {
        return {
          ...toEmployee(m),
          workPlaceKey: this.data.item.key,
        }
      })
    } else {
      this.people = []
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.people, event.previousIndex, event.currentIndex);
  }

  removePosition(item: any) {
    this.removedPeople = toUniq(this.removedPeople.concat(item))
    this.people = this.people.filter(m => m.key !== item.key)
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.data.removedPeople = this.removedPeople;
      this.data.people = this.people;
      this.dialogRef.close(this.data);
    }
  }

}
