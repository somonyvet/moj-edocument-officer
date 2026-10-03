import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-org-chart-node',
  templateUrl: './org-chart-node.component.html',
  styleUrls: ['./org-chart-node.component.scss'],
})
export class OrgChartNodeComponent {
  @Input() node: any;
}
