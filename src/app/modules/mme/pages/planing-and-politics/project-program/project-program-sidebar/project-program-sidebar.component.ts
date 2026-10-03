import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { tabs } from 'src/app/dummy/tabs';
import { YearProgramFormComponent } from 'src/app/modules/organization/year-program/year-program-form/year-program-form.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DynamicFlatNode, ProjectDataSource, ProjectStore } from 'src/app/stores/project/project.store';
import { ProjectActivationFormComponent } from '../../project-activation-form/project-activation-form.component';

@Component({
  selector: 'app-project-program-sidebar',
  templateUrl: './project-program-sidebar.component.html',
  styleUrls: ['./project-program-sidebar.component.scss']
})
export class ProjectProgramSidebarComponent implements OnInit {
  tabs = tabs.program_planing


  treeControl: FlatTreeControl<DynamicFlatNode>;
  dataSource: ProjectDataSource;
  getLevel = (node: DynamicFlatNode) => node.level;
  isExpandable = (node: DynamicFlatNode) => node.expandable;
  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;
  loading: boolean = true;

  constructor(public auth: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: ProjectStore) { }

  async ngOnInit(): Promise<void> {

    this.route.params.subscribe(params=>{
      this.tabs = this.tabs.map(m => ({ ...m, path: `/planing/programs/${params.programKey}/${m.key}` }))
      const programKey = params?.programKey !== 'na' ? params.programKey : null;
    })

    // this.route.queryParams.subscribe(async queryParams => {
    //   if (queryParams?.annualProject || this.auth.planing) {
    //     const { planing } = this.auth;
    //     this.loading = true;
    //     const planingKey = queryParams?.annualProject || planing?.key;
    //     this.store.permissionAccessAnnualProject()
    //     await this.store.fetchRootLevelNodes(planingKey);
    //     this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    //     this.dataSource = new ProjectDataSource(this.treeControl, this.store);
    //     this.store.fetchProjectProgramsNodesListing(planingKey, res => {
    //       this.dataSource.data = this.store.initialData();
    //       this.loading = false;
    //     })
    //   }
    // })

    // if (!this.auth.planing) {
    //   this.route.firstChild.params.subscribe(async params => {
    //     if (!params?.id) {
    //       const annualProject = await this.store.fetchAnnualProject();
    //       if (annualProject) {
    //         this.router.navigate([`/planing/programs/${annualProject.key}/annual-project`])
    //       }
    //     }
    //   })
    //   this.loading = false;
    // }
    this.loading = false;
  }


  ngOnDestroy(): void {
    this.store.unsubscribeForm()
  }

  _onPublicAnnualProject() {
    const { planing } = this.auth;
    if (!planing) {
      return;
    }
    this.dialog.open(ProjectActivationFormComponent, {
      data: { project: planing },
      disableClose: true,
      role: 'dialog',
    })
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(YearProgramFormComponent, {
      data: { item: item,req:1 },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
