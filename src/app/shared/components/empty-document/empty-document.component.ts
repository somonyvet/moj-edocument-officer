import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-empty-document',
  templateUrl: './empty-document.component.html',
  styleUrls: ['./empty-document.component.scss']
})
export class EmptyDocumentComponent implements OnInit {
  @Input() headerText:string;
  @Input() description:string;
  @Input() image:string;

  constructor() { }

  ngOnInit(): void {
  }

}
