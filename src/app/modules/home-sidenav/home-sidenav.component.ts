import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-sidenav',
  templateUrl: './home-sidenav.component.html',
  styleUrls: ['./home-sidenav.component.scss']
})
export class HomeSidenavComponent implements OnInit {

  dummyIonicons = [
    "add-outline", "add-circle-outline", "airplane-outline", "alarm-outline"
  ]

  toggleBar : boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
