import { HrPermissionStore } from './../../stores/hr-permission.store';
import { Component, OnInit } from '@angular/core';
import { HrPermissionFormComponent } from './human-resource-permission-form/human-resource-permission-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-human-resource-permission',
  templateUrl: './human-resource-permission.component.html',
  styleUrls: ['./human-resource-permission.component.scss']
})
export class HumanResourcePermissionComponent implements OnInit {
  title = "បញ្ជីមន្ត្រីសុំអនុញ្ញាតច្បាប់ឈប់សម្រាក";
  constructor(
    public store: HrPermissionStore,
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.store.fetchHrPermissions();
  }

  async fetchMore(event): Promise<void> {
    await this.store.fetchMoreHrPermissions();
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(HrPermissionFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
