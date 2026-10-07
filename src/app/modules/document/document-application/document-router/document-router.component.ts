import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-document-router',
    templateUrl: './document-router.component.html',
    styleUrls: ['./document-router.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentRouterComponent implements OnInit {

  constructor(private router: Router,
    private auth: AuthStore) { }

  ngOnInit(): void {
    const { currentDepartment } = this.auth;
    this.router.navigate([`/documents/memo/${currentDepartment?.key}/all/me/all`], { queryParams: { periodKey: 'all' } })
  }

}
