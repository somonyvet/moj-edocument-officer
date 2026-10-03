import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-approval',
  templateUrl: './confirm-approval.component.html',
  styleUrls: ['./confirm-approval.component.scss']
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
