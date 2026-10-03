import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { IProjectProgram } from 'src/app/interfaces/mme';
import { AddEditUserAccountComponent } from 'src/app/modules/organization/user-account/add-edit-user-account/add-edit-user-account.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';

@Component({
  selector: 'app-planing-and-politics-route',
  templateUrl: './planing-and-politics-route.component.html',
  styleUrls: ['./planing-and-politics-route.component.scss']
})
export class PlaningAndPoliticsRouteComponent implements OnInit, OnDestroy {

  loading: boolean = true;
  form: FormGroup;
  search: AbstractControl;
  params: any;

  projectProgramList = null;
  sidebarHeaderOptions: any = null;

  constructor(public auth: AuthStore,
    private route: ActivatedRoute,
    public store: ProjectStore,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
  ){}


  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.loading = true;
      const { currentDepartment } = this.auth;
      if (!currentDepartment?.planingOffice) {
        this.router.navigate([`/page-not-found`])
        return;
      }
      const { planingKey, parentKey } = params;
      this.params = params;
      await this.store.fetchPlaningData(planingKey, parentKey, res => {
        this.sidebarHeaderOptions = {
          title : `ផែនការអនុម័តប្រចាំឆ្នាំ ${this.store?.selectedPlaning?.year} · ${this.store?.selectedPlaning?.name}`,
          subTitle : this.store?.selectedCategory?.name,
          isSetting : true
        }
        this.loading = false;
      });
      this.store.fetchAllPlaningData(planingKey,res=>{
        this.projectProgramList = res
      })
    })
  }

  create(name : string){
    const path = this.router.url.split('?')[0]
    const dialogRef = this.dialog.open(AddEditUserAccountComponent,{
      data: { item: null, path: path, nameKey: name},
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _onDelete(item: IProjectProgram) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, isDelete: true, headerText: `លុប: ${item?.name}` },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result && result.key) {
        await this.store.delete(item).then(() => {
          this.snackBar.open(`${item?.name}ត្រូវបានលុបចេញពីប្រព័ន្ធដោយជោគជ័យ.`, "ជោគជ័យ", { duration: 1000 });
          this.router.navigate([`/planing/${this.params?.planingKey}/${this.params?.parentKey}/draft/form`])
        }).catch(err => {
          alert(err)
        }).finally(() => {

        })
      }
    })
  }

  onSelectedSearchItem(event){
    // this.router.navigate(['planing/'+event?.project?.key+'/'+ event?.key +'/draft/form'])
    this.router.navigate(['planing/'+event?.project?.key+'/'+ (event?.subOfProgram?.key || 'na') +'/'+ event?.key +'/form'])
  }
  onChangePlan(event){
    this.router.navigate([ 'planing/' + event?.key +"/na/draft/form" ])
  }

  ngOnDestroy(): void {
    this.store.subscribeFetchPlaningData()
  }

}
