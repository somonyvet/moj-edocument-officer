import { Component, OnDestroy, OnInit } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { SwotifyStore } from '../../stores/swotify.store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  apps_items = SYS_MODULES.SWOTIFY

  constructor(public store: SwotifyStore) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

  }

}
