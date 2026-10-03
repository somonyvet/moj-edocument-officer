import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-application-route-search',
  templateUrl: './criminal-application-route-search.component.html',
  styleUrls: ['./criminal-application-route-search.component.scss']
})
export class CriminalApplicationRouteSearchComponent implements OnInit, OnDestroy {
  loading:boolean=true;

  constructor(private store: CriminalStore,
    private router: Router,
    private route: ActivatedRoute,
    private criminalStore: CriminalApplicationStore) { }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.loading=true;
      let item: any = null;
      let urgent = false;
      if (params?.statusKey === 'urgent') {
        item = STATUS_OBJ.APPLY;
        urgent = true;
      }
      else {
        const statusKey = `${params?.statusKey}`.toUpperCase();
        item = STATUS_OBJ[statusKey];
      }
      if (!item) {
        this.router.navigate([`/page-not-found`])
        return;
      }
      this.store.displayStatus = item;
      this.store.urgent = urgent;
      this.loading=false;
    })
  }

  ngOnDestroy(): void {

  }

}
