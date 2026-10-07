import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthlayoutComponent } from './layouts/authlayout/authlayout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DocPreviewLayoutComponent } from './layouts/doc-preview-layout/doc-preview-layout.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';
import { AuthGuard } from './auth/auth.guard';
import { OverviewLayoutComponent } from './layouts/overview-layout/overview-layout.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { AppScanQrCodeComponent } from './shared/components/app-scan-qr-code/app-scan-qr-code.component';

const routes: Routes = [

  {
    path: "login",
    component: AuthlayoutComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectLoggedInTo(["/"]) },
    children: [
      { path: "", component: LoginComponent },
    ]
  },
  {
    path: '',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/criminal-record/criminal-record.module').then(m => m.CriminalRecordModule)
  },

  // {
  //   path: '',
  //   component: AuthlayoutComponent,
  //   canActivate: [AngularFireAuthGuard],
  //   data: { authGuardPipe: () => redirectLoggedInTo(["/ecosystem"]) },
  //   children: [
  //     { path: "", component: CriminalRecordLatterComponent },
  //   ]
  // },

  // {
  //   path: 'ecosystem',
  //   canActivate: [AngularFireAuthGuard],
  //   data: { authGuardPipe: () => redirectUnauthorizedTo(["/"]) },
  //   component: CriminalLayoutComponent,
  //   loadChildren: () => import('../app/modules/criminal-record-public/criminal-record-public.module').then(m => m.CriminalRecordPublicModule)
  // },


  {
    path: 'privacy',component: PrivacyComponent
  },

  // {
  //   path: 'finger-print',component: FingerPrintComponent
  // },

  {
    path: 'edoc',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'swotify',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/swotify/swotify.module').then(m => m.SwotifyModule)
  },

  // {
  //   path: "home-sidenav",
  //   component: MainLayoutComponent,
  //   children: [
  //     { path: "", component: HomeSidenavComponent },
  //   ]
  // },
  {
    path: 'control',
    canActivate: [AuthGuard],
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
  },


  {
    path: 'projects',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/mme/mme.module').then(m => m.MmeModule)
  },

  {
    path: 'hr',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/human-resource/human-resource.module').then(m => m.HumanResourceModule)
  },

  {
    path: 'attendance',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/attendance/attendance.module').then(m => m.AttendanceModule)
  },

  {
    path: 'apps',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/organization/organization.module').then(m => m.OrganizationModule)
  },
  {
    path: 'pages',
    canActivate: [AngularFireAuthGuard],
    component: OverviewLayoutComponent,
    loadChildren: () => import('./modules/master-form/master-form.module').then(m => m.MasterFormModule)
  },
  {
    path: 'documents',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/document/document.module').then(m => m.DocumentModule)
  },

  {
    path: 'm-documents',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: DocPreviewLayoutComponent,
    loadChildren: () => import('../app/modules/document-web-view/document-web-view.module').then(m => m.DocumentWebViewModule)
  },

  {
    path: 'inbox',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/inbox/inbox.module').then(m => m.InboxModule)
  },

  {
    path: 'document-panel-lists',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/document-listing-panel/document-listing-panel.module').then(m => m.DocumentListingPanelModule)
  },

  {
    path: 'document',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: DocPreviewLayoutComponent,
    loadChildren: () => import('../app/modules/document-preview/document-preview.module').then(m => m.DocumentPreviewModule)
  },
  {
    path: 'document-template',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/document-template-design/document-template-design.module').then(m => m.DocumentTemplateDesignModule)
  },


  // {
  //   path: 'file-manager',
  //   canActivate: [AngularFireAuthGuard],
  //   data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
  //   component: MainLayoutComponent,
  //   loadChildren: () => import('../app/modules/file-manager/file-manager.module').then(m => m.FileManagerModule)
  // },
  {
    path: 'files',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/file-manager/file-manager.module').then(m => m.FileManagerModule)
  },
  {
    path: 'profile',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'training',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/training/training.module').then(m => m.TrainingModule)
  },
  {
    path: 'report-doc',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/report-doc/report-doc.module').then(m => m.ReportDocModule)
  },
  {
    path: 'company',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(["/login"]) },
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/company/company.module').then(m => m.CompanyModule)
  },

  {
    path: "app-scan-qr-code", component: AppScanQrCodeComponent,
  },

  { path: '**', redirectTo: '/page-not-found', pathMatch: 'full' },
  {
    path: 'page-not-found',
    component: MainLayoutComponent,
    loadChildren: () => import('../app/modules/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    // Angular's own default for this changed between v12 ('emptyOnly') and
    // v22 ('always') -- neither app ever set it explicitly, so each silently
    // used its own version's default. Under 'always', child-route params
    // (e.g. :id) now bubble up to every ancestor's ActivatedRoute, including
    // parent layout components that never received them before. Confirmed
    // concretely: main-sidenav-layout.component's `isMME` (driven by
    // `id === 'data'`) flips to true under Angular 22 when it stayed false
    // under Angular 12 for the identical route, substituting that branch's
    // real content with its "..." placeholder. Restoring the old default
    // app-wide, since this almost certainly affects other components beyond
    // the one this was traced through.
    paramsInheritanceStrategy: 'emptyOnly'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
