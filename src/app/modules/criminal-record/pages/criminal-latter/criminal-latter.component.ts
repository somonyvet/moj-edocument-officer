import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-latter',
    templateUrl: './criminal-latter.component.html',
    styleUrls: ['./criminal-latter.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalLatterComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.criminal_latter_input_number;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ព្រឹត្តិបត្រថ្កោលទោស`;

  item_status: any = null;
  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe(async paramItems => {
      const { module, params } = this.criminal;
      this.tabs = criminal_tabs.criminal_latter_input_number?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/${params?.criminalCategoryKey}/${m?.key}` }))
      this.params = params;
      const { statusKey } = paramItems;
      this.item_status = STATUS_OBJ[`${statusKey}`]
      this.criminal.firstParams = paramItems;
      // if(statusKey === 'APPROVED'){
      //   this.item_status = STATUS_OBJ.RECEIVE_FOLDER
      // }
      await this.store.fetchFolderByStatus(this.item_status, null, null, null,false, res => {
        this.loading = false;
      })
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
    this.store.fetchMoreCriminalRecords(this.item_status, null, null, null,false, res => {
      this.loading = false;
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
