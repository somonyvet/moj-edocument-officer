import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { PrintService } from 'src/app/shared/services/print.service';
import { HrStore } from '../../stores/hr.store';
import { HumanResourceApprovalComponent } from '../human-resource-approval/human-resource-approval.component';

@Component({
  selector: 'app-officer-application-form-preview-route',
  templateUrl: './officer-application-form-preview-route.component.html',
  styleUrls: ['./officer-application-form-preview-route.component.scss']
})
export class OfficerApplicationFormPreviewRouteComponent implements OnInit {

  lottie: AnimationOptions = {
    path: '../../../../../assets/animate/109279-checklist.json',
  };

  docKey: string = 'na';
  childrenRoute = 'certificate'
  backUrl: string = null;
  toggleComment = false;
  loading : boolean = true;

  constructor(
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    private ps: PrintService,
    public store: HrStore,
    private router: Router,
  ) { }


  ngOnInit(): void {
    this.activateRoute.params.subscribe(params => {
      this.backUrl = JSON.stringify(this.router.url)
      this.toggleComment = false;
      const { docKey } = params;
      this.docKey = docKey;
      this.store.fetchSelectedOfficer(this.docKey, doc=>{
        this.loading = false;
      })
    })
  }


  _onApproval() {
    this.dialog.open(HumanResourceApprovalComponent, {
      data: { item: this.store?.selectedOfficer },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '600px',
      height: '92vh',
      disableClose: true,
    })
  }

  selectedFile(file, index) {
  }

  print() {
    const str = '#print'
    this.ps.print(str, 'a4')
  }


}
