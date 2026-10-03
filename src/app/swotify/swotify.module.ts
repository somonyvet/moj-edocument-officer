import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SwotifyRoutingModule } from './swotify-routing.module';
import { HomeComponent } from './modules/home/home.component';
import { MarketplaceComponent } from './modules/marketplace/marketplace.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { MarketplaceListingComponent } from './modules/marketplace/marketplace-listing/marketplace-listing.component';
import { AccountantsComponent } from './modules/accountants/accountants.component';
import { ChartOfAccountsComponent } from './modules/accountants/chart-of-accounts/chart-of-accounts.component';
import { PettyCashComponent } from './modules/accountants/petty-cash/petty-cash.component';
import { ChartOfAccountFormComponent } from './modules/accountants/chart-of-accounts/chart-of-account-form/chart-of-account-form.component';
export function playerFactory() {
  return player;
}
@NgModule({
  declarations: [
    HomeComponent,
    MarketplaceComponent,
    MarketplaceListingComponent,
    AccountantsComponent,
    ChartOfAccountsComponent,
    PettyCashComponent,
    ChartOfAccountFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SwotifyRoutingModule,
    LottieModule,
    LottieModule.forRoot({ player: playerFactory }),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})

export class SwotifyModule { }
