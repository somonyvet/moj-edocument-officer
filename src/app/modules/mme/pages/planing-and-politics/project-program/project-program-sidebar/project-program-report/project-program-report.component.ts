import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/shared/services/data.service';
import { toNumber } from 'src/app/shared/services/mapping.service';
import { ProjectStore } from 'src/app/stores/project/project.store';

@Component({
  selector: 'app-project-program-report',
  templateUrl: './project-program-report.component.html',
  styleUrls: ['./project-program-report.component.scss']
})
export class ProjectProgramReportComponent implements OnInit {

  formFilter: FormGroup;
  quarterPlaningKey: string[] = [];
  quarterReportKey: string[] = [];
  monthlyReportKey: string[] = [];
  quaters : any[] = [];

  queryParams: any = null;

  budget = [{key:'mef' ,name:'ប្រភពថវិកា MEF'},{key:'mme' ,name:'ប្រភពថវិកា MME'}];

  programLevel = [{key:'1' ,name:'កម្មវិធី'},{key:'2' ,name:'អនុកម្មវិធី'},{key:'3' ,name:'ចង្កោមសកម្មភាព'},{key:'4' ,name:'សកម្មភាព'},{key:'5' ,name:'អនុសកម្មភាព'}]

  loading: boolean = true;
  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    public store: ProjectStore,
    private router: Router,
    public ds : DataService
  ) { }

  async ngOnInit(): Promise<void> {
    this.formFilter = this.fb.group({
      quarterPlaning: new FormArray([]),
      budget: new FormArray([]),
      programLevel: new FormArray([])
    })
    const { quaters } = this.store;
    this.quaters = quaters;
    this.route.queryParams.subscribe(async queryParams => {
      this.queryParams = queryParams;
      const { quarterPlaningKey, budget, programLevel } = queryParams;
      const quarterPlaningKeys = quarterPlaningKey ? JSON.parse(quarterPlaningKey) : [];
      const budgetKeys = budget ? JSON.parse(budget) : [];
      const programLevelKeys = programLevel ? JSON.parse(programLevel) : [];
      if(!(quarterPlaningKeys?.length>0) && !(budgetKeys?.length>0) && !(programLevelKeys?.length>0)){
        this.initFormArray('quarterPlaning',quaters);
        this.initFormArray('budget',this.budget);
        this.initFormArray('programLevel',this.programLevel);
      }else{
        this.patchFormArray('quarterPlaning',quarterPlaningKeys,quaters);
        this.patchFormArray('budget',budgetKeys,this.budget);
        this.patchFormArray('programLevel',programLevelKeys,this.programLevel);
      }
      this.loading = false;
    })
  }

  selectionChangePlaningQuater(event: MatSelectionListChange) {
    const options = event?.options;
    const items = options?.filter(m => m?.selected);
    const keys = items?.length > 0 ? JSON.stringify(items.map(m => m?.value?.key)?.toString()) : null;
    const query = {
      activityKey: this.queryParams?.activityKey || null,
      budget: this.queryParams?.budget,
      programLevel: this.queryParams?.programLevel,
      quarterPlaningKey: keys,
    };
    this.router.navigate([`/planing/programs/${this.store.originalProjectKey}/reports`], { queryParams: query })
  }

  selectionChangeBudget(event: MatSelectionListChange){
    const options = event?.options;
    const items = options?.filter(m => m?.selected);
    const keys = items?.length > 0 ? JSON.stringify(items.map(m => m?.value?.key)?.toString()) : null;
    const query = {
      activityKey: this.queryParams?.activityKey || null,
      budget: keys,
      programLevel: this.queryParams?.programLevel,
      quarterPlaningKey: this.queryParams?.quarterPlaningKey,
    };
    this.router.navigate([`/planing/programs/${this.store.originalProjectKey}/reports`], { queryParams: query })
  }

  selectionChangeProgramLevel(event: MatSelectionListChange){
    const options = event?.options;
    const items = options?.filter(m => m?.selected);
    const keys = items?.length > 0 ? JSON.stringify(items.map(m => m?.value?.key)?.toString()) : null;
    const query = {
      activityKey: this.queryParams?.activityKey || null,
      budget: this.queryParams?.budget,
      programLevel: keys,
      quarterPlaningKey: this.queryParams?.quarterPlaningKey,
    };
    this.router.navigate([`/planing/programs/${this.store.originalProjectKey}/reports`], { queryParams: query })
  }



  initFormArray(name,list){
    const formArr = this.formFilter?.get(name) as FormArray
    while(formArr.length>0){
      formArr.removeAt(0)
    }
    if(name!=='quarterPlaning'){
      list.map(m=>{
        formArr?.push(
          this.fb.group({
            isCheck: true,
            name: m?.name,
            key: m?.key
          })
        )
      })
    }else{
      list.map(m=>{
        formArr?.push(
          this.fb.group({
            isCheck: false,
            name: m?.name,
            key: m?.key
          })
        )
      })
    }
    formArr?.controls?.map(m=>{
      m?.get('isCheck')?.valueChanges.subscribe(()=>{
        this.changeFilter();
      })
    })
  }

  patchFormArray(name, keys:any[],lists:any[]){
    const formArr = this.formFilter?.get(name) as FormArray
    while(formArr.length>0){
      formArr.removeAt(0)
    }
    lists.map(m=>{
      if(keys?.find(f=>f === m?.key)){
        formArr.push(
          this.fb.group({
            isCheck: true,
            name: m?.name,
            key: m?.key
          })
        )
      }
      else{
        formArr?.push(
          this.fb.group({
            isCheck: false,
            name: m?.name,
            key: m?.key
          })
        )
      }
    })
    formArr?.controls?.map(m=>{
      m?.get('isCheck')?.valueChanges.subscribe(()=>{
        this.changeFilter();
      })
    })
  }

  changeFilter(){
    const quarterPlaning = this.formFilter.get('quarterPlaning') as FormArray;
    const budget = this.formFilter.get('budget') as FormArray;
    const programLevel = this.formFilter.get('programLevel') as FormArray;

    const quarterPlaningKeys = quarterPlaning?.controls?.filter(f=>f?.get('isCheck')?.value).map(m=>m?.get('key')?.value)
    const budgetKeys = budget?.controls?.filter(f=>f?.get('isCheck')?.value).map(m=>m?.get('key')?.value)
    const programLevelKeys = programLevel?.controls?.filter(f=>f?.get('isCheck')?.value).map(m=>m?.get('key')?.value)

    this.patchFormArray('quarterPlaning',quarterPlaningKeys,this.quaters)
    this.patchFormArray('budget',budgetKeys,this.budget)
    this.patchFormArray('programLevel',programLevelKeys,this.programLevel)

    const query = {
      activityKey: this.queryParams?.activityKey || null,
      budget: budgetKeys.length > 0 ? JSON.stringify(budgetKeys) : null,
      programLevel: programLevelKeys.length > 0 ? JSON.stringify(programLevelKeys) : null,
      quarterPlaningKey: quarterPlaningKeys.length > 0 ? JSON.stringify(quarterPlaningKeys) : null,
    };

    this.store.queryParams = query

    this.router.navigate([`/planing/programs/${this.store.originalProjectKey}/reports`], { queryParams: query })

  }

  debug(){
  }

  trackFn(index: number) {
    return index;
  }
}
