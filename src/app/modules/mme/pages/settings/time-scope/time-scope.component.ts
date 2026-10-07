import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tabs } from 'src/app/dummy/tabs';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { IQuarter } from '../../../interfaces/document.interface';
import { TimeScopeStore } from '../../../store/time_scope.store';
import { TimeScopeFormComponent } from './time-scope-form/time-scope-form.component';

@Component({
    selector: 'app-time-scope',
    templateUrl: './time-scope.component.html',
    styleUrls: ['./time-scope.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TimeScopeComponent implements OnInit, OnDestroy {
  tabs = tabs.quarter

  constructor(
    public store: TimeScopeStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.store.fetchData()
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(TimeScopeFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: IQuarter) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.delete(item).then(() => {
          this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
        }).catch(err => {
          alert(err)
        })
      }
    })
  }
}
