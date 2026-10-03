import { Component, OnDestroy, OnInit } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalVerifyStore } from '../../stores/criminalVerify.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-criminal-record-approve',
  templateUrl: './criminal-record-approve.component.html',
  styleUrls: ['./criminal-record-approve.component.scss']
})
export class CriminalRecordApproveComponent implements OnInit, OnDestroy {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'approval_folder')?.modules || [];
  expandedGroups: { [key: string]: boolean } = {};

  constructor(
    public criminal: CriminalStore,
    private auth: AuthStore,
    public store: CriminalVerifyStore,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'approval_folder');
    if (!this.auth.root) {
      this.nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'approval_folder')?.modules?.filter((m: any) => !m?.admin) || []
    } else {
      this.nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'approval_folder')?.modules || []
    }

    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'approval');
    console.log("this.criminal.module",this.criminal.module)
    this.criminal.firstParams = { key: 'approval' }
  }

  ngOnDestroy(): void {
    this.criminal.firstParams = null;
  }

  isGroupActive(item: any): boolean {
    return item?.children?.some((m: any) => this.router.url.includes(m?.router)) || false;
  }

  // panels start expanded and stay that way until the user collapses one from its own header;
  // navigating into another panel must not close them
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
