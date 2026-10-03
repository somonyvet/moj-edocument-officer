import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { HrStore } from '../../../stores/hr.store';
import { AttachmentDialogComponent } from '../attachment-dialog/attachment-dialog.component';

@Component({
  selector: 'app-officer-profile-form',
  templateUrl: './officer-profile-form.component.html',
  styleUrls: ['./officer-profile-form.component.scss']
})
export class OfficerProfileFormComponent implements OnInit {

  childrenRoute = 'certificate'
  docKey : string = '';
  backUrl:string=null;

  loading : boolean = true;

  constructor(
    private activateRoute : ActivatedRoute,
    private dialog:MatDialog,
    private ps: PrintService,
    public store: HrStore,
    private router:Router,
    private auth : AuthStore,
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.backUrl=JSON.stringify(this.router.url)
    this.docKey = this.auth?.uid;
    this.store.fetchSelectedOfficer(this.docKey, doc=>{
      this.loading = false;
    })
  }

  print() {
    const str = '#print'
    this.ps.print(str, 'a4')
  }

  onOpenAttachment(){
    this.dialog.open(AttachmentDialogComponent, {
      data: this.store.selectedOfficer,
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '720px',
      height: '96vh',
      disableClose: true,
    });
  }

  async ngOnDestroy() {
    await this.store.subscribeSelectedOfficer()
  }

}
