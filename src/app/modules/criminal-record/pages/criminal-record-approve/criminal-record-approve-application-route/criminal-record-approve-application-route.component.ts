import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-record-approve-application-route',
    templateUrl: './criminal-record-approve-application-route.component.html',
    styleUrls: ['./criminal-record-approve-application-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordApproveApplicationRouteComponent implements OnInit {
  tabs = criminal_tabs.internal_process_applications;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោសជាកញ្ចប់`;
  statusKey : string = null;

  isApproved: boolean = false;
  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    this.route.parent.params.subscribe(async params => {
      this.loading = true;
      const { module, } = this.criminal;
      this.tabs = criminal_tabs.internal_process_applications?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/${params?.statusKey}/${m?.key}` }))
      this.params = params;
      console.log("this.params",this.params)
      const { currentDepartment, config } = this.auth

      this.statusKey = params?.statusKey
      this.store.fetchCLByFolder(currentDepartment?.key, config, params?.statusKey, res => {
        this.loading = false;
      })

      if(this.criminal?.firstParams?.key === 'approval'){
        this.tabs = criminal_tabs.internal_process_applications?.map(m => ({ ...m, path: `/criminal-record/approval` }))
      }
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { currentDepartment } = this.auth
    const { urgent } = this.criminal
    this.store.fetchCLByFolder(currentDepartment?.key, urgent, this.statusKey, res => {
      this.loading = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
  }

}
