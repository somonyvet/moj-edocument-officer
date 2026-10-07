import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-approval',
    templateUrl: './confirm-approval.component.html',
    styleUrls: ['./confirm-approval.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ConfirmApprovalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmApprovalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  onClose() {
    this.dialogRef.close()
  }

}
