import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CriminalStore } from '../../../stores/criminal.store';

@Component({
  selector: 'app-criminal-latter-print-route',
  templateUrl: './criminal-latter-print-route.component.html',
  styleUrls: ['./criminal-latter-print-route.component.scss']
})
export class CriminalLatterPrintRouteComponent implements OnInit {

  constructor(private route:ActivatedRoute,
    private criminal: CriminalStore,
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params=>{
      this.criminal.params=params;
    })
  }

}
