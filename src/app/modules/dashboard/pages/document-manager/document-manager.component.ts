import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-document-manager',
    templateUrl: './document-manager.component.html',
    styleUrls: ['./document-manager.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentManagerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
