import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SYS_MODULES } from 'src/app/dummy/config';
import { CriminalStore } from 'src/app/modules/criminal-record/stores/criminal.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { MessageDialogComponent } from '../../components/message-dialog/message-dialog.component';
import { ApplicationStore } from '../../store/application.store';

@Component({
  selector: 'app-criminal-nav-route',
  templateUrl: './criminal-nav-route.component.html',
  styleUrls: ['./criminal-nav-route.component.scss']
})
export class CriminalNavRouteComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'public_applications')?.modules || [];

  constructor(
    public criminal: CriminalStore,
    public store: ApplicationStore,
    private router: Router,
    private auth: AuthStore,
    private criminalApplicationStore : CriminalApplicationStore,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'public_applications');
  }

  onCreate() {
    if(this.auth?.config?.disableApply){
      this.openMessageDialog();
    }else{
      this.router.navigate([`/ecosystem/criminal-record-latter/create`])
    }
  }

  _onSelectedCalendar(event) {
  }

  openMessageDialog(){
    const dialogRef = this.dialog.open(MessageDialogComponent,{
      width:'720px',
      height:'auto',
    })
  }

  setToggle() {
    if (this.criminal?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }
}
