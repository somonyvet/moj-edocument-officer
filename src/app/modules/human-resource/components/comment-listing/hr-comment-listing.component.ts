import { AuthStore } from 'src/app/stores/auth.store';
import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IComment } from 'src/app/interfaces/document/document.interface';

@Component({
    selector: 'app-hr-comment-listing',
    templateUrl: './hr-comment-listing.component.html',
    styleUrls: ['./hr-comment-listing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HrCommentListingComponent implements OnInit {
  @Input() data: any;
  @Input() header: any;
  @Output() EditReplyComment: EventEmitter<any> = new EventEmitter();
  @Output() DeleteReplyComment: EventEmitter<any> = new EventEmitter();

  cData: any;
  constructor(public auth: AuthStore) { }

  ngOnInit(): void {
    this.auth.getUser();
  }
  ngOnChanges(changes: SimpleChanges): void {
    const currentData = changes?.data?.currentValue;
    this.cData = currentData?.filter(f => f.headerKey === this.header.key);
  }

  trackByIdx(i: number) {
    return i;
  }

  editComment(item) {
    this.EditReplyComment.emit(item)
  }
  deleteComment(item) {
    this.DeleteReplyComment.emit(item)
  }
}
