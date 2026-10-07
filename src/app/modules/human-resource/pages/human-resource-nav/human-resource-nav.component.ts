import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { HrStore } from '../../stores/hr.store';

@Component({
    selector: 'app-human-resource-nav',
    templateUrl: './human-resource-nav.component.html',
    styleUrls: ['./human-resource-nav.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceNavComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = [
    { key: 'urgent', name: `មន្ត្រីនគរបាល`, icon: `person`, url: `/hr/officers/applications` },
    { key: 'approval', name: `ពិនិត្យនិងឯកភាព`, icon: `file-tray-full`, url: `/hr/officers/approval` },
    { key: 'attendances', name: `បញ្ជីវត្តមាន`, icon: `alarm`, url: `/hr/officers/attendances` },
    { key: 'missions', name: `បេសកកម្ម`, icon: `earth`, url: `/hr/officers/missions` },
    { key: 'holidays', name: `ថ្ងៃឈប់សម្រាក`, icon: `calendar-number`, url: `/hr/officers/holidays` },
    { key: 'pregnancy-break', name: `សម្រាកមានផ្ទៃពោះ`, icon: `bandage`, url: `/hr/officers/pregnancy-break` },
    { key: 'my-files', name: `មន្រី្តផ្ទេរចេញ`, icon: `cloudy`, url: `/hr/officers/my-files` },
    { key: 'archived', name: `ប្រវត្តិការងារ`, icon: `archive`, url: `/hr/officers/archived` },
    { key: 'rejected', name: `មរណភាព`, icon: `cloud-offline`, url: `/hr/officers/rejected` },
    { key: 'working-hour', name: `ម៉ោងធ្វើការ`, icon: `time`, url: `/hr/officers/working-hour` },
  ]
  constructor(
    private route: ActivatedRoute,
    public store: HrStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    if (!this.auth?.currentDepartment?.approveOfficerForm) {
      this.nav_items = this.nav_items?.filter(f => f.key !== 'approval')
    }
  }


  _onSelectedCalendar(event) {
  }

  setToggle() {
    if (this.store?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }

}
