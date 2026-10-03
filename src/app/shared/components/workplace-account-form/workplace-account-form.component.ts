import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { DataService } from 'src/app/shared/services/data.service';
import { ACCOUNT_PERMISSION_OBJECT } from 'src/app/dummy/config';
import { toOfficer } from 'src/app/shared/services/mapping.service';
import { IOfficer, IUserPermission } from 'src/app/interfaces/document/document.interface';
import { toJS } from 'mobx';

@Component({
  selector: 'app-workplace-account-form',
  templateUrl: './workplace-account-form.component.html',
  styleUrls: ['./workplace-account-form.component.scss']
})
export class WorkplaceAccountFormComponent implements OnInit, OnDestroy {
  title: any = "គណនីមានសិទ្ធិលើឯកសារ";

  form: FormGroup;
  search: AbstractControl;
  loading: boolean = true;

  URL: any = PHOTO_LIB.EMPTY;
  constructor(
    public dialogRef: MatDialogRef<WorkplaceAccountFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: DocumentStore,
    private fb: FormBuilder,
    private auth: AuthStore,
    private officer: OfficerStore,
    private ds: DataService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.store.selectedWorkplace = null;
    this.form = this.fb.group({
      search: [null]
    })
    this.search = this.form.controls['search'];
    const { currentDepartment } = this.auth;
    await this.officer.fetchOfficers(currentDepartment?.key);
    this.search.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (false)),
        switchMap(value => this.officer.fetchSearchOfficers(value, currentDepartment?.key,null, data => {
          this.loading = false;
        }))
      )
      .subscribe(res => { });
    this.officer.fetchUserPermissionWorkplace(this.store.headerDocument?.key, currentDepartment?.key)
    this.loading = false;
  }

  ngOnDestroy() {
    const { fetchUserPermissionWorkplaceRef } = this.officer;
    fetchUserPermissionWorkplaceRef && fetchUserPermissionWorkplaceRef.unsubscribe()
  }

  _onAdd(officer: IOfficer) {
    const { uid } = this.auth;
    const { headerDocument } = this.store;
    const item: IUserPermission = {
      key: officer?.key,
      created_at: this.ds.serverTimestamp(),
      created_by: uid,
      updated_by: uid,
      isDelete: false,
      accountKey: officer?.key,
      permission: ACCOUNT_PERMISSION_OBJECT.readOnly,
      documentKey: headerDocument?.key,
      workplaceKey: officer?.currentDepartment?.key,
      head: false,
      assistant: false,
      profile: toOfficer(officer),
      completedTask: false,
      isActive: true,
      officerWorkplaces: officer?.officeKeys || [],
      approval_order: 0,
    }
    this.store.addDocumentAccountReport(this.store.headerDocument, item, res => {

    })
  }

  _onRemoveDocumentAccount(event: any, isUserPermission: boolean): void {
    const { userPermissions } = this.officer
    const findAccount = userPermissions?.find(m => m?.accountKey === event.key);
    if (!isUserPermission) {
      if (findAccount) {
        this.store.removeDocumentAccountReport(this.store.headerDocument, findAccount, res => {
        })
      } else {
        this._onAdd(event)
      }
    } else {
      this.store.removeDocumentAccountReport(this.store.headerDocument, findAccount, res => {
      })
    }

  }
}
