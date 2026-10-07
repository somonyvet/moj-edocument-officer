import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { IInstitution } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { InstitutionStore } from 'src/app/stores/document/institution.store';
import { InstitutionFormComponent } from './institution-form/institution-form.component';

@Component({
    selector: 'app-institution',
    templateUrl: './institution.component.html',
    styleUrls: ['./institution.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class InstitutionComponent implements OnInit {

  tabs = tabs.institutions;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;

  constructor(
    private dialog: MatDialog,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store : InstitutionStore,
  ) { }

  ngOnInit(): void {
    this.store.fetchData()
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  create(item?: any){
    const dialogRef = this.dialog.open(InstitutionFormComponent,{
      data: { item: item},
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus:false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  delete(item: IInstitution) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.displayName, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result==="yes") {
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
