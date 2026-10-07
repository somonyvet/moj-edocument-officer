import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { swotify_tabs } from 'src/app/swotify/dummy/tab.dummy';
import { AccountFlatNode, AccountNode } from 'src/app/swotify/interfaces/account.interface';
import { ChartOfAccountStore } from 'src/app/swotify/stores/chartOfAccount.store';
import { SwotifyStore } from 'src/app/swotify/stores/swotify.store';
import { ChartOfAccountFormComponent } from './chart-of-account-form/chart-of-account-form.component';


@Component({
    selector: 'app-chart-of-accounts',
    templateUrl: './chart-of-accounts.component.html',
    styleUrls: ['./chart-of-accounts.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChartOfAccountsComponent implements OnInit {
  tabs = swotify_tabs.chartOfAccounts;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `Chart of Accounts`

  private _transformer = (node: AccountNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      item: node.item,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<AccountFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  // treeControl = new NestedTreeControl<AccountNode>(node => node.children);
  // dataSource = new MatTreeNestedDataSource<AccountNode>();

  constructor(private route: ActivatedRoute,
    public store: ChartOfAccountStore,
    private swotify: SwotifyStore,
    public auth: AuthStore,
  ) { }

  hasChild = (_: number, node: AccountFlatNode) => node.expandable;

  ngOnInit(): void {
    const { module } = this.swotify;
    this.swotify.newButtonName = `New account`;
    this.swotify.componentDialog = ChartOfAccountFormComponent;

    this.tabs = swotify_tabs.chartOfAccounts?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/chart-of-accounts/${m?.key}` }))
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.params = params;
      this.store.fetchData(params?.tabKey, items => {
        this.dataSource.data = items;
        this.treeControl.expandAll()
        this.loading = false;
      })
    })
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

  createRange(number){
    // return new Array(number);
    return new Array(number).fill(0)
      .map((n, index) => index + 1);
  }
}