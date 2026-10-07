import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { ActivatedRoute, Router } from '@angular/router';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { CriminalStore } from '../../../stores/criminal.store';
import { MatDialog } from '@angular/material/dialog';
import { AuthStore } from 'src/app/stores/auth.store';
import { ICriminalRecord } from 'src/app/interfaces/criminal.interface';
import { DigitalApprovalFormComponent } from 'src/app/shared/components/digital-approval-form/digital-approval-form.component';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';

@Component({
    selector: 'app-approve-letter-digital-route',
    templateUrl: './approve-letter-digital-route.component.html',
    styleUrls: ['./approve-letter-digital-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ApproveLetterDigitalRouteComponent implements OnInit {
  tabs = criminal_tabs.digital_application_details;
  isIssued: boolean = false;
  loading: boolean = true;
  params: any = null;

  childRoute: string = 'criminal-record';
  child: any;
  subscriptionRoute: any;

  decreeResult: any = null;
  canApprove: boolean = false;
  doneApprove: boolean = false;
  approver: boolean = false;
  canReject: boolean = false;
  isRejected: boolean = false;
  rejectReason: string = null;
  rejectedBy: any = null;
  rejectedAt: any = null;

  process: boolean = false;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private router: Router,
    public auth: AuthStore,
    public criminal: CriminalStore,
    private dialog: MatDialog,
    private ps: PrintService,
  ) { }

  // the printable bulletin is rendered by the child route, so print from here by its element id
  get isBulletin(): boolean {
    return this.router.url.includes('/bulletin');
  }

  onPrint() {
    this.ps.print('#printDkh', 'a4-criminal');
  }

  ngOnInit(): void {
    const { currentDepartment } = this.auth

    // an issued bulletin has nothing left to review: only the printable letter is offered.
    // DigitalIssuedRedirectGuard already sends its child routes to `bulletin`.
    this.route.parent?.params.subscribe(parentParams => {
      this.isIssued = parentParams?.tabKey === 'issued';
      this.tabs = this.isIssued ? criminal_tabs.digital_issued_details : criminal_tabs.digital_application_details;
    })

    this.route.params.subscribe(async params => {
      this.params = params;
      this.store.fetchSelectedCriminalRecord(params?.id, (res: ICriminalRecord) => {
        if (!res) {
          this.router.navigate([`/page-not-found`])
          return;
        }
        const { decree_result } = res;
        this.decreeResult= decree_result?.name;
        this.canApprove = res.request_approval_workplace_keys.includes(currentDepartment.key);
        this.doneApprove = res.approved_workplaceKeys.includes(currentDepartment.key);
        this.approver = res?.workplaceKeys?.includes(currentDepartment?.key);
        // the first workplace of the flow has no previous step to send the record back to
        const currentIndex = res?.workplaceKeys?.findIndex((f: any) => f == currentDepartment?.key);
        this.canReject = this.canApprove && currentIndex > 0;

        this.isRejected = res?.internal_status?.key === STATUS_OBJ.INTERNAL_PROCESS_REJECT.key;
        this.rejectReason = this.isRejected ? res?.reject_reason : null;
        this.rejectedBy = this.isRejected ? res?.rejected_by : null;
        this.rejectedAt = this.isRejected ? res?.rejected_at : null;
        this.loading = false;
      });
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord();
  }

  approveDocument(){
    this.openApprovalDialog(null);
  }

  rejectDocument(){
    this.openApprovalDialog('reject');
  }

  private openApprovalDialog(mode: string){
    const dialogRef = this.dialog.open(DigitalApprovalFormComponent, {
      data: { item: null, mode: mode },
      panelClass: 'cs-dialog-wrapper',
      width: '980px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
