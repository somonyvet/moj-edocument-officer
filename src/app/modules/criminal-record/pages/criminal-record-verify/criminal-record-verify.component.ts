import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalVerifyStore } from '../../stores/criminalVerify.store';
import { Router } from '@angular/router';

@Component({
    selector: 'app-criminal-record-verify',
    templateUrl: './criminal-record-verify.component.html',
    styleUrls: ['./criminal-record-verify.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordVerifyComponent implements OnInit, OnDestroy {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'decree')?.modules || [];
  expandedGroups: { [key: string]: boolean } = {};

  constructor(
    public criminal: CriminalStore,
    private auth: AuthStore,
    public store: CriminalVerifyStore,
    private router: Router) { }

  ngOnInit(): void {
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'decree');
    this.criminal.firstParams = { key: 'decree' }
    const { root, permissionKeys } = this.auth;
    if (!root) {
      this.nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'decree')?.modules?.filter((m: any) => {
        const { permission_key } = m;
        return permission_key && permissionKeys?.find(r => permission_key?.includes(r));
      }) || [];
    }
  }

  ngOnDestroy(): void {
    this.criminal.firstParams = null;
  }

  isGroupActive(item: any): boolean {
    return item?.children?.some((m: any) => this.router.url.includes(m?.router)) || false;
  }

  // panels start expanded and stay that way until the user collapses one from its own header
  isGroupExpanded(item: any): boolean {
    const expanded = this.expandedGroups[item?.key];
    return expanded === undefined ? true : expanded;
  }

  setGroupExpanded(item: any, expanded: boolean) {
    this.expandedGroups[item?.key] = expanded;
  }

  _onSelectedCalendar(event) {
  }

  setToggle() {
    if (this.criminal?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }
}
