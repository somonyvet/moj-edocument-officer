import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkplaceAccountFormComponent } from 'src/app/shared/components/workplace-account-form/workplace-account-form.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
  selector: 'app-inbox-workplace-account',
  templateUrl: './inbox-workplace-account.component.html',
  styleUrls: ['./inbox-workplace-account.component.scss']
})
export class InboxWorkplaceAccountComponent implements OnInit,OnDestroy {

  constructor(public store: DocumentStore,
    private dialog: MatDialog,
    public officer:OfficerStore,
    public auth: AuthStore) { }

  ngOnInit(): void {
    // const {currentDepartment}=this.auth;
    // this.officer.fetchUserPermissionWorkplace(this.store.headerDocument?.key, currentDepartment?.key)
  }

  ngOnDestroy() {
    // const { fetchUserPermissionWorkplaceRef } = this.officer;
    // fetchUserPermissionWorkplaceRef && fetchUserPermissionWorkplaceRef.unsubscribe()
  }

  _onAccount() {
    const dialogRef = this.dialog.open(WorkplaceAccountFormComponent, {
      data: null,
      panelClass: 'cs-dialog-doc',
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
  }
}
