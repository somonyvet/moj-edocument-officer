import { IOfficer } from '../../../../../interfaces/document/document.interface';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { AddDocToGroupComponent } from '../add-doc-to-group/add-doc-to-group.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
@Component({
    selector: 'app-app-criminal-group-request-form-sign',
    templateUrl: './app-criminal-group-request-form-sign.component.html',
    styleUrls: ['./app-criminal-group-request-form-sign.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppCriminalGroupRequestFormSignComponent implements OnInit {

  tabs = tabs.officers;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  formFocus: boolean;

  isAdmin = false
  form: UntypedFormGroup

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/109279-checklist.json',
  };
  selectedFilter: any = null;
  search: AbstractControl;
  loadingSearch: boolean = false;
  isKhmerForm: boolean = false;
  printDate = new Date();

  yearNumber: number = new Date().getFullYear();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: CriminalApplicationStore,
    private route: ActivatedRoute,
    public auth: AuthStore,
    private ps: PrintService,
  ) { }
  criminalRecords = []
  criminalRecordsAmount: number = 0;
  criminalGroupService = null
  signature2;
  signature3;
  signature4;
  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.store.fetchData(params?.id, res => {
        this.criminalRecords = res;
        this.criminalRecordsAmount = this.criminalRecords.filter(f => f?.key)?.length
        const criminalGroupServiceData = MappingService.groupBy(this.criminalRecords, 'urgent_obj.key', 'urgent_obj.key')
        this.criminalGroupService = criminalGroupServiceData && criminalGroupServiceData.length > 0 ? criminalGroupServiceData[0] : null
      });
    })
    this.signature2 = this.store?.selectedGroupDoc?.workplaces.find(m=>(m?.flowNo === 2) && m?.approved_at) || null
    this.signature3 = this.store?.selectedGroupDoc?.workplaces.find(m=>(m?.flowNo === 3) && m?.approved_at) || null
    this.signature4 = this.store?.selectedGroupDoc?.workplaces.find(m=>(m?.flowNo === 4) && m?.approved_at) || null

    console.log("this.signature2",this.signature2)
    console.log("this.signature2",this.signature3)
    console.log("this.signature2",this.signature4)
  }

  ngOnDestroy() {
    // this.store.unsubscribe();
    this.store?.fetchDataRef?.unsubscribe();
    this.store.folderItem = null;
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

  removeLink(item: IOfficer) {
    const { uid } = this.auth
    // this.store.removeLinkGroupCriminalRecord(item, uid, (success, res) => {
    //   if (success) {
    //     this.snackBar.open(`ការដកមន្ត្រីចេញពីម៉ោងធ្វើការបានជោគជ័យ.`, "បិទ", { duration: 1000 });
    //   } else {
    //     alert(res)
    //   }
    // })
  }

  print() {
    this.ps.print('#printD', 'a4')
  }
}


