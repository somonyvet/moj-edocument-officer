import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { PageNotFoundRoutingModule } from './page-not-found-routing.module';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { PageNoDataComponent } from './pages/page-no-data/page-no-data.component';
import { PageUnderConstructionComponent } from './pages/page-under-construction/page-under-construction.component';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    PageNotFoundComponent,
    AccessDeniedComponent,
    PageNoDataComponent,
    PageUnderConstructionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PageNotFoundRoutingModule,
    LottieComponent,
  ],
  providers: [
    provideLottieOptions({ player: playerFactory }),
  ],
})
export class PageNotFoundModule { }
