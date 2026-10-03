import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SideNavService } from '../../shared/services/sidenav.servce';

@Component({
  selector: 'app-comment-chart',
  templateUrl: './comment-chart.component.html',
  styleUrls: ['./comment-chart.component.scss']
})
export class CommentChartComponent implements OnInit {

  @ViewChild('sidebar') public sidebar: MatSidenav;
  constructor(private sidenavService: SideNavService) { }
  ngOnInit(): void {
    this.sidenavService.setSidenav(this.sidebar);
  }

}
