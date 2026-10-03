import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tabs } from 'src/app/dummy/tabs';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  TABS = tabs.hr_officers;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onLink(){
    this.router.navigate([`/ecosystems/s/createStor`])
  }


}
