import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';

@Component({
    selector: 'app-criminal-application',
    templateUrl: './criminal-application.component.html',
    styleUrls: ['./criminal-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplicationComponent implements OnInit {
  apps_items = SYS_MODULES.CRIMINAL?.filter(m => m?.key !== 'public_applications')

  constructor(
    public store: CriminalStore,
    public auth: AuthStore
  ) { }

  ngOnInit(): void {
    const { dataEntryOnly, root, permissionKeys } = this.auth;
    const appItems = SYS_MODULES.CRIMINAL?.filter(m => m?.key !== 'public_applications');
    if (root) {
      this.apps_items = appItems;
    } else if (dataEntryOnly) {
      const canSeeModReport = this.auth?.dataEntryMinistry?.key === 'ministry_of_defense';
      if(this.auth?.profile?.admin_mol || canSeeModReport){
        this.apps_items = appItems?.filter(m => ['applications','reports']?.includes(m?.key))
      }else{
        this.apps_items = appItems?.filter(m => m?.key === 'applications')
      }
    } else {
      this.apps_items = appItems?.filter((m: any) => {
        const { permission_key } = m;
        if (permission_key && permissionKeys?.find(r => permission_key?.includes(r))) return m;
      })
    }
  }

  ngOnDestroy(): void {

  }

}
