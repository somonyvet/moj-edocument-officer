import { pushToArray } from 'src/app/shared/services/convert.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPageInfo } from 'ngx-virtual-scroller';
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
import { MmeSubFormComponent } from './mme-sub-form/mme-sub-form.component';
import { MmeSubProgramStore } from 'src/app/stores/document/mme-sub-program.store';
import { DescribeActivitiesComponent } from '../sub-activities/describe-activities/describe-activities.component';
import { IndicatorsComponent } from '../sub-activities/indicators/indicators.component';
import { MmeSubActivitiesStore } from 'src/app/stores/document/mme-sub-activities.store';
import { MmeClusterActivitiesStore } from 'src/app/stores/document/mme-cluster-activities.store';

@Component({
  selector: 'app-mme-sub-program',
  templateUrl: './mme-sub-program.component.html',
  styleUrls: ['./mme-sub-program.component.scss']
})
export class MmeSubProgramComponent implements OnInit {
  tabs = tabs.mmeProgram;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  dataMainProgram: any[] = [];
  ArrayGetRanking: any[] = [];
  getRanking: any = null;
  parentData: any;
  idParent: string;
  key1: string;
  dataParent: any = null;
  dataKey1: any = null;
  key2: string;
  key3: string;

  constructor(
    private dialog: MatDialog,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: MmeSubProgramStore,
    private route: ActivatedRoute,
    public subPro: MmeSubProgramStore,
    public clusAct: MmeClusterActivitiesStore,
    public subAct: MmeSubActivitiesStore,
  ) {
    this.route.params.subscribe( param => {
      this.idParent = param.id
      this.store.fetchData(this.ds.mmeProgramRef(null, null, this.idParent), ref => {
        this.dataMainProgram = ref;
        this.ArrayGetRanking = this.dataMainProgram;
        this.ArrayGetRanking = this.ArrayGetRanking.map(m => m.ranking.key);
        this.dataMainProgram = this.dataMainProgram.filter( m => m.ranking.key !== 6);
        for(let item of this.ArrayGetRanking){
          this.getRanking = item;
        }
        this.subPro.fetchParent(this.ds.mmeProgramRef(), this.idParent, callback => {
          this.dataParent = callback;
        })

      });

      this.store.fetchParent(this.ds.mmeProgramRef(null, null), this.idParent, null);
    })
  }

  ngOnInit(): void {

  }

  breadcrumb(key: any){

  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(MmeSubFormComponent, {
      data: { item: item, parentKey: this.idParent},
      panelClass: 'cs-dialog-wrapper',
      width: '980px',
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
      data: { title: item.displayName, item: item},
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
  desActi(item?: any) {
    const dialogRef = this.dialog.open(DescribeActivitiesComponent, {
      data: { data: item, parentKey: item?.key },
      panelClass: 'cs-dialog-wrapper',
      width: '1080px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  AddIndicators(item?: any) {
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
}
