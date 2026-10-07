import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CitizenStore } from '../../../stores/citizen.store';
import { CriminalStore } from '../../../stores/criminal.store';

@Component({
    selector: 'app-citizen-profile',
    templateUrl: './citizen-profile.component.html',
    styleUrls: ['./citizen-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CitizenProfileComponent implements OnInit {
  tabs = criminal_tabs.citizen_nationality;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ប្រវត្តិរូប`;
  nationalKey: string = null;
  constructor(private route: ActivatedRoute,
    public store: CitizenStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលប្រវត្តិរូប`;
    this.criminal.routerCreate = `/criminal-record/criticizes/profile/form/draft`;

    this.tabs = criminal_tabs.citizen_nationality?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/profile/${m?.key}` }))
    this.route.params.subscribe(async params => {
      this.loading = false;
      this.params = params;
      const { config } = this.auth;
      this.nationalKey = params?.tabKey === 'foreigner' ? null : config?.country_khmer_key;
      await this.store.fetchCitizens(this.nationalKey, res => {
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

  async scrollHandler(e) {
    // if (e.endIndex !== this.store.data?.length - 1) return
    // this.loadingMore = true;
    // const { currentDepartment } = this.auth
    // await this.store.fetchMore(this.statusKey, currentDepartment?.key, res => {
    //   this.loadingMore = false;
    // })
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