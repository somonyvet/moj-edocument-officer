import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-listing',
  templateUrl: './filter-listing.component.html',
  styleUrls: ['./filter-listing.component.scss']
})
export class FilterListingComponent implements OnInit {

  @Input() filterOptions: any[];
  @Input() companyKey: any;
  @Input() itemStatusKey: any;
  @Input() filterRef: any;

  @Output() onFilter = new EventEmitter();
  @Output() onClear = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }


}
