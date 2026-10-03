import { Component, OnInit } from '@angular/core';
import { Observable, merge, of, fromEvent } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Component({
  selector: 'app-net-info',
  templateUrl: './net-info.component.html',
  styleUrls: ['./net-info.component.scss']
})
export class NetInfoComponent implements OnInit {

  online$: Observable<boolean>;
  constructor() {
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    );
   }
  ngOnInit() {
  }

}
