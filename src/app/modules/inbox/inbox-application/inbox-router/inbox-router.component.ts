import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-inbox-router',
  templateUrl: './inbox-router.component.html',
  styleUrls: ['./inbox-router.component.scss']
})
export class InboxRouterComponent implements OnInit {

  constructor(private router: Router,
    private auth: AuthStore) { }

  ngOnInit(): void {
    const { currentDepartment } = this.auth;
    this.router.navigate([`/inbox/tasks/${currentDepartment?.key}`])
  }

}
