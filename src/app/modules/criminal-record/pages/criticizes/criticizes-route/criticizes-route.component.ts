import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-criticizes-route',
    templateUrl: './criticizes-route.component.html',
    styleUrls: ['./criticizes-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriticizesRouteComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
