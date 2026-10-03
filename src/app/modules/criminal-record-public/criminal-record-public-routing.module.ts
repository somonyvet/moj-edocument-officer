import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CriminalRecordFormRouteComponent } from '../criminal-record/pages/criminal-record-form/criminal-record-form-route/criminal-record-form-route.component';
import { CriminalRecordFormComponent } from '../criminal-record/pages/criminal-record-form/criminal-record-form.component';
import { CvFormCondemnComponent } from '../criminal-record/pages/criminal-record-form/cv-form-condemn/cv-form-condemn.component';
import { CvFormCondemnationPrintComponent } from '../../shared/components/cv-form-condemnation-print/cv-form-condemnation-print.component';
import { LetterOfCondemnationPrintComponent } from '../../shared/components/letter-of-condemnation-print/letter-of-condemnation-print.component';
import { ViewAttachmentCondemnComponent } from '../../shared/components/view-attachment-condemn/view-attachment-condemn.component';
import { ApplyFormComponent } from './pages/apply-form/apply-form.component';
import { CriminalLatterChooseNationalityComponent } from './pages/criminal-latter-choose-nationality/criminal-latter-choose-nationality.component';
import { CriminalLatterApplicationComponent } from './pages/criminal-latter-form/criminal-latter-application/criminal-latter-application.component';
import { CriminalLatterStepRouteComponent } from './pages/criminal-latter-form/criminal-latter-step-route/criminal-latter-step-route.component';
import { CriminalLatterOverviewComponent } from './pages/criminal-latter-overview/criminal-latter-overview.component';
import { CriminalLatterRouteComponent } from './pages/criminal-latter-route/criminal-latter-route.component';
import { CriminalNavApplicationComponent } from './pages/criminal-nav-application/criminal-nav-application.component';
import { CriminalNavRouteComponent } from './pages/criminal-nav-route/criminal-nav-route.component';
import { LetterOfCondemnationOverviewComponent } from './pages/letter-of-condemnation-overview/letter-of-condemnation-overview.component';
import { SupportComponent } from './pages/support/support.component';
import { UserProfileInfoComponent } from './pages/user-profile-info/user-profile-info.component';
import { CriminalApplicationCitizenRoutePublicComponent } from './pages/criminal-application-citizen-route-public/criminal-application-citizen-route-public.component';

const routes: Routes = [
  {
    path: '', component: CriminalNavRouteComponent, children: [
      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
      { path: 'profile', component: UserProfileInfoComponent },
      { path: 'support', component: SupportComponent },
      {
        path: 'criminal-record', component: CriminalLatterRouteComponent, children: [
          { path: '', redirectTo: 'all', pathMatch: 'full' },
          {
            path: ':tabKey', component: CriminalNavApplicationComponent, children: [
              { path: '', redirectTo: 'doc/overview', pathMatch: 'full' },
              { path: 'doc/overview', component: CriminalLatterOverviewComponent },
              {
                path: ':id', component: CriminalApplicationCitizenRoutePublicComponent, children: [
                  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                  { path: `profile`, component: CvFormCondemnationPrintComponent },
                  { path: `attachments`, component: ViewAttachmentCondemnComponent },
                ]
              }
              // {
              //   path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
              //     { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
              //     { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
              //     { path: `profile`, component: CvFormCondemnationPrintComponent },
              //     { path: `attachments`, component: ViewAttachmentCondemnComponent },
              //   ]
              // }
            ]
          },
        ]
      },
    ]
  },
  { path: `criminal-record-latter/create`, component: CriminalLatterChooseNationalityComponent },
  {
    path: 'criminal-record-form/:natinalityKey/:pageKey', component: CriminalRecordFormRouteComponent, children: [
      { path: '', redirectTo: 'na/draft', pathMatch: 'full' },
      {
        path: ':citizenKey/:id', component: CriminalLatterStepRouteComponent, children: [
          { path: '', redirectTo: 'application-form', pathMatch: 'full' },
          { path: 'application-form', component: CriminalLatterApplicationComponent },
          { path: 'curriculum-vitae', component: CvFormCondemnComponent },
          { path: 'apply-application', component: ApplyFormComponent },
        ]
      },
    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CriminalRecordPublicRoutingModule { }
