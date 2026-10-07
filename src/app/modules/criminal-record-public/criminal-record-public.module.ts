import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { SharedModule } from 'src/app/shared/shared.module';
import { CriminalRecordPublicRoutingModule } from './criminal-record-public-routing.module';
import { CriminalNavRouteComponent } from './pages/criminal-nav-route/criminal-nav-route.component';
import { CriminalNavApplicationComponent } from './pages/criminal-nav-application/criminal-nav-application.component';
import { CriminalLatterRouteComponent } from './pages/criminal-latter-route/criminal-latter-route.component';
import { CriminalLatterFormComponent } from './pages/criminal-latter-form/criminal-latter-form.component';
import { CriminalLatterChooseNationalityComponent } from './pages/criminal-latter-choose-nationality/criminal-latter-choose-nationality.component';
import { CriminalLatterStepRouteComponent } from './pages/criminal-latter-form/criminal-latter-step-route/criminal-latter-step-route.component';
import { CriminalLatterApplicationComponent } from './pages/criminal-latter-form/criminal-latter-application/criminal-latter-application.component';
import { CriminalLatterOverviewComponent } from './pages/criminal-latter-overview/criminal-latter-overview.component';
import { ApplyFormComponent } from './pages/apply-form/apply-form.component';
import { UserProfileInfoComponent } from './pages/user-profile-info/user-profile-info.component';
import { SupportComponent } from './pages/support/support.component';
import { LetterOfCondemnationOverviewComponent } from './pages/letter-of-condemnation-overview/letter-of-condemnation-overview.component';
import { CriminalApplicationCitizenRoutePublicComponent } from './pages/criminal-application-citizen-route-public/criminal-application-citizen-route-public.component';
import { ChooseFormLanguageDialogComponent } from './pages/choose-form-language-dialog/choose-form-language-dialog.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    CriminalNavRouteComponent,
    CriminalNavApplicationComponent,
    CriminalLatterRouteComponent,
    CriminalLatterFormComponent,
    CriminalLatterChooseNationalityComponent,
    CriminalLatterStepRouteComponent,
    CriminalLatterApplicationComponent,
    CriminalLatterOverviewComponent,
    ApplyFormComponent,
    UserProfileInfoComponent,
    SupportComponent,
    LetterOfCondemnationOverviewComponent,
    CriminalApplicationCitizenRoutePublicComponent,
    ChooseFormLanguageDialogComponent,
    MessageDialogComponent,
  ],
  imports: [
    CommonModule,
    CriminalRecordPublicRoutingModule,
    SharedModule,
    LottieComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideLottieOptions({ player: playerFactory }),
  ],
})
export class CriminalRecordPublicModule { }
