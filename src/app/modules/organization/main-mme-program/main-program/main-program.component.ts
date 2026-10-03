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
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { IMmeProgram } from 'src/app/interfaces/mme';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MainProgramFormComponent } from './main-program-form/main-program-form.component';
import { MmeBaseProgramStore } from 'src/app/stores/document/mme_program.store';

@Component({
  selector: 'app-main-program',
  templateUrl: './main-program.component.html',
  styleUrls: ['./main-program.component.scss']
})
export class MainProgramComponent implements OnInit {
  tabs = tabs.mmeProgram;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  dataMainProgram: any[] = [];

  constructor(
    private dialog: MatDialog,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: MmeBaseProgramStore,
  ) { }

  ngOnInit(): void {
    // this.store.fetchData(this.ds.mmeProgramRef(null, null), ref => {
    // });

    this.store.fetchData()
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(MainProgramFormComponent, {
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
    // const itemData = { ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result === "yes") {
    //     this.store.save(this.ds.programRef(), itemData, (success, res) => {
    //       if (success) {
    //         this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
    //       } else {
    //         alert(res);
    //       }
    //     })
    //   }
    // })
  }

}
