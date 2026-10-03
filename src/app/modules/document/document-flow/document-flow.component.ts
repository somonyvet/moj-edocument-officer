import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FLOW_TYPE_OBJECT } from 'src/app/dummy/config';
import { IRanking } from 'src/app/interfaces/document/document.interface';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentDepartmentFormComponent } from '../document-department-form/document-department-form.component';

@Component({
  selector: 'app-document-flow',
  templateUrl: './document-flow.component.html',
  styleUrls: ['./document-flow.component.scss']
})
export class DocumentFlowComponent implements OnInit {
  managementLevel: any[] = [];
  FLOW_TYPE_OBJECT = FLOW_TYPE_OBJECT

  constructor(public auth: AuthStore,
    private dialog: MatDialog,
    public store: DocumentStore) { }

  async ngOnInit(): Promise<void> {
    const { documentDataDoc } = this.store;
    this.managementLevel = await this.store.fetchManagementLevel();
    this.store.fetchFileStream(documentDataDoc.key,null)
  }

  onIncomingStream(level: IRanking, flowTypeObject: any,item?:any) {
    const dialogRef = this.dialog.open(DocumentDepartmentFormComponent, {
      data: { item: item ||null, flowTypeObject: flowTypeObject,level:level },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }
}
