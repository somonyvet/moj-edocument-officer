import { HumanResourceMyFilesComponent } from './pages/human-resource-my-files/human-resource-my-files.component';
import { HumanResourcePermissionComponent } from './pages/human-resource-permission/human-resource-permission.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApproveOfficerGuardGuard } from 'src/app/auth/approve-officer-guard.guard';
import { TabLayoutComponent } from 'src/app/layouts/tab-layout/tab-layout.component';
import { HumanResourceListingComponent } from './pages/human-resource-listing/human-resource-listing.component';
import { HumanResourceMissionsComponent } from './pages/human-resource-missions/human-resource-missions.component';
import { HumanResourceNavComponent } from './pages/human-resource-nav/human-resource-nav.component';
import { HumanResourceComponent } from './pages/human-resource/human-resource.component';
import { OfficerApplicationFormPreviewBiographyComponent } from './pages/officer-application-form-preview-biography/officer-application-form-preview-biography.component';
import { OfficerApplicationFormPreviewRouteComponent } from './pages/officer-application-form-preview-route/officer-application-form-preview-route.component';
import { OfficerApplicationFormPreviewComponent } from './pages/officer-application-form-preview/officer-application-form-preview.component';
import { OfficerApplicationListingComponent } from './pages/officer-personal-info/officer-application-listing/officer-application-listing.component';
import { OfficerFormPreviewRouteComponent } from './pages/officer-personal-info/officer-form-preview-route/officer-form-preview-route.component';
import { OfficerProfileFormComponent } from './pages/officer-personal-info/officer-profile-form/officer-profile-form.component';
import { ViewAttachmentComponent } from './pages/officer-personal-info/view-attachment/view-attachment.component';
import { OfficerEducationLevelComponent } from './pages/officer-profile/officer-education-level/officer-education-level.component';
import { OfficerFamilyInfoComponent } from './pages/officer-profile/officer-family-info/officer-family-info.component';
import { OfficerForeignLanguageComponent } from './pages/officer-profile/officer-foreign-language/officer-foreign-language.component';
import { OfficerPersonalInfoComponent } from './pages/officer-profile/officer-personal-info/officer-personal-info.component';
import { OfficerPraiseComponent } from './pages/officer-profile/officer-praise/officer-praise.component';
import { OfficerProfileComponent } from './pages/officer-profile/officer-profile.component';
import { OfficerPunishmentComponent } from './pages/officer-profile/officer-punishment/officer-punishment.component';
import { OfficerVocationalTrainingLevelComponent } from './pages/officer-profile/officer-vocational-training-level/officer-vocational-training-level.component';
import { OfficerWorkHistoryComponent } from './pages/officer-profile/officer-work-history/officer-work-history.component';
import { FirstBulletinOfCriminalKhComponent } from './pages/officer-profile/first-bulletin-of-criminal-kh/first-bulletin-of-criminal-kh.component';
import { SecondBulletinOfCriminalKhComponent } from './pages/officer-profile/second-bulletin-of-criminal-kh/second-bulletin-of-criminal-kh.component';
import { ThirdCondemnationBulletinComponent } from './pages/officer-profile/third-condemnation-bulletin/third-condemnation-bulletin.component';
import { ThirdBulletinOfCriminalKhComponent } from './pages/officer-profile/third-bulletin-of-criminal-kh/third-bulletin-of-criminal-kh.component';
import { ThirdBulletinOfCriminalEngComponent } from './pages/officer-profile/third-bulletin-of-criminal-eng/third-bulletin-of-criminal-eng.component';
import { ThirdBulletinOfCriminalFrComponent } from './pages/officer-profile/third-bulletin-of-criminal-fr/third-bulletin-of-criminal-fr.component';
import { HumanResourceWorkingHourComponent } from './pages/human-resource-working-hour/human-resource-working-hour.component';
import { OfficerListWorkingHourComponent } from './pages/human-resource-working-hour/officer-list-working-hour/officer-list-working-hour.component';
import { HumanResourceAttendancesComponent } from './pages/human-resource-attendances/human-resource-attendances.component';
import { HumanResourceHolidaysComponent } from './pages/human-resource-holidays/human-resource-holidays.component';
import { HumanResourcePregnancyBreakComponent } from './pages/human-resource-pregnancy-break/human-resource-pregnancy-break.component';
import { HumanResourceMissionsListComponent } from './pages/human-resource-missions/human-resource-missions-list/human-resource-missions-list.component';

const routes: Routes = [

  {
    path: '', component: HumanResourceComponent, children: [
      { path: '', redirectTo: 'officers', pathMatch: 'full' },
      {
        path: 'officers', component: HumanResourceNavComponent, children: [
          { path: '', redirectTo: 'applications', pathMatch: 'full' },
          {
            path: 'applications', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'profile/officer', pathMatch: 'full' },
              {
                path: 'profile/:docKey', component: OfficerProfileFormComponent,
                canActivate: [ApproveOfficerGuardGuard],
                children: [
                  { path: '', redirectTo: 'certificate', pathMatch: 'full' },
                  {
                    path: 'certificate', component: OfficerApplicationFormPreviewComponent,
                  },
                  {
                    path: 'biography', component: OfficerApplicationFormPreviewBiographyComponent,
                  },
                  {
                    path: 'attachment', component: ViewAttachmentComponent,
                  },
                ]
              },
              {
                path: ':docTypeKey', component: OfficerApplicationListingComponent, children: [
                  // {path: 'personal-info/:id', component: FormPersonalInformationComponent},
                  // {path: 'newsletter/:id', component: FormPersonalInformationComponent},
                  { path: '', redirectTo: 'na', pathMatch: 'full' },
                  {
                    path: ':docKey', component: OfficerFormPreviewRouteComponent,
                    children: [
                      { path: '', redirectTo: 'certificate', pathMatch: 'full' },
                      {
                        path: 'certificate', component: OfficerApplicationFormPreviewComponent,
                      },
                      {
                        path: 'biography', component: OfficerApplicationFormPreviewBiographyComponent,
                      },
                      {
                        path: 'attachment', component: ViewAttachmentComponent,
                      }
                    ]
                  },
                ]
              },
            ]
          },
          {
            path: 'approval', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              {
                path: ':docTypeKey', component: HumanResourceListingComponent, children: [
                  { path: '', redirectTo: 'na', pathMatch: 'full' },
                  {
                    path: ':docKey', component: OfficerApplicationFormPreviewRouteComponent,
                    children: [
                      { path: '', redirectTo: 'certificate', pathMatch: 'full' },
                      {
                        path: 'certificate', component: OfficerApplicationFormPreviewComponent,
                      },
                      {
                        path: 'biography', component: OfficerApplicationFormPreviewBiographyComponent,
                      },
                      {
                        path: 'attachment', component: ViewAttachmentComponent,
                      }

                    ]
                  },

                  {
                    path: ':docKey/biography', component: OfficerApplicationFormPreviewBiographyComponent,
                  }
                ]
              },
            ]
          },

          {
            path: "my-files", component: HumanResourceMyFilesComponent,
          },
          {
            path: "archived", component: HumanResourceMyFilesComponent,
          },
          {
            path: "rejected", component: HumanResourceMyFilesComponent,
          },

          {
            path: "attendances", component: HumanResourceMyFilesComponent,
          },
          {
            path: "holidays", component: HumanResourceMyFilesComponent,
          },

          {
            path: "working-hour", component: HumanResourceMyFilesComponent,
          },

          {
            path: "missions", component: HumanResourceMyFilesComponent,
          },

          {
            path: "permission", component: HumanResourceMyFilesComponent,
          },
          {
            path: "pregnancy-break", component: HumanResourceMyFilesComponent,
          },


          // {
          //   path: "attendances", component: HumanResourceAttendancesComponent,
          // },
          // {
          //   path: "holidays", component: HumanResourceHolidaysComponent,
          // },


          // {
          //   path: "missions", component: HumanResourceMissionsComponent,
          //   children: [
          //     {
          //       path: "", component: HumanResourceMissionsListComponent,
          //     },
          //     {
          //       path: ':key/view', component: HumanResourceMissionsListComponent,
          //     },
          //   ]
          // },

          // {
          //   path: "permission", component: HumanResourcePermissionComponent,
          // },
          // {
          //   path: "pregnancy-break", component: HumanResourcePregnancyBreakComponent,
          // },
          // {
          //   path: "working-hour", component: HumanResourceWorkingHourComponent,
          //   children: [
          //     {
          //       path: '', component: OfficerListWorkingHourComponent,
          //     },
          //     {
          //       path: ':key/view', component: OfficerListWorkingHourComponent,
          //     },
          //   ]
          // },
        ]
      },
    ]
  },

  {
    path: 'officer-application-form/:id', component: OfficerProfileComponent, children: [
      { path: '', redirectTo: 'personal-info', pathMatch: 'full' },
      { path: 'personal-info', component: OfficerPersonalInfoComponent },
      { path: 'education-level', component: OfficerEducationLevelComponent },
      { path: 'vocational-training-level', component: OfficerVocationalTrainingLevelComponent },
      { path: 'work-history', component: OfficerWorkHistoryComponent },
      { path: 'praise-history', component: OfficerPraiseComponent },
      { path: 'punishment-history', component: OfficerPunishmentComponent },
      { path: 'family-info', component: OfficerFamilyInfoComponent },
      { path: 'foreign-language', component: OfficerForeignLanguageComponent },
      // { path: 'letter-condemnation', component: LetterOfCondemnationComponent },
      { path: 'first-bl-crim-kh', component: FirstBulletinOfCriminalKhComponent },
      { path: 'second-bl-crim-kh', component: SecondBulletinOfCriminalKhComponent },
      { path: 'thrid-bl-crim-kh', component: ThirdBulletinOfCriminalKhComponent },
      { path: 'thrid-bl-crim-eng', component: ThirdBulletinOfCriminalEngComponent },
      { path: 'thrid-bl-crim-fr', component: ThirdBulletinOfCriminalFrComponent },
      { path: 'thrid-cond-bul-kh', component: ThirdCondemnationBulletinComponent },

    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HumanResourceRoutingModule { }
