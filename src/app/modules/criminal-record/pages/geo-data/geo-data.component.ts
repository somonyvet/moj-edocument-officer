import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-geo-data',
    templateUrl: './geo-data.component.html',
    styleUrls: ['./geo-data.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoDataComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
  }

}
