import { DatabaseService } from 'src/app/shared/services/database.service';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tabs } from 'src/app/dummy/tabs';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AchievementStatusFormComponent } from './achievement-status-form/achievement-status-form.component';
import { AchievementStatusStore } from '../../../store/achievementStatus.store';

@Component({
    selector: 'app-achievement-status',
    templateUrl: './achievement-status.component.html',
    styleUrls: ['./achievement-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AchievementStatusComponent implements OnInit,OnDestroy {
  tabs = tabs.planingAchievement
  constructor(
    public store: AchievementStatusStore,
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
    const dialogRef = this.dialog.open(AchievementStatusFormComponent, {
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
