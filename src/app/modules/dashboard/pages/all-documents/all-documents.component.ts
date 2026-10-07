import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { DocumentFormComponent } from 'src/app/modules/document/document-form/document-form.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocListingStore } from 'src/app/stores/document/doc-listing.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-all-documents',
    templateUrl: './all-documents.component.html',
    styleUrls: ['./all-documents.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AllDocumentsComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  img = "../../../../../../assets/images/doc-cover.jpg";

  constructor(
    public store: DocumentStore,
    public auth: AuthStore,
    private dialog: MatDialog,
    public docListStore: DocListingStore,
  ) { }

  ngOnInit(): void {
    const { uid, currentDepartment } = this.auth;
    this.store.fetchApprovalDocument(uid)
    this.store.fetchOwnerDocument(uid, currentDepartment?.key || null)
    this.store.fetchDocumentInWorkPlace(uid, currentDepartment?.key, res => {
      this.loading = false;
    })
  }

  ngOnDestroy(): void {
    this.store.subscribeHome()
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.documentInWorkPlace.length - 1) return;
    const { uid, currentDepartment } = this.auth
    this.store.fetchDocumentInWorkPlaceMore(uid, currentDepartment?.key)
  }

  onCreateDocument(item?: IHeaderInformation) {
    this.dialog.open(DocumentFormComponent, {
      data: { item: item || null },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '780px',
      height: '580px',
      disableClose: true,
    });
  }

}
