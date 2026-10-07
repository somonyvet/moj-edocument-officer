import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SideNavService } from '../../shared/services/sidenav.servce';

@Component({
    selector: 'app-comment-chart',
    templateUrl: './comment-chart.component.html',
    styleUrls: ['./comment-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommentChartComponent implements OnInit {

  @ViewChild('sidebar') public sidebar: MatSidenav;
  constructor(private sidenavService: SideNavService) { }
  ngOnInit(): void {
    this.sidenavService.setSidenav(this.sidebar);
  }

}
