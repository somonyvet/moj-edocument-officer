import { ActivatedRoute } from '@angular/router';
import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { tabs } from 'src/app/dummy/tabs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStore } from 'src/app/stores/auth.store';
import { LEVEL_MME, PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { DescribeActivitiesFormComponent } from './describe-activities-form/describe-activities-form.component';
import { MmeSubActivitiesStore } from 'src/app/stores/document/mme-sub-activities.store';


@Component({
    selector: 'app-describe-activities',
    templateUrl: './describe-activities.component.html',
    styleUrls: ['./describe-activities.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DescribeActivitiesComponent implements OnInit {
  title = 'បរិយាយសកម្មភាព';
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
    public dialogRef: MatDialogRef<DescribeActivitiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: MmeSubActivitiesStore,
    private route: ActivatedRoute
  ) {

  }

  async ngOnInit(): Promise<void> {
    const { parentKey } = this.data
    this.id = parentKey;
    const item = this.ds.mmeProgramRef(null, LEVEL_MME.desc_activities, this.id).valueChanges().subscribe( res => {
      this.dataMainProgram = res.map((m, index) => ({ ...m, index: index + 1 }));
    })

  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  // create(item?: any) {
  //   const dialogRef = this.dialog.open(DescribeActivitiesFormComponent, {
  //     data: { item: item, parentKey: this.id, arrData: this.dataMainProgram},
  //     panelClass: 'cs-dialog-wrapper',
  //     width: '980px',
  //     height: '96vh',
  //     disableClose: true,
  //     role: 'dialog',
  //     autoFocus: false,
  //   })
  //   dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  // }

  create(item?: any) {
    const { data } = this.data
    const dialogRef = this.dialog.open(DescribeActivitiesFormComponent, {
      data: { item: item, data: data, parentKey: this.id, arrData: this.dataMainProgram },
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

}
