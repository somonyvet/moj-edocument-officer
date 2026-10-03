import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SYS_MODULES } from 'src/app/dummy/config';
import { MarketplaceStore } from '../../stores/marketplace.store';
import { SwotifyStore } from '../../stores/swotify.store';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.SWOTIFY?.find(m => m?.key === 'marketplace')?.modules || [];

  constructor(private route: ActivatedRoute,
    private swotify: SwotifyStore,
    public store: MarketplaceStore) { }

  ngOnInit(): void {
    this.swotify.module=SYS_MODULES.SWOTIFY?.find(m => m?.key === 'marketplace');
  }

  _onCreateDoc() {

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
