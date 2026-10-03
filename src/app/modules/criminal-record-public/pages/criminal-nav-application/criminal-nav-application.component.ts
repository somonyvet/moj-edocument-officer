import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { criminal_tabs } from 'src/app/modules/criminal-record/dummy/criminal.dummy';
import { CriminalStore } from 'src/app/modules/criminal-record/stores/criminal.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { ApplicationStore } from '../../store/application.store';

@Component({
  selector: 'app-criminal-nav-application',
  templateUrl: './criminal-nav-application.component.html',
  styleUrls: ['./criminal-nav-application.component.scss']
})
export class CriminalNavApplicationComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.public_applications;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ព្រឹត្តិបត្រថ្កោលទោស`;
  urgent: boolean = false;
  status: any = null;
  STATUS_OBJ = STATUS_OBJ;

  constructor(private route: ActivatedRoute,
    public store: ApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលពាក្យស្នើសុំ`;
    this.criminal.routerCreate = `/criminal-record/form/application-no-iii`;
    this.tabs = criminal_tabs.public_applications?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/${m?.key}` }))
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.params = params;
      this.status = params?.tabKey === 'pending' ? STATUS_OBJ.DRAFT : STATUS_OBJ.APPLY;
      this.urgent = params?.tabKey === 'urgent';
      const { uid } = this.auth;
      await this.store.fetchCriminalRecords(uid, res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.unsubscribe()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { uid } = this.auth;
    this.store.fetchMoreCriminalRecords(uid, res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    // this.loadingSearch = true;
    // const { currentDepartment } = this.auth
    // this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
    //       this.loadingSearch = false;
    // })
  }

}
