import { HRPregnancyBreakFormComponent } from './human-resource-pregnancy-break-form/human-resource-pregnancy-break-form.component';
import { HrPregnancyBreakStore } from './../../stores/hr-pregnancy-break.store';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStore } from 'src/app/stores/auth.store';
import { khmerNumberToEN, toLocaleNumber } from 'src/app/shared/services/convert.service';

@Component({
  selector: 'app-human-resource-pregnancy-break',
  templateUrl: './human-resource-pregnancy-break.component.html',
  styleUrls: ['./human-resource-pregnancy-break.component.scss']
})
export class HumanResourcePregnancyBreakComponent implements OnInit {
  title = "បញ្ជីមន្ត្រីសម្រាកមានផ្ទៃពោះ";
  URL: any = PHOTO_LIB.EMPTY_PHOTO;

  constructor(
    public store: HrPregnancyBreakStore,
    private dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.store.fetchHrPregnancyBreaks();

  }

  async fetchMore(event): Promise<void> {
    await this.store.fetchMoreHrPregnancyBreaks();
  }

  createOrEdit(item?: any) {
    const dialogRef = this.dialog.open(HRPregnancyBreakFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  toKhmerNumber(num: number) {
    return toLocaleNumber(num);
  }

  _onDelete(item: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { isDelete: true, warning: true, name: "លុបទិន្នន័យ", memo: "កំណត់ត្រានេះនឹងត្រូវបានលុបចេញពីប្រព័ន្ធ។ តើអ្នកប្រាកដទេថាអ្នកចង់លុប?", },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === "yes") {
        this.store.save({
          key: item.key,
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: this.auth.User,
        }, (isSuccess, error) => {
          if (isSuccess) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(error);
          }
        });
      }
    })

  }

}
