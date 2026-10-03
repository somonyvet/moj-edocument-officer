import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-share-file',
  templateUrl: './delete-share-file.component.html',
  styleUrls: ['./delete-share-file.component.scss']
})
export class DeleteShareFileComponent implements OnInit {

  msg: any;

  constructor(
    public dialogRef: MatDialogRef<DeleteShareFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.msg = this.data;
  }

  onClose() {
    this.dialogRef.close('no')
  }

}
