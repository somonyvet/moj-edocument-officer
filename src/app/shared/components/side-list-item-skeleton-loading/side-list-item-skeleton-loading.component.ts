import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-list-item-skeleton-loading',
  templateUrl: './side-list-item-skeleton-loading.component.html',
  styleUrls: ['./side-list-item-skeleton-loading.component.scss']
})
export class SideListItemSkeletonLoadingComponent implements OnInit {
  @Input() number : number;

  dummyArr : any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.dummyArr.length = this.number||1;
  }

}
