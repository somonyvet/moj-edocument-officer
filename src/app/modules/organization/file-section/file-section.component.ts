import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'ngx-virtual-scroller';
import { tabs } from 'src/app/dummy/tabs';
import { ICategory } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { SectorStore } from 'src/app/stores/document/sector.store';
import { FileSectionFormComponent } from './file-section-form/file-section-form.component';

@Component({
  selector: 'app-file-section',
  templateUrl: './file-section.component.html',
  styleUrls: ['./file-section.component.scss']
})
export class FileSectionComponent implements OnInit, OnDestroy {
  tabs = tabs.sectors

  constructor(
    public store: SectorStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DataService,
  ) { }

  ngOnInit(): void {
    this.store.fetchData()
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(FileSectionFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: ICategory) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.save({ ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }, (success, res) => {
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
