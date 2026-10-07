import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { STATUS_LIVES_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CriminalReceiptPrintDialogComponent } from 'src/app/modules/criminal-record/components/criminal-receipt-print-dialog/criminal-receipt-print-dialog.component';
import { CriminalScanFingerPrintDialogComponent } from 'src/app/modules/criminal-record/components/criminal-scan-finger-print-dialog/criminal-scan-finger-print-dialog.component';
import { CriminalStore } from 'src/app/modules/criminal-record/stores/criminal.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { Subscription } from 'rxjs';
import { CitizenStore } from '../../../stores/citizen.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-print-verified-application',
    templateUrl: './print-verified-application.component.html',
    styleUrls: ['./print-verified-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrintVerifiedApplicationComponent implements OnInit {
  STATUS_OBJ = STATUS_OBJ
  STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY;
  show_confirm: boolean = false;
  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/digitization-documents.json',
  };
  isKhmerForm: boolean = false;
  process: boolean = false;

  isTypeConfirm: boolean = false;
  isTypeReview: boolean = false;
  incomplete_criminal_record: boolean = false;

  ITEM:any;
  fingerImg:any;
  paid_online: boolean = false;

  canWithDrawPaidOnline: boolean = false;

  khmer_amount = 0
  france_amount = 0
  english_amount = 0
  subToStatus: Subscription = null;

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private route: ActivatedRoute,
    private criminal: CriminalStore,
    private dialog: MatDialog,
  ) {}

  async ngOnInit() {
    const { permissionKeys } = this.auth;
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;
    this.ITEM = selectedCitizenProfile;
    const { apply, status } = selectedCriminalRecord || {}
    this.show_confirm = apply && status?.key === STATUS_OBJ.APPLY.key;
    this.isKhmerForm = selectedCriminalRecord?.national_application?.key === 'khmer';
    this.isTypeReview = this.criminal?.params?.key === 'apply-in-place';
    this.isTypeConfirm = this.criminal?.params?.key === 'apply-online';
    this.canWithDrawPaidOnline = permissionKeys?.find(f=>f=== 'print_and_notify') ? true : false

    this.subToStatus = this.criminalStore.subscribeStatus?.subscribe(res=>{
      const { selectedCriminalRecord } = this.criminalStore
      this.khmer_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 1)?.amount || 1
      this.france_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 2)?.amount || 0
      this.english_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 3)?.amount || 0
    })
  }

  makePayment() {
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;
    const form = {
      ...this.criminalStore.selected_language_obj_to_form_value(selectedCriminalRecord?.criminal_language),
      urgent_obj: selectedCriminalRecord?.urgent_obj,
    }
    if (this.incomplete_criminal_record || !selectedCriminalRecord || !selectedCitizenProfile) {
      alert('Invalid some information!')
    } else {
      const dialogRef = this.dialog.open(CriminalReceiptPrintDialogComponent, {
        data: { form: form, isKhmerForm: this.isKhmerForm },
        panelClass: 'cs-dialog-wrapper',
        width: '580px',
        height: '96vh',
        disableClose: true,
        role: 'dialog',
      });
      dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    }
  }
  makeFingerPrint() {
    const dialogRef = this.dialog.open(CriminalScanFingerPrintDialogComponent, {
      data: null,
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
