import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDocument } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { TemplateDocumentFormComponent } from '../template-document-form/template-document-form.component';

@Component({
  selector: 'app-template-document',
  templateUrl: './template-document.component.html',
  styleUrls: ['./template-document.component.scss']
})
export class TemplateDocumentComponent implements OnInit {

  constructor(public store: DocumentStore,
    public dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DatabaseService,) { }

  ngOnInit(): void {
  }

  onCreateDocument(item?:IDocument){
    const dialogRef = this.dialog.open(TemplateDocumentFormComponent, {
      data: { item: item || null },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
