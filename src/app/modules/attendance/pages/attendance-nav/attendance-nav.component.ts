import { AttendanceStore } from '../../../../stores/attendance.store';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { observable } from 'mobx';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';

@Component({
  selector: 'app-attendance-nav',
  templateUrl: './attendance-nav.component.html',
  styleUrls: ['./attendance-nav.component.scss']
})
export class AttendanceNavComponent implements OnInit {
  selected: Date | null = new Date();

  @observable timeClock = {
    hour: '០០',
    minute: '០០',
    second: '០០',
  };

  nav_items = [{}
    // { key: 'urgent', name: `មន្ត្រីនគរបាល`, icon: `person`, url: `/hr/officers/applications` },
    // { key: 'approval', name: `ពិនិត្យនិងឯកភាព`, icon: `file-tray-full`, url: `/hr/officers/approval` },
    // { key: 'attendances', name: `បញ្ជីវត្តមាន`, icon: `alarm`, url: `/hr/officers/attendances` },
    // { key: 'missions', name: `បេសកកម្ម`, icon: `earth`, url: `/hr/officers/missions` },
    // { key: 'permission', name: `ច្បាប់ឈប់សម្រាក`, icon: `calendar-number`, url: `/hr/officers/permission` },
    // { key: 'pregnancy-break', name: `សម្រាកមានផ្ទៃពោះ`, icon: `bandage`, url: `/hr/officers/pregnancy-break` },
    // { key: 'my-files', name: `មន្រី្តផ្ទេរចេញ`, icon: `cloudy`, url: `/hr/officers/my-files` },
    // { key: 'archived', name: `ប្រវត្តិការងារ`, icon: `archive`, url: `/hr/officers/archived` },
    // { key: 'rejected', name: `មរណភាព`, icon: `cloud-offline`, url: `/hr/officers/rejected` },
    // { key: 'working-hour', name: `ម៉ោងធ្វើការ`, icon: `time`, url: `/hr/officers/working-hour` },
  ]
  constructor(
    private route: ActivatedRoute,
    public store: AttendanceStore,
    public auth: AuthStore,
    public officerStore: OfficerStore,
    private snackBar: MatSnackBar,
  ) {
    this.clockRun();
    setInterval(() => this.clockRun(), 1000);
  }

  async ngOnInit(): Promise<void> {
    this.officerStore.getCurrentData(this.auth.uid);

    this.store.getLocation();
    await this.store.fetchAttendances();
    await this.store.fetchCheckIns();
  }

  async ngOnDestroy(): Promise<void> {
    await this.officerStore.unsubscribe();
  }

  _onSelectedCalendar(event) {
  }

  clockRun() {
    let clock = new Date();
    let hour = clock.getHours();
    let minute = clock.getMinutes();
    let second = clock.getSeconds();
    this.timeClock = {
      hour: ((hour < 10) ? '០' : '') + toLocaleNumber(hour),
      minute: ((minute < 10) ? '០' : '') + toLocaleNumber(minute),
      second: ((second < 10) ? '០' : '') + toLocaleNumber(second),
    };
  }

  fetchMoreAttendances(event) {
    this.store.fetchMoreAttendances();
  }


  setToggle() {
    if (this.store?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }

  checkIn() {
    this.store.officerCheckIn((isSuccess, res) => {
      if (isSuccess) {
        this.snackBar.open(`ចាប់ផ្ដើមម៉ោងធ្វើការបានជោគជ័យ`, "បិទ", { duration: 3000 });
      } else {
        alert(res);
      }
    });
  }

  checkOut() {
    this.store.officerCheckOut((isSuccess, res) => {
      if (isSuccess) {
        this.snackBar.open(`បញ្ចប់ម៉ោងធ្វើការបានជោគជ័យ`, "បិទ", { duration: 3000 });
      } else {
        alert(res);
      }
    });
  }






}
