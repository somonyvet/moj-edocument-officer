import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SYS_MODULES } from 'src/app/dummy/config';
import { programArrayObj } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { GeoProvinceFormComponent } from '../../geo-data/geo-province-form/geo-province-form.component';

@Component({
  selector: 'app-criminal-application-route',
  templateUrl: './criminal-application-route.component.html',
  styleUrls: ['./criminal-application-route.component.scss']
})
export class CriminalApplicationRouteComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'applications')?.modules?.filter((m:any) => !m?.dataEntry) || [];

  constructor(
    public criminal: CriminalStore,
    public store: CriminalApplicationStore,
    public dialog: MatDialog,
    public auth: AuthStore
  ) { }

  ngOnInit(): void {
    const { root, dataEntryOnly, permissionKeys,officerType } = this.auth;
    let permissionArray = permissionKeys
    if(officerType?.key === 1){ // application online officers
      permissionArray.push('criminal_applications_office_online')
      this.auth.permissionKeys.push('criminal_applications_office_online')
    }
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'applications');
    if (!root) {
      const items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'applications')?.modules?.filter((m:any) => !m?.admin && !m?.dataEntry) || [];
      if (dataEntryOnly) {
        let dataEntryItems = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'applications')?.modules?.filter((m:any) => !m?.admin && m?.dataEntry) || [];
        if (this.auth.dataEntryMinistry?.key === programArrayObj.ministry_of_defense.key) {
          dataEntryItems = dataEntryItems.filter((m: any) => m?.key !== 'criminal-record-confirm' && m?.key !== 'approved');
        } else {
          dataEntryItems = dataEntryItems.filter((m: any) => m?.key !== 'criminal-record-rejected' && m?.key !== 'criminal-record-completed');
        }
        this.nav_items = dataEntryItems;
      } else {
        this.nav_items = items?.filter((m: any) => {
          const { permission_key } = m;
          if (permission_key && permissionArray?.find(r => permission_key?.includes(r))) return m;
        })
      }
    } else {
      this.nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'applications')?.modules?.filter((m:any) => !m?.dataEntry) || [];
    }
  }

  onCreate(item?: any) {
    let idName = '', idComponent: any = '';
    idName = this.criminal.newIDName;
    if (idName == 'province') { idComponent = GeoProvinceFormComponent };
    const dialogRef = this.dialog.open(idComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _onSelectedCalendar(event) {}

  setToggle() {
    if (this.criminal?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }
}
