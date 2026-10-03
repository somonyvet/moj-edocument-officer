import { AuthStore } from './../../../../../stores/auth.store';
import { Subscription } from 'rxjs';
import { HrMissionStore } from '../../../stores/hr-mission.store';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
import { HrMissionsFormComponent } from '../human-resource-missions-form/human-resource-missions-form.component';

@Component({
  selector: 'app-human-resource-missions-list',
  templateUrl: './human-resource-missions-list.component.html',
  styleUrls: ['./human-resource-missions-list.component.scss']
})
export class HumanResourceMissionsListComponent implements OnInit {
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  _subscription: Subscription;
  lottie: AnimationOptions = {
    path: '../../../../assets/animate/109279-checklist.json',
  };
  constructor(
    public store: HrMissionStore,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,

  ) {
    this._subscription = this.route.paramMap.subscribe((params) => {
      this.store.activeKey = params.get('key');
      let selectedIndex = this.store.data.findIndex(({ key }) => this.store.activeKey === key);

      if (selectedIndex !== -1) {
        this.store.fetchOfficersFromMission(this.store.data[selectedIndex]?.officerKeys);
      }
    });
  }


  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }


  _onDelete() {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { isDelete: true, warning: true, name: "លុបបេសកកម្ម", memo: "កំណត់ត្រានេះនឹងត្រូវបានលុបចេញពីប្រព័ន្ធ។ តើអ្នកប្រាកដទេថាអ្នកចង់លុប?", },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === "yes") {
        this.store.save({
          key: this.store.activeKey,
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: this.authStore.User,
        }, (isSuccess, error) => {
          if (isSuccess) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(error);
          }
        });
      }
    })

  }

  _editMission() {
    let item = this.store.data.find(({ key }) => key === this.store.activeKey);
    const dialogRef = this.dialog.open(HrMissionsFormComponent, {
      data: { item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });

  }
}
