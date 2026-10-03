import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { DataService } from 'src/app/shared/services/data.service';
import { pushToArray, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { getYearsList, todayDate } from 'src/app/shared/services/mapping.service';
import { days, monthOfYear } from 'src/app/dummy/report';

@Component({
  selector: 'app-criminal-verify-application3',
  templateUrl: './criminal-verify-application3.component.html',
  styleUrls: ['./criminal-verify-application3.component.scss']
})
export class CriminalVerifyApplication3Component implements OnInit {
  tabs = criminal_tabs.internal_process_applications;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  isApproved: boolean = false;
  urgent: any = null;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;
  MOL_workplace_key: string = null;

  constructor(
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private ds: DataService,
  ) {
    const { config } = this.auth;
    this.MOL_workplace_key = config.department_labor?.key
  }

  ngOnInit(): void {
    this.route.parent.params.subscribe(async params => {
      this.loading = true;
      const { module } = this.criminal;
      this.isApproved = false;
      if (params?.statusKey === 'urgent') {
        this.urgent = true;
        this.store.fetchCriminalRecords(STATUS_OBJ.DECREE, null, true, null, false, res => {
          this.loading = false;
        })
      } else if (params?.statusKey === 'processing') {
        this.urgent = null;
        this.isApproved = true;
        const { currentDepartment } = this.auth;
        this.store.fetchCriminalRecordsForApprove(currentDepartment?.key, this.urgent, this.isApproved, res => {
          this.loading = false;
        })
      } else if (params?.statusKey === 'application') {
        this.urgent = null;
        this.isApproved = true;
        const { currentDepartment } = this.auth;
        this.store.fetchCriminalRecordsForApprove(currentDepartment?.key, this.urgent, this.isApproved, res => {
          this.loading = false;
        })
      } else {
        this.store.fetchCriminalRecords(STATUS_OBJ.PAID, null, null, null, false, res => {
          this.loading = false;
        })
      }
      this.tabs = criminal_tabs.internal_process_applications?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/${params?.statusKey}/${m?.key}` }))
      this.params = params;
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
    if ((e.endIndex !== this.store.data?.length - 1) || this.loadingMore ) return
    this.loadingMore = true;
    this.store.fetchMoreCriminalRecords(STATUS_OBJ.PAID, null, null, null, false, res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value) {
      this.store.fetchSearchCriminalListing(null, null, null, value.toUpperCase(), STATUS_OBJ.REVIEW, res => {
      })
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

  async resolve168(){
    let data =  []
    this.ds.criminalRecordRef(ref=>ref.where('status.key','>=',STATUS_OBJ?.DECREE.key)).get().toPromise().then((res)=>{

      data = pushToArray(res)
      // const DAYS = days?.map(m => ({ ...m, isKhmer: true }))
      // const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: true }))
      // const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: true, name_en: `${m}` } })

      data = data.filter(f => (new Date(f.paid_at?.toDate()).getDate()) !==  (new Date(f.paid_at?.toDate()).getDate()) )
      // const datetemp = todayDate(data[0].paid_at?.toDate(), DAYS, MONTHS, years);

      const batch = this.ds.batch()

      data = data.map(m=>{
        const dataRef = this.ds.criminalRecordRef().doc(m.key).ref;

        // batch.update(dataRef, {})
      })

      // batch.commit().then(()=>{
      //   console.log('done')
      // })
    })
  }
}
