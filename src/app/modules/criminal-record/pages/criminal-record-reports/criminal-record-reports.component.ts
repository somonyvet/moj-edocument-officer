import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SYS_MODULES } from 'src/app/dummy/config';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-reports',
  templateUrl: './criminal-record-reports.component.html',
  styleUrls: ['./criminal-record-reports.component.scss']
})
export class CriminalRecordReportsComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'reports')?.modules?.filter((m: any) => !m?.dataEntry) || [];

  constructor(
    public criminal: CriminalStore,
    public store: CriminalApplicationStore,
    public dialog: MatDialog,
    private auth: AuthStore
  ) { }

  ngOnInit(): void {
    const { root, dataEntryOnly, permissionKeys, officerType, dataEntryMinistry } = this.auth;
    let permissionArray = permissionKeys
    if(officerType?.key === 1){ // application online officers
      permissionArray.push('criminal_applications_office_online')
      this.auth.permissionKeys.push('criminal_applications_office_online')
    }
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'reports');
    if (!root) {
      const items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'reports')?.modules?.filter((m: any) => !m?.admin && !m?.dataEntry) || [];
      if (dataEntryOnly) {
        if(this.auth?.profile?.admin_mol){
          this.nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'reports')?.modules?.filter((m:any) => (!m?.admin && m?.dataEntry) || m?.permission_key?.includes('mol_admin')) || [];
        }else{
          this.nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'reports')?.modules?.filter((m:any) => (!m?.admin && m?.dataEntry) || (dataEntryMinistry?.key && m?.permission_key?.includes(dataEntryMinistry?.key))) || [];
        }
      } else {
        this.nav_items = items?.filter((m: any) => {
          const { permission_key } = m;
          if (permission_key && permissionArray?.find(r => permission_key?.includes(r))) return m;
        })
      }
    } else {
      this.nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'reports')?.modules?.filter((m: any) => !m?.dataEntry) || [];
    }
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
