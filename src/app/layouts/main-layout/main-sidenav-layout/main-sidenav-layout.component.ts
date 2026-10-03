import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Application } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-main-sidenav-layout',
  templateUrl: './main-sidenav-layout.component.html',
  styleUrls: ['./main-sidenav-layout.component.scss']
})
export class MainSidenavLayoutComponent implements OnInit {

  isMME : boolean = false;

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

  mmeApplications = [
    // { path: '/mme/settings/data/program', title: 'appication', title_kh: 'កម្មវិធី', icon: 'groups' },
    // { path: '/mme/settings/data/user-program', title: 'appication', title_kh: 'កម្មវិធីតាមអ្នកប្រើប្រាស់', icon: 'accessibility_new' },
    // { path: `/mme/settings/data/mme-program`, title: 'appication', title_kh: 'បង្កើតកម្មវិធី', icon: 'groups' },
    { path: '/mme/settings/data/year-program', title: 'Year for Program', title_kh: 'កម្មវិធីសម្រាប់ឆ្នាំ', icon: 'calendar_today' },
    { path: '/mme/settings/data/planing-category', title: 'Planing Category', title_kh: 'កម្រិតគោលនយោបាយ', icon: 'category' },
    { path: '/mme/settings/data/achievement-status', title: 'Achievement Status', title_kh: 'ផ្ទៀងផ្ទាត់សមិទ្ធិផល', icon: 'verified' },
    { path: '/mme/settings/data/time-scope', title: 'Source Budge', title_kh: 'រៀបចំដែនកំណត់រយៈពេល', icon: 'business_center' },

  ]

  constructor(
    public auth: AuthStore,
    private activatedRoute : ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params=>{
      const { id } = params;
      if(id && id === 'data'){
        this.isMME = true;
      }else{
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
