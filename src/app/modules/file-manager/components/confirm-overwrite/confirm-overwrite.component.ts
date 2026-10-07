import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-overwrite',
    templateUrl: './confirm-overwrite.component.html',
    styleUrls: ['./confirm-overwrite.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ConfirmOverwriteComponent implements OnInit {

  msg: any;

  constructor(
    public dialogRef: MatDialogRef<ConfirmOverwriteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.msg = this.data;
  }

  onClose() {
    this.dialogRef.close('no')
  }

}
