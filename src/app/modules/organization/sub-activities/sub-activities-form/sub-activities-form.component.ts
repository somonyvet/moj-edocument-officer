import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IDepartment, IPosition, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { IMmeProgram, IMmeSubProgram } from 'src/app/interfaces/mme';
import { ConvertService, pushObjArray, pushToArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { getYearData, MappingService, toDepartment, toRanking, toCapitalize, toEmployee, toNameKey, generateKeywords } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { LEVEL_MME, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import CustomEditor from 'src/app/shared/ckeditor/custom-editor';
import { MmeSubProgramStore } from 'src/app/stores/document/mme-sub-program.store';
import { config } from 'src/app/dummy/config';

@Component({
    selector: 'app-sub-activities-form',
    templateUrl: './sub-activities-form.component.html',
    styleUrls: ['./sub-activities-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SubActivitiesFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('Follower') Follower: ElementRef<HTMLInputElement>;
  @ViewChild('Representative') Representative: ElementRef<HTMLInputElement>;

  title: any = "បង្កើតអនុសកម្មភាព";
  form: UntypedFormGroup;
  yearProgram: AbstractControl;
  source_budget: AbstractControl;
  department: AbstractControl;
  filterYearProgram: Observable<IYearProgram[]>;

  position: AbstractControl;
  officer: AbstractControl;
  representativeForm: AbstractControl;

  filterPosition: Observable<IPosition[]>;
  itemYearBudget: any[] = [];
  yearBudget: Observable<IYearProgram[]>;
  filterSourceBudget: any[] = [];
  filterDepartment: Observable<IYearProgram[]>;
  filterOfficer: Observable<any[]>;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  removable = true;
  idParent: string;

  source: any[] = [];
  public Editor = CustomEditor;
  public config = config;

  constructor(
    public dialogRef: MatDialogRef<SubActivitiesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: MmeSubProgramStore,
    public ds: DataService,
    private auth: AuthStore,
    private db: DatabaseService,
    private snackbar: MatSnackBar
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      yearProgram: [null, ([Validators.required, MappingService.validSelected.bind(this)])],
      program_id: [null, Validators.required],
      title: [null, Validators.required],
      mfe_budget: [null, Validators.required],
      department: [null, ([Validators.required, MappingService.validSelected.bind(this)])],
      indicators: [null, Validators.required],
      // goal: [null, Validators.required],
      officer: [null],
      representativeForm: [null],
    })
    this.yearProgram = this.form.controls['yearProgram']
    this.position = this.form.controls['position']
    this.department = this.form.controls['department']
    this.officer = this.form.controls['officer']
    this.representativeForm = this.form.controls['representativeForm']

    const { config } = this.auth;
    const offices = await this.store.fetchYearProgram(config);
    this.filterYearProgram = MappingService.autoComplete(this.yearProgram, offices, "name");

    const data = await this.db.mmeSourceBudgetRef().get().toPromise();
    const dataSource = pushToArray(data);
    this.filterSourceBudget = dataSource;

    const departmentRef = await this.db.departmentFireRef(ref => ref.where('isDelete', '==', false).orderBy('node').orderBy('order')).get().toPromise();
    const dataDepartment = pushToArray(departmentRef);
    this.filterDepartment = MappingService.autoComplete(this.department, dataDepartment, "name");

    const officerRef = await this.db.userAccountRef().get().toPromise();
    const dataOfficer = pushToArray(officerRef);
    this.filterOfficer = MappingService.autoComplete(this.officer, dataOfficer, "displayName");

    this.inputRef.nativeElement.focus()
    const { item, id } = this.data;

    if (id) {
      this.idParent = id;
    }
    if (item) {
      this.title = "កែប្រែអនុសកម្មភាព"
      const { program_id,
        title,
        source_budget,
        year_of_program,
        budget_for_year,
        department,
        checker,
        responsible_people,
        base_indicators,
        goal_text,
        mfe_budget
      } = item;
      this.people = checker;
      this.representative = responsible_people;
      if (source_budget) {
        this.filterSourceBudget = source_budget;
        this.selectedObjects = this.filterSourceBudget.filter(m => m.checked)
      }
      this.form.patchValue({
        program_id: program_id,
        title: title,
        yearProgram: year_of_program,
        budget_for_year: budget_for_year?.toString() || null,
        budget_for_yearKey: budget_for_year || null,
        department: department,
        indicators: base_indicators,
        goal: goal_text,
        mfe_budget
      })
    }

  }

  people: any[] = [];
  representative: any[] = [];
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

  selectedRepresentative(event: MatAutocompleteSelectedEvent): void {
    const data = event.option.value;
    this.representative.push(toEmployee(data));
    this.Representative.nativeElement.value = '';
    this.officer.reset()
    this.Representative.nativeElement.blur();
  }

  selectedObjects: any[] = [];
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
  async _onSave(f: any) {

    // if (this.selectedObjects) {
    this.form.disable();
    const data = this.data?.item || null;
    const { yearProgram, title, program_id, mfe_budget, department, indicators, goal } = f;
    const displayName = toCapitalize(title)
    const array_responsible_people = this.representative.map(f => (f.key));
    const array_checker = this.people.map(f => (f.key));
    const { uid } = this.auth;
    const key = data?.key || this.ds.createId();
    const { parentTitle, parentKey } = this.data;
    const item: IMmeSubProgram = {
      key: key,
      status: data?.status || STATUS_OBJ.ACTIVE,
      created_at: data?.created_at || this.ds.serverTimestamp(),
      created_by: data?.created_by || uid,
      updated_by: uid,
      updated_at: this.ds.serverTimestamp(),
      date_key: data?.date_key || ConvertService.dateKey(),
      page_key: data?.page_key || ConvertService.pageKey(),
      keyword: generateKeywords([title, program_id]),
      isDelete: data?.isDelete || false,

      program_id: program_id,
      title: title,
      displayName: displayName,
      nameKey: toNameKey(title),
      // year_of_program: getYearData(yearProgram) || null,
      parentKey: parentKey,
      source_budget: this.filterSourceBudget || [],
      department: toDepartment(department) || [],
      checker: this.people,
      responsible_people: this.representative,
      base_indicators: indicators,
      level: LEVEL_MME.sub_activities,
      mfe_budget,
      array_responsible_people: array_responsible_people,
      array_checker: array_checker,
    }
    this.store.save(this.db.mmeProgramSaveRef(), item, (success, error) => {
      if (success) {
        this.form.reset()
        this.form.enable();
        this.people = [];
        this.representative = [];
        this.dialogRef.close({ item: data })
        this.snackbar.open(`ទិន្នន័យត្រូវបានបង្កើតដោយជោគជ័យ។`, "យល់ព្រម", { duration: 3000 })
      } else {
        this.snackbar.open(error, "យល់ព្រម")
      }
    })
  }

}
