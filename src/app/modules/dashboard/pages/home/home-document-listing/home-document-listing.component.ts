import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
    selector: 'app-home-document-listing',
    templateUrl: './home-document-listing.component.html',
    styleUrls: ['./home-document-listing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomeDocumentListingComponent implements OnInit, OnDestroy {
  tabs = tabs.inbox;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;

  link: string = '';
  title: string = 'ឯកសារ'
  lottie: AnimationOptions = {
    path: '../../../../assets/animate/85710-sea-empty-state1.json',
  };

  constructor(private route: ActivatedRoute,
    public store: MemoStore,
    private auth: AuthStore,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.params = params;
      if (params?.tabKey) {
        this.store.tabKey = params?.tabKey
      }
      if (params?.tabKey === "received-document") {
        this.link = 'preview/';
      } else if (params?.tabKey === "archived") {
        this.link = 'archived/';
      } else {
        this.link = '';
      }
      this.getTab();
      const { uid, currentDepartment } = this.auth;
      const { tabKey } = this.params
      if (tabKey === 'pined') {
        await this.store.fetchPinedDocument(uid)
        this.loading = false;
      } else {
        this.store.fetchData(uid, currentDepartment?.key, params, res => {
          this.loading = false;
        })
      }
    })
  }

  getTab() {
    const { tabKey } = this.params
    switch (tabKey) {
      case 'approval':
        this.tabs = tabs.inbox;
        this.title = `ឯកសារត្រូវពិនិត្យឯកភាព`
        break;
      case 'received-document':
        this.tabs = tabs.docIn
        this.title = `ឯកសារចូល`
        break;
      case 'urgent':
        this.tabs = tabs.urgent
        this.title = `ឯកសារបន្ទាន់`
        break;
      case 'inbox':
        this.tabs = tabs.inBoxed
        this.title = `ប្រអប់ឌីជីថល`
        break;
      case 'pined':
        this.tabs = tabs.pined
        this.title = `ឯកសារទុកចំណាំ`
        break;
      case 'my-files':
        this.tabs = tabs.myFiles
        this.title = `ឯកសារខ្ញុំ`
        break;
      case 'cc-files':
        this.tabs = tabs.myFiles
        this.title = `ឯកសារចេញចូល`
        break;
      case 'archived':
        this.tabs = tabs.archived
        this.title = `ឯកសារបិទបញ្ចប់`
        break;
      case 'rejected':
        this.tabs = tabs.rejected
        this.title = `ឯកសារមោឃៈ`
        break;
      default:
        this.tabs = tabs.inbox
        this.title = `ឯកសារពិនិត្យ និងឯកភាព`
        break;
    }
    this.tabs = this.tabs?.map(m => ({ ...m, path: `/edoc/documents/${this.params?.tabKey}/${m?.key}` }));

  }

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    const { uid, currentDepartment } = this.auth;
    this.loadingMore = true;
    await this.store.fetchMore(uid, currentDepartment?.key, this.params, res => {
      this.loadingMore = false;
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.unsubscribe()
  }

  trackByIdx(i) {
    return i;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  onSearch(event) {
    const { uid, currentDepartment } = this.auth;
    this.loading = true;
    this.store.fetchSearch(uid, currentDepartment?.key, this.params, event, null, res => {
      this.loading = false;
    })
  }

}
