import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-doc-preview-layout',
    templateUrl: './doc-preview-layout.component.html',
    styleUrls: ['./doc-preview-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocPreviewLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
