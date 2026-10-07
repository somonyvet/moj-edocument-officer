import { HrMissionStore } from './../../stores/hr-mission.store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { HrMissionsFormComponent } from './human-resource-missions-form/human-resource-missions-form.component';
import { MatDialog } from '@angular/material/dialog';
import { tabs } from 'src/app/dummy/tabs';
import { ConvertService, toLocaleNumber } from 'src/app/shared/services/convert.service';

@Component({
    selector: 'app-human-resource-missions',
    templateUrl: './human-resource-missions.component.html',
    styleUrls: ['./human-resource-missions.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceMissionsComponent implements OnInit {
  tabs = tabs.missions;

  options: AnimationOptions = {
    path: '/assets/animate/25943-nodata.json',
  };

  constructor(
    public store: HrMissionStore,
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    // await this.store.fetchHrMissions();
    await this.onSearch(null);

  }
  // fetchMore() {
  //   this.store.fetchMoreHrMissions();
  // }

  getLocalNumber(num: number) {
    return toLocaleNumber(num);
  }
  async onSearch(value) {
    await this.store.search(ConvertService.toNull(value));
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(HrMissionsFormComponent, {
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
