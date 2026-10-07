import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentReportFormComponent } from '../document-report-form/document-report-form.component';

@Component({
    selector: 'app-document-application-form-workplaces',
    templateUrl: './document-application-form-workplaces.component.html',
    styleUrls: ['./document-application-form-workplaces.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationFormWorkplacesComponent implements OnInit {

  constructor(
    public store: DocumentStore,
    private storage: FireStorageService,
    private dialog: MatDialog,
    ) { }

  ngOnInit(): void {
  }

  _onReceivedReport(workplace: any) {
    const dialogRef = this.dialog.open(DocumentReportFormComponent, {
      data: workplace,
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'yes') {

      }
    })
  }

}
