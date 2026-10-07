import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalStore } from '../../stores/criminal.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalPaymentComponent } from '../criminal-payment/criminal-payment.component';
import { OverseaUserFormComponent } from './oversea-user-form/oversea-user-form.component';
import { UserStore } from '../../stores/users.store';
import {  MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-oversea-user',
    templateUrl: './oversea-user.component.html',
    styleUrls: ['./oversea-user.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OverseaUserComponent implements OnInit {

  tabs = tabs.createEmbassyAccount
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `គណនីស្ថានទូក`;
  STATUS_OBJ = STATUS_OBJ;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  focusSearch: boolean;
  statusMoreThan: string = null;
  isScanQrCode = false;
  orderDESC: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public store: UserStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.criminal.firstParams = { key: 'pay' }
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.store.data = []
      const { recipient } = this.auth;
      this.criminal.newButtonName = recipient ? 'ចេញបង្កាន់ដៃ' : `បង្កើតគណនីស្ថានទូក`;
      this.title = recipient ? 'បញ្ជីចេញបង្កាន់ដៃ' : 'គណនីស្ថានទូក'
      this.criminal.componentDialog = recipient ? CriminalPaymentComponent : OverseaUserFormComponent;
      this.criminal.params = { key: 'application-payment' }
      this.store.fetchOverseaOfficer()
      this.loading = false;
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.searchString = null;
    this.criminal.firstParams = null;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { displayStatus } = this.criminal
    // this.store.fetchAssistantPaymentMore(displayStatus,this.statusMoreThan,this.orderDESC, res => {
    //   this.loadingMore = false;
    // })
  }

  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;

  }

  onFocusSearch() {
    this.focusSearch = true;
  }

  createUser(item){
    const dialogRef = this.dialog.open(OverseaUserFormComponent,{
      data: {
        item: item
      },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }
}
