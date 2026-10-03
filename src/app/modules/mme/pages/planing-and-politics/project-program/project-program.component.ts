import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ANNUAL_PROJECT_COLUMNS, PROJECT_STATUS_OBJECT } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { YearProgramFormComponent } from 'src/app/modules/organization/year-program/year-program-form/year-program-form.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';
import { ProjectActivationFormComponent } from '../project-activation-form/project-activation-form.component';

@Component({
  selector: 'app-project-program',
  templateUrl: './project-program.component.html',
  styleUrls: ['./project-program.component.scss']
})
export class ProjectProgramComponent implements OnInit, OnDestroy {
  tabs = tabs.annual_project_planing
  queryParams: any = null;
  params:any=null;

  loading: boolean = true;
  loadingForm:boolean=true;
  loadingActivities: boolean = true;

  PROJECT_STATUS_OBJECT = PROJECT_STATUS_OBJECT;
  ANNUAL_PROJECT_COLUMNS = ANNUAL_PROJECT_COLUMNS;

  isViewMoreIndicator = false;
  projectProgramList = null;
  sidebarHeaderOptions = null;

  queryParamsSubscription: Subscription = null;
  isShowMME : boolean = true;
  isShowMEF : boolean = true;

  programLevelFilter: any[];

  constructor(public auth: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public store: ProjectStore) { }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.store.originalProjectKey = params.projectKey;
      const projectKey = params?.projectKey !== 'na' ? params.projectKey : null;
      this.tabs = this.tabs.map(m => ({ ...m, path: `/planing/programs/${projectKey}/${m?.key}` }))
      this.params = params;
      const { planing } = this.auth;
      if (planing) {
        const planingKey = projectKey || planing?.key;
        this.store.fetchAnnualProjectPlaning(planingKey, async res => {
          this.sidebarHeaderOptions = {
            title : `ផែនការអនុម័តប្រចាំឆ្នាំ ${this.store?.selectedPlaning?.year} · ${this.store?.selectedPlaning?.name}`,
            subTitle : this.store?.selectedPlaning?.name,
            isSetting : true,
            dotStatus : this.store?.selectedPlaning?.projectStatus?.color
          }
          this.queryParamsSubscription && this.queryParamsSubscription.unsubscribe();
          this.queryParamsSubscription = this.route.queryParams.subscribe(async queryParams => {
            const { activityKey, quarterPlaningKey, programLevel, budget } = queryParams;
            this.loadingForm=true;
            this.loadingActivities= true;
            const quarterPlaningKeys = quarterPlaningKey ? JSON.parse(quarterPlaningKey) : [];
            const programLevelKeys = programLevel ? JSON.parse(programLevel) : [];
            const budgetKeys = budget ? JSON.parse(budget) : [];
            if(budgetKeys?.length===1){
              budgetKeys[0] === 'mme'? this.isShowMEF = false : this.isShowMME = false;
            }else{
              this.isShowMEF = true;
              this.isShowMME = true;
            }
            if(programLevelKeys?.length>0){
              this.programLevelFilter = programLevelKeys.map(m=>parseInt(m, 10))
            }else{
              this.programLevelFilter = [1,2,3,4,5]
            }
            const query = {
              ...this.store.queryParams,
              activityKey: activityKey || null,
            };

            this.store.queryParams = query;

            await this.store.fetchProjectQuarters(planingKey, quarterPlaningKeys, [], [], false,false);
            this.store.fetchActivitiesAnnualProject(planingKey, activityKey || null, res => {
              this.loading = false;
              this.loadingForm=false;
              this.loadingActivities=false;
            })
          })

        })
        this.store.fetchAllPlaningData(planingKey,res=>{
          this.projectProgramList = res
        })
      }else{
        this.store.selectedPlaning=null;
        this.loading = false;
        this.loadingForm=false;
        this.loadingActivities=false;
      }
    })
  }


  ngOnDestroy(): void {
    this.store.queryParams = null;
    this.store.subscribeFetchAnnualProjectPlaning()
  }

  _onPublicAnnualProject() {
    const { selectedPlaning, activities } = this.store;

    this.dialog.open(ProjectActivationFormComponent, {
      data: { project: selectedPlaning, queryParams: this.queryParams },
      disableClose: true,
      role: 'dialog',
    })
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(YearProgramFormComponent, {
      data: { item: item, req: 1 },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  onSelectedSearchItem(event) {
    this.router.navigate(
      ['planing/programs/' + event?.project?.key + '/activities'],
      { queryParams: { quarterPlaningKeys: this.queryParams?.quarterPlaningKeys, quarterKeys: this.queryParams?.quarterKeys, monthlyKeys: this.queryParams?.monthlyKeys, activityKey: event?.key } }
    )
  }
  onChangePlan(event) {
    this.router.navigate(['planing/programs/' + event?.key + '/activities'])
  }


}
