import { Component, OnInit } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { CitizenStore } from '../../stores/citizen.store';
import { CriminalStore } from '../../stores/criminal.store';

@Component({
  selector: 'app-criticizes',
  templateUrl: './criticizes.component.html',
  styleUrls: ['./criticizes.component.scss']
})
export class CriticizesComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'criticizes')?.modules || [];

  constructor(
    public criminal: CriminalStore,
    public store: CitizenStore) { }

  ngOnInit(): void {
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'criticizes');
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
