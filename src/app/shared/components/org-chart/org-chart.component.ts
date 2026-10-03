import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
})
export class OrgChartComponent {
  @Input() nodes: any[] = [];
}
