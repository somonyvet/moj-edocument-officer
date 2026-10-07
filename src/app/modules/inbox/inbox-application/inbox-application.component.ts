import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT_NOTED_OBJECT_ARRAY, REPORT_PERIOD_OBJECT_ARRAY } from 'src/app/dummy/config';
import { tabs } from 'src/app/dummy/tabs';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { AuthStore } from 'src/app/stores/auth.store';
import { InboxStore } from 'src/app/stores/document/index.store';
import { InboxFormComponent } from '../inbox-form/inbox-form.component';

@Component({
    selector: 'app-inbox-application',
    templateUrl: './inbox-application.component.html',
    styleUrls: ['./inbox-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class InboxApplicationComponent implements OnInit, OnDestroy {
  REPORT_PERIOD_OBJECT_ARRAY = REPORT_PERIOD_OBJECT_ARRAY;
  DOCUMENT_NOTED_OBJECT_ARRAY = DOCUMENT_NOTED_OBJECT_ARRAY;
  tabs = tabs.documentNotedTab;

  loading: boolean = true;
  constructor(public auth: AuthStore,
    public store: InboxStore,
    public dialog: MatDialog,
    public router:Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const { uid } = this.auth;
    this.route.params.subscribe(async params => {
      this.loading = true;
      const { departmentKey } = params;
      this.tabs = tabs.documentNotedTab.map(m => ({ ...m, path: `/inbox/${m?.key}` }))
      this.store.fetchInboxNoted(departmentKey, uid, res => {
        this.loading = false;
      })
    })
  }

  ngOnDestroy() {
    this.store.unsubscribeInbox()
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



}
