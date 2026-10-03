import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-application-edit-dialog',
  templateUrl: './criminal-application-edit-dialog.component.html',
  styleUrls: ['./criminal-application-edit-dialog.component.scss'],
})
export class CriminalApplicationEditDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<CriminalApplicationEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public criminalStore: CriminalApplicationStore,
  ) { }

  get title(): string {
    return this.data?.title || 'កែសម្រួលពាក្យស្នើសុំ';
  }

  get subtitle(): string {
    return this.data?.subtitle || null;
  }
}
