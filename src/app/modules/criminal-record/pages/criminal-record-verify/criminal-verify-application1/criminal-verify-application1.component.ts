import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CriminalStore } from '../../../stores/criminal.store';

@Component({
  selector: 'app-criminal-verify-application1',
  templateUrl: './criminal-verify-application1.component.html',
  styleUrls: ['./criminal-verify-application1.component.scss']
})
export class CriminalVerifyApplication1Component implements OnInit {
  loading:boolean=true;

  constructor(private store: CriminalStore,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loading=true;
      let item: any = null;
      let urgent = false;
      if (params?.statusKey === 'urgent') {
        item = STATUS_OBJ.REVIEW;
        urgent = true;
      } else {
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

}
