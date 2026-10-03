import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { pushObjArray, toUniq, updateObjArray } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore, DynamicFlatNode, ProjectDataSource } from 'src/app/stores/document/document.store';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DocumentAddPersonWorkplaceFormComponent } from '../document-add-person-workplace-form/document-add-person-workplace-form.component';

@Component({
  selector: 'app-document-application-workplace-form',
  templateUrl: './document-application-workplace-form.component.html',
  styleUrls: ['./document-application-workplace-form.component.scss']
})
export class DocumentApplicationWorkplaceFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  title: string = "ស្ថាប័នទទួលភារកិច្ច";

  treeControl: FlatTreeControl<DynamicFlatNode>;
  dataSource: ProjectDataSource;
  getLevel = (node: DynamicFlatNode) => node.level;
  isExpandable = (node: DynamicFlatNode) => node.expandable;
  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;


  Office = [];
  removedOffice = [];

  people: any[] = [];
  removedPeople = [];
  loading: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<DocumentApplicationWorkplaceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    public ds: DatabaseService,
    public storage: FireStorageService,
    public dialog: MatDialog,

  ) { }

  async ngOnInit(): Promise<void> {
    const item = this.data;

    this.Office = this.data.office || [];
    this.store.officeInDoc = this.Office;
    const { documentSections } = this.store;
    const practicePlace = documentSections.filter(m => !m?.isHeader && !m?.isRejected)
    practicePlace.map(m => {
      this.people = this.people.concat(m?.office?.headerOfficer || [])
    })

    await this.store.fetchWorkplaces();
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new ProjectDataSource(this.treeControl, this.store);
    this.dataSource.data = this.store.initialData();
    this.loading = false;
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeWorkplace()
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.Office, event.previousIndex, event.currentIndex);
  }

  removePosition(item: any) {
    this.removedOffice = toUniq(this.removedOffice.concat(item))
    this.Office = this.Office.filter(m => m.key !== item.key)
    this.store.officeInDoc = this.Office

    const practicePlace = this.Office.filter(m => !m?.isHeader && !m?.isRejected)
    this.people = [];
    practicePlace.map(m => {
      this.people = this.people.concat(m?.office?.headerOfficer || [])
    })
    this.store.peoplesInDoc = this.people
  }

  onAddPersonWorkPlaceItem(item: any) {
    let dialogRef = this.dialog.open(DocumentAddPersonWorkplaceFormComponent, {
      data: { item: item, people: this.people },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== 'no') {
        const { people, removedPeople } = result;

        this.people = this.people.concat(people)
        // this.Office = people && people.length > 0 ? this.Office.push(item) : this.Office

        const { type } = this.data;

        const officeDoc = {
          office: { ...item, headerOfficer: people },
          isInfo: false,
          remark: null,
          key: item.key,
          type: type,
        }

        this.Office = updateObjArray(this.Office, officeDoc)
        this.store.officeInDoc = this.Office

        this.data.office = this.Office
        this.data.removedOffice = this.removedOffice;

        this.data.people = people
        this.data.removedPeople = removedPeople;
        this.store.peoplesInDoc = this.people

      }
    })
  }

  close() {
    this.data.office = this.Office
    this.data.removedOffice = this.removedOffice;
    this.data.people = this.people
    this.dialogRef.close(this.data);
  }

  removePerson(item: any) {
    this.removedPeople = toUniq(this.removedPeople.concat(item))
    this.people = this.people.filter(m => m.key !== item.key)
  }

  async _onSave(item: any) {
    // this.data.removedOffice = this.removedOffice;
    // this.data.office = this.Office;
  }

}
