import { WorkingHourStore } from './../../../stores/working-hour.store';
import { AssignUserGroupWorkingHourComponent } from './../assign-user-group-working-hour/assign-user-group-working-hour.component';
import { IOfficer } from '../../../../../interfaces/document/document.interface';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
@Component({
  selector: 'app-officer-list-working-hour',
  templateUrl: './officer-list-working-hour.component.html',
  styleUrls: ['./officer-list-working-hour.component.scss']
})
export class OfficerListWorkingHourComponent implements OnInit {
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

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: WorkingHourStore,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe((params) => {
      this.store.activeKey = params.get('key');
      this.store.officers = [];
      this.store.getOfficersByWorkingHour(this.store.activeKey);

    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.store.unsubscribe();
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

  addOfficer(item?: any) {
    const dialogRef = this.dialog.open(AssignUserGroupWorkingHourComponent, {
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

  removeOfficer(item: IOfficer) {
    this.store.removeOfficerFromWorkingHour(item, (success, res) => {
      if (success) {
        this.snackBar.open(`ការដកមន្ត្រីចេញពីម៉ោងធ្វើការបានជោគជ័យ.`, "បិទ", { duration: 1000 });
      } else {
        alert(res)
      }
    })
  }
}


