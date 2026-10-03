import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { ActivatedRoute } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { AuthStore } from 'src/app/stores/auth.store';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { PositionStore } from 'src/app/stores/document/position.store';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { AddDocToGroupComponent } from '../criminal-group-request-form/add-doc-to-group/add-doc-to-group.component';
import { CriminalRecordApprovalComponent } from '../criminal-record-approval/criminal-record-approval.component';
import { CriminalLetterAddReceiveNoComponent } from '../criminal-letter-add-receive-no/criminal-letter-add-receive-no.component';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { DataService } from 'src/app/shared/services/data.service';
import { addMonth, ConvertService } from 'src/app/shared/services/convert.service';
@Component({
  selector: 'app-criminal-group-request-form-listing-input-number',
  templateUrl: './criminal-group-request-form-listing-input-number.component.html',
  styleUrls: ['./criminal-group-request-form-listing-input-number.component.scss']
})
export class CriminalGroupRequestFormListingInputNumberComponent implements OnInit, OnDestroy {
  tabs = tabs.officers;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  formFocus: boolean;

  isAdmin = false
  form: FormGroup

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/109279-checklist.json',
  };
  selectedFilter: any = null;
  search: AbstractControl;
  loadingSearch: boolean = false;
  isKhmerForm: boolean = false;
  STATUS_OBJ = STATUS_OBJ;
  printDate = new Date();
  process: boolean = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: CriminalApplicationStore,
    public criminalStore: CriminalApplicationStore,
    private route: ActivatedRoute,
    public auth: AuthStore,
    private ps: PrintService,
    public pa: PositionStore,
    private ds: DataService,

  ) { }

  criminalRecords = []
  criminalGroupService = null
  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.store.fetchData(params?.id, res => {
        this.criminalRecords = res;
        const criminalGroupServiceData = MappingService.groupBy(this.criminalRecords, 'urgent_obj.key', 'urgent_obj.key')
        this.criminalGroupService = criminalGroupServiceData && criminalGroupServiceData.length > 0 ? criminalGroupServiceData[0] : null
      });
    })
  }

  ngOnDestroy() {
    this.store.subscribeData()
  }

  compareObjects(o1: any, o2: any): boolean {
    if (o2) {
      return o1.key === o2.key;
    }
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  addDoc(item?: any) {
    const dialogRef = this.dialog.open(AddDocToGroupComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  deleteGroup(item: any) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Remove Criminal Record Folder', memo: '', name: item?.folder_no_items?.toString() },
      width: '580px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.pa.removeCriminalFromFolder(item, this.store.selectedGroupDoc, this.store.getMappedProfile()).then(() => {
          this.snackBar.open('Criminal Record Category has been deleted.', 'done', { duration: 2000 });
          dialogRef.close('yes')
        }).catch(err => {
          alert(err)
        })
      }
    })
  }

  print() {
    this.ps.print('#printD', 'a4')
  }

  approvalDoc() {
    const dialogRef = this.dialog.open(CriminalRecordApprovalComponent, {
      data: { item: null },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  addReceiveNo(item: any) {
    if (item.status.key === STATUS_OBJ.RECEIVED.key) {
      const ref = this.dialog.open(ConfirmSuccessComponent, {
        data: { title: 'ដកឯកសារ', memo: `តើលោកអ្នកពិតជាចង់ដកឯកសារព្រឹត្តិបត្រថ្កោលទោសមែនទេ?` },
        panelClass: 'cs-dialog-doc',
        width: '580px',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(async result => {
        if (result === 'yes') {
          this.process = true;
          const isLastRecode = this.criminalRecords.filter((m: any) => m.key !== item.key && m.status && m.status.key === STATUS_OBJ.RECEIVED.key).length === 0 ? true : false
          const { config } = this.auth
          const { period_renew_month } = config
          const expired_date = addMonth(new Date(), period_renew_month)

          const form = {
            expired_date: expired_date.toDate(),
            expired_date_key: ConvertService.toDateKey(expired_date.toDate()),
            collected_doc_at: this.ds.serverTimestamp(),
            collected_doc_by: this.criminalStore?.getMappedProfile(),
            status: STATUS_OBJ.DONE,
            criminal_record_category: this.store.selectedGroupDoc.category_folder,
            updated_by: this.criminalStore?.getMappedProfile(),
            updated_at: this.ds.serverTimestamp(),
            key: item.key
          }

          const citizen = await this.store.fetchDoc(this.ds.dbRef().collection("citizens").doc(item.citizen_ref))
          this.criminalStore.approvedCriminalCollectDoc(form, citizen, true, isLastRecode, this.store.selectedGroupDoc).then(() => {
            this.snackBar.open(`ប្រតិបត្តិបានដកឯកសារដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
            this.process = false;
          })
        }
      })


    } else {

      const dialogRef = this.dialog.open(CriminalLetterAddReceiveNoComponent, {
        data: { item: item, criminalRecords: this.criminalRecords, selectedGroupDoc: this.store.selectedGroupDoc },
        panelClass: 'cs-dialog-wrapper',
        width: '680px',
        height: '96vh',
        disableClose: true,
        role: 'dialog',
      });
      dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    }
  }

}


