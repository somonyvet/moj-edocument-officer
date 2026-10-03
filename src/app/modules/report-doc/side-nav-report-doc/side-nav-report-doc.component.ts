import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Application } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-side-nav-report-doc',
  templateUrl: './side-nav-report-doc.component.html',
  styleUrls: ['./side-nav-report-doc.component.scss']
})
export class SideNavReportDocComponent implements OnInit {

  isMME: boolean = false;

  Application = Application;

  expansions = {
    'one': true,
    'two': false,
    'three': false,
    'four': false,
    'five': false,
    'six': false,
    'seven': false,
    'eight': false,
    'nine': false,
    'ten': false,
  };

  reportApplications = [
    { path: '/report-doc/everyday-nationality-report', title: 'របាយការណ៍សញ្ជាតិប្រចាំថ្ងៃអាកាស', title_kh: 'របាយការណ៍សញ្ជាតិប្រចាំថ្ងៃអាកាស', icon: '' },
    { path: '/report-doc/daily-operations-report', title: 'របាយការណ៍កិច្ចប្រតិបត្តិការប្រចាំថ្ងៃ', title_kh: 'របាយការណ៍កិច្ចប្រតិបត្តិការប្រចាំថ្ងៃ', icon: '' },
    { path: '/report-doc/visitor-apply-to-cambo', title: 'ស្ថិតិភ្ញៀវសុំទិដ្ឋាការចូលព្រះរាជាណាចក្រកម្ពុជា', title_kh: 'ស្ថិតិភ្ញៀវសុំទិដ្ឋាការចូលព្រះរាជាណាចក្រកម្ពុជា', icon: '' },
    { path: '/report-doc/daily-guest-report', title: 'រាយការណ៍ភ្ញៀវប្រចាំថ្ងៃ', title_kh: 'រាយការណ៍ភ្ញៀវប្រចាំថ្ងៃ', icon: '' },
  ]

  constructor(
    public auth: AuthStore,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const { id } = params;
      if (id && id === 'data') {
        this.isMME = true;
      } else {
        this.isMME = false;
      }
    })
    const expansions = JSON.parse(localStorage.getItem('expansions'));
    if (expansions) {
      this.expansions = expansions
    }
  }

  onOpened(i: number) {
    const isOpen = true;
    switch (i) {
      case 1:
        this.expansions.one = isOpen;
        break;
      case 2:
        this.expansions.two = isOpen;
        break;
      case 3:
        this.expansions.three = isOpen;
        break;
      case 4:
        this.expansions.four = isOpen;
        break;
      case 5:
        this.expansions.five = isOpen;
        break;
      case 6:
        this.expansions.six = isOpen;
        break;
      case 7:
        this.expansions.seven = isOpen;
        break;
      case 8:
        this.expansions.eight = isOpen;
        break;
      case 9:
        this.expansions.nine = isOpen;
        break;
      case 10:
        this.expansions.ten = isOpen;
        break;
    }
    localStorage.setItem('expansions', JSON.stringify(this.expansions));

  }
  onClosed(i: number) {
    const isOpen = false;
    switch (i) {
      case 1:
        this.expansions.one = isOpen;
        break;
      case 2:
        this.expansions.two = isOpen;
        break;
      case 3:
        this.expansions.three = isOpen;
        break;
      case 4:
        this.expansions.four = isOpen;
        break;
      case 5:
        this.expansions.five = isOpen;
        break;
      case 6:
        this.expansions.six = isOpen;
        break;
      case 7:
        this.expansions.seven = isOpen;
        break;
      case 8:
        this.expansions.eight = isOpen;
        break;
      case 9:
        this.expansions.nine = isOpen;
        break;
      case 10:
        this.expansions.ten = isOpen;
        break;
    }
    localStorage.setItem('expansions', JSON.stringify(this.expansions));
  }


}
