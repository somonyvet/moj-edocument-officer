import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { DecreeConfirmDialogComponent } from '../../../components/decree-confirm-dialog/decree-confirm-dialog.component';
import { RemarkApplicationComponent } from '../../../components/remark-application/remark-application.component';

@Component({
    selector: 'app-criminal-verify-route',
    templateUrl: './criminal-verify-route.component.html',
    styleUrls: ['./criminal-verify-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalVerifyRouteComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.criminal_record_verify_tabs;
  loading: boolean = true;
  params: any = null;

  childRoute: string = 'criminal-record';
  child: any;
  subscriptionRoute: any;

  decreeResult: string = null;
  STATUS_OBJ = STATUS_OBJ;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private router: Router,
    public auth: AuthStore,
    private ps: PrintService,
    public criminal: CriminalStore,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.params = params;
      this.store.fetchSelectedCriminalRecord(params?.id, res => {
        if (!res) {
          this.router.navigate([`/page-not-found`])
          return;
        }
        const { decree_result } = res;
        this.decreeResult=decree_result?.name;
        this.loading = false;
      });
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord();
  }


  onPrint() {
    this.ps.print("#printD", "a4-info-history")

  }

  onConfirmReviewed() {
    const item = this.store.selectedCriminalRecord;
    const name = `${item?.last_name || ''} ${item?.first_name || ''}`.trim();
    const dialogRef = this.dialog.open(DecreeConfirmDialogComponent, {
      width: '420px',
      panelClass: 'cs-dialog-wrapper',
      data: { title: 'បញ្ជាក់ការត្រួតពិនិត្យ', memo: `សូមបញ្ជាក់ថាអ្នកបានពិនិត្យរួចរាល់សម្រាប់ <strong>${name}</strong> ?` },
    });
    dialogRef.afterClosed().subscribe(async res => {
      if (res === 'yes') {
        await this.store.updateStatus(item, STATUS_OBJ.CONFIRM_APPLICATION);
        this.store.selectedCriminalRecord = { ...item, status: STATUS_OBJ.CONFIRM_APPLICATION };
      }
    });
  }

  onRejectApplication() {
    const item = this.store.selectedCriminalRecord;
    const dialogRef = this.dialog.open(RemarkApplicationComponent, {
      data: { selectedCriminal: item, mode: 'reject' },
      panelClass: 'cs-dialog-wrapper',
      width: '660px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res?.status) {
        this.store.selectedCriminalRecord = { ...item, status: res.status, remark_application: res.remark_application };
      }
    });
  }

}
