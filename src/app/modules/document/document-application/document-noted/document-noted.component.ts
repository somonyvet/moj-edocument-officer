import { Component, Inject, OnDestroy, OnInit, DOCUMENT, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { DOCUMENT_TYPE_OBJECT } from 'src/app/dummy/config';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { InboxFormComponent } from 'src/app/modules/inbox/inbox-form/inbox-form.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentFormComponent } from '../../document-form/document-form.component';


@Component({
    selector: 'app-document-noted',
    templateUrl: './document-noted.component.html',
    styleUrls: ['./document-noted.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentNotedComponent implements OnInit, OnDestroy {
  params: any;
  constructor(@Inject(DOCUMENT) public document: Document,
    public auth: AuthStore,
    public store: DocumentStore,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,) { }

  ngOnInit(): void {
    const { uid } = this.auth;
    this.route.parent.params.subscribe(params => {
      const { notedStatus } = params;
      this.params = params;
      this.route.queryParams.subscribe(params => {
        const { periodKey } = params;
        this.store.fetchHeaderDocument(null, uid, notedStatus, periodKey)
      })
    })
  }

  async _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.headerDocuments.length - 1) return;
    const { periodKey, notedStatus } = this.params;
    const { uid, currentDepartment } = this.auth
    await this.store.fetchMoreDocument(currentDepartment, uid, notedStatus, periodKey)
  }

  ngOnDestroy() {
    this.store.subscriptionFetchHeaderDocument()
  }

  onCreateDocument(item?: IHeaderInformation) {
    let form: any = item?.doc_type?.key === DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO?.key ? InboxFormComponent : DocumentFormComponent;
    this.dialog.open(form, {
      data: { item: item || null },
      panelClass: 'cs-dialog-doc',
      width: item?.doc_type?.key === DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO?.key ? '780px' : '680px',
      height: '580px',
      disableClose: true,
      role: 'dialog',
    });
  }

  delete(item: IHeaderInformation) {
    const ref = this.dialog.open(DeleteComponent, {
      data: { isDelete: true, name: item?.documentTitle, memo: `តើលោកអ្នកចង់លុបឯកសារនោះចេញពីប្រព័ន្ធមែនទេ` },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteDocument(item, this.auth.uid, (success, error) => {
          if (success) {
            this.snackBar.open(`Document has been deleted successful.`, "Done", { duration: 1000 });
          } else {
            alert(error)
          }
        })
      }
    })
  }

}
