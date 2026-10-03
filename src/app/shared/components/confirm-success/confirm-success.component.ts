import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-success',
  templateUrl: './confirm-success.component.html',
  styleUrls: ['./confirm-success.component.scss']
})
export class ConfirmSuccessComponent implements OnInit {
  msg: any;
  constructor(public dialogRef: MatDialogRef<ConfirmSuccessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.msg = this.data;
  }

  onClose(result){
    this.dialogRef.close(result)
  }
}
