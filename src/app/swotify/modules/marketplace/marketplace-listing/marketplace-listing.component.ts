import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { MarketplaceStore } from 'src/app/swotify/stores/marketplace.store';
import { swotify_tabs } from 'src/app/swotify/dummy/tab.dummy';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { SwotifyStore } from 'src/app/swotify/stores/swotify.store';

@Component({
    selector: 'app-marketplace-listing',
    templateUrl: './marketplace-listing.component.html',
    styleUrls: ['./marketplace-listing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MarketplaceListingComponent implements OnInit, OnDestroy {
  tabs = swotify_tabs.marketplaces;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;

  constructor(private route: ActivatedRoute,
    public store: MarketplaceStore,
    private swotify: SwotifyStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    const { module } = this.swotify;
    this.tabs = swotify_tabs.marketplaces?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/listing/${m?.key}` }))
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