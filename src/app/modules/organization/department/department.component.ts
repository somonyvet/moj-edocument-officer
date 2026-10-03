import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toJS } from 'mobx';
import { IPageInfo } from 'ngx-virtual-scroller';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { IDepartment } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { DepartmentFormComponent } from './department-form/department-form.component';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit, OnDestroy {
  tabs = tabs.department
  URL: any = PHOTO_LIB.EMPTY;

  constructor(
    public store: DepartmentStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DatabaseService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.store.fetchData()
    // this.ds.departmentFireRef(ref => ref
    //   .where('parent', 'array-contains', 'f9ZJZq6qiSKffRsm3FMh')
    //   .where('adminOffice', '==', true)
    //   .where('ranking.order', '>', 7).orderBy('ranking.order'))
    //   .valueChanges().subscribe(doc => {
    //   })
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    // if (event.endIndex !== this.store.data.length - 1) return;
    // this.store.fetchMore()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(DepartmentFormComponent, {
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
      if (result === "yes") {
        this.store.deleteDepartment(item, (success, res) => {
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
