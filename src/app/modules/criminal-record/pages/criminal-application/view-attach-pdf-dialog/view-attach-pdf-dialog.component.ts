import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-attach-pdf-dialog',
  templateUrl: './view-attach-pdf-dialog.component.html',
  styleUrls: ['./view-attach-pdf-dialog.component.scss']
})
export class ViewAttachPdfDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ViewAttachPdfDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
  }

}
