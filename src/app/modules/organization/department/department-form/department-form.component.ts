import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService, pushObjArray, pushToArray } from 'src/app/shared/services/convert.service';
import { generateKeywords, MappingService, orderListFormat, toDepartmentNoWorkplace, toManagementLevel, toNameKey, toNumber, toUniq } from 'src/app/shared/services/mapping.service';
import { map, take, debounceTime } from "rxjs/operators";
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IDepartment, IManagementLevel, IPosition, IRanking } from 'src/app/interfaces/document/document.interface';
import { Observable } from 'rxjs';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { OfficeInDepartmentComponent } from '../office-in-department/office-in-department.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AddPeopleReceivedDocumentComponent } from '../add-people-received-document/add-people-received-document.component';
import { AddPeopleCcDocumentComponent } from '../add-people-cc-document/add-people-cc-document.component';

@Component({
    selector: 'app-department-form',
    templateUrl: './department-form.component.html',
    styleUrls: ['./department-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DepartmentFormComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតរចនាសម្ព័ន្ធស្ថាប័ន";
  form: UntypedFormGroup;
  ranking: AbstractControl;

  subOfDepartment: AbstractControl;
  filteredDepartmentOptions: Observable<IDepartment[]>;
  filteredRankingOptions: Observable<IRanking[]>;

  SELECTED_PHOTO: any = null;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;

  constructor(
    public dialogRef: MatDialogRef<DepartmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DepartmentStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public ds: DatabaseService,
    public storage: FireStorageService,
    private dialog: MatDialog,

  ) { }

  async ngOnInit(): Promise<void> {
    const item = this.data?.item as IDepartment;
    this.store.position = [];
    if (item) {
      this.title = "កែសម្រួលព័ត៌មានរចនាសម្ព័ន្ធស្ថាប័ន";
    }
    this.form = this.fb.group({
      code: [item?.code || null, [Validators.required], this.checkExistRef.bind(this)],
      name: [item ? item.name : null, [Validators.required]],
      subOfDepartment: [item?.subOfDepartment || null, [MappingService.validSelected.bind(this)]],
      name_en: [null],
      displayName: [null, [Validators.required]],
      ranking: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      adminOffice: [false],
      completedDuration: [0],
      showInHeader: [null],
      verifyFromAssistant: [null],
      approveOfficerForm: [null],
      userBlockNoteDirection: [null],
    })
    this.subOfDepartment = this.form.controls['subOfDepartment'];
    this.ranking = this.form.controls['ranking'];

    this.store.fetchWorkplaces(res => {
      this.filteredDepartmentOptions = MappingService.autoComplete(this.subOfDepartment, res, 'name')
      if (item) {
        this.form.patchValue({
          subOfDepartment: res.find(m => m?.key === item?.subOfDepartment?.key),
        })
      }
    })
    const managementLevel = await this.store.fetchRanking()
    this.filteredRankingOptions = MappingService.autoComplete(this.ranking, managementLevel, 'name')
    if (item) {
      const { adminOffice, completedDuration, showInHeader, approveOfficerForm, userBlockNoteDirection } = item;
      const management = managementLevel.find(m => m?.key === item?.ranking?.key) as IManagementLevel;
      this.store.position = management?.positionManager || [];
      this.form.patchValue({
        name_en: item?.name_en,
        displayName: item?.displayName,
        ranking: management,
        adminOffice,
        completedDuration: completedDuration || 0,
        showInHeader: showInHeader || false,
        approveOfficerForm: approveOfficerForm || false,
        userBlockNoteDirection: userBlockNoteDirection || false,
      })

      this.store.fetchDepartmentMember(item.key)
      this.store.fetchDepartmentOfficersReceived(item.key)
      this.store.fetchDepartmentOfficeCC(item.key)

    }

  }

  ngOnDestroy(): void {
    this.store.subscribeFetchWorkplaces()
  }

  optionSelectedManagement(event: MatAutocompleteSelectedEvent) {
    const { value } = event.option;
    this.store.position = value?.positionManager || [];
    this.form.patchValue({
      verifyFromAssistant: value?.verifyFromAssistant || false,
    })
  }

  optionSelectedPosition(event) {
    const { value } = event.option;
    const { position } = this.store;
    this.store.position = pushObjArray(position, value)
  }

  drop(event: CdkDragDrop<IPosition[]>) {
    moveItemInArray(this.store.position, event.previousIndex, event.currentIndex);
  }

  removePosition(item: IPosition) {
    const { position } = this.store;
    this.store.position = position.filter(m => m.key !== item.key)
  }


  async checkExistRef(control: AbstractControl) {
    const { value } = control
    if (!value) return null;
    const item = this.data?.item as IDepartment;
    if (item) {
      const { code } = item;
      if (code !== toNameKey(code)) {
        const doc = await this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).where('code', '==', toNameKey(value))).get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
      return null;
    }
    else {
      const doc = await this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).where('code', '==', toNameKey(value))).get().toPromise();
      if (doc.empty) return null;
      return { nameAvailable: true }
    }
  }
  checkExistOnEdit() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      const item = this.data?.item as IDepartment;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).where('nameKey', '==', toNameKey(value))).valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const oldValue = item ? item.nameKey : null;
              if (oldValue && oldValue === toNameKey(value)) {
                return null;
              }
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_PHOTO = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.URL = event.target.result;
      }
      this.photoFile.nativeElement.value = "";
    }
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(OfficeInDepartmentComponent, {
      data: { item: item, department: this.data.item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: IDepartment) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { isDelete: true, warning: true, name: "ដកគណនីចេញ", memo: "កំណត់ត្រានេះនឹងត្រូវបានលុបចេញពីប្រព័ន្ធ។ តើអ្នកប្រាកដទេថាអ្នកចង់លុប?", },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === "yes") {
        this.store.deletePosition(this.data.item, item, this.auth.uid, (success, res) => {
          if (success) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(res);
          }
        })
      }
    })
  }

  createOfficeReceived(item?: any) {
    const dialogRef = this.dialog.open(AddPeopleReceivedDocumentComponent, {
      data: { item: item, department: this.data.item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  deleteOfficeReceived(item: IDepartment) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { isDelete: true, warning: true, name: "ដកគណនីចេញ", memo: "កំណត់ត្រានេះនឹងត្រូវបានលុបចេញពីប្រព័ន្ធ។ តើអ្នកប្រាកដទេថាអ្នកចង់លុប?", },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === "yes") {
        this.store.deleteDepartmentOfficesReceived(this.data.item, item, (success, res) => {
          if (success) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(res);
          }
        })
      }
    })
  }

  createOfficeCC(item?: any) {
    const dialogRef = this.dialog.open(AddPeopleCcDocumentComponent, {
      data: { item: item, department: this.data.item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  deleteOfficeCC(item: IDepartment) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { isDelete: true, warning: true, name: "ដកគណនីចេញ", memo: "កំណត់ត្រានេះនឹងត្រូវបានលុបចេញពីប្រព័ន្ធ។ តើអ្នកប្រាកដទេថាអ្នកចង់លុប?", },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === "yes") {
        this.store.deleteDepartmentOfficesCC(this.data.item, item, (success, res) => {
          if (success) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(res);
          }
        })
      }
    })
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const item = (this.data?.item as IDepartment) || null;
      const { approveOfficerForm, userBlockNoteDirection, name, code, name_en, displayName, ranking, adminOffice, completedDuration, showInHeader, verifyFromAssistant } = f;
      const subOfDepartment = f?.subOfDepartment as IDepartment;
      let levelItem: any = 0;
      let nodeItem: any = `${orderListFormat(1)}.`
      let indexItem: any = 1;
      let parentItem: any = null;
      let pathItem: any[] = [];
      const key = item?.key || this.ds.createId();
      let newWorkplace = null;
      let workplace = [];
      if (subOfDepartment && item?.subOfDepartment?.key !== subOfDepartment?.key) {
        const parentMemberItems = pushToArray(await this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).where("subOfDepartment.key", "==", subOfDepartment.key)).get().toPromise());
        const { level, node, path } = subOfDepartment;
        const totalChild = parentMemberItems.length;
        const lastChild = MappingService.orderByDesc(parentMemberItems, "index")
        if (totalChild === 0) {
          indexItem = (toNumber(totalChild) + 1);
        } else {
          const { index } = lastChild[0];
          indexItem = toNumber(index) + 1
        }
        nodeItem = `${node}${orderListFormat(indexItem)}.`
        levelItem = level + 1;
        parentItem = node;
        pathItem = toUniq((path || []).concat([subOfDepartment?.key]));
        newWorkplace = { key, name_en: name_en || null, name, order: levelItem, index: indexItem, node: nodeItem, managementLevel: toManagementLevel(ranking) }
        workplace = (subOfDepartment?.workplace || []).concat([newWorkplace]);
      } else {
        if (subOfDepartment) {
          pathItem = toUniq((subOfDepartment?.path || []).concat([subOfDepartment?.key]));
        } else if (item) {
          pathItem = item?.path;
        }
        if (!item) {
          const nodeRef = await this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false)).get().toPromise();
          if (!nodeRef.empty) {
            const nodeData = pushToArray(nodeRef)[0];
            const { index } = nodeData;
            indexItem = index + 1;
            nodeItem = `${orderListFormat(indexItem)}.`
            newWorkplace.node = nodeItem;
            newWorkplace = { key, name_en: name_en || null, name, order: levelItem, index: indexItem, node: nodeItem, managementLevel: toManagementLevel(ranking) }
          }
        } else {
          indexItem = item?.index;
          nodeItem = item?.node;
          levelItem = item?.level;
          parentItem = pathItem
          newWorkplace = { key, name_en: name_en || null, name, order: item?.order, index: item.index, node: item?.node, managementLevel: toManagementLevel(ranking) }
        }
        workplace = (subOfDepartment?.workplace || []).concat([newWorkplace])
      }
      const keywords = generateKeywords([name.toLowerCase()])
      keywords.push(`${code}`)
      if (subOfDepartment) {
        keywords.push(subOfDepartment.key)
      }
      const data: IDepartment = {
        code: `${code}`.trim(),
        key: key,
        status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: false,
        keyword: keywords,
        name: name,
        name_en: name_en,
        order: levelItem,
        level: levelItem,
        node: nodeItem,
        parent: parentItem,
        index: indexItem,
        totalChild: item?.totalChild || 0,
        path: pathItem,
        workplace: workplace,
        file: item ? item.file : null,
        nameKey: toNameKey(name),
        displayName: displayName,
        subOfDepartment: subOfDepartment ? toDepartmentNoWorkplace(subOfDepartment) : null,
        company: subOfDepartment?.company || null,
        ranking: toManagementLevel(ranking),
        isWorkplace: ranking?.isWorkplace || false,
        headerOfficer: item?.headerOfficer || [],
        headerOfficerKeys: item?.headerOfficerKeys || [],
        topManagement: item?.topManagement || [],
        topManagementKeys: item?.topManagementKeys || [],
        adminOffice: adminOffice || false,
        completedDuration: completedDuration || 0,
        showInHeader: showInHeader || false,
        verifyFromAssistant: verifyFromAssistant || false,
        approveOfficerForm: approveOfficerForm || false,
        userBlockNoteDirection: userBlockNoteDirection || false,
      }
      if (this.SELECTED_PHOTO) {
        const files = await this.storage.upload([this.SELECTED_PHOTO])
        data.file = files[0]
      }
      this.store.save(data, item || null, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Workplace has been saved successful.`, "Done", { duration: 1000 });
          this.form.reset();
          this.store.position = [];
          this.store.departmentOfficers = [];
          this.inputRef.nativeElement.focus();
          if (this.data.req || this.data.item) {
            this.dialogRef.close(data);
          }
        } else {
          alert(res)
        }
      })
    }
  }

}
