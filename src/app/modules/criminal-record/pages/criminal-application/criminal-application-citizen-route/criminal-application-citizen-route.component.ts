import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { PrintFinishReviewDialogComponent } from '../../../components/print-finish-review-dialog/print-finish-review-dialog.component';
import { PrintReceiptDialogComponent } from '../../../components/print-receipt-dialog/print-receipt-dialog.component';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { CriminalPaymentComponent } from '../../criminal-payment/criminal-payment.component';
import { CriminalApplicationFullviewDialogComponent } from '../criminal-application-fullview-dialog/criminal-application-fullview-dialog.component';
import { ManualPaidOnlineComponent } from '../../../components/manual-paid-online/manual-paid-online.component';
import { ChangeDateProcessDocComponent } from '../../../components/change-date-process-doc/change-date-process-doc.component';
import { RemarkApplicationComponent } from '../../../components/remark-application/remark-application.component';

@Component({
  selector: 'app-criminal-application-citizen-route',
  templateUrl: './criminal-application-citizen-route.component.html',
  styleUrls: ['./criminal-application-citizen-route.component.scss']
})
export class CriminalApplicationCitizenRouteComponent implements OnInit {
  // the tab set is route driven so pages like the MOD completed list can add their own tabs
  tabs = criminal_tabs.criminal_record_tabs;
  loading: boolean = true;
  params: any = null;
  process: boolean = false;
  PENDING = STATUS_OBJ.PENDING
  STATUS_OBJ = STATUS_OBJ;

  MOL_workplace_key: string = null;
  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private router: Router,
    public auth: AuthStore,
    private ps: PrintService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    const { config } = this.auth;
    this.MOL_workplace_key = config.department_labor?.key
  }

  ngOnInit(): void {
    this.tabs = criminal_tabs[this.route.snapshot.data?.tabsKey] || criminal_tabs.criminal_record_tabs;
    this.route.params.subscribe(async params => {
      this.params = params;
      this.store.fetchSelectedCriminalRecord(params?.id, res => {
        if (!res) {
          this.router.navigate([`/page-not-found`])
          return;
        }
        this.loading = false;
      })
    })
  }

  _onPrint(item) {
    this.dialog.open(PrintReceiptDialogComponent, {
      data: { selectedCriminalRecord: item },
      width: '80vw',
      height: '85vh',
      disableClose: true
    });
  }

  _onPrintPreview(item) {
    this.dialog.open(PrintFinishReviewDialogComponent, {
      data: { selectedCriminalRecord: item, print: 'rp' },
      width: '80vw',
      height: '85vh',
      disableClose: true
    });
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord()
  }

  print() {
    this.ps.print("#printD", "a4-info-history")
  }

  _onEditReceipt(item) {
    const dialogRef = this.dialog.open(CriminalPaymentComponent, {
      data: { item: item || null },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _reApply() {
    const { selectedCriminalRecord, selectedCitizenProfile } = this.store;
    if (selectedCriminalRecord?.status?.key < STATUS_OBJ.APPROVED.key) return;
    const ref = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'ធ្វើពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសឡើងវិញ', memo: `តើលោកអ្នកពិតជាចង់ធ្វើពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសឡើងវិញរបស់ឈ្មោះ ${selectedCriminalRecord?.last_name} ${selectedCriminalRecord?.first_name} ដែលមានលេខទូរសព្ទ ${selectedCriminalRecord?.phoneNumber} មែនទេ?` },
      panelClass: 'cs-dialog-doc',
      width: '580px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(async result => {
      if (result === 'yes') {
        this.process = true;
        this.store.replyCriminal(selectedCriminalRecord, selectedCitizenProfile, (success, item) => {
          this.process = false;
          if (success) {
            this.snackBar.open(`សំណើរសុំព្រឹត្តិបត្រថ្កោលទោសត្រូវបានយកធ្វើឡើងវិញដោយជោគជ័យ`, "រួចរាល់", { duration: 2000 });
            this.router.navigate([`/criminal-record/applications/apply-in-place/submitted/${item?.key}/criminal-record`])
            this._onPrint(item)
          } else {
            alert(item)
          }
        })

      }
    })
  }

  _onDelete() {
    const { selectedCriminalRecord } = this.store;
    if (selectedCriminalRecord?.workplace_entry?.key !== this.MOL_workplace_key) return;
    const ref = this.dialog.open(ConfirmDeleteComponent, {
      data: { title: `លុប (${selectedCriminalRecord?.last_name} ${selectedCriminalRecord?.first_name})`, memo: `តើលោកអ្នកចង់លុបសំណើរសុំព្រឹត្តិបត្រថ្កោលទោសចេញពីប្រព័ន្ធមែនទេ` },
      panelClass: 'cs-dialog-doc',
      width: '580px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.process = true;
        this.router.navigate(['/criminal-record/applications/bulletin-list/labor'])
        this.store.deleteCriminalRecord(selectedCriminalRecord).then(() => {
          this.snackBar.open(`សំណើរសុំព្រឹត្តិបត្រថ្កោលទោសត្រូវបានយកចេញពីប្រព័ន្ធដោយជោគជ័យ`, "រួចរាល់", { duration: 2000 });
        }).catch(err => {
          alert(err)
        }).finally(() => {
          this.process = false;
        })
      }
    })
  }

  fullScreenPreview(){
    const ref = this.dialog.open(CriminalApplicationFullviewDialogComponent, {
      panelClass: 'cs-dialog-doc',
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      role: 'dialog',
    });
  }

  paidOnline(){
    const dialogRef = this.dialog.open(ManualPaidOnlineComponent, {
      data: {
        selectedCriminal: this.store?.selectedCriminalRecord,
        selectedCitizenProfile: this.store?.selectedCitizenProfile
      },
      panelClass: 'cs-dialog-wrapper',
      width: '660px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }


  changeDateProcessDate(){
    const dialogRef = this.dialog.open(ChangeDateProcessDocComponent, {
      data: {
        selectedCriminal: this.store?.selectedCriminalRecord,
        selectedCitizenProfile: this.store?.selectedCitizenProfile
      },
      panelClass: 'cs-dialog-wrapper',
      width: '660px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  doRemark(){
    const dialogRef = this.dialog.open(RemarkApplicationComponent, {
      data: {
        selectedCriminal: this.store?.selectedCriminalRecord,
      },
      panelClass: 'cs-dialog-wrapper',
      width: '660px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  togglePaymentOption(){
    let payment_option = this.store?.selectedCriminalRecord?.payment_option
    let passCondition = false;
    if(payment_option?.name == "ACLEDA PAY(Can process payment from all Bakong Participated Banks)"){
      passCondition = true;
      payment_option = {
        ...this.store?.selectedCriminalRecord?.payment_option,
        name : "Credit/Debit Card",
        name_kh : "ប័ណ្ណឥណទាន"
      }
    }else if(payment_option?.name == "Credit/Debit Card"){
      passCondition = true;
      payment_option = {
        ...this.store?.selectedCriminalRecord?.payment_option,
        name : "ACLEDA PAY(Can process payment from all Bakong Participated Banks)",
        name_kh : "​អេស៊ីលីដា(អាចទូទាត់បានគ្រប់ធនាគាទាំងអស់ដែលជាសមាជិករបស់បាគង)"
      }
    }
    if(!passCondition){
      alert("not valid condition");
      return
    }
    const data = {
      key : this.store.selectedCriminalRecord?.key,
      payment_option : payment_option,
    }
    this.store.updateCriminalRecord(data)
    alert("update complete");
  }

  onSearchReceipt(data: any){
    console.log("onSearchReceipt data",data);
    this.findApplication(data);
  };

  async findApplication(receipt_ref: string){
    const res = await this.store.findApplicationFromReceiptKey(receipt_ref);
    if(!res?.key){
      alert("Record not found in the system.");
      return;
    }
    this.router.navigate([`/criminal-record/applications/bulletin-list/all/${res?.key}/criminal-record`])
  }
  
}
