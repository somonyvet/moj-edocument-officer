import { Component,OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { STATUS_LIVES_ARRAY } from 'src/app/dummy/appinfo';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-letter-of-condemnation-overview',
  templateUrl: './letter-of-condemnation-overview.component.html',
  styleUrls: ['./letter-of-condemnation-overview.component.scss']
})
export class LetterOfCondemnationOverviewComponent implements OnInit, OnDestroy {
  STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY;
  loading : boolean = false;

  criminalData : any = null;

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    private activatedRoute: ActivatedRoute,
    public store: CitizenStore,
    public criminalStore : CriminalApplicationStore,
  ) { }

  async ngOnInit() {
    this.activatedRoute.params.subscribe(params=>{
      this.loading = true;
      const { docKey } = params;
      if(docKey){
        this.criminalStore.getCriminalRecord(docKey,res=>{
          this.criminalData = res;
          this.loading = false;
        })
      }
    })
  }

  ngOnDestroy(): void {
  }

}

