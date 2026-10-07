import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-comment-decree-view',
    templateUrl: './comment-decree-view.component.html',
    styleUrls: ['./comment-decree-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommentDecreeViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
