import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmApprovalComponent } from 'src/app/shared/components/confirm-approval/confirm-approval.component';
import { UserAccountStore } from 'src/app/stores/userAccount.store';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss']
})
export class ImportDataComponent implements OnInit {
  @ViewChild('table') table: ElementRef;

  constructor(
    public store: UserAccountStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit(): Promise<void> {
    // await this.store.fetchUser()
    // await this.store.fetchDocument()
    // await this.store.fetchResolve()
    await this.store.fetchCRToDraft()
  }

  _onClear() {
    this.store.excelData = [];
  }

  create() {

    if (this.store.excelData.length === 0) return;
    const dialogRef = this.dialog.open(ConfirmApprovalComponent, {
      data: {
        title: 'Import users',
        subtitle: 'Please check all user if there have issue with at least one user you cannot import!',
      },
      width: '680px',
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.store.importUser(this.store.excelData, (success, error) => {
          if (success) {
            this.snackBar.open('Data have been imported successfully.', 'Done', { duration: 2000 })
          } else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    })

  }

  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement, { raw: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'បញ្ជីទិន្នន័យអ្នកបើកបរ និងអ្នករួមដំណើរ.xlsx');
  }

}

