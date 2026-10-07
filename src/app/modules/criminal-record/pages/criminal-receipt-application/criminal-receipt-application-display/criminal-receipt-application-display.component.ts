import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-receipt-application-display',
    templateUrl: './criminal-receipt-application-display.component.html',
    styleUrls: ['./criminal-receipt-application-display.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalReceiptApplicationDisplayComponent implements OnInit {
  criminalData
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public criminalStore : CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.criminalData = this.criminalStore.getSelectedCriminalRecord(params?.criminalKey);
      if(!this.criminalData){
        this.router.navigate(['404'])
      }
    })
  }

}
