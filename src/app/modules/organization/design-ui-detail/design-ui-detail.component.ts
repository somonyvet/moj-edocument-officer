import { Component, OnInit } from '@angular/core';
import { tabs } from 'src/app/dummy/tabs';

@Component({
  selector: 'app-design-ui-detail',
  templateUrl: './design-ui-detail.component.html',
  styleUrls: ['./design-ui-detail.component.scss']
})
export class DesignUiDetailComponent implements OnInit {
  tabs = tabs.design_ui;

  constructor() { }

  ngOnInit(): void {
  }

}
