import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SYS_MODULES } from 'src/app/dummy/config';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-latter-router',
    templateUrl: './criminal-latter-router.component.html',
    styleUrls: ['./criminal-latter-router.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalLatterRouterComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'criminal_latter')?.modules || [];

  constructor(
    public criminal: CriminalStore,
    public store: CriminalApplicationStore,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'criminal_latter');
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
