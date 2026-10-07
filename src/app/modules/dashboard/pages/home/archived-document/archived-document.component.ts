import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DocumentCompleteComponent } from 'src/app/modules/document/document-complete/document-complete.component';
import { orderBy, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
    selector: 'app-archived-document',
    templateUrl: './archived-document.component.html',
    styleUrls: ['./archived-document.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ArchivedDocumentComponent implements OnInit {

  workplaces: any = []
  isDocCompleted: boolean = false;
  loading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    public store: MemoStore,
    private auth: AuthStore,
    private ds: DatabaseService,
    public dialog: MatDialog,
    public documentStore: DocumentStore,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(async params => {
      this.loading = true;
      const { docKey } = params;

      const docs = await this.ds.documentRef().doc(docKey).collection('sections', ref => ref.where('isRejected', '==', false)).get().toPromise()
      this.workplaces = pushToArray(docs);
      this.workplaces = orderBy(this.workplaces.filter(f => (f?.isHeader === false) && (f?.type?.key == 8)), 'office.order')
      let temp = []

      await Promise.all(
        this.workplaces.map(async m => {
          const dItem = await this.ds.departmentFireRef().doc(m?.office?.key).get().toPromise()
          if (pushToObject(dItem)?.isWorkplace) temp.push(m)
        })
      )

      const parentItem = await this.store.fetchDocumentByParents(docKey)

      this.workplaces = temp.map(m => {
        const isCompleted = parentItem.filter(d => d.workplaceKeys && d.workplaceKeys.indexOf(m?.office?.key) !== -1).length > 0 ? true : false || false
        let docItem = parentItem.filter(d => d.workplaceKeys && d.workplaceKeys.indexOf(m?.office?.key) !== -1)
        docItem = MappingService.orderBy(docItem, 'created_at')

        return ({
          ...m,
          isCompleted: isCompleted,
          docKey: docItem && docItem.length > 0 ? docItem[0].key : null
        })
      })

      this.isDocCompleted = this.workplaces.filter(m => !m.isCompleted).length === 0 ? true : false
      this.loading = false;

      const { uid } = this.auth
      this.documentStore.fetchHeader(this.store?.documentParentDoc?.key, uid, doc=>{ })
    })
  }

  scroll(id) {
    let el = document.getElementById(id);
    el!.scrollIntoView();
  }

  completedDoc() {
    const dialogRef = this.dialog.open(DocumentCompleteComponent, {
      data: null,
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
