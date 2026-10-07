import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IHeaderInformation } from 'functions/src/interfaces/interface';

@Component({
    selector: 'app-document-pined',
    templateUrl: './document-pined.component.html',
    styleUrls: ['./document-pined.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentPinedComponent implements OnInit {
  @Input() data:IHeaderInformation[];
  @Input() loading:boolean;

  img = "../../../../../../assets/images/doc-cover.jpg"
  constructor() { }

  ngOnInit(): void {
 
  }

}
