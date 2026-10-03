import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom, Observable } from 'rxjs';
import { APPROVAL_STATUS_OBJECT, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PLANING_RECORD_TYPE } from 'src/app/dummy/status';
import { IDepartment, IQuarter } from 'src/app/interfaces/document/document.interface';
import { IAnnualProjectPlaning, IAnnualProjectQuarterWorkplace, IAnnualProjectWorkplace, IProjectProgram } from 'src/app/interfaces/mme';
import { ConvertService, pushToArray, sum } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MappingService, toDepartmentNoWorkplace, toKeyAndName, toProject } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';

@Component({
  selector: 'app-annual-project-planing-form',
  templateUrl: './annual-project-planing-form.component.html',
  styleUrls: ['./annual-project-planing-form.component.scss']
})
export class AnnualProjectPlaningFormComponent implements OnInit {
  form: FormGroup;
  department: AbstractControl;
  filterDepartment: Observable<IDepartment[]>;

  title = ``;
  selectedQuarter: IQuarter = null;

  loading: boolean = true;
  loadingForm: boolean = true;
  process: boolean = false;
  myWorkplaceKey: string = ``;
  departments: any[] = [];
  disabledForm: boolean = false;
  constructor(public dialogRef: MatDialogRef<AnnualProjectPlaningFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: ProjectStore,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit(): Promise<void> {
    const { parent, quater, project } = this.data;
    const { root, workplaceKeys } = this.auth;
    this.selectedQuarter = quater;
    const currentDepartment = parent?.departments?.find(m => m?.key === this.auth?.currentDepartment?.key) || parent?.departments[0] || null;

    const { workplaceSubmittedPlaning } = this.store;
    const indicatorDoc = parent?.quater_planing?.find(i => i.quater?.key === quater?.key) || null;
    this.form = this.fb.group({
      quater: [this.selectedQuarter],
      // indicator: [indicatorDoc?.indicator || null, [Validators.required]],
      remark_indicator : new FormArray([]),
      credentials: this.fb.array([]),
      department: [null, [Validators.required, MappingService.validSelected.bind(this)]]
    })
    if(indicatorDoc){
      this.patchValueToFormArray(indicatorDoc?.remark_indicator||[],'remark_indicator')
    }
    this.department = this.form.controls['department'];
    this.title = `${parent.name}`;
    const status = workplaceSubmittedPlaning?.status || null;

    const departmentRef = await lastValueFrom(this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).orderBy('node').orderBy('order')).get());
    const dataDepartment = pushToArray(departmentRef);
    let selectedDepartment: any = null;
    let items: any[] = [];
    if (root || currentDepartment?.planingOffice) {
      items = dataDepartment?.filter(m => parent?.departmentKeys?.includes(m?.key))
      selectedDepartment = items?.find((m, index) => index === 0);
    } else {
      items = dataDepartment?.filter(m => workplaceKeys?.includes(m?.key) && parent?.departmentKeys?.includes(m?.key))
      selectedDepartment = items?.find((m) => m?.key === currentDepartment?.key) || items[0];
    }
    this.disabledForm = (status && status?.key !== APPROVAL_STATUS_OBJECT.REJECT?.key) || !this.store.canReleasePlaning;
    if (!selectedDepartment) {
      selectedDepartment = currentDepartment
    }
    this.myWorkplaceKey = selectedDepartment?.key;
    await this.store.fetchQuarterPlaning(project?.key, quater?.key, parent?.key, this.myWorkplaceKey);
    const { quaterPlaning } = this.store;
    const item: any = quaterPlaning?.find(m => m?.project_program?.key === parent?.key && m?.record_type?.key === PLANING_RECORD_TYPE?.quater_plan?.key);

    this.departments = items;
    this.filterDepartment = MappingService.autoComplete(this.department, items, "name");
    this.form.patchValue({
      // indicator: item?.indicator || null,
      department: selectedDepartment || null,
    })

    this.patchValueToFormArray(item?.remark_indicator||[],'remark_indicator')

    if (parent?.category?.allowDoReport) {
      quater?.month?.map(m => {
        const item = quaterPlaning.find(i => i.month?.key === m.key && i?.record_type?.key === PLANING_RECORD_TYPE.monthly_plan.key) || null;
        this.addProgramForm(item, m, parent)
        this.loadingForm = false;
        this.loading = false;
      })
    } else {
      this.loadingForm = false;
      this.loading = false;
    }
    if (this.disabledForm) {
      this.form.disable()
    } else {
      this.form.enable()
    }
  }

  addProgramForm(val: IAnnualProjectPlaning, month?: any, parent?: IProjectProgram) {
    const { budgetProviderMME, budgetProviderMMF } = parent;
    const credential = this.form.controls.credentials as FormArray;
    credential.push(
      this.fb.group({
        currentPlaning: [val || null],
        monthKey: [month?.key],
        name: [month?.name],
        month: month,
        remark: [val?.remark || null, [Validators.required]],
        budgetMMF_riel: [{ value: val?.budgetMMF_riel || null, disabled: !budgetProviderMMF }, [ Validators.min(0)]],
        budgetMME_dollar: [{ value: val?.budgetMME_dollar || null, disabled: !budgetProviderMME }, [ Validators.min(0)]],
        budgetMME_riel: [{ value: val?.budgetMME_riel || null, disabled: !budgetProviderMME }, [ Validators.min(0)]],
      })
    )
  }

  _onOptionSelected = async (event: MatSelectChange): Promise<void> => {
    this.loadingForm = true;
    const { value } = event;
    const { parent, project } = this.data;
    await this.store.fetchQuarterPlaning(project?.key, value?.key, parent?.key, this.myWorkplaceKey);
    const { quaterPlaning } = this.store;
    const item: any = quaterPlaning?.find(m => m?.record_type?.key === PLANING_RECORD_TYPE.quater_plan?.key);
    this.form.patchValue({
      indicator: item?.indicator || null
    })
    if (parent?.category?.allowDoReport) {
      const credential = this.form.controls.credentials as FormArray;
      value?.month?.map((m, i) => {
        credential.removeAt(0)
      })
      value?.month?.map((m, index) => {
        const { quaterPlaning } = this.store;
        const item = quaterPlaning.find(i => i.month?.key === m.key) || null;
        this.addProgramForm(item, m, parent)
        this.loadingForm = false;
      })
    } else {
      this.loadingForm = false;
    }
  }

  optionSelectedWorkplace = async (event: MatAutocompleteSelectedEvent): Promise<void> => {
    const { key } = event.option.value;
    if (key === this.myWorkplaceKey) return;
    this.loadingForm = true;
    this.myWorkplaceKey = key;
    const { parent, project } = this.data;
    const value = this.form?.value.quater;
    await this.store.fetchQuarterPlaning(project?.key, value?.key, parent?.key, this.myWorkplaceKey);
    const { quaterPlaning } = this.store;
    const item: any = quaterPlaning?.find(m => m?.record_type?.key === PLANING_RECORD_TYPE.quater_plan?.key);
    this.form.patchValue({
      indicator: item?.indicator || null,
    })
    if (parent?.category?.allowDoReport) {
      const credential = this.form.controls.credentials as FormArray;
      value?.month?.map((m, i) => {
        credential.removeAt(0)
      })
      value?.month?.map((m, index) => {
        const { quaterPlaning } = this.store;
        const item = quaterPlaning.find(i => i.month?.key === m.key) || null;
        this.addProgramForm(item, m, parent)
        this.loadingForm = false;
      })
    } else {
      this.loadingForm = false;
    }
  }

  _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable()
      this.process = true;
      const { quater, credentials, indicator, department,remark_indicator } = f;
      const { parent, project, } = this.data;
      const { uid, config } = this.auth;
      const workplacePlaning = null;
      const quaterPlanKey = `${quater?.key}_${parent.key}_${department?.key}`;
      const item = this.data?.parent?.quater_planing?.find(m => m?.key === quaterPlanKey) || null;
      const sharedWorkplaceKeys = department?.workplace?.filter(m => config?.generalDepartmentLevel?.order < m?.managementLevel?.order)?.map(m => m?.key)
      const data: IAnnualProjectWorkplace = {
        key: `${quater?.key}_${department?.key}`,
        status: workplacePlaning?.status || STATUS_OBJ.ACTIVE,
        created_at: workplacePlaning?.created_at || this.ds.serverTimestamp(),
        created_by: workplacePlaning?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: workplacePlaning?.date_key || ConvertService.dateKey(),
        page_key: workplacePlaning?.page_key || ConvertService.pageKey(),
        keyword: [],
        isDelete: workplacePlaning?.isDelete || false,
        //fields
        workplace: toDepartmentNoWorkplace(department),
        project: toProject(project),
        quater: { key: quater?.key, name_en: quater?.name_en, order: quater?.order, name: quater?.name },
        semester: quater?.semester,
        months: quater?.month,
        sharedWorkplaceKeys: sharedWorkplaceKeys || [],
        sharedWithKeys: parent.sharedWithKeys,
        sharedWithMemberKeys: parent?.sharedWithMemberKeys || [],
      }
      const budgetMMF_riel = sum(credentials, 'budgetMMF_riel')
      const budgetMME_dollar = sum(credentials, 'budgetMME_dollar')
      const budgetMME_riel = sum(credentials, 'budgetMME_riel')

      const quaterPlan: IAnnualProjectQuarterWorkplace = {
        key: quaterPlanKey,
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: item?.isDelete || false,
        //fields
        workplace: toDepartmentNoWorkplace(department),
        project: toProject(project),
        quater: { key: quater?.key, name_en: quater?.name_en, order: quater?.order, },
        semester: quater?.semester,
        remark_indicator: remark_indicator || null,
        budgetMME_riel: budgetMME_riel || null,
        budgetMME_dollar: budgetMME_dollar || null,
        budgetMMF_riel: budgetMMF_riel || null,
        project_program: toKeyAndName(parent),
        project_program_keys: parent?.programKeys || [],
        record_type: PLANING_RECORD_TYPE.quater_plan,
        sharedWithMemberKeys: parent?.sharedWithMemberKeys || [],
        category: parent?.category || null,
      }

      this.form.enable()
      this.process = false;

      this.store.createPlaning(data, quaterPlan, quater, parent, credentials).then(async () => {
        await this.store.fetchQuarterPlaning(project?.key, quater?.key, parent?.key, this.myWorkplaceKey);
        this.snackBar.open(`ផែនការអនុម័តប្រចាំឆ្នាំត្រូវបានដាក់ឲ្យលើកផែនការត្រីមាស`, "ជោគជ័យ", { duration: 3000 });
        if (parent?.category?.allowDoReport || this.departments.length === 1) {
          this.dialogRef.close('yes')
        }
      }).catch(error => {
        alert(error)
      }).finally(() => {
        this.form.enable()
        this.process = false;
      })
    }
  }

  addFormArrayItem(name) {
    const formArray = this.form.get(name) as FormArray;
    formArray.push(this.fb.group({
      remark: [null, [Validators.required]],
      indicator: [null, [Validators.required]],
    }))
  }

  removeFormArr(index: number){
    const form = this.form.get('remark_indicator') as FormArray
    form.removeAt(index)
  }

  patchValueToFormArray(list: any, name: string) {
    this.clearFormArray(name);
    if (list?.length === 0) {
      this.addFormArrayItem(name)
    } else {
      const formArray = this.form.get(name) as FormArray;
      for (let item of list) {
        formArray.push(
          this.fb.group({
            remark: [item?.remark || null, Validators.required],
            indicator: [item?.indicator || null, Validators.required],
          })
        )
      }
    }
  }

  clearFormArray(name: string) {
    const formArray = this.form.get(name) as FormArray;
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  trackFn(index: number) {
    return index;
  }
}
