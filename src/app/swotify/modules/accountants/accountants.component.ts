import { Component, OnInit } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { MarketplaceStore } from '../../stores/marketplace.store';
import { SwotifyStore } from '../../stores/swotify.store';

@Component({
  selector: 'app-accountants',
  templateUrl: './accountants.component.html',
  styleUrls: ['./accountants.component.scss']
})
export class AccountantsComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.SWOTIFY?.find(m => m?.key === 'accountant')?.modules || [];

  constructor(
    public swotify: SwotifyStore,
    public store: MarketplaceStore) { }

  ngOnInit(): void {
    this.swotify.module=SYS_MODULES.SWOTIFY?.find(m => m?.key === 'accountant');
  }


  _onSelectedCalendar(event) {
  }

  setToggle() {
    if (this.swotify?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }
}
