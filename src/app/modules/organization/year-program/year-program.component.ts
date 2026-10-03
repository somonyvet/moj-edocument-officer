  import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'ngx-virtual-scroller';
import { tabs } from 'src/app/dummy/tabs';
import { IRemarkOfficer, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { RemarkStore } from 'src/app/stores/document/remark.store';
import { YearProgramFormComponent } from './year-program-form/year-program-form.component';
@Component({
  selector: 'app-year-program',
  templateUrl: './year-program.component.html',
  styleUrls: ['./year-program.component.scss']
})
export class YearProgramComponent implements OnInit {
  tabs = tabs.mmeYearProgram

  constructor(
    public store: MmeProgramStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DataService,
  ) { }

  ngOnInit(): void {
    this.store.fetchYearData()
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(YearProgramFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: IYearProgram) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.saveYear({ ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }, (success, res) => {
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
