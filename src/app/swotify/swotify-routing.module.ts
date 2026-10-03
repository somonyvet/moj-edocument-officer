import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabLayoutComponent } from '../layouts/tab-layout/tab-layout.component';
import { AccountantsComponent } from './modules/accountants/accountants.component';
import { ChartOfAccountsComponent } from './modules/accountants/chart-of-accounts/chart-of-accounts.component';
import { PettyCashComponent } from './modules/accountants/petty-cash/petty-cash.component';
import { HomeComponent } from './modules/home/home.component';
import { MarketplaceListingComponent } from './modules/marketplace/marketplace-listing/marketplace-listing.component';
import { MarketplaceComponent } from './modules/marketplace/marketplace.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: '', redirectTo: 'marketplace', pathMatch: 'full' },
      {
        path: 'marketplace', component: MarketplaceComponent, children: [
          { path: '', redirectTo: 'listing', pathMatch: 'full' },
          {
            path: 'listing', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              { path: ':tabKey', component: MarketplaceListingComponent }
            ]
          }
        ]
      },
      {
        path: 'accountants', component: AccountantsComponent, children: [
          { path: '', redirectTo: 'petty-cash', pathMatch: 'full' },
          {
            path: 'petty-cash', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              { path: ':tabKey', component: PettyCashComponent }
            ]
          },
          {
            path: 'chart-of-accounts', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              { path: ':tabKey', component: ChartOfAccountsComponent }
            ]
          },
        ]
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwotifyRoutingModule { }
