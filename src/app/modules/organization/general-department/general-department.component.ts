import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'ngx-virtual-scroller';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { IDepartment } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { GeneralDepartmentStore } from 'src/app/stores/document/general-department.store';
import { GeneralDepartmentFormComponent } from './general-department-form/general-department-form.component';

@Component({
  selector: 'app-general-department',
  templateUrl: './general-department.component.html',
  styleUrls: ['./general-department.component.scss']
})
export class GeneralDepartmentComponent implements OnInit, OnDestroy {
  tabs = tabs.generalDepartment
  URL: string = PHOTO_LIB.EMPTY;

  constructor(
    public store: GeneralDepartmentStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DataService,
  ) { }

  ngOnInit(): void {
    this.store.fetchData(this.auth.config)
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore(this.auth.config)
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(GeneralDepartmentFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: IDepartment) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.key) {
        this.store.save({ ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }, (success, res) => {
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
