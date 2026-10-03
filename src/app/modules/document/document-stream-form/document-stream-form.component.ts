import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { DocumentHeadOptionComponent } from '../document-head-option/document-head-option.component';
import { IUserPermission } from 'src/app/interfaces/document/document.interface';
import { DataService } from 'src/app/shared/services/data.service';
import { ACCOUNT_PERMISSION_OBJECT } from 'src/app/dummy/config';
import { ConvertService, pushObjArray } from 'src/app/shared/services/convert.service';
import { toOfficer } from 'src/app/shared/services/mapping.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-document-stream-form',
  templateUrl: './document-stream-form.component.html',
  styleUrls: ['./document-stream-form.component.scss']
})
export class DocumentStreamFormComponent implements OnInit {
  title: any = "ចរន្តឯកសារ";

  form: FormGroup;
  search: AbstractControl;
  loading: boolean = true;

  URL: any = PHOTO_LIB.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<DocumentStreamFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: DocumentStore,
    private fb: FormBuilder,
    private auth: AuthStore,
    private officer: OfficerStore,
    private dialog: MatDialog,
    private ds: DataService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.store.selectedWorkplace = null;
    this.form = this.fb.group({
      search: [null]
    })
    this.search = this.form.controls['search'];
    await this.officer.fetchOfficers();
    this.search.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (false)),
        switchMap(value => this.officer.fetchSearchOfficers(value, null, null, data => {
          this.loading = false;
        }))
      )
      .subscribe(res => { });

    this.loading = false;
  }

  _onSelectedWorkplace(workplace) {
    this.store.selectedWorkplace = workplace
  }
  _clear() {
    this.store.selectedWorkplace = null;
  }

  _onSaveCheckedChange(event) {
    const { checked, source } = event;
    const item = source?.value || null;
    const { headerDocument } = this.store;
    const { workplaces } = headerDocument;
    const { uid, config } = this.auth;
    const wp = workplaces.find(m => m?.key === item?.key)
    const data = pushObjArray(workplaces, { ...wp, isActive: checked || false, updated_by: uid, updated_at: new Date() });
    this.store.workplaces = this.store.getWorkPlace(data, config)
    this.store.workplaceDocument(data, uid, item, checked, (success, error) => {
      if (success) {
      } else {
        alert(error)
      }
    })
  }

  getApprovalOrder(profile, permission) {
    let approvalOrder = 0
    if (permission.key === 1) return approvalOrder
    const currentWorkPlace = this.store?.approvalUserPermission.find(m => m?.profile?.position.key === profile?.position.key && !m.isDelete && m.isActive)
    if (currentWorkPlace) approvalOrder = currentWorkPlace.approval_order
    else {
      const cwp1 = this.store?.approvalUserPermission.find(m => m?.profile?.position.order === (profile?.position.order + 1) && !m.isDelete && m.isActive)
      if (cwp1) approvalOrder = cwp1.approval_order + 1
      else {
        const cwp2 = this.store?.approvalUserPermission.find(m => m?.profile?.position.order === (profile?.position.order + 2) && !m.isDelete && m.isActive)
        if (cwp2) approvalOrder = cwp2.approval_order + 2
      }
    }
    return approvalOrder
  }

  _onEdit(event) {
    const { allUserPermission } = this.store;
    const findAccount = allUserPermission?.find(m => m?.accountKey === event?.key);
    const dialogRef = this.dialog.open(DocumentHeadOptionComponent, {
      data: { item: findAccount || null, officer: event },
      panelClass: 'cs-dialog-doc',
      width: '580px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result?.permission) {
        const { uid } = this.auth;
        const { headerDocument } = this.store;
        const { permission, workplace } = result;
        const item: IUserPermission = {
          key: findAccount?.key || event?.key,
          created_at: findAccount?.created_at || this.ds.serverTimestamp(),
          created_by: findAccount?.created_by || uid,
          updated_by: uid,
          isDelete: false,
          accountKey: event?.key,
          permission: permission || ACCOUNT_PERMISSION_OBJECT.readOnly,
          documentKey: headerDocument?.key,
          workplaceKey: workplace?.key,
          head: findAccount?.head || false,
          assistant: findAccount?.assistant || false,
          profile: findAccount?.profile || toOfficer(event),
          completedTask: findAccount?.completedTask || false,
          isActive: true,
          approval_order: this.getApprovalOrder(findAccount?.profile || toOfficer(event), permission || ACCOUNT_PERMISSION_OBJECT.readOnly)
        }

        this.store.addDocumentAccount(this.store.headerDocument, item, res => {
        })
      }
    })
  }

  _onRemoveDocumentAccount(event: any, isDelete: boolean): void {
    if (isDelete) {
      this.store.removeDocumentAccount(this.store.headerDocument, event?.key, this.auth.uid)
      return;
    }
    const { userPermission } = this.store;
    const findAccount = userPermission?.find(m => m?.accountKey === event?.key);
    if (!findAccount) {
      this._onEdit(event)
    } else {
      this.store.removeDocumentAccount(this.store.headerDocument, event?.key, this.auth.uid)
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.store?.approvalUserPermission, event.previousIndex, event.currentIndex);
    const previousData = this.store?.approvalUserPermission[event.previousIndex]
    const currentData = this.store?.approvalUserPermission[event.currentIndex]
    if(currentData?.completedTask) return
    this.store.calApprovalOrder(this.store.headerDocument, previousData, currentData)
  }

}
