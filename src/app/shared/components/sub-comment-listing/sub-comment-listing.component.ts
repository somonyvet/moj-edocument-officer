import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub-comment-listing',
  templateUrl: './sub-comment-listing.component.html',
  styleUrls: ['./sub-comment-listing.component.scss']
})
export class SubCommentListingComponent implements OnInit {
  @Input() data:any;
  @Input() header:any;
  constructor() { }

  ngOnInit(): void {
  }

}
