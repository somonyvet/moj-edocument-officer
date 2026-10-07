import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { IEcosystem } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { EcosystemStore } from 'src/app/stores/document/ecosystem.store';
import { EcosystemFormComponent } from './ecosystem-form/ecosystem-form.component';

@Component({
    selector: 'app-ecosystem-apps',
    templateUrl: './ecosystem-apps.component.html',
    styleUrls: ['./ecosystem-apps.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class EcosystemAppsComponent implements OnInit {
  tabs = tabs.ecosystem
  URL: string = PHOTO_LIB.EMPTY;

  constructor(
    public store: EcosystemStore,
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
    const dialogRef = this.dialog.open(EcosystemFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: IEcosystem) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result==='yes') {
        this.store.delete(item).then(() => {
          this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
        }).catch(err => {
          alert(err)
        })
      }
    })
  }

}
