import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-document-confirm-submitted',
  templateUrl: './document-confirm-submitted.component.html',
  styleUrls: ['./document-confirm-submitted.component.scss']
})
export class DocumentConfirmSubmittedComponent implements OnInit {
  title: string = "";

  constructor(
    public dialogRef: MatDialogRef<DocumentConfirmSubmittedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
   const {name}=this.data;
   this.title=name;
  }

  _onSave() {
    this.dialogRef.close('yes')
  }

}
