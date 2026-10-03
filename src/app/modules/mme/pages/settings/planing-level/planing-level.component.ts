import { DatabaseService } from 'src/app/shared/services/database.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tabs } from 'src/app/dummy/tabs';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { PlaningLevelFormComponent } from './planing-level-form/planing-level-form.component';
import { PlaningCategoryStore } from '../../../store/planingCategory.store';

@Component({
  selector: 'app-planing-level',
  templateUrl: './planing-level.component.html',
  styleUrls: ['./planing-level.component.scss']
})
export class PlaningLevelComponent implements OnInit, OnDestroy {
  tabs = tabs.planingCategory
  constructor(
    public store: PlaningCategoryStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ds: DatabaseService,
  ) { }

  ngOnInit(): void {
    this.store.fetchData();
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(PlaningLevelFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.delete(item, (success, res) => {
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
