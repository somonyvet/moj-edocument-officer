import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalVerifyStore } from '../../stores/criminalVerify.store';
import { AddGroupRequestFormComponent } from './add-group-request-form/add-group-request-form.component';

@Component({
    selector: 'app-criminal-group-request-form',
    templateUrl: './criminal-group-request-form.component.html',
    styleUrls: ['./criminal-group-request-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalGroupRequestFormComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'folder')?.modules || [];

  constructor(
    public criminal: CriminalStore,
    private auth: AuthStore,
    public store: CriminalVerifyStore) { }

  ngOnInit(): void {
    this.criminal.newButtonName = "បង្កើតបញ្ជីលេខរៀង"
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'folder');
    this.criminal.componentDialog = AddGroupRequestFormComponent;
    this.criminal.routerCreate = null;
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
