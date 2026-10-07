import { pushToArray } from 'src/app/shared/services/convert.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { tabs } from 'src/app/dummy/tabs';
import { MatDialog } from '@angular/material/dialog';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { LEVEL_MME, PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AddEditUserAccountComponent } from '../user-account/add-edit-user-account/add-edit-user-account.component';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { IMmeProgram, IMmeSubProgram } from 'src/app/interfaces/mme';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MmeSubProgramStore } from 'src/app/stores/document/mme-sub-program.store';
import { SubActivitiesFormComponent } from './sub-activities-form/sub-activities-form.component';
import { DescribeActivitiesComponent } from './describe-activities/describe-activities.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { MmeSubActivitiesStore } from 'src/app/stores/document/mme-sub-activities.store';


@Component({
    selector: 'app-sub-activities',
    templateUrl: './sub-activities.component.html',
    styleUrls: ['./sub-activities.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SubActivitiesComponent implements OnInit {
  tabs = tabs.mmeProgram;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  dataMainProgram: any[] = [];
  mainProgram: any;
  submainProgram: any;
  mainActivitiesProgram: any;
  clusterProgram: any;
  idParent: string;
  id: string;

  constructor(
    private dialog: MatDialog,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: MmeSubActivitiesStore,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(param => {
      this.id = param.mainid
      this.store.fetchData(this.ds.mmeProgramRef(null, LEVEL_MME.sub_activities, this.id), ref => {
        this.dataMainProgram = ref;
      });
    })
  }

  async ngOnInit(): Promise<void> {
    this.store.fetchMainActivites(this.id, ref => {
      this.store.fetchCluster(ref => {
        this.store.fetchSubParent(ref => {
          this.store.fetchParent(null)
        })
      })
    })

  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(SubActivitiesFormComponent, {
      data: { item: item, parentKey: this.id },
      panelClass: 'cs-dialog-wrapper',
      width: '980px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }
  desActi(item?: any) {
    const dialogRef = this.dialog.open(DescribeActivitiesComponent, {
      data: { item: item, parentKey: item?.key },
      panelClass: 'cs-dialog-wrapper',
      width: '1080px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  AddIndicators(item?: any){
    const dialogRef = this.dialog.open(IndicatorsComponent, {
      data: { item: item, parentKey: item?.key },
      panelClass: 'cs-dialog-wrapper',
      width: '1080px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  delete(item: IMmeSubProgram) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.displayName, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    const itemData = { ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.store.save(this.ds.mmeProgramRef(), itemData, (success, res) => {
          if (success) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(res);
          }
        })
      }
    })
  }

}
