import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-sub-comment-listing',
    templateUrl: './sub-comment-listing.component.html',
    styleUrls: ['./sub-comment-listing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SubCommentListingComponent implements OnInit {
  @Input() data:any;
  @Input() header:any;
  constructor() { }

  ngOnInit(): void {
  }

}
