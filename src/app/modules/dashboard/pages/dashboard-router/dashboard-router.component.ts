import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-dashboard-router',
    templateUrl: './dashboard-router.component.html',
    styleUrls: ['./dashboard-router.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DashboardRouterComponent implements OnInit {
  
  constructor(private router: Router,
    private auth: AuthStore) { }

  ngOnInit(): void {
    const { currentDepartment } = this.auth;
    this.router.navigate([`workplace/${currentDepartment?.key}/docs`])
  }

}
