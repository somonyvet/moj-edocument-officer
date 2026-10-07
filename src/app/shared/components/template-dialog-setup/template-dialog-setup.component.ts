import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toJS } from 'mobx';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocTemplateStore } from 'src/app/stores/document/doc-template.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { pushToArray } from '../../services/convert.service';
import { DataService } from '../../services/data.service';
import { DatabaseService } from '../../services/database.service';

@Component({
    selector: 'app-template-dialog-setup',
    templateUrl: './template-dialog-setup.component.html',
    styleUrls: ['./template-dialog-setup.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TemplateDialogSetupComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TemplateDialogSetupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: DocTemplateStore,
    public docStore: DocumentStore,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DatabaseService,
    public dialog: MatDialog,
    
  ) { }

  async ngOnInit(): Promise<void> {
    const { Template, Doc } = this.data;
    if (Template && Doc) {
      const templateSection = pushToArray(await this.ds.documentTemplateRef().doc(Template.key).collection('sections').get().toPromise());
      const headerData = templateSection.filter(m => m.isHeader === true)
      const detailData = templateSection.filter(m => m.isHeader === false)
      let newArray = []
      headerData.map(m => {
        const headerDetail = detailData.filter(d => d.sectionKey === m.key)

        const newHeaderKey = this.ds.createId()
        const newHeader = {
          ...m,
          sectionKey: newHeaderKey,
          key: newHeaderKey,
          id:newHeaderKey,
        }

        newArray.push(newHeader)

        if (headerDetail && headerDetail.length > 0) {

          headerDetail.map(hd => {
            const { office } = hd
            const hdData = {
              ...hd,
              sectionKey: newHeaderKey,
              id:`${newHeaderKey}_${office.key}`,
              key: `${newHeaderKey}_${office.key}`
            }

            newArray.push(hdData)
          })
        }
      })
      this.onSetTemplate(Doc,Template,newArray)
    }
  }

  onSetTemplate(data,Template, section) {
    this.store.addDocumentTemplate(data,Template,section, async (success, res) => {
      // this.process = false;
      if (success) {
        window.location.reload();
        this.dialogRef.close();
        this.snackBar.open(`Document template has been setup successful.`, "Done", {
          duration: 1000,
          verticalPosition: 'bottom',
          horizontalPosition: 'end',
        });

      } else {
        this.dialogRef.close();
        this.snackBar.open(`Document template setup fail.`, "Done", {
          duration: 1000,
          verticalPosition: 'bottom',
          horizontalPosition: 'end',
        });
        alert(res)
      }
    })
  
  }

}
