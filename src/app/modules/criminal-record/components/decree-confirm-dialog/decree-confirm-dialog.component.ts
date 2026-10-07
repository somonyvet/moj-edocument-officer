import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-decree-confirm-dialog',
    templateUrl: './decree-confirm-dialog.component.html',
    styleUrls: ['./decree-confirm-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DecreeConfirmDialogComponent implements OnInit {
  msg: any;

  constructor(public dialogRef: MatDialogRef<DecreeConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.msg = this.data;
  }

  onClose(result){
    this.dialogRef.close(result)
  }

}
