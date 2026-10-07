import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService, pushObjArray, pushToArray } from 'src/app/shared/services/convert.service';
import { generateKeywords, getYearData, MappingService, orderListFormat, toDepartment, toDepartmentNoWorkplace, toEmployee, toManagementLevel, toManagementLevelMME, toNameKey, toNumber, toSubWorkplace, toUniq } from 'src/app/shared/services/mapping.service';
import { map, take, debounceTime } from "rxjs/operators";
import { ARRAY_LEVEL_MME, LEVEL_MME, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IProgram, IManagementLevel, IPosition, IRanking, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { Observable } from 'rxjs';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { toJS } from 'mobx';
import { OfficeInDepartmentComponent } from '../../../department/office-in-department/office-in-department.component';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { MatChipInputEvent } from '@angular/material/chips';
import { config } from 'src/app/dummy/config';
import CustomEditor from 'src/app/shared/ckeditor/custom-editor';
import { MmeBaseProgramStore } from 'src/app/stores/document/mme_program.store';
import { IMmeMainProgram, IMmeProgram } from 'src/app/interfaces/mme';

@Component({
    selector: 'app-main-program-form',
    templateUrl: './main-program-form.component.html',
    styleUrls: ['./main-program-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MainProgramFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('Representative') Representative: ElementRef<HTMLInputElement>;
  @ViewChild('Follower') Follower: ElementRef<HTMLInputElement>;
  @ViewChild('Department') Department: ElementRef<HTMLInputElement>;

  title: any = "បង្កើតកម្មវិធី";
  form: UntypedFormGroup;
  ranking: AbstractControl;
  yearProgram: AbstractControl;
  representativeForm: AbstractControl;
  officer: AbstractControl;
  department: AbstractControl;

  subOfProgram: AbstractControl;
  filteredProgramOptions: Observable<IProgram[]>;
  filteredRankingOptions: Observable<IRanking[]>;
  filterYearProgram: Observable<IYearProgram[]>;
  filterDepartment: Observable<IYearProgram[]>;
  filterOfficer: Observable<any[]>;
  filterSourceBudget: any[] = [];

  SELECTED_PHOTO: any = null;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  MME_LEVEL = ARRAY_LEVEL_MME;
  selectedObjects: any[] = [];
  people: any[] = [];
  arrayDepartment: any[] = [];
  representative: any[] = [];
  isLastChild: boolean = false;
  removable: boolean = true;

  public Editor = CustomEditor;
  public config = config

  constructor(
    public dialogRef: MatDialogRef<MainProgramFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: MmeBaseProgramStore,
    public storeMME: MmeProgramStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public ds: DatabaseService,
    public storage: FireStorageService,
    private dialog: MatDialog,

  ) { }

  async ngOnInit(): Promise<void> {
    const item = this.data?.item as any;
    this.store.position = [];
    if (item) {
      this.title = "កែសម្រួលព័ត៌មានកម្មវិធី";
    }
    this.form = this.fb.group({
      code: [item?.code || null, [Validators.required], this.checkExistRef.bind(this)],
      name: [item ? item.name : null, [Validators.required]],
      subOfProgram: [item?.subOfProgram || null],
      name_en: [null],
      displayName: [null, [Validators.required]],
      ranking: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      department: [null],
      adminOffice: [false],
      completedDuration: [null, [Validators.required]],
      showInHeader: [null],
      verifyFromAssistant: [null],
      yearProgram: [null, MappingService.validSelected.bind(this)],
      budget_for_year: [null],
      representativeForm: [null],
      officer: [null],
      indicators: [null],
      goal: [null],
      last_level: [item?.last_level || false],
    })
    this.subOfProgram = this.form.controls['subOfProgram'];
    this.ranking = this.form.controls['ranking'];
    this.representativeForm = this.form.controls['representativeForm']
    this.yearProgram = this.form.controls['yearProgram'];
    this.officer = this.form.controls['officer'];
    this.department = this.form.controls['department']

    const { config } = this.auth;
    const offices = await this.storeMME.fetchYearProgram(config);
    this.filterYearProgram = MappingService.autoComplete(this.yearProgram, offices, "name");

    const data = await this.ds.mmeSourceBudgetRef().get().toPromise();
    const dataSource = pushToArray(data);
    this.filterSourceBudget = dataSource;

    const officerRef = await this.ds.userAccountRef().get().toPromise();
    const dataOfficer = pushToArray(officerRef);
    this.filterOfficer = MappingService.autoComplete(this.officer, dataOfficer, "displayName");

    const departmentRef = await this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).orderBy('node').orderBy('order')).get().toPromise();
    const dataDepartment = pushToArray(departmentRef);
    this.filterDepartment = MappingService.autoComplete(this.department, dataDepartment, "name");

    this.store.fetchWorkplaces(res => {
      this.filteredProgramOptions = MappingService.autoComplete(this.subOfProgram, res, 'name')
      if (item) {
        this.form.patchValue({
          subOfProgram: res.find(m => m?.key === item?.subOfProgram?.key),
        })
      }
    })
    // const managementLevel = await this.store.fetchRanking()
    const managementLevel = await this.MME_LEVEL
    this.filteredRankingOptions = MappingService.autoComplete(this.ranking, managementLevel, 'name')
    if (item) {
      const { adminOffice, completedDuration, showInHeader, responsible_people, department,
        checker, source_budget, year_of_program, budget_for_year, goal_text, base_indicators, last_child } = item;
      if (last_child && last_child === true){
          this.isLastChild = true;
        }else{
          this.isLastChild = false;
        }
      this.representative = responsible_people;
      this.people = checker;
      this.arrayDepartment = department;
      this.representative = responsible_people;
      this.filterSourceBudget = source_budget;
      this.selectedObjects = this.filterSourceBudget.filter(m => m.checked)
      const management = managementLevel.find(m => m?.key === item?.ranking?.key) as any;
      //   this.store.position = management?.positionManager || [];
      this.form.patchValue({
        name_en: item?.name_en,
        displayName: item?.displayName,
        ranking: management,
        adminOffice,
        completedDuration: completedDuration || null,
        showInHeader: showInHeader || false,
        yearProgram: year_of_program,
        budget_for_year: budget_for_year?.toString() || null,
        budget_for_yearKey: budget_for_year || null,
        indicators: base_indicators || null,
        goal: goal_text || null,
      })

      //   this.store.fetchDepartmentMember(item.key)

    }

  }

  ngOnDestroy(): void {
    this.store.subscribeFetchWorkplaces()
  }

  budgetChange(event) {
    const data = event.source.value;
    const id = event.source.value.key;
    const isChecked = event.checked;
    this.filterSourceBudget = this.filterSourceBudget.map((d) => {
      if (d.key === id) {
        d.checked = isChecked
        d = {
          key: d.key,
          checked: isChecked,
          name: d.name,
          created_by: d.created_by
        }
        return d;
      }
      return d;
    })
    this.selectedObjects = this.filterSourceBudget.filter(m => m.checked)

  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.people.push(value);
    }
  }

  removeFollower(person: string): void {
    const index = this.people.indexOf(person);

    if (index >= 0) {
      this.people.splice(index, 1);
    }
  }

  removeDepartment(department: string): void {
    const index = this.arrayDepartment.indexOf(department);

    if (index >= 0) {
      this.arrayDepartment.splice(index, 1);
    }
  }
  removeRepresentative(person: string): void {
    const index = this.representative.indexOf(person);

    if (index >= 0) {
      this.representative.splice(index, 1);
    }
  }

  selectedFollower(event: MatAutocompleteSelectedEvent): void {
    const data = event.option.value;
    this.people.push(toEmployee(data));
    this.Follower.nativeElement.value = '';
    this.officer.reset()
    this.Follower.nativeElement.blur();
  }

  selectedDepartment(event: MatAutocompleteSelectedEvent){
    const data = event.option.value;
    this.arrayDepartment.push(toDepartment(data));
    this.Department.nativeElement.value = '';
    this.department.reset()
    this.Department.nativeElement.blur();
  }

  selectedRepresentative(event: MatAutocompleteSelectedEvent): void {
    const data = event.option.value;
    this.representative.push(toEmployee(data));
    this.Representative.nativeElement.value = '';
    this.officer.reset()
    this.Representative.nativeElement.blur();
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
    const item = this.data?.item as IProgram;
    if (item) {
      const { code } = item;
      if (code !== toNameKey(code)) {
        const doc = await this.ds.programFireRef(ref => ref.where('isDelete', '==', false).where('code', '==', toNameKey(value))).get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
      return null;
    }
    else {
      const doc = await this.ds.programFireRef(ref => ref.where('isDelete', '==', false).where('code', '==', toNameKey(value))).get().toPromise();
      if (doc.empty) return null;
      return { nameAvailable: true }
    }
  }
  checkExistOnEdit() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      const item = this.data?.item as IProgram;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.programFireRef(ref => ref.where('isDelete', '==', false).where('nameKey', '==', toNameKey(value))).valueChanges()
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

  delete(item: IProgram) {
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
  itemWorkplace: any = null;
  async _onSave(f: any) {

    if (this.form.valid) {
      this.form.disable();
      const item = (this.data?.item as IMmeMainProgram) || null;
      const { name, code, name_en, displayName, ranking, adminOffice, completedDuration, showInHeader, verifyFromAssistant,
        budget_for_year, indicators, goal,
        yearProgram,
        department,
        last_level,
      } = f;

      const subOfProgram = f?.subOfProgram as IProgram;
      let levelItem: any = 0;
      let nodeItem: any = `${orderListFormat(1)}.`
      let indexItem: any = 1;
      let parentItem: any = null;
      let pathItem: any[] = [];
      const key = item?.key || this.ds.createId();
      let newWorkplace = null;
      let workplace = [];
      if (subOfProgram && item?.subOfProgram?.key !== subOfProgram?.key) {
        const parentMemberItems = pushToArray(await this.ds.programFireRef(ref => ref.where('isDelete', '==', false).where("subOfProgram.key", "==", subOfProgram.key)).get().toPromise());
        const { level, node, path } = subOfProgram;
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
        pathItem = toUniq((path || []).concat([subOfProgram?.key]));
        newWorkplace = { key, name_en: name_en || null, name, order: levelItem, index: indexItem, node: nodeItem, managementLevel: toManagementLevelMME(ranking) }
        workplace = (subOfProgram?.workplace || []).concat([newWorkplace]);
        workplace = workplace.filter(m => m != null);
      } else {
        if (subOfProgram) {
          pathItem = toUniq((subOfProgram?.path || []).concat([subOfProgram?.key]));
        } else if (item) {
          pathItem = item?.path;
        }
        if (!item) {
          const nodeRef = await this.ds.programFireRef(ref => ref.where('isDelete', '==', false)).get().toPromise();
          if (!nodeRef.empty) {
            const nodeData = pushToArray(nodeRef)[0];
            const { index } = nodeData;
            indexItem = index + 1;
            nodeItem = `${orderListFormat(indexItem)}.`
            newWorkplace = { key, name_en: name_en || null, name, order: levelItem, index: indexItem, node: nodeItem, managementLevel: toManagementLevelMME(ranking) }
            newWorkplace.node = nodeItem;
          }
        } else {
          indexItem = item?.index;
          nodeItem = item?.node;
          levelItem = item?.level;
          parentItem = pathItem
          newWorkplace = { key, name_en: name_en || null, name, order: levelItem, index: indexItem, node: nodeItem, managementLevel: toManagementLevelMME(ranking) }

        }
        newWorkplace = { key, name_en: name_en || null, name, order: levelItem, index: indexItem, node: nodeItem, managementLevel: toManagementLevelMME(ranking) }
        workplace = (subOfProgram?.workplace || []).concat([newWorkplace])
      }
      const keywords = generateKeywords([name.toLowerCase()])
      keywords.push(`${code}`)
      if (subOfProgram) {
        keywords.push(subOfProgram.key)
      }
      const array_responsible_people = this.representative.map(f => (f.key));
      const array_checker = this.people.map(f => (f.key));
      const array_source_budget_key = this.selectedObjects.map( m => m.key);
      const workplaceKeys = workplace.map(m => m.key)
      const departmentKeys = this.arrayDepartment.map(m => m.key)
      const data: IMmeMainProgram = {
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
        subOfProgram: subOfProgram ? toSubWorkplace(subOfProgram) || null : null,
        company: subOfProgram?.company || null,
        ranking: toManagementLevelMME(ranking),
        isWorkplace: ranking?.isWorkplace || false,
        headerOfficer: item?.headerOfficer || [],
        headerOfficerKeys: item?.headerOfficerKeys || [],
        topManagement: item?.topManagement || [],
        topManagementKeys: item?.topManagementKeys || [],
        adminOffice: adminOffice || false,
        completedDuration: completedDuration || false,
        showInHeader: showInHeader || false,
        verifyFromAssistant: verifyFromAssistant || false,

        budget_for_year: budget_for_year?.toString() || null,
        budget_for_yearKey: budget_for_year || null,
        source_budget: this.filterSourceBudget || [],
        array_source_budget_key: array_source_budget_key,
        base_indicators: indicators,
        goal_text: goal,
        year_of_program: getYearData(yearProgram) || null,
        responsible_people: this.representative,
        checker: this.people,
        department: this.arrayDepartment || [],
        array_responsible_people: array_responsible_people,
        array_checker: array_checker,
        workplaceKeys: workplaceKeys,
        departmentKeys: departmentKeys
      }
      if (this.SELECTED_PHOTO) {
        const files = await this.storage.upload([this.SELECTED_PHOTO])
        data.file = files[0]
      }
      this.store.save(data, item || null, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Workplace has been saved successful.`, "Done", { duration: 1000 });
          this.store.position = [];
          this.store.departmentOfficers = [];
          this.form.reset()
          this.form.enable();
          this.people = [];
          this.representative = [];
          this.inputRef.nativeElement.focus();
          this.dialogRef.close();
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
