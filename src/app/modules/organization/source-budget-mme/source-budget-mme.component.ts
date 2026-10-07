import { DatabaseService } from 'src/app/shared/services/database.service';
import { SourceBudgetFormComponent } from './source-budget-form/source-budget-form.component';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { tabs } from 'src/app/dummy/tabs';
import { IRemarkOfficer, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { RemarkStore } from 'src/app/stores/document/remark.store';

@Component({
    selector: 'app-source-budget-mme',
    templateUrl: './source-budget-mme.component.html',
    styleUrls: ['./source-budget-mme.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SourceBudgetMmeComponent implements OnInit {
  tabs = tabs.mmeSourceBudget

  constructor(
    public store: MmeProgramStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DatabaseService,
  ) { }

  ngOnInit(): void {
    this.store.fetchData(this.ds.mmeSourceBudgetRef(), null);
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(SourceBudgetFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
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
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.delete(this.ds.mmeSourceBudgetRef(), item, (success, res) => {
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
