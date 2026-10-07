import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';

@Component({
    selector: 'app-document-urgent',
    templateUrl: './document-urgent.component.html',
    styleUrls: ['./document-urgent.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentUrgentComponent implements OnInit {
  @Input() data:IHeaderInformation[];
  @Input() loading:boolean;

  img = "../../../../../../assets/images/doc-cover.jpg"

  constructor(
  ) { }

  ngOnInit(): void {
    
  }

}
