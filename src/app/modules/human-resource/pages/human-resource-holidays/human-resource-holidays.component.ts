import { MatSnackBar } from '@angular/material/snack-bar';
import { IHoliday } from 'src/app/interfaces/attendance';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { HrHolidayStore } from '../../stores/hr-holiday.store';
import { HrHolidayFormComponent } from './human-resource-holidays-form/human-resource-holidays-form.component';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-human-resource-holidays',
    templateUrl: './human-resource-holidays.component.html',
    styleUrls: ['./human-resource-holidays.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceHolidaysComponent implements OnInit {
  title = "បញ្ជីថ្ងៃឈប់សម្រាក";

  constructor(
    public store: HrHolidayStore,
    private dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.store.fetchHrHolidays();
  }

  async fetchMore(event): Promise<void> {
    await this.store.fetchMoreHrHolidays();
  }

  createOrUpdate(item?: any) {
    const dialogRef = this.dialog.open(HrHolidayFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _onDelete(item: IHoliday) {
    const ref = this.dialog.open(DeleteComponent, {
      data: { isDelete: false, name: 'ថ្ងៃឈប់សម្រាក', memo: `តើលោកអ្នកចង់លុបថ្ងៃឈប់សម្រាកនេះចេញពីប្រព័ន្ធមែនទេ?` },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.save({
          key: item.key,
          deletedAt: new Date(),
          deletedBy: this.auth.User,
          isDeleted: true,
        }, (success, error) => {
          if (success) {
            this.snackBar.open(`ថ្ងៃសម្រាកត្រូវបានលុបចេញពីប្រព័ន្ធដោយជោគជ័យ`, "បិទ", { duration: 1000 });
          } else {
            alert(error);
          }
        })
      }
    })
  }
}