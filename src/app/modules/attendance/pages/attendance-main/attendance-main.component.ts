import { AttendanceStore } from '../../../../stores/attendance.store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-attendance-main',
    templateUrl: './attendance-main.component.html',
    styleUrls: ['./attendance-main.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AttendanceMainComponent implements OnInit {
  apps_items = [
    { key: `attendance`, icon: `people`, toolTip: `វត្តមានមន្ត្រី`, url: `/attendance` },

  ];

  constructor(
    public store: AttendanceStore,
  ) { }
  ngOnInit(): void {

  }

}
