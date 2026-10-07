import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-org-chart-node',
    templateUrl: './org-chart-node.component.html',
    styleUrls: ['./org-chart-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OrgChartNodeComponent {
  @Input() node: any;
}
