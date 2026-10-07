import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { swotify_tabs } from 'src/app/swotify/dummy/tab.dummy';
import { ChartOfAccountStore } from 'src/app/swotify/stores/chartOfAccount.store';
import { SwotifyStore } from 'src/app/swotify/stores/swotify.store';

@Component({
    selector: 'app-petty-cash',
    templateUrl: './petty-cash.component.html',
    styleUrls: ['./petty-cash.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PettyCashComponent implements OnInit {
  tabs = swotify_tabs.chartOfAccounts;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title:string=`Petty Cash`;
  

  constructor(private route: ActivatedRoute,
    public store: ChartOfAccountStore,
    private swotify: SwotifyStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    const { module } = this.swotify;
    this.swotify.newButtonName=`New Expense`;

    this.tabs = swotify_tabs.chartOfAccounts?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/petty-cash/${m?.key}` }))
    this.route.params.subscribe(async params => {
      this.loading = false;
      this.params = params;
      // await this.store.fetchData(this.statusKey, currentDepartment?.key, null, res => {
      //   this.loading = false;
      // })
    })
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

  async ngOnDestroy(): Promise<void> {
    await this.store.unsubscribe()
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