import { ConvertService } from './../../../../shared/services/convert.service';
import { AddEditWorkingHourComponent } from './add-edit-working-hour/add-edit-working-hour.component';
import { WorkingHourStore } from './../../stores/working-hour.store';
import { Component, OnInit, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';
import { tabs } from 'src/app/dummy/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
@Component({
  selector: 'app-human-resource-working-hour',
  templateUrl: './human-resource-working-hour.component.html',
  styleUrls: ['./human-resource-working-hour.component.scss']
})
export class HumanResourceWorkingHourComponent implements OnInit {
  tabs = tabs.working_hour;
  loadingSearch = false;

  constructor(
    public store: WorkingHourStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnInit() {
    this.onSearch(null);
  }

  ngOnDestory() {
    this.store.unsubscribe();
  }

  onSearch(value) {
    this.store.search(ConvertService.toNull(value));
  }

  getLocalNumber(num: number) {
    return toLocaleNumber(num);
  }

  createWorkingHour() {
    this.store.workingHour = null;
    this.dialog.open(AddEditWorkingHourComponent, {
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-overlay-panel',
      width: '780px',
      height: '',
      disableClose: true,
    });
  }

  editWorkingHour(workingHour) {
    this.store.workingHour = workingHour;
    this.dialog.open(AddEditWorkingHourComponent, {
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-overlay-panel',
      width: '780px',
      height: '',
      disableClose: true,
    });
  }

  deleteWorkingHour(item) {
    console.log('delete working hour');
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: {
        title: 'លុប',
        warning: true,
        memo: 'តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?'
      },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      disableClose: true,
      role: 'dialog',

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.store.createOrUpdateWorkingHour(item, true).then((isSuccess) => {
          this.snackBar.open(isSuccess ? `ម៉ោងធ្វើការត្រូវបានលុបដោយជោគជ័យ` : `បរាជ័យក្នុងការលុបទិន្នន័យ`, "បិទ", { duration: 3000 });
          this.router.navigate(['/hr/officers/working-hour']);
        });
      }
    })
  }

}
