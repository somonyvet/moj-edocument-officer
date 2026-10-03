import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-latter-tabs',
  templateUrl: './criminal-latter-tabs.component.html',
  styleUrls: ['./criminal-latter-tabs.component.scss']
})
export class CriminalLatterTabsComponent implements OnInit {
  tabs = criminal_tabs.criminal_record_approval_by_folder_tabs_input_number;
  loading: boolean = true;

  canSetApplicationNum : boolean = false;
  CanDone : boolean = false;

  params: any = null;

  childRoute: string = 'criminal-record';
  child: any;
  subscriptionRoute: any;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private router: Router,
    public auth: AuthStore,
    private ps: PrintService,
    private criminal:CriminalStore,
  ) { }

  ngOnInit(): void {
    // this.route.parent.params.subscribe(parentParams=>{

    //   const { statusKey } = parentParams;

    //   if(statusKey === "done") this.CanDone = true;

    //   this.route.params.subscribe(async pas => {
    //     const { module,firstParams,params } = this.criminal;
    //     this.tabs = criminal_tabs.criminal_latter_approval_tabs?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/${this.criminal?.params?.criminalCategoryKey}/${firstParams?.statusKey}/${pas?.criminalKey}/${m?.key}` }))
    //     this.store.fetchSelectedCriminalRecord(pas?.criminalKey, res => {
    //       if (!res) {
    //         this.router.navigate([`/page-not-found`])
    //         return;
    //       }
    //       this.criminal?.fetchCriminalFlow(res=>{
    //         this.canSetApplicationNum = this.auth?.currentDepartment?.key === res.find(f=>f?.flowNo === 1)?.department?.key && statusKey === 'incompleted'
    //         this.loading = false;
    //       })
    //     });
    //   })
    // })
    this.route.params.subscribe(async params => {
      this.loading=true;
      this.params = params;
      this.store.fetchSelectedGroupDoc(params?.id, res => {
        this.loading = false;
      });
    })
    this.router.events.subscribe(e => {
      if (this.child !== this.route.firstChild) {
        this.subscriptionRoute?.unsubscribe();
        this.child = this.route.firstChild;
        this.subscriptionRoute = this.route.firstChild.url.subscribe(x => {
          this.childRoute = x[0]?.path
        });
      }
    });
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord();
  }

  onPrint() {
    this.ps.print("#printD", "a4-criminal")
  }

}
