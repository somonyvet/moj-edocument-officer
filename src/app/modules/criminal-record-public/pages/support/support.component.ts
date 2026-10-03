import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

  dummyArr = [1,2,3,4,5]

  constructor() { }

  ngOnInit(): void {
  }

}
