import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SYS_MODULES } from 'src/app/dummy/config';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
    selector: 'app-ministry-of-labor',
    templateUrl: './ministry-of-labor.component.html',
    styleUrls: ['./ministry-of-labor.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MinistryOfLaborComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'molvt')?.modules || [];

  constructor(
    public criminal: CriminalStore,
    public store: CriminalApplicationStore,
    public dialog: MatDialog,
    private auth: AuthStore
  ) { }

  ngOnInit(): void {
   
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
