import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { convertPrimitiveToObservable, generateKeywords, MappingService, orderListFormat, toCodeKey, toEmployee, toFlatten, toKeyAndName, toNameKey, toNumber, toProjectCategory, toWorkplacePlaning } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';
import { map, take, debounceTime, startWith } from "rxjs/operators";
import { lastValueFrom, Observable, of, Subscription } from 'rxjs';
import { ConvertService, pushToArray, toUniq, pushToObject } from 'src/app/shared/services/convert.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IProjectProgram } from 'src/app/interfaces/mme';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { HANDLER_AUDITOR_TYPE_OBJ } from 'src/app/dummy/data';

@Component({
  selector: 'app-planing-and-politics-form',
  templateUrl: './planing-and-politics-form.component.html',
  styleUrls: ['./planing-and-politics-form.component.scss']
})
export class PlaningAndPoliticsFormComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  form: FormGroup;

  autoCompleteDepartmentSubscription: Array<Subscription> = [];
  filteredDepartmentOptions: Observable<any[]>[] = [];

  autoCompleteOfficerSubscription: Array<Subscription> = [];
  filteredOfficerOptions: Observable<any[]>[] = [];

  filterAuditor: Observable<any[]>;
  officer: AbstractControl;
  department: AbstractControl;
  auditor: AbstractControl;

  routeSubscription: Subscription;

  arrayOfficers2d: any[][] = [];
  arrayAuditors: any[] = [];
  removable = true;
  isNew: boolean = false;
  process: boolean = false;
  showBudgetOption: boolean = false;
  title: string = ''
  isIndicatorHasValue = false;

  dataDepartment = null;
  dataOfficer = null;

  deleteOfficer: any[] = [];

  constructor(
    private fb: FormBuilder,
    public auth: AuthStore,
    public store: ProjectStore,
    private snackBar: MatSnackBar,
    public ds: DatabaseService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  async ngOnInit() {
    this.form = this.fb.group({
      code: [null, [Validators.required], this.checkExistCodeRef()],
      name: [null, [Validators.required], this.checkExistRef()],
      budgetProviderMMF: [true],
      budgetProviderMME: [false],
      budgetMMF_riel: [null, [Validators.required, Validators.min(0)]],
      budgetMME_dollar: [{ value: null, disabled: true }, [Validators.required, Validators.min(0)]],
      budgetMME_riel: [{ value: null, disabled: true }, [Validators.required, Validators.min(0)]],
      auditor: [null],
      department_officer: new FormArray([]),
      remark_indicator: new FormArray([]),
    })
    this.department = this.form.controls['department'];
    this.officer = this.form.controls['officer'];
    this.auditor = this.form.controls['auditor'];

    const departmentRef = await lastValueFrom(this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).orderBy('node').orderBy('order')).get());
    this.dataDepartment = pushToArray(departmentRef);
    const officerRef = await lastValueFrom(this.ds.userAccountRef().get());
    this.dataOfficer = pushToArray(officerRef);
    this.filterAuditor = MappingService.autoComplete(this.auditor, this.dataOfficer, "displayName");

    this.routeSubscription = this.route.params.subscribe(async params => {
      const { selectedPlaning, selectedCategory, } = this.store;
      const formArray = this.form.get('remark_indicator') as FormArray;
      if (formArray?.length === 0) {
        this.addFormArrayItem('remark_indicator')
      }
      const formArray1 = this.form.get('department_officer') as FormArray;
      if (formArray1?.length === 0) {
        this.addDepartmentArrItem()
      }
      const { id } = params;
      this.showBudgetOption = selectedCategory?.allowDoReport || false;
      if (id !== 'draft') {
        this.store.fetchProjectPrograms(selectedPlaning?.key, id, async res => {
          if (!res) {
            this.router.navigate(['/page-not-found'])
            return;
          }
          const { selectedItem, selectedCategory, remark_indicator } = this.store;
          this.title = `កែសម្រួល${selectedItem?.name}`;
          this.patchValueToFormArray(remark_indicator, 'remark_indicator')
          const planningKey = selectedItem?.project?.key;
          const programKey = selectedItem?.key;
          const projectProgramsOfficerWorkplaceRef = await lastValueFrom(this.ds.projectProgramsOfficerWorkplaceRef(planningKey, programKey).get())
          this.arrayOfficers2d = [];
          this.arrayAuditors = [];
          pushToArray(projectProgramsOfficerWorkplaceRef).map(m => {
            if (m.member_type.key === HANDLER_AUDITOR_TYPE_OBJ.AUDITOR.key) {
              this.arrayAuditors.push(m?.officer);
            }
            else {
              const department = selectedItem.departments.find(f => f.key === m.officer.workplace.key)
              this.arrayOfficers2d[department.line_order] = this.arrayOfficers2d[department.line_order] || []
              this.arrayOfficers2d[department.line_order].push(m?.officer)
            }
          })
          const originalDepartment = this.dataDepartment?.filter(m => {
            const depKeys = selectedItem?.departments?.map(r => r?.key);
            return depKeys?.includes(m?.key);
          })
          this.patchValueToDepartmentFormArr(originalDepartment);
          if (selectedCategory?.allowDoReport) {
            if (res?.budgetProviderMMF) {
              this.form.controls['budgetProviderMMF'].enable();
              this.form.controls['budgetMMF_riel'].enable();
              this.form.controls['budgetProviderMMF'].patchValue(true)
            } else {
              this.form.controls['budgetProviderMMF'].disable();
              this.form.controls['budgetMMF_riel'].disable();
            }
            if (res?.budgetProviderMME) {
              this.form.controls['budgetProviderMME'].enable();
              this.form.controls['budgetMME_dollar'].enable();
              this.form.controls['budgetMME_riel'].enable();
              this.form.controls['budgetProviderMME'].patchValue(true)
            } else {
              this.form.controls['budgetProviderMME'].enable();
              this.form.controls['budgetMME_dollar'].disable();
              this.form.controls['budgetMME_riel'].disable();
            }
          } else {
            this.form.controls['budgetProviderMMF'].disable();
            this.form.controls['budgetMMF_riel'].disable();
            this.form.controls['budgetProviderMME'].disable();
            this.form.controls['budgetMME_dollar'].disable();
            this.form.controls['budgetMME_riel'].disable();
          }
          this.form.patchValue({
            code: selectedItem?.code || null,
            name: selectedItem ? selectedItem.name : null,
            budgetProviderMMF: selectedItem?.budgetProviderMMF || false,
            budgetProviderMME: selectedItem?.budgetProviderMME || false,
            budgetMMF_riel: selectedItem?.budgetMMF_riel,
            budgetMME_dollar: selectedItem?.budgetMME_dollar,
            budgetMME_riel: selectedItem?.budgetMME_riel,
          })
          this.inputRef.nativeElement.focus();
        })
      } else {
        this.newForm()
      }
    })
    this.route.queryParams.subscribe(async queryParams => {
      const { officer, auditor } = queryParams
      if (officer) {
        const officerRef = await lastValueFrom(this.ds.userAccountRef().doc(officer).get());
        this.officer.reset()
      }
      if (auditor) {
        const auditorRef = await lastValueFrom(this.ds.userAccountRef().doc(auditor).get());
        this.arrayAuditors.push(toEmployee(pushToObject(auditorRef)));
        this.auditor.reset()
      }
    })
  }

  ngOnDestroy(): void {
    this.store.subscribeForm()
    this.routeSubscription.unsubscribe()
  }

  async newForm() {
    this.store.subscribeForm()
    this.form.reset()
    const { selectedCategory, selectedParent } = this.store;
    this.title = `បង្កើត${selectedCategory?.name}`;

    const formArray1 = this.form.get('remark_indicator') as FormArray;
    if (formArray1?.length === 0) {
      this.addFormArrayItem('remark_indicator')
    } else if (formArray1?.length > 1) {
      this.clearFormArray('remark_indicator');
      this.addFormArrayItem('remark_indicator')
    }

    if (selectedCategory?.allowDoReport) {
      this.form.controls['budgetProviderMMF'].patchValue(true)
      this.form.controls['budgetProviderMMF'].enable();
      this.form.controls['budgetMMF_riel'].enable();

      this.form.controls['budgetProviderMME'].enable();
      this.form.controls['budgetMME_dollar'].disable();
      this.form.controls['budgetMME_riel'].disable();
    } else {
      this.form.controls['budgetProviderMMF'].patchValue(false)
      this.form.controls['budgetProviderMMF'].disable();
      this.form.controls['budgetMMF_riel'].disable();

      this.form.controls['budgetProviderMME'].disable();
      this.form.controls['budgetMME_dollar'].disable();
      this.form.controls['budgetMME_riel'].disable();
    }
    this.arrayOfficers2d = [];
    this.arrayAuditors = [];
    // this.arrayAuditors = [];
    if (selectedParent && !selectedCategory?.allowDoReport) {
      const planningKey = selectedParent?.project?.key;
      const programKey = selectedParent?.key;
      const projectProgramsOfficerWorkplaceRef = await lastValueFrom(this.ds.projectProgramsOfficerWorkplaceRef(planningKey, programKey).get())
      pushToArray(projectProgramsOfficerWorkplaceRef).map(m => {
        if (m.member_type.key === HANDLER_AUDITOR_TYPE_OBJ.AUDITOR.key) {
          this.arrayAuditors.push(m?.officer);
        }
        else {
          const department = selectedParent.departments.find(f => f.key === m.officer.workplace.key)
          this.arrayOfficers2d[department.line_order] = this.arrayOfficers2d[department.line_order] || []
          this.arrayOfficers2d[department.line_order].push(m?.officer)
        }
      })
      const originalDepartment = this.dataDepartment?.filter(m => {
        const depKeys = selectedParent?.departments?.map(r => r?.key);
        return depKeys?.includes(m?.key);
      })

      this.patchValueToDepartmentFormArr(originalDepartment);
    }



    this.inputRef.nativeElement.focus();
  }

  onChangeMME(event: MatCheckboxChange) {
    if (event?.checked) {
      this.form.controls['budgetMME_dollar'].enable();
      this.form.controls['budgetMME_riel'].enable();
    } else {
      this.form.controls['budgetMME_dollar'].disable();
      this.form.controls['budgetMME_riel'].disable();
    }
  }
  onChangeMMF(event: MatCheckboxChange) {
    if (event?.checked) {
      this.form.controls['budgetMMF_riel'].enable();
    } else {
      this.form.controls['budgetMMF_riel'].disable();
    }
  }

  removeDepartment(department: string, key: string): void {
    switch (key) {
      case 'DEPARTMENT':
        // const index = this.arrayDepartment.indexOf(department);
        // if (index >= 0) {
        //   this.arrayDepartment.splice(index, 1);
        // }
        break;
      case 'AUDITOR':
        const indexA = this.arrayAuditors.indexOf(department);
        if(this.store.selectedItem){
          const officerMapKey = this.mapDeleteOfficerKey(this.arrayAuditors[indexA], 'auditor')
          if (!this.deleteOfficer.find(f => f.key === officerMapKey.key)) this.deleteOfficer.push(officerMapKey)
        }
        if (indexA >= 0) {
          this.arrayAuditors.splice(indexA, 1);
        }
        break;
    }
  }

  selectedDepartment(event: MatAutocompleteSelectedEvent, key: string) {
    switch (key) {
      case 'DEPARTMENT':
        const data = event.option.value;
        // this.arrayDepartment.push(toDepartment(data));
        this.department.reset()
        break;
      case 'AUDITOR':
        const officer = toEmployee(event.option.value)
        if (!this.arrayAuditors.find(f => f.key === officer.key)) this.arrayAuditors.push(officer);
        this.auditor.reset()
        break;
    }

  }

  checkExistCodeRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      const { selectedItem, selectedPlaning } = this.store;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.projectProgramsRef(selectedPlaning?.key, ref => ref.where('isDelete', '==', false).where('codeKey', '==', toCodeKey(value))).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const oldValue = selectedItem ? selectedItem.codeKey : null;
              if (oldValue && oldValue === toCodeKey(value)) {
                return null;
              }
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  checkExistRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      const { selectedItem, selectedPlaning } = this.store;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.projectProgramsRef(selectedPlaning?.key, ref => ref.where('isDelete', '==', false).where('nameKey', '==', toNameKey(value))).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const oldValue = selectedItem ? selectedItem.nameKey : null;
              if (oldValue && oldValue === toNameKey(value)) {
                return null;
              }
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  async _onSave(f: any, isNew: boolean): Promise<void> {
    if (this.form.valid) {
      const { name, code, budgetProviderMMF, budgetProviderMME, budgetMMF_riel, budgetMME_dollar, budgetMME_riel, department_officer } = f;
      const departments = department_officer?.map((m, index) => ({ ...m?.department, line_order: index }))?.filter(m => m)
      if (departments?.length === 0) {
        alert('សូមត្រួតពិនិត្យអង្គភាពឲ្យ និងជនបង្គោល​​(អ្នកទទួលខុសត្រូវ)បានត្រឹមត្រូវ')
        return;
      }
      this.isNew = isNew;
      this.process = true;
      this.form.disable();
      const { selectedItem, selectedCategory, selectedParent, selectedPlaning, nextCategory } = this.store;
      const item = selectedItem;
      const officerWorkplaces = toFlatten(this.arrayOfficers2d?.filter(m => m))
      const { selectedCompany } = this.auth;
      let levelItem: any = 0;
      let nodeItem: any = `${orderListFormat(1)}.`
      let indexItem: any = 1;
      let parentItem: any = null;
      let pathItem: any[] = [];
      const key = item?.key || this.ds.createId();
      let workplace = [{ key: selectedPlaning?.key, name: selectedPlaning?.name }];
      let newWorkplace = null;
      if (selectedParent && item?.subOfProgram?.key !== selectedParent?.key) {
        const parentMemberItems = pushToArray(await lastValueFrom(this.ds.projectProgramsRef(selectedPlaning?.key, ref => ref.where('isDelete', '==', false).where("subOfProgram.key", "==", selectedParent.key)).get()));
        const { level, node, path } = selectedParent;
        const totalChild = parentMemberItems.length;
        const lastChild = MappingService.orderByDesc(parentMemberItems, "node")
        if (totalChild === 0) {
          indexItem = (toNumber(totalChild) + 1);
        } else {
          const { index } = lastChild[0];
          indexItem = toNumber(index) + 1
        }
        nodeItem = `${node}${orderListFormat(indexItem)}.`
        levelItem = level + 1;
        parentItem = node;
        pathItem = toUniq((path || []).concat([selectedParent?.key]));
        newWorkplace = { key, name }
        workplace = (selectedParent?.programData || []).concat([newWorkplace]);
      } else {
        if (selectedParent) {
          pathItem = toUniq((selectedParent?.path || []).concat([selectedParent?.key]));
        } else if (item) {
          pathItem = item?.path;
        }
        if (!item) {
          const nodeRef = await lastValueFrom(this.ds.projectProgramLatestRef(selectedPlaning?.key).get());
          if (!nodeRef.empty) {
            const nodeData = MappingService.orderByDesc(pushToArray(nodeRef), 'node');
            const { index } = nodeData[0];
            indexItem = index + 1;
            nodeItem = `${orderListFormat(indexItem)}.`
            newWorkplace = { key, name }
          } else {
            newWorkplace = { key, name }
          }
        } else {
          indexItem = item?.index;
          nodeItem = item?.node;
          levelItem = item?.level;
          parentItem = pathItem
          newWorkplace = { key, name }
        }
        if (selectedParent) {
          workplace = (selectedParent?.programData || []).concat([newWorkplace])
        } else {
          workplace = workplace.concat([newWorkplace])
        }
      }
      const keywords = generateKeywords([name.toLowerCase()])
      keywords.push(`${code}`)
      keywords.push(`${selectedPlaning?.key}`)
      keywords.push(`${selectedCategory?.key}`)
      let sharedWithKeys: string[] = [];
      if (this.arrayAuditors?.length > 0) {
        sharedWithKeys = this.arrayAuditors.map(auditor => auditor?.key)
      }
      if (this.arrayOfficers2d?.length > 0) {
        sharedWithKeys = sharedWithKeys.concat(toFlatten(this.arrayOfficers2d).map(auditor => auditor?.officer?.key))
      }
      if (departments?.length > 0) {
        sharedWithKeys = sharedWithKeys.concat(departments.map(m => m?.key));
      }
      sharedWithKeys = toUniq(sharedWithKeys)?.filter(m => m)
      if (selectedParent) {
        keywords.push(selectedParent.key)
      }
      const remark_indicator = this.mapRemarkIndicator(this.getLegitItemInFormArray('remark_indicator'))
      const data: IProjectProgram = {
        key: key,
        status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: false,
        keyword: keywords,

        code: `${code}`,
        codeKey: toCodeKey(code),
        name: name,
        nameKey: toNameKey(name),
        budgetProviderMMF: selectedCategory?.allowDoReport ? (budgetProviderMMF || false) : false,
        budgetProviderMME: selectedCategory?.allowDoReport ? (budgetProviderMME || false) : false,
        budgetMMF_riel: selectedCategory?.allowDoReport ? (budgetMMF_riel || 0) : 0,
        budgetMME_dollar: selectedCategory?.allowDoReport ? (budgetMME_dollar || 0) : 0,
        budgetMME_riel: selectedCategory?.allowDoReport ? (budgetMME_riel || 0) : 0,
        remark_indicator: remark_indicator || [],
        subOfProgram: selectedParent ? toKeyAndName(selectedParent) : null,
        project: selectedPlaning ? toKeyAndName(selectedPlaning) : null,
        company: toKeyAndName(selectedCompany) || null,
        category: toProjectCategory(selectedCategory) || null,

        order: levelItem,
        level: levelItem,
        node: nodeItem,
        parent: parentItem,
        index: indexItem,
        totalChild: item?.totalChild || 0,
        path: pathItem,
        projectStatus:selectedPlaning?.projectStatus,

        departments: departments.length > 0 ? departments?.map(m => (toWorkplacePlaning(m))) : [],
        departmentKeys: departments.length > 0 ? departments?.map(m => m?.key) : [],
        sharedWithKeys: sharedWithKeys || [],
        programKeys: workplace?.length > 0 ? workplace.map(m => m?.key) : [],
        programData: workplace,
        nextCategory: nextCategory ? toProjectCategory(nextCategory) : null,
      }

      if (this.deleteOfficer.length > 0) {
        this.deleteOfficer.map(m => {
          this.ds.projectProgramsOfficerWorkplaceRef(data?.project?.key, data?.key).doc(m.key).delete();
        })
      }

      await this.store.save(data, officerWorkplaces, this.arrayAuditors).then(() => {
        this.snackBar.open(`${selectedCategory?.name} has been created successful.`, "Done", { duration: 1000 });
        this.router.navigate([`/planing/${data?.project?.key}/${data?.subOfProgram?.key || 'na'}/${!isNew ? data?.key : 'draft'}/form`]);
        this.form.enable();
        if (isNew) {
          this.newForm()
          this.inputRef?.nativeElement?.focus()
        }
      }).catch(err => {
        alert(err)
      }).finally(() => {
        this.process = false;
      })

    }
  }

  addFormArrayItem(name) {
    const formArray = this.form.get(name) as FormArray;
    formArray.push(this.fb.group({
      remark: [null, [Validators.required]],
      indicator: [null, [Validators.required]],
      created_by: [null],
      created_at: [null],
      updated_by: [null],
      updated_at: [null],
    }))
  }

  deleteFormArrayItem(index, name) {
    const formArray = this.form.get(name) as FormArray;
    formArray.removeAt(index);
    if (name === 'department_officer') {
      this.reorderInputSubscription()
    }
  }

  getLegitItemInFormArray(name): any[] {
    const formArray = this.form.get(name) as FormArray;
    let temp = [];
    formArray.value.map(m => m?.remark ? temp.push(m) : null)
    return temp;
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
            created_by: [item?.created_by || null],
            created_at: [item?.created_at || null],
            updated_by: [item?.updated_by || null],
            updated_at: [item?.updated_at || null],
          })
        )
      }
    }
  }

  async patchValueToDepartmentFormArr(list: any) {
    this.clearFormArray('department_officer');
    if (list?.length === 0) {
      this.addDepartmentArrItem()
    } else {
      const formArray = this.form.get('department_officer') as FormArray;
      for (let item of list) {
        formArray.push(
          this.fb.group({
            department: [item || null, Validators.required],
            officers: [{ value: null, disabled: false }],
          })
        )
        this.manageDepartmentControl(formArray.length - 1);
        this.manageOfficerControl(formArray.length - 1);
      }
    }
  }

  clearFormArray(name: string) {
    const formArray = this.form.get(name) as FormArray;
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  mapRemarkIndicator(list) {
    let temp = []
    list.map((m, index) => {
      const { remark_indicator } = this.store;
      let obj = null;
      if (m?.created_by) {
        if (m?.remark !== remark_indicator[index]?.remark || m?.indicator !== remark_indicator[index]?.indicator) {
          obj = {
            ...m,
            created_by: m?.created_by || this.toUserObj(this.auth?.user),
            created_at: m?.created_at || new Date(),
            updated_by: this.toUserObj(this.auth?.user),
            updated_at: new Date(),
          }
        }
        else {
          obj = {
            ...m,
            created_by: m?.created_by || this.toUserObj(this.auth?.user),
            created_at: m?.created_at || new Date(),
            updated_by: m?.updated_by,
            updated_at: m?.updated_at,
          }
        }
      }
      else {
        obj = {
          ...m,
          created_by: this.toUserObj(this.auth?.user),
          created_at: new Date(),
        }
      }
      temp.push(obj)
    })
    return temp;
  }

  toUserObj(object) {
    return {
      displayName: object?.displayName,
      photoURL: object?.photoURL,
      key: object?.uid,
    }
  }

  addDepartmentArrItem() {
    const formArray = this.form.get('department_officer') as FormArray;
    formArray.push(this.fb.group({
      department: [null, [Validators.required]],
      officers: [{ value: null, disabled: true }],
    }))
    this.manageDepartmentControl(formArray.length - 1);
    this.manageOfficerControl(formArray.length - 1);
  }


  manageDepartmentControl(index: number) {
    var arrayControl = this.form.get('department_officer') as FormArray;
    this.autoCompleteDepartmentSubscription[index] = arrayControl.at(index).get('department').valueChanges.pipe(
      startWith(''),
      map(async name => {
        return name ? MappingService.filterStates(this.dataDepartment, name, "name") : this.dataDepartment.slice();
      })).subscribe((result) => {
        result.then((result2) => {
          this.filteredDepartmentOptions[index] = convertPrimitiveToObservable(result2);
        });
      });
  }

  manageOfficerControl(index: number) {
    const arrayControl = this.form.get('department_officer') as FormArray;
    this.autoCompleteOfficerSubscription[index] = arrayControl.at(index).get('officers').valueChanges.pipe(
      startWith(''),
      map(async name => {
        return name ? MappingService.filterStates(this.dataOfficer, name, "displayName") : this.dataOfficer.slice();
      })).subscribe((result) => {
        result.then((result2) => {
          const formControl = arrayControl.controls[index] as FormGroup;
          const department = formControl.controls['department'].value;
          const officers = result2?.filter(m => m?.workplaceKey === department?.key);
          this.filteredOfficerOptions[index] = convertPrimitiveToObservable(officers);
        });
      });
  }

  reorderInputSubscription() {
    const formArray = this.form.get('department_officer') as FormArray;
    for (let i = 0; i < formArray.controls.length; i++) {
      this.manageDepartmentControl(i)
      this.manageOfficerControl(i)
    }
    this.autoCompleteDepartmentSubscription[formArray.controls.length].unsubscribe();
    this.autoCompleteOfficerSubscription[formArray.controls.length].unsubscribe();
  }


  selectedDepartmentFormArr(event: MatAutocompleteSelectedEvent, key: string, index: number) {
    if (key === 'OFFICER') {
      const dataO = event.option.value;
      const formArray = this.form.get('department_officer') as FormArray;
      const formControl = formArray.controls[index] as FormGroup;
      const department = formControl.controls['department']?.value;
      if (!department) {
        alert('លោកអ្នកត្រូវជ្រើសរើសអង្គភាពឲ្យបានត្រឹមត្រូវជាមុន ទើបលោកអ្នកអាចជ្រើសរើសជនបង្គោល​​(អ្នកទទួលខុសត្រូវ)បាន')
        return;
      }
      const { config } = this.auth;
      const workplaceKeys = department?.workplace?.filter(r => r?.managementLevel?.order > config?.generalDepartmentLevel?.order).map(m => m?.key);
      const officerWorkplace = {
        ...toEmployee(dataO),
        workplace: { key: department?.key, name: department?.name, workplaceKeys: workplaceKeys },
        order: index,
        ranking: department?.ranking || null,
      }
      this.arrayOfficers2d[index] = this.arrayOfficers2d[index] || [];
      this.arrayOfficers2d[index].push(officerWorkplace);
    }
  }
  removeDepartmentFormArr(department: string, key: string, index: number): void {
    if (key === 'OFFICER') {
      const indexO = this.arrayOfficers2d[index].indexOf(department);
      
      if(this.store.selectedItem){
        const officerMapKey = this.mapDeleteOfficerKey(this.arrayOfficers2d[index][indexO], 'handler')
        if (!this.deleteOfficer.find(f => f.key === officerMapKey.key)) this.deleteOfficer.push(officerMapKey)
      }

      if (indexO >= 0) {
        this.arrayOfficers2d[index].splice(indexO, 1);
      }
    }
  }

  onSelectDepartment(event, index: number) {
    const formArray = this.form.get('department_officer') as FormArray;
    const department = event.option.value;
    formArray.controls[index].setValue({
      department: department,
      officers: null,
    })
    const formControl = formArray.controls[index] as FormGroup;
    formControl.controls['officers'].enable();
  }

  mapDeleteOfficerKey(item, type) {
    return {
      key: `${type}_${item.key}_${this.store?.selectedItem?.key}`
    }
  }

}
