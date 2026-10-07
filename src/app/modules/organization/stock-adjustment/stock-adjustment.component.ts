import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { MASTER_PAGES } from 'src/app/dummy/status';
import { tabs } from 'src/app/dummy/tabs';
import { IVisaType } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { BaseStore } from 'src/app/stores/base.store';

@Component({
    selector: 'app-stock-adjustment',
    templateUrl: './stock-adjustment.component.html',
    styleUrls: ['./stock-adjustment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StockAdjustmentComponent implements OnInit, OnDestroy {
  tabs = tabs.stockAdjustment

  params: any = null;
  constructor(
    public store: BaseStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.params = params;
      this.store.fetchData(this.ds.stockAdjustmentRef())
    })
  }

  onClick() {
    // this.store.updateData(this.store.data)
  }

  ngOnDestroy(): void {
    // this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    // this.store.fetchMore()
  }

  create(item?: any) {
    this.router.navigate([`/pages/inventory/stock-adjustment-form/${item ? item.key : 'draft'}`], { queryParams: { p: MASTER_PAGES.adjustment.key, t: (this.params && this.params.id) || 'all' } })
    // const dialogRef = this.dialog.open(PostFormComponent, {
    //   data: { item: item },
    //   panelClass: 'cs-dialog-wrapper',
    //   width: '680px',
    //   height: '96vh',
    //   disableClose: true,
    //   role: 'dialog',
    // });
    // dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: IVisaType) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.delete(this.ds.postRef(), item, (success, res) => {
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
