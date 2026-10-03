import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'ngx-virtual-scroller';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocTemplateStore } from 'src/app/stores/document/doc-template.store';
import { TemplateDocumentFormComponent } from './template-document-form/template-document-form.component';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit {


  constructor(
    private dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: DocTemplateStore,
  ) { }

  ngOnInit(): void {
    const { currentDepartment } = this.auth;
    this.store.fetchTemplateData(currentDepartment?.key);
  }

  ngOnDestroy(): void {
    this.store.unsubscribe()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    const { currentDepartment } = this.auth;
    this.store.fetchTemplateMore(currentDepartment?.key)
  }

  create(item) {
    const dialogRef = this.dialog.open(TemplateDocumentFormComponent, {
      data: { ITEM: item || null, headerDocument: null },
      role: 'dialog',
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item) {
    const { uid } = this.auth
    if (uid !== item.created_by) return
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { name: `គំរូ និងចរន្តឯកសារ ${item.documentName}`, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteTemplate(item, (success, res) => {
          if (success) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(res);
          }
        })
      }
    })
  }

}
