import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { tabs } from 'src/app/dummy/tabs';
import { IYearProgram } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { YearProgramFormComponent } from './year-program-form/year-program-form.component';
@Component({
    selector: 'app-year-program',
    templateUrl: './year-program.component.html',
    styleUrls: ['./year-program.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class YearProgramComponent implements OnInit, OnDestroy {
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

  _onActive(item: IYearProgram) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { item: item, headerText:`ដាក់បញ្ចូលកម្មវិធីក្នុងផែនការប្រចាំឆ្នាំ: ${item?.name}`,remark:`ផែនការអនុម័តប្រចាំឆ្នាំនឹងចាប់ផ្ដើមដាក់ឲ្យបញ្ចូលកម្មវិធី`,button:`យលព្រម` },
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.key || result==='yes') {
        this.auth.setActivePlaning(item).then(() => {
          this.snackBar.open(`ផែនការអនុម័តប្រចាំឆ្នាំត្រូវបានដាក់ឲ្យចាប់ផ្ដើមដាក់បញ្ចូលកម្មវិធី.`, "ជោគជ័យ", { duration: 3000 });
        }).catch(error => {
          alert(error)
        })
      }
    })
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(YearProgramFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
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
      width: '580px',
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
