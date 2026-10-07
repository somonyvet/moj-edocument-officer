import { pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { ActivatedRoute } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { tabs } from 'src/app/dummy/tabs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { LEVEL_MME, PHOTO_LIB } from 'src/app/dummy/appinfo';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { IMmeProgram, IMmeSubProgram } from 'src/app/interfaces/mme';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MmeSubProgramStore } from 'src/app/stores/document/mme-sub-program.store';
import { FirstQuarterComponent } from './first-quarter/first-quarter.component';
import { SecondQuarterComponent } from './second-quarter/second-quarter.component';
import { ThirdQuarterComponent } from './third-quarter/third-quarter.component';
import { FourthQuarterComponent } from './fourth-quarter/fourth-quarter.component';
// import { DescribeActivitiesFormComponent } from './describe-activities-form/describe-activities-form.component';


@Component({
    selector: 'app-indicators',
    templateUrl: './indicators.component.html',
    styleUrls: ['./indicators.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class IndicatorsComponent implements OnInit {
  title = 'សូចនាករ';
  tabs = tabs.mmeProgram;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  dataMainProgram: any[] = [];
  mainProgram: any;
  submainProgram: any;
  mainActivitiesProgram: any;
  clusterProgram: any;
  idParent: string;
  id: string;
  ITEM: any;

  constructor(
    public dialogRef: MatDialogRef<IndicatorsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: MmeSubProgramStore,
    private route: ActivatedRoute
  ) {
    const { item } = this.data
    if(item){
      this.id = item.key;
      this.ds.mmeProgramRef(null, null, null, this.id).valueChanges().subscribe(res => {
        this.dataMainProgram = res.map((m, index) => ({ ...m, index: index + 1 }));
        this.dataMainProgram.forEach(m => {
          this.ITEM = m
        })
      })
    }
  }

  ngOnInit(){


  }

  // ngOnDestroy(): void {
  //   this.store.unsubscribe()
  // }

  // create(item?: any) {
  //   const dialogRef = this.dialog.open(DescribeActivitiesFormComponent, {
  //     data: { item: item, parentKey: this.id, arrData: this.dataMainProgram },
  //     panelClass: 'cs-dialog-wrapper',
  //     width: '980px',
  //     height: '96vh',
  //     disableClose: true,
  //     role: 'dialog',
  //     autoFocus: false,
  //   })
  //   dialogRef.updatePosition({ top: '16px', right: '20px', bottom: '16px' });
  // }
  // desActi(item?: any) {
  //   const dialogRef = this.dialog.open(DescribeActivitiesComponent, {
  //     data: { item: item, parentKey: this.id },
  //     panelClass: 'cs-dialog-wrapper',
  //     width: '1080px',
  //     height: '96vh',
  //     disableClose: true,
  //     role: 'dialog',
  //     autoFocus: false,
  //   })
  //   dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  // }

  _onScroll(event: IPageInfo) {
    // if (event.endIndex !== this.store.data.length - 1) return;
    // this.store.fetchMore()
  }

  delete(item: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.displayName, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    // const itemData = { ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.store.delete(this.ds.mmeProgramRef(), item, (success, res) => {
          if (success) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(res);
          }
        })
      }
    })
  }

  goFirst(item?: any){
    const dialogRef = this.dialog.open(FirstQuarterComponent, {
      data: { item: this.ITEM, parentKey: this.id },
      panelClass: 'cs-dialog-wrapper',
      width: '980px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '58px', bottom: '16px' });
  }
  goSecond(item?: any) {
    const dialogRef = this.dialog.open(SecondQuarterComponent, {
      data: { item: this.ITEM, parentKey: this.id },
      panelClass: 'cs-dialog-wrapper',
      width: '980px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '58px', bottom: '16px' });
  }
  goThird(item?: any) {
    const dialogRef = this.dialog.open(ThirdQuarterComponent, {
      data: { item: this.ITEM, parentKey: this.id },
      panelClass: 'cs-dialog-wrapper',
      width: '980px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '58px', bottom: '16px' });
  }
  goForth(item?: any) {
    const dialogRef = this.dialog.open(FourthQuarterComponent, {
      data: { item: this.ITEM, parentKey: this.id },
      panelClass: 'cs-dialog-wrapper',
      width: '980px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '58px', bottom: '16px' });
  }
}
