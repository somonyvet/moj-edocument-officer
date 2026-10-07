import { HumanResourceModule } from './modules/human-resource/human-resource.module';
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { provideHttpClient, withJsonpSupport, withXhr } from '@angular/common/http';
import { BnNgIdleService } from 'bn-ng-idle';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './pages/auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { MainLayoutHeaderComponent } from './layouts/main-layout/main-layout-header/main-layout-header.component';
import { MainSidenavLayoutComponent } from './layouts/main-layout/main-sidenav-layout/main-sidenav-layout.component';
import { FileManagerLayoutComponent } from './layouts/file-manager-layout/file-manager-layout.component';
import { DocPreviewLayoutComponent } from './layouts/doc-preview-layout/doc-preview-layout.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireFunctionsModule, REGION } from '@angular/fire/compat/functions';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database'
import { ChatBoxComponent } from './shared/components/chat/chat-box/chat-box.component';
import { ChatBoxesComponent } from './shared/components/chat/chat-boxes/chat-boxes.component';
import { ChatBoxLeftComponent } from './shared/components/chat/chat-box-left/chat-box-left.component';
import { ChatBoxRightComponent } from './shared/components/chat/chat-box-right/chat-box-right.component';
import { SignInFormComponent } from './pages/sign-in-form/sign-in-form.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS } from '@angular/material/slide-toggle';
import player from 'lottie-web';
import { RegisterFormComponent } from './pages/auth/register-form/register-form.component';
import { HomeSidenavComponent } from './modules/home-sidenav/home-sidenav.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SnackNotificationComponent } from './pages/snack-notification/snack-notification.component';
import { OverviewLayoutComponent } from './layouts/overview-layout/overview-layout.component';
import { CriminalRecordLatterComponent } from './pages/criminal-record-latter/criminal-record-latter.component';
import { CriminalLayoutComponent } from './layouts/criminal-layout/criminal-layout.component';
import { CriminalHeaderComponent } from './layouts/criminal-layout/criminal-header/criminal-header.component';
import { CriminalRecordLatterHeadComponent } from './pages/criminal-record-latter/pages/criminal-record-latter-head/criminal-record-latter-head.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

export function playerFactory() {
  return player;
}
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    LoginComponent,
    MainLayoutComponent,
    MainLayoutHeaderComponent,
    MainSidenavLayoutComponent,
    FileManagerLayoutComponent,
    DocPreviewLayoutComponent,
    ChatBoxComponent,
    ChatBoxesComponent,
    ChatBoxLeftComponent,
    ChatBoxRightComponent,
    SignInFormComponent,
    SignupComponent,
    RegisterFormComponent,
    HomeSidenavComponent,
    SnackNotificationComponent,
    OverviewLayoutComponent,
    CriminalRecordLatterComponent,
    CriminalLayoutComponent,
    CriminalHeaderComponent,
    CriminalRecordLatterHeadComponent,
    PrivacyComponent,
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    SharedModule,
    NgbModule,
    LottieComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    provideHttpClient(withXhr(), withJsonpSupport()),
    provideLottieOptions({ player: playerFactory }),
    BnNgIdleService,
    { provide: REGION, useValue: 'asia-east2' },
    { provide: MAT_TABS_CONFIG, useValue: { stretchTabs: false, alignTabs: 'start' } },
    // ~400 of the app's form-fields never set an explicit `appearance` and relied
    // on Angular 12's default, which was the legacy underline-only style. MDC
    // removed the 'legacy'/'standard' appearances entirely, so those same
    // form-fields silently fell back to MDC's own default, 'fill' (a filled grey
    // background) -- a pervasive, app-wide visual regression. 'outline' is the
    // closest MDC equivalent to the old look and also matches the ~130
    // form-fields that already explicitly request appearance="outline".
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    // MDC slide-toggles show a checkmark/minus icon inside the handle by
    // default; legacy toggles never had icons at all. hideIcon restores that.
    { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
