import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { InboxStore } from 'src/app/stores/document/index.store';
import { InboxFormComponent } from '../../inbox-form/inbox-form.component';

@Component({
    selector: 'app-inbox-document-noted',
    templateUrl: './inbox-document-noted.component.html',
    styleUrls: ['./inbox-document-noted.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class InboxDocumentNotedComponent implements OnInit, OnDestroy {
  loading: boolean = true;

  constructor(public auth: AuthStore,
    public store: InboxStore,
    private dialog: MatDialog,
    private doc: DocumentStore,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,) { }

  ngOnInit(): void {
    const { uid } = this.auth;
    this.route.params.subscribe(params => {
      const { selectedDepartment } = this.store;
      this.store.fetchInboxDocumentNoted(selectedDepartment?.key, uid, res => {
        this.loading = false;
      })
    })
  }

  ngOnDestroy() {
    this.store.unsubscribeInboxDocumentNotedRef()
  }

  async _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.documentNotedList.length - 1) return;
    const { uid, currentDepartment } = this.auth
    await this.store.fetchMore(currentDepartment?.key, uid)
  }

  onCreateDocument(item?: IHeaderInformation) {
    this.dialog.open(InboxFormComponent, {
      data: { item: item || null },
      panelClass: 'cs-dialog-doc',
      width: '500px',
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
        this.doc.deleteDocument(item, this.auth.uid, (success, error) => {
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
