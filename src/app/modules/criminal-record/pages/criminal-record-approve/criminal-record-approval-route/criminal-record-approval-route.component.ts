import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { DataService } from 'src/app/shared/services/data.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-approval-route',
  templateUrl: './criminal-record-approval-route.component.html',
  styleUrls: ['./criminal-record-approval-route.component.scss']
})
export class CriminalRecordApprovalRouteComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.criminal_record_approval_tabs;
  loading: boolean = true;
  params: any = null;
  process: boolean = false;

  lottie: AnimationOptions = {
    path: '../../../../../../assets/animate/41291-human-resources-approval-animation.json',
  };

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    private router: Router,
    private dialog: MatDialog,
    public auth: AuthStore,
    private ps: PrintService,
    private snackBar: MatSnackBar,
    private ds: DataService,

  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.params = params;
      this.store.fetchSelectedCriminalRecord(params?.id, res => {
        if (!res) {
          this.router.navigate([`/page-not-found`])
          return;
        }
        this.loading = false;
      });
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord();
  }

  _approve() {
    const dialogRef = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'បានត្រួតពិនិត្យ', memo: `តើលោកអ្នកពិតជាចង់ដាក់ដាក់អនុម័តលើព្រឹត្តិបត្រថ្កោលទោស?` },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      const { selectedCriminalRecord, selectedCitizenProfile } = this.store;
      const { employee } = this.auth
      this.process = true;
      const data = {
        ...selectedCriminalRecord,
        approved_by: this.auth?.getMappedApprover(),
        approved_at: this.ds.serverTimestamp(),
        updated_by: this.store?.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),
        status: STATUS_OBJ.PROCESSING,
        internal_status: STATUS_OBJ.PROCESSING,

        default_stampFile: employee?.stampFile || null,
        default_remarkFile: employee?.signatureFile || null,
        default_signatureFile: employee?.signatureFile || null,

      }
      this.store.approvedCriminal(data, selectedCitizenProfile, true).then(() => {
        this.snackBar.open(`ព្រឹត្តិបត្រថ្កោលទោសបានអនុម័តដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.router.navigate(['/criminal-record/approval/processing/all'])
        this.process = false;
      })

    })
  }

  onPrint() {
    this.ps.print("#printD", "a4")
  }

}
