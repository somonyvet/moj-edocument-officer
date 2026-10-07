import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { REPORT_PERIOD_OBJECT_ARRAY, WORKPLACE_FEATURES_ARRAY } from 'src/app/dummy/config';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocumentFormComponent } from '../document-form/document-form.component';

@Component({
    selector: 'app-document-application',
    templateUrl: './document-application.component.html',
    styleUrls: ['./document-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationComponent implements OnInit, OnDestroy, AfterViewChecked {
  REPORT_PERIOD_OBJECT_ARRAY = REPORT_PERIOD_OBJECT_ARRAY;
  WORKPLACE_FEATURES_ARRAY = WORKPLACE_FEATURES_ARRAY;

  loading: boolean = true;
  tabs: any[] = [];

  queryParams: any = { periodKey: 'all' };
  constructor(public auth: AuthStore,
    public store: DocumentStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private changeRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const { uid } = this.auth;
    this.route.params.subscribe(async params => {
      const { departmentKey, docStatus, ownerNotedStatus } = params;
      this.store.params = params;
      this.tabs = WORKPLACE_FEATURES_ARRAY.map(m => ({ path: `/documents/memo/${departmentKey}/${m?.key}/${docStatus}/${ownerNotedStatus}`, label: m?.name }))
      this.route.queryParams.subscribe(queryParams => {
        this.queryParams = queryParams || { periodKey: 'all' };
        this.store.fetchHeaderDocumentRecent(uid, ownerNotedStatus, this.queryParams?.periodKey);
      })
      await this.store.fetchCurrentDepartment(departmentKey)
      this.loading = false;
    })
  }

  _onSelectedPeriod(period: any) {
    const { params } = this.store;
    this.router.navigate([`/documents/memo/${params?.departmentKey}/${params?.notedStatus}/${params?.docStatus}/${params?.ownerNotedStatus}`], { queryParams: { periodKey: period?.route } })
  }

  _onSelectedDocStatus(status: any) {
    const { params } = this.store;
    this.router.navigate([`/documents/memo/${params?.departmentKey}/${params?.notedStatus}/${params?.docStatus}/${status?.key}`], { queryParams: { periodKey: this.queryParams?.periodKey } })
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

  ngOnDestroy() {
    this.store.unSubscribeFetchHeaderDocumentRecent()
  }


  onCreateDocument(item?: IHeaderInformation) {
    this.dialog.open(DocumentFormComponent, {
      data: { item: item || null, headerDocument: null },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '780px',
      height: '580px',
      disableClose: true,
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
