import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CriminalStore } from '../../../stores/criminal.store';

@Component({
    selector: 'app-criminal-record-approve-application',
    templateUrl: './criminal-record-approve-application.component.html',
    styleUrls: ['./criminal-record-approve-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordApproveApplicationComponent implements OnInit {
  loading: boolean= true;

  constructor(private store: CriminalStore,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loading=true;
      let item: any = null;
      let urgent = false;
      this.store.displayStatus = item;
      this.store.urgent = urgent;
      this.loading=false;
    })
  }

}
