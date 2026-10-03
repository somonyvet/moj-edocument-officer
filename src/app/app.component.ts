import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthStore } from './stores/auth.store';
import { NotificationStore } from './stores/document/notification.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  loading: boolean = true;

  constructor(
    public auth: AuthStore,
    private notify: NotificationStore,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.auth.fetchCanActive(async profile => {
      if (profile) {
        const { uid, currentDepartment,isEmbassyUser, selected_application_embassy } = this.auth;
        await this.auth.fetchProfile();
        await this.auth.getUser();
        if(isEmbassyUser){
          this.notify.fetchData(uid, selected_application_embassy?.key)
        }else{
          this.notify.fetchData(uid, currentDepartment?.key)
        }
      }
      this.loading = false;
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.auth.subscribe()
    await this.notify.subscribe()
  }

}


