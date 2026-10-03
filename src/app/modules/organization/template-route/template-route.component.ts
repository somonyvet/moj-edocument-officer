import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { tabs } from 'src/app/dummy/tabs';
import { TemplateDocumentFormComponent } from '../template/template-document-form/template-document-form.component';

@Component({
  selector: 'app-template-route',
  templateUrl: './template-route.component.html',
  styleUrls: ['./template-route.component.scss']
})
export class TemplateRouteComponent implements OnInit {
  tabs = tabs.templates

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  onCreateTemplateDocument(item?: any) {
    const dialogRef = this.dialog.open(TemplateDocumentFormComponent, {
      data: { item: item || null, headerDocument: null },
      role: 'dialog',
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }
}
