import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-org-chart',
    templateUrl: './org-chart.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OrgChartComponent {
  @Input() nodes: any[] = [];
}
