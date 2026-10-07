import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { tabs } from 'src/app/dummy/tabs';
import { IRemarkOfficer } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { RemarkStore } from 'src/app/stores/document/remark.store';
import { RemarkFormComponent } from './remark-form/remark-form.component';
@Component({
    selector: 'app-remark-document',
    templateUrl: './remark-document.component.html',
    styleUrls: ['./remark-document.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RemarkDocumentComponent implements OnInit, OnDestroy {
  tabs = tabs.remarks
  remarkData: any[] = [];
  uid;

  constructor(
    // public store: RemarkStore,
    public store: OfficerStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    // private ds: DataService,
    private ds: DatabaseService,
    public st: DocumentStore
  ) { }

  ngOnInit(): void {
    this.store.fetchData()
    const { employee } = this.auth;

    if(employee){
      this.uid = employee.key;
      this.st.fetchRemarkTextOfficer(employee.key, res => {
        this.remarkData = res;
      });
    }

  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(RemarkFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: IRemarkOfficer) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteRemark(this.ds.remarkTextRef().doc(this.uid).collection('remarkTexts'), item, (success, error) => {
          if (success) {
            this.snackBar.open(`ចំណារបានលុបដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          } else {
            this.snackBar.open(error, "យល់ព្រម");
          }
        })
      }
    })
  }

}
