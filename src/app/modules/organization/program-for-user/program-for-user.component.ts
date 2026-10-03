import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPageInfo } from 'ngx-virtual-scroller';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { tabs } from 'src/app/dummy/tabs';
import { MatDialog } from '@angular/material/dialog';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { LEVEL_MME, PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AddEditUserAccountComponent } from '../user-account/add-edit-user-account/add-edit-user-account.component';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { IMmeProgram } from 'src/app/interfaces/mme';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { ProgramForUserFormComponent } from './program-for-user-form/program-for-user-form.component';

@Component({
  selector: 'app-program-for-user',
  templateUrl: './program-for-user.component.html',
  styleUrls: ['./program-for-user.component.scss']
})
export class ProgramForUserComponent implements OnInit {
  tabs = tabs.mmeProgram;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  dataMainProgram: any[] = [];

  constructor(
    private dialog: MatDialog,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: MmeProgramStore,
  ) { }

  ngOnInit(): void {
    const { employee } = this.auth;
    this.store.fetchData(this.ds.mmeProgramRef(null, null, null, null, employee?.currentDepartment?.key), ref => {
    });
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(ProgramForUserFormComponent, {
      data: { item: item },
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
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  delete(item: IMmeProgram) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.displayName, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    const itemData = { ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.store.save(this.ds.mmeProgramRef(), itemData, (success, res) => {
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
