import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-document-skeleton-loading',
    templateUrl: './document-skeleton-loading.component.html',
    styleUrls: ['./document-skeleton-loading.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentSkeletonLoadingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
