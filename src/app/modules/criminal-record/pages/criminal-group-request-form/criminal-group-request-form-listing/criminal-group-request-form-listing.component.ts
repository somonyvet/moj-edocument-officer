import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CRIMINAL_APPLICATION_LANGUAGE_OBJECT, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { AddDocToGroupComponent } from '../add-doc-to-group/add-doc-to-group.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { PositionStore } from 'src/app/stores/document/position.store';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { CriminalRecordApprovalComponent } from '../../criminal-record-approval/criminal-record-approval.component';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalRecordApprovalTopMComponent } from '../../criminal-record-approval-top-m/criminal-record-approval-top-m.component';
import { CriminalLetterPrintByLanguageComponent } from '../../../components/criminal-letter-print-by-language/criminal-letter-print-by-language.component';
@Component({
  selector: 'app-criminal-group-request-form-listing',
  templateUrl: './criminal-group-request-form-listing.component.html',
  styleUrls: ['./criminal-group-request-form-listing.component.scss']
})
export class CriminalGroupRequestFormListingComponent implements OnInit, OnDestroy {
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
  canApproveFolder :boolean = false;
  CRIMINAL_APPLICATION_LANGUAGE = CRIMINAL_APPLICATION_LANGUAGE_OBJECT;

  folder: any;
  folderKey: string = null;
  criminalRecordsAmount: number  = 0;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: CriminalApplicationStore,
    public criminal: CriminalStore,
    private route: ActivatedRoute,
    public auth: AuthStore,
    private ps: PrintService,
    public pa: PositionStore,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.form= this.fb.group({
      date_string: [null],
    })
  }

  criminalRecords = []
  criminalGroupService = null
  topMApproval: boolean = false
  ngOnInit() {
    this.route.parent.params.subscribe(async params => {
      if (this.criminal?.firstParams?.key === 'approval') {
        this.topMApproval = true
      }
      const { currentDepartment} = this.auth
      if(this.store.selectedGroupDoc?.request_approval_workplace.find(f=>f===currentDepartment?.key)){
        this.canApproveFolder = true;
      }else{
        this.canApproveFolder = false;
      }
      this.folderKey = params?.id || null
      this.folder = await this.store.getCriminalRecordFolder(this.folderKey)
      this.form.patchValue({
        date_string: this.folder?.customer_receive_date_str || null,
      })
      this.store.fetchData(params?.id, res => {
        this.criminalRecords = res?.map(m => ({ ...m, canApprove: m?.request_approval_workplace?.find((f: any) => f === currentDepartment?.key) ? true : false }));
        const b = 26 - this.criminalRecords.length;
        if (this.criminalRecords.length < 26) {
          for (let i = 0; i < b; i++) {
            this.criminalRecords.push({
              pushField: null,
            })
          }
        }
        this.criminalRecordsAmount = this.criminalRecords.filter(f=>f?.key)?.length
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
    this.ps.print('#printD', 'a4-2')
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

  // approvalDocFromTopM(item: any) {
  //   const dialogRef = this.dialog.open(CriminalRecordApprovalTopMComponent, {
  //     data: { item: item },
  //     panelClass: 'cs-dialog-wrapper',
  //     width: '680px',
  //     height: '96vh',
  //     disableClose: true,
  //     role: 'dialog',
  //     autoFocus: false,
  //   })
  //   dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  // }

  approveFolder(){
    let dialogRef = this.dialog.open(CriminalRecordApprovalTopMComponent, {
      data: { items:this.criminalRecords},
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  openPrintDialog(item){
    const dialogRef = this.dialog.open(CriminalLetterPrintByLanguageComponent, {
      data: { criminalRecords: [item] },
      panelClass: 'cs-dialog-doc',
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      role: 'dialog',
    });
  }

  change(event){
    if(this.folderKey && event?.target?.value){
      this.store.updateCustomerReceiveDateStr(event?.target?.value,this.folderKey)
    }
  }

}


