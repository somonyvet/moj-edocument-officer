import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { FileInfo } from 'src/app/interfaces/attendance';
import { CRIMINAL_APPLICATION_LANGUAGE_OBJECT } from 'src/app/dummy/appinfo';
import { DOCUMENT_FLOW_CATEGORY } from '../../../dummy/criminal.dummy';

@Component({
    selector: 'app-criminal-application-fullview-dialog',
    templateUrl: './criminal-application-fullview-dialog.component.html',
    styleUrls: ['./criminal-application-fullview-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationFullviewDialogComponent implements OnInit {
  CRfiles = []

  CRIMINAL_APPLICATION_LANGUAGE = CRIMINAL_APPLICATION_LANGUAGE_OBJECT
  DOCUMENT_FLOW_CATEGORY = DOCUMENT_FLOW_CATEGORY

  constructor(
    public dialogRef: MatDialogRef<CriminalApplicationFullviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    const { selectedCriminalRecord } = this.criminalStore;
    this.CRfiles = [];
    if (selectedCriminalRecord) {
      const { attachments } = selectedCriminalRecord;
      const groupDoc: FileInfo[] = MappingService.groupBy(attachments || [], "docType.key", "docType.key");
      this.CRfiles = groupDoc.map(m => {
        const { docType } = m;
        const items = attachments.filter(r => r?.docType?.key === docType?.key)?.map((m: any) => ({ ...m, file_uri: m?.type === 'image' ? (m?.downloadUrl || null) : m?.downloadUrl || null }));
        return {
          ...docType,
          data: items?.filter(m => m?.file_uri),
        }
      })
      if(this.CRfiles[1]?.key==2){
        const temp = []
        temp.push(this.CRfiles[1]);
        temp.push(this.CRfiles[2]);
        temp.push(this.CRfiles[0]);
        this.CRfiles = temp;
      }
    }

  }

}
