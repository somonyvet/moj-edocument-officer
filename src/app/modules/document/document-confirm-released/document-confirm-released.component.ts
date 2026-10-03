import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-document-confirm-released',
  templateUrl: './document-confirm-released.component.html',
  styleUrls: ['./document-confirm-released.component.scss']
})
export class DocumentConfirmReleasedComponent implements OnInit {
  title: any = "ដាក់សំណើឯកភាព";

  constructor(
    public dialogRef: MatDialogRef<DocumentConfirmReleasedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    if (this.data)
      this.title = this.data.title;
  }

  _onSave() {
    this.dialogRef.close('yes')
  }

}
