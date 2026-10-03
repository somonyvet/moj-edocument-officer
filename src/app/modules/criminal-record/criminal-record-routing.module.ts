import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CriminalApplicationRecordComponent } from './pages/criminal-application/criminal-application-record/criminal-application-record.component';
import { CriminalApplicationRouteSearchComponent } from './pages/criminal-application/criminal-application-route-search/criminal-application-route-search.component';
import { CriminalApplicationRouteComponent } from './pages/criminal-application/criminal-application-route/criminal-application-route.component';
import { CriminalApplicationComponent } from './pages/criminal-application/criminal-application.component';
import { CriminalRecordCategoriesComponent } from './pages/criminal-record-categories/criminal-record-categories.component';
import { CriminalRecordFormRouteComponent } from './pages/criminal-record-form/criminal-record-form-route/criminal-record-form-route.component';
import { CriminalRecordFormComponent } from './pages/criminal-record-form/criminal-record-form.component';
import { CvFormCondemnComponent } from './pages/criminal-record-form/cv-form-condemn/cv-form-condemn.component';
import { CvFormCondemnationPrintComponent } from '../../shared/components/cv-form-condemnation-print/cv-form-condemnation-print.component';
import { CvFormComponent } from './pages/criminal-record-form/cv-form/cv-form.component';
import { LetterOfCondemnationPrintComponent } from '../../shared/components/letter-of-condemnation-print/letter-of-condemnation-print.component';
import { LetterOfCondemnationPrintCompactComponent } from 'src/app/shared/components/letter-of-condemnation-print-compact/letter-of-condemnation-print-compact.component';
import { LetterOfCondemnationComponent } from './pages/criminal-record-form/letter-of-condemnation/letter-of-condemnation.component';
import { ViewAttachmentCondemnComponent } from '../../shared/components/view-attachment-condemn/view-attachment-condemn.component';
import { CriminalRecordVerifyComponent } from './pages/criminal-record-verify/criminal-record-verify.component';
import { CriminalVerifyApplication3Component } from './pages/criminal-record-verify/criminal-verify-application3/criminal-verify-application3.component';
import { CriminalVerifyRouteComponent } from './pages/criminal-record-verify/criminal-verify-route/criminal-verify-route.component';
import { CriminalRecordFlowComponent } from './pages/criminal-setting/criminal-record-flow/criminal-record-flow.component';
import { CriminalSettingComponent } from './pages/criminal-setting/criminal-setting.component';
import { CitizenProfileCriminalRecordComponent } from './pages/criticizes/citizen-profile-criminal-record/citizen-profile-criminal-record.component';
import { CitizenProfileComponent } from './pages/criticizes/citizen-profile/citizen-profile.component';
import { CriticizesListingComponent } from './pages/criticizes/criticizes-listing/criticizes-listing.component';
import { CriticizesRouteComponent } from './pages/criticizes/criticizes-route/criticizes-route.component';
import { CriticizesComponent } from './pages/criticizes/criticizes.component';
import { DocNotesComponent } from './pages/doc-notes/doc-notes.component';
import { GeoCommunesComponent } from './pages/geo-data/geo-communes/geo-communes.component';
import { GeoDataComponent } from './pages/geo-data/geo-data.component';
import { GeoDistrictComponent } from './pages/geo-data/geo-district/geo-district.component';
import { GeoProvincesComponent } from './pages/geo-data/geo-provinces/geo-provinces.component';
import { GeoVillagesComponent } from './pages/geo-data/geo-villages/geo-villages.component';
import { CriminalApplicationCitizenRouteComponent } from './pages/criminal-application/criminal-application-citizen-route/criminal-application-citizen-route.component';
import { NationalDataComponent } from './pages/national-data/national-data.component';
import { NationalityComponent } from './pages/nationality/nationality.component';
import { CriminalVerifyApplication1Component } from './pages/criminal-record-verify/criminal-verify-application1/criminal-verify-application1.component';
import { CriminalRecordApproveComponent } from './pages/criminal-record-approve/criminal-record-approve.component';
import { CriminalRecordApproveApplicationComponent } from './pages/criminal-record-approve/criminal-record-approve-application/criminal-record-approve-application.component';
import { CriminalRecordApproveApplicationRouteComponent } from './pages/criminal-record-approve/criminal-record-approve-application-route/criminal-record-approve-application-route.component';
import { ApproveLetterDigitalComponent } from './pages/criminal-record-approve/approve-letter-digital/approve-letter-digital.component';
import { ApproveLetterDigitalRouteComponent } from './pages/criminal-record-approve/approve-letter-digital-route/approve-letter-digital-route.component';
import { ApproveLetterDigitalBulletinComponent } from './pages/criminal-record-approve/approve-letter-digital-bulletin/approve-letter-digital-bulletin.component';
import { CriminalLatterRouterComponent } from './pages/criminal-latter/criminal-latter-router/criminal-latter-router.component';
import { CriminalLatterComponent } from './pages/criminal-latter/criminal-latter.component';
import { CriminalLatterTabsComponent } from './pages/criminal-latter/criminal-latter-tabs/criminal-latter-tabs.component';
import { TutorialComponent } from './pages/tutorial/tutorial.component';
import { TutorialDocumentComponent } from './pages/tutorial/tutorial-document/tutorial-document.component';
import { TutorialVideoComponent } from './pages/tutorial/tutorial-video/tutorial-video.component';
import { TutorialFaqComponent } from './pages/tutorial/tutorial-faq/tutorial-faq.component';
import { CriminalOnlineApplicationRouteComponent } from './pages/criminal-online-application-route/criminal-online-application-route.component';
import { CriminalApplicationApplyInPlaceComponent } from './pages/criminal-application-apply-in-place/criminal-application-apply-in-place.component';
import { CriminalApplicationBulletinListComponent } from './pages/criminal-application-bulletin-list/criminal-application-bulletin-list.component';
import { CriminalLatterPrintRouteComponent } from './pages/criminal-latter/criminal-latter-print-route/criminal-latter-print-route.component';
import { OfficerCreateApplicationConfirmComponent } from './components/officer-create-application-confirm/officer-create-application-confirm.component';
import { CriminalGroupRequestFormComponent } from './pages/criminal-group-request-form/criminal-group-request-form.component';
import { CriminalGroupRequestFormRouteComponent } from './pages/criminal-group-request-form/criminal-group-request-form-route/criminal-group-request-form-route.component';
import { CriminalGroupRequestFormAppRouteComponent } from './pages/criminal-group-request-form/criminal-group-request-form-app-route/criminal-group-request-form-app-route.component';
import { CriminalGroupRequestFormAppComponent } from './pages/criminal-group-request-form/criminal-group-request-form-app/criminal-group-request-form-app.component';
import { CriminalGroupRequestFormListingComponent } from './pages/criminal-group-request-form/criminal-group-request-form-listing/criminal-group-request-form-listing.component';
import { CriminalReceiptApplicationComponent } from './pages/criminal-receipt-application/criminal-receipt-application.component';
import { CriminalReceiptApplicationRecordComponent } from './pages/criminal-receipt-application/criminal-receipt-application-record/criminal-receipt-application-record.component';
import { CriminalReceiptApplicationDisplayComponent } from './pages/criminal-receipt-application/criminal-receipt-application-display/criminal-receipt-application-display.component';
import { GroupUsersComponent } from './pages/group-users/group-users.component';
import { TabLayoutComponent } from 'src/app/layouts/tab-layout/tab-layout.component';
import { PublicHolidayComponent } from './pages/public-holiday/public-holiday.component';
import { AppCriminalGroupRequestFormSignComponent } from './pages/criminal-group-request-form/app-criminal-group-request-form-sign/app-criminal-group-request-form-sign.component';
import { ClassifyCriminalRemainingComponent } from './pages/criminal-group-request-form/classify-criminal-remaining/classify-criminal-remaining.component';
import { ClassifyRemainingNumberComponent } from './pages/criminal-group-request-form/classify-criminal-remaining/classify-remaining-number/classify-remaining-number.component';
import { GroupUserDetailComponent } from './pages/group-users/group-user-detail/group-user-detail.component';
import { CriminalGroupRequestFormListingInputNumberComponent } from './pages/criminal-group-request-form-listing-input-number/criminal-group-request-form-listing-input-number.component';
import { CriminalGroupRequestFormListingTemplateInputNumberComponent } from './pages/criminal-group-request-form-listing-template-input-number/criminal-group-request-form-listing-template-input-number.component';
import { CriminalGroupRequestFormListingTemplateDisplayAllComponent } from './pages/criminal-group-request-form-listing-template-display-all/criminal-group-request-form-listing-template-display-all.component';
import { CriminalApplicationPaymentComponent } from './pages/criminal-application-payment/criminal-application-payment.component';
import { CriminalRecordReportsComponent } from './pages/criminal-record-reports/criminal-record-reports.component';
import { DataReportComponent } from './pages/criminal-record-reports/data-report/data-report.component';
import { CriminalStatisticsComponent } from './pages/criminal-statistics/criminal-statistics.component';
import { CriminalRecordAppyDataEntryComponent } from './pages/criminal-record-appy-data-entry/criminal-record-appy-data-entry.component';
import { CriminalRecordConfirmDataEntryComponent } from './pages/criminal-record-confirm-data-entry/criminal-record-confirm-data-entry.component';
import { CriminalRecordApprovedDataEntryComponent } from './pages/criminal-record-approved-data-entry/criminal-record-approved-data-entry.component';
import { CriminalRecordRejectedDataEntryComponent } from './pages/criminal-record-rejected-data-entry/criminal-record-rejected-data-entry.component';
import { CriminalRecordCompletedDataEntryComponent } from './pages/criminal-record-completed-data-entry/criminal-record-completed-data-entry.component';
import { CriminalRecordApprovedModDataEntryComponent } from './pages/criminal-record-approved-mod-data-entry/criminal-record-approved-mod-data-entry.component';
import { CriminalApplicationDirectComponent } from './pages/criminal-application-direct/criminal-application-direct.component';
import { CriminalApplicationDirectLetter1Component } from './pages/criminal-application-direct-letter1/criminal-application-direct-letter1.component';
import { CriminalApplicationDirectLetter3Component } from './pages/criminal-application-direct-letter3/criminal-application-direct-letter3.component';
import { CriminalApplicationDirectLetter3GeneralComponent } from './pages/criminal-application-direct-letter3-general/criminal-application-direct-letter3-general.component';
import { CriminalApplicationDirectLetter3MolComponent } from './pages/criminal-application-direct-letter3-mol/criminal-application-direct-letter3-mol.component';
import { CriminalApplicationDirectLetter3BusinessComponent } from './pages/criminal-application-direct-letter3-business/criminal-application-direct-letter3-business.component';
import { CriminalApplicationDirectLetter2Component } from './pages/criminal-application-direct-letter2/criminal-application-direct-letter2.component';
import { CriminalApplicationDirectLetter2ModComponent } from './pages/criminal-application-direct-letter2-mod/criminal-application-direct-letter2-mod.component';
import { LetterOfCondemnationThreeComponent } from './pages/criminal-record-form/letter-of-condemnation-three/letter-of-condemnation-three.component';
import { ReportConfirmFormComponent } from './pages/criminal-record-reports/report-confirm-form/report-confirm-form.component';
import { ReportProvideFingerprintComponent } from './pages/criminal-record-reports/report-provide-fingerprint/report-provide-fingerprint.component';
import { ReportPaidFormComponent } from './pages/criminal-record-reports/report-paid-form/report-paid-form.component';
import { ReportPaidFormDeliveryComponent } from './pages/criminal-record-reports/report-paid-form-delivery/report-paid-form-delivery.component';
import { ReportDecreeFormComponent } from './pages/criminal-record-reports/report-decree-form/report-decree-form.component';
import { ReportDecreeFormAlreadyPaidComponent } from './pages/criminal-record-reports/report-decree-form-already-paid/report-decree-form-already-paid.component';
import { CommentDecreeGuiltyComponent } from 'src/app/shared/components/comment-decree-guilty/comment-decree-guilty.component';
import { ForderDoneFormComponent } from './pages/criminal-record-reports/forder-done-form/forder-done-form.component';
import { Letter3InputPrintComponent } from './pages/letter3-input-print/letter3-input-print.component';
import { CriminalRecordFormLetter3InputComponent } from './pages/letter3-input-print/criminal-record-form-letter3-input/criminal-record-form-letter3-input.component';
import { DailyFolderReportComponent } from './pages/criminal-record-reports/daily-folder-report/daily-folder-report.component';
import { MolPaymentComponent } from './pages/mol-payment/mol-payment.component';
import { MolLetterOfCondemnationPrintComponent } from 'src/app/shared/components/mol-letter-of-condemnation-print/mol-letter-of-condemnation-print.component';
import { MolCriminalRecordVerifyComponent } from './pages/mol-criminal-record-verify/mol-criminal-record-verify.component';
import { MolSubmitReportComponent } from './pages/criminal-record-reports/mol-submit-report/mol-submit-report.component';
import { ModSubmitReportComponent } from './pages/criminal-record-reports/mod-submit-report/mod-submit-report.component';
import { ReportDecreeWithMolComponent } from './pages/criminal-record-reports/report-decree-with-mol/report-decree-with-mol.component';
import { AssistantPaymentComponent } from './pages/assistant-payment/assistant-payment.component';
import { AssistantCriminalRecordVerifyComponent } from './pages/assistant-criminal-record-verify/assistant-criminal-record-verify.component';
import { CriminalPaymentOptionComponent } from './pages/criminal-payment-option/criminal-payment-option.component';
import { EmbassyComponent } from './pages/embassy/embassy.component';
import { ReportPaidOnlineComponent } from './pages/criminal-record-reports/report-paid-online/report-paid-online.component';
import { PaidMonthlyReportComponent } from './pages/criminal-record-reports/paid-monthly-report/paid-monthly-report.component';
import { OverseaReportComponent } from './pages/criminal-record-reports/oversea-report/oversea-report.component';
import { OverseaApplicationComponent } from './pages/oversea-application/oversea-application.component';
import { DecreeRecordDirectionGuard, UserDirectionGuard, UserPermissionGuard } from './route-guard/user-permission-guard.guard';
import { DigitalIssuedRedirectGuard } from './route-guard/digital-issued-redirect.guard';
import { OverseaUserComponent } from './pages/oversea-user/oversea-user.component';
import { CriminalRecordPaidOnlineComponent } from './pages/criminal-record-paid-online/criminal-record-paid-online.component';
import { ReportWithdrawOnlineComponent } from './pages/criminal-record-reports/report-withdraw-online/report-withdraw-online.component';
import { OverseaPaidComponent } from './pages/criminal-record-reports/oversea-paid/oversea-paid.component';
import { OverseaWithdrawComponent } from './pages/criminal-record-reports/oversea-withdraw/oversea-withdraw.component';
import { OverseaCompletedComponent } from './pages/criminal-record-reports/oversea-completed/oversea-completed.component';
import { ReportPaidApplyOnlineComponent } from './pages/criminal-record-reports/report-paid-apply-online/report-paid-apply-online.component';
import { ReportPaidOnlineProcessComponent } from './pages/criminal-record-reports/report-paid-online-process/report-paid-online-process.component';
import { CriminalLetter1InputPrintComponent } from './pages/criminal-letter1-input-print/criminal-letter1-input-print.component';
import { CriminalLetter1FormComponent } from './pages/criminal-letter1-input-print/criminal-letter1-form/criminal-letter1-form.component';
import { CriminalLetter2InputPrintComponent } from './pages/criminal-letter2-input-print/criminal-letter2-input-print.component';
import { CriminalLetter2FormComponent } from './pages/criminal-letter2-input-print/criminal-letter2-form/criminal-letter2-form.component';
import { CriminalLetter3BusinessInputPrintComponent } from './pages/criminal-letter3-business-input-print/criminal-letter3-business-input-print.component';
import { CriminalLetter3BusinessFormComponent } from './pages/criminal-letter3-business-input-print/criminal-letter3-business-form/criminal-letter3-business-form.component';
import { PrintVerifiedComponent } from './pages/print-verified/print-verified.component';
import { PrintVerifiedListingComponent } from './pages/print-verified/print-verified-listing/print-verified-listing.component';
import { PrintVerifiedApplicationComponent } from './pages/print-verified/print-verified-application/print-verified-application.component';
import { WithdrawOnlineComponent } from './pages/withdraw-online/withdraw-online.component';
import { ScanExpireDateComponent } from './pages/scan-expire-date/scan-expire-date.component';
import { ReportDoExpireComponent } from './pages/criminal-record-reports/report-do-expire/report-do-expire.component';
import { CriminalPaymentOnlineDraftComponent } from './pages/criminal-payment-online-draft/criminal-payment-online-draft.component';
import { ReportMolPaidComponent } from './pages/criminal-record-reports/report-mol-paid/report-mol-paid.component';
import { VerifyOnlineReportComponent } from './pages/criminal-record-reports/verify-online-report/verify-online-report.component';

const routes: Routes = [
  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
  {
    path: 'criminal-record', component: CriminalApplicationComponent, children: [
      { path: '', redirectTo: 'applications', pathMatch: 'full' },
      {
        path: 'folder', component: CriminalGroupRequestFormComponent,
        canActivate: [UserPermissionGuard], data: { permissions: ['classify_folder']},
        children: [
          { path: '', redirectTo: 'confirm', pathMatch: 'full' },
          {
            path: 'confirm', component: CriminalGroupRequestFormRouteComponent, children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalGroupRequestFormAppComponent, children: [
                  {
                    path: ':id', component: CriminalGroupRequestFormAppRouteComponent, children: [
                      { path: '', redirectTo: 'group-listing', pathMatch: 'full' },
                      { path: `group-listing`, component: CriminalGroupRequestFormListingComponent },
                      { path: `group-listing-template`, component: AppCriminalGroupRequestFormSignComponent },
                      { path: `group-listing-template-display-all`, component: CriminalGroupRequestFormListingTemplateDisplayAllComponent },
                      // { path: `review`, component: CriminalGroupRequestFormPaidComponent },
                      // { path: `group-listing`, component: CriminalGroupRequestFormListingComponent },

                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'out-of-folder', component: ClassifyCriminalRemainingComponent, children: [
              { path: '', redirectTo: 'fill-decree', pathMatch: 'full' },
              // {
              //   path: ':tabKey', component: ClassifyRemainingNumberComponent
              // },
              {
                path: ':status', component: CriminalApplicationDirectComponent, children: [
                  {
                    path: ':natinalityKey/:pageKey', component: CriminalRecordFormRouteComponent, children: [
                      { path: '', redirectTo: 'na/draft', pathMatch: 'full' },
                      {
                        path: ':citizenKey/:id', component: CriminalRecordFormComponent, children: [
                          { path: '', redirectTo: 'application-form/direct', pathMatch: 'full' },
                          { path: 'application-form/:pageType', component: LetterOfCondemnationThreeComponent },
                        ]
                      },
                    ]
                  }
                ]
              },
            ]
          },

        ]
      },
      {
        path: 'form/:natinalityKey/:pageKey', component: CriminalRecordFormRouteComponent, children: [
          { path: '', redirectTo: 'na/draft', pathMatch: 'full' },
          {
            path: ':citizenKey/:id', component: CriminalRecordFormComponent, children: [
              { path: '', redirectTo: 'application-form', pathMatch: 'full' },
              { path: 'application-form', component: LetterOfCondemnationComponent },
              // { path: 'application-form', component: LetterOfCondemnationThreeComponent },
              { path: 'curriculum-vitae', component: CvFormCondemnComponent },
              { path: 'apply-application', component: OfficerCreateApplicationConfirmComponent },
            ]
          },
        ]
      },

      {
        path: 'decree-record', component: CriminalRecordVerifyComponent,
        canActivate: [UserPermissionGuard], data: { permissions: ['judgment_list_office', 'admin_mod_request']},
        children: [
          { path: '', pathMatch: 'full', canActivate: [DecreeRecordDirectionGuard], children: [] },
          {
            path: 'application/letter1', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'decree', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectLetter1Component, children: [
                {
                  path: ':id', component: CriminalVerifyRouteComponent, children: [
                    { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                    { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                    { path: `profile`, component: CvFormCondemnationPrintComponent },
                    { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                    { path: `attachments`, component: ViewAttachmentCondemnComponent },

                  ]
                }
                ]
              },
            ]
          },
          {
            path: 'application/letter2', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'decree', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectLetter2Component, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },

                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'application/letter2-mod', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'decree', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectLetter2ModComponent, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },

                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'application/letter3', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'decree', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectLetter3Component, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },

                    ]
                  }
                ]
              },
            ]
          },          {
            path: 'application/letter3-general', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'decree/period12', pathMatch: 'full' },
              // the period tabs (១២ថ្ងៃ / ២០ថ្ងៃ) are a route param, ១២ថ្ងៃ is the default
              { path: ':status', redirectTo: ':status/period12', pathMatch: 'full' },
              {
                path: ':status/:period', component: CriminalApplicationDirectLetter3GeneralComponent, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },

                    ]
                  }
                ]
              },
            ]
          },          {
            path: 'application/letter3-business', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'listing', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectLetter3BusinessComponent, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'application/letter3-mol', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'decree', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectLetter3MolComponent, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },

                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'application/app', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'unfill', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectComponent, children: [
                  {
                    path: ':natinalityKey/:pageKey', component: CriminalRecordFormRouteComponent, children: [
                      { path: '', redirectTo: 'na/draft', pathMatch: 'full' },
                      {
                        path: ':citizenKey/:id', component: CriminalRecordFormComponent, children: [
                          { path: '', redirectTo: 'application-form/direct', pathMatch: 'full' },
                          { path: 'application-form/:pageType', component: LetterOfCondemnationThreeComponent },
                        ]
                      },
                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'mol', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'paid', pathMatch: 'full' },
              {
                path: ':tabKey', component: MolCriminalRecordVerifyComponent, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'assistant', component: TabLayoutComponent, children: [
              { path: '', redirectTo: 'paid', pathMatch: 'full' },
              {
                path: ':tabKey', component: AssistantCriminalRecordVerifyComponent, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: ':statusKey', component: CriminalVerifyApplication1Component, children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalVerifyApplication3Component, children: [
                  {
                    path: ':id', component: CriminalVerifyRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `comment-decree-guilty`, component: CommentDecreeGuiltyComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },

                    ]
                  }
                ]
              }
            ]
          },
        ]
      },
      {
        path: 'criminal-latter', component: CriminalLatterRouterComponent,
        canActivate: [UserPermissionGuard], data: { permissions: ['print_and_notify']},
        children: [
          { path: '', redirectTo: 'criminal-iii', pathMatch: 'full' },
          {
            path: ':criminalCategoryKey', component: CriminalLatterPrintRouteComponent, children: [
              { path: '', redirectTo: 'APPROVED', pathMatch: 'full' },
              {
                path: ':statusKey', component: CriminalLatterComponent, children: [
                  {
                    path: ':id', component: CriminalLatterTabsComponent, children: [
                      { path: '', redirectTo: 'group-listing-input-number', pathMatch: 'full' },
                      { path: `group-listing-input-number`, component: CriminalGroupRequestFormListingInputNumberComponent },
                      { path: `group-listing-template-input-number`, component: CriminalGroupRequestFormListingTemplateInputNumberComponent },
                      { path: `group-listing-template-display-all`, component: CriminalGroupRequestFormListingTemplateDisplayAllComponent },
                      // { path: `criminal-record-kh`, component: CriminalRecordLetterKhComponent },
                      // { path: `criminal-record-fr`, component: CriminalRecordLetterFrComponent },
                      // { path: `criminal-record-en`, component: CriminalRecordLetterEnComponent },
                    ]
                  }
                ]
              }

            ]
          }
        ]
      },
      {
        path: 'applications', component: CriminalApplicationRouteComponent,
        children: [
          { path: '', redirectTo: 'bulletin-list', pathMatch: 'full' },
          {
            path: 'list/:statusKey', component: CriminalApplicationRouteSearchComponent, children: [
              { path: '', redirectTo: 'officer', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalApplicationRecordComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'apply-direct', component: TabLayoutComponent,  canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']} ,  children: [
              { path: '', redirectTo: 'unfill', pathMatch: 'full' },
              {
                path: ':status', component: CriminalApplicationDirectComponent, children: [
                  {
                    path: ':natinalityKey/:pageKey', component: CriminalRecordFormRouteComponent, children: [
                      { path: '', redirectTo: 'na/draft', pathMatch: 'full' },
                      {
                        path: ':citizenKey/:id', component: CriminalRecordFormComponent, children: [
                          { path: '', redirectTo: 'application-form/direct', pathMatch: 'full' },
                          // { path: 'application-form/:pageType', component: LetterOfCondemnationComponent },
                          { path: 'application-form/:pageType', component: LetterOfCondemnationThreeComponent },
                          // { path: 'curriculum-vitae', component: CvFormCondemnComponent },
                          // { path: 'apply-application', component: OfficerCreateApplicationConfirmComponent },
                        ]
                      },
                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'bulletin-list', component: TabLayoutComponent,  
            canActivate: [UserDirectionGuard,UserPermissionGuard], 
            data: { permissions: ['criminal_applications_office', 'recipient', 'judgment_list_office', 'classify_folder', 'print_and_notify', 'approval','overseas_embassy','overseas_management','ministry_of_labor','ministry_of_defense','admin_mol_request','admin_mod_request'] },
            children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalApplicationBulletinListComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              }
            ]
          },

          {
            path: 'print-verify', component: TabLayoutComponent,  
            canActivate: [UserDirectionGuard,UserPermissionGuard], 
            data: { permissions: ['print_and_notify'] },
            children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              {
                path: ':tabKey', component: PrintVerifiedComponent, children: [
                  { path: '', redirectTo: 'scan-expire-date', pathMatch: 'full' },
                  { path: 'scan-expire-date', component: ScanExpireDateComponent },
                  {
                    path: ':id', component: PrintVerifiedListingComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: PrintVerifiedApplicationComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              }
            ]
          },

          {
            path: 'withdraw-online', component: TabLayoutComponent,  
            canActivate: [UserDirectionGuard,UserPermissionGuard], 
            data: { permissions: ['print_and_notify'] },
            children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              {
                path: ':tabKey', component: WithdrawOnlineComponent, children: [
                  // {
                  //   path: ':id', component: WithdrawOnlineRouteComponent, children: [
                  //     { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  //     { path: `criminal-record`, component: PrintVerifiedApplicationComponent },
                  //     { path: `profile`, component: CvFormCondemnationPrintComponent },
                  //     { path: `attachments`, component: ViewAttachmentCondemnComponent },
                  //   ]
                  // }
                ]
              }
            ]
          },

          {
            path: 'apply-online', component: TabLayoutComponent, canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']} ,
            children: [
              { path: '', redirectTo: 'unverified', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalOnlineApplicationRouteComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      // { path: 'letter3', component: LetterThreeFormComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },

          {
            path: 'letter3-input-print', component: TabLayoutComponent, canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']} ,
            children: [
              { path: '', redirectTo: 'fill', pathMatch: 'full' },
              {
                path: ':status', component: Letter3InputPrintComponent, children: [
                  { path: '', redirectTo: 'create', pathMatch: 'full' },
                  {
                    path: 'create',component: CriminalRecordFormLetter3InputComponent
                  },
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  },
                ]
              },
            ]
          },

          {
            path: 'letter1', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard],
            data: { permissions: ['letter_2']},
            children: [
              { path: '', redirectTo: 'fill', pathMatch: 'full' },
              {
                path: ':status', component: CriminalLetter1InputPrintComponent, children: [
                  { path: '', redirectTo: 'create', pathMatch: 'full' },
                  {
                    path: 'create',component: CriminalLetter1FormComponent
                  },
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  },
                ]
              },
            ]
          },

          {
            path: 'letter2', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard],
            data: { permissions: ['letter_2']},
            children: [
              { path: '', redirectTo: 'fill', pathMatch: 'full' },
              {
                path: ':status', component: CriminalLetter2InputPrintComponent, children: [
                  { path: '', redirectTo: 'create', pathMatch: 'full' },
                  {
                    path: 'create',component: CriminalLetter2FormComponent
                  },
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  },
                ]
              },
            ]
          },

          {
            path: 'letter3-business', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard],
            data: { permissions: ['letter_2']},
            children: [
              { path: '', redirectTo: 'fill', pathMatch: 'full' },
              {
                path: ':status', component: CriminalLetter3BusinessInputPrintComponent, children: [
                  { path: '', redirectTo: 'create', pathMatch: 'full' },
                  {
                    path: 'create',component: CriminalLetter3BusinessFormComponent
                  },
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  },
                ]
              },
            ]
          },

          {
            path: 'application-payment', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient']},
            children: [
              { path: '', redirectTo: 'apply', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalApplicationPaymentComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },

          {
            path: 'payment-online', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient','criminal_applications_office_online']},
            children: [
              { path: '', redirectTo: 'paid', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalRecordPaidOnlineComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },

          {
            path: 'payment-online-draft', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient','criminal_applications_office_online']},
            children: [
              { path: '', redirectTo: 'all', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalPaymentOnlineDraftComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },

          {
            path: 'mol-payment', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient']},
            children: [
              { path: '', redirectTo: 'apply', pathMatch: 'full' },
              {
                path: ':tabKey', component: MolPaymentComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: MolLetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },

          {
            path: 'applications-oversea', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['overseas_management']},
            children: [
              { path: '', redirectTo: 'paid', pathMatch: 'full' },
              {
                path: ':tabKey', component: OverseaApplicationComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },

          {
            path: 'assistant-payment', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient']},
            children: [
              { path: '', redirectTo: 'apply', pathMatch: 'full' },
              {
                path: ':tabKey', component: AssistantPaymentComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: MolLetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },

          {
            path: 'apply-in-place', component: TabLayoutComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']},
            children: [
              { path: '', redirectTo: 'apply', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalApplicationApplyInPlaceComponent, children: [
                  {
                    path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },
                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'tutorial', component: TutorialComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']},
            children: [
              { path: '', redirectTo: 'faqs', pathMatch: 'full' },
              { path: `faqs`, component: TutorialFaqComponent },
              { path: `documents`, component: TutorialDocumentComponent },
              { path: `videos`, component: TutorialVideoComponent },
            ]
          },
          {
            path: 'settings', component: CriminalSettingComponent,
            canActivate: [UserPermissionGuard], data: { permissions: []},
            children: [
              { path: '', redirectTo: 'flow', pathMatch: 'full' },
              { path: `flow`, component: CriminalRecordFlowComponent },
            ]
          },
          {
            path: 'geo', component: GeoDataComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']},
            children: [
              { path: '', redirectTo: 'provinces', pathMatch: 'full' },
              { path: 'provinces', component: GeoProvincesComponent },
              { path: ':id/districts', component: GeoDistrictComponent },
              { path: ':id/communes', component: GeoCommunesComponent },
              { path: ':id/villages', component: GeoVillagesComponent },
            ]
          },
          {
            path: 'natinalities', component: NationalDataComponent, children: [
              { path: '', redirectTo: 'data', pathMatch: 'full' },
            ]
          },
          {
            path: 'nationalities', component: NationalityComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']},
          },
          {
            path: 'criminal-record-categories', component: CriminalRecordCategoriesComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']},
          },
          {
            path: 'document-notes', component: DocNotesComponent,
            canActivate: [UserPermissionGuard], data: { permissions: []},
          },

          {
            path: 'public-holidays', component: PublicHolidayComponent,
            canActivate: [UserPermissionGuard], data: { permissions: []},
          },

          {
            path: 'group-users', component: GroupUsersComponent,
            canActivate: [UserPermissionGuard], data: { permissions: []},
            children: [
              {
                path: ':key', component: GroupUserDetailComponent
              },
            ]
          },
          {
            path: 'apply', component: CriminalRecordAppyDataEntryComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_labor', 'ministry_of_defense']},
            children: [
              {
                path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                  { path: `profile`, component: CvFormCondemnationPrintComponent },
                  { path: `attachments`, component: ViewAttachmentCondemnComponent },
                ]
              }
            ]
          },
          {
            path: 'confirm', component: CriminalRecordConfirmDataEntryComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_labor']},
            children: [
              {
                path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                  { path: `profile`, component: CvFormCondemnationPrintComponent },
                  { path: `attachments`, component: ViewAttachmentCondemnComponent },
                ]
              }
            ]
          },
          {
            path: 'approved', component: CriminalRecordApprovedDataEntryComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_labor']},
            children: [
              {
                path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                  { path: `profile`, component: CvFormCondemnationPrintComponent },
                  { path: `attachments`, component: ViewAttachmentCondemnComponent },
                ]
              }
            ]
          },
          {
            path: 'rejected', component: CriminalRecordRejectedDataEntryComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_defense', 'admin_mod_request']},
            children: [
              {
                path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                  { path: `profile`, component: CvFormCondemnationPrintComponent },
                  { path: `attachments`, component: ViewAttachmentCondemnComponent },
                ]
              }
            ]
          },
          {
            path: 'approved-mod', component: CriminalRecordApprovedModDataEntryComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_defense', 'admin_mod_request']},
            children: [
              {
                path: ':id', component: CriminalApplicationCitizenRouteComponent, children: [
                  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                  { path: `profile`, component: CvFormCondemnationPrintComponent },
                  { path: `attachments`, component: ViewAttachmentCondemnComponent },
                ]
              }
            ]
          },
          {
            path: 'completed', component: CriminalRecordCompletedDataEntryComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_defense', 'admin_mod_request']},
            children: [
              {
                path: ':id', component: CriminalApplicationCitizenRouteComponent,
                data: { tabsKey: 'criminal_record_mod_completed_tabs' },
                children: [
                  { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                  { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                  { path: `profile`, component: CvFormCondemnationPrintComponent },
                  { path: `attachments`, component: ViewAttachmentCondemnComponent },
                  { path: `bulletin`, component: ApproveLetterDigitalBulletinComponent },
                ]
              }
            ]
          },

          // {
          //   path: 'payment-option', component: CriminalPaymentOptionComponent,
          //   canActivate: [UserPermissionGuard], data: { permissions: []},
          // },


          {
            path: 'embassy', component: EmbassyComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office','overseas_management']},
          },

          {
            path: 'oversea-report', component: OverseaReportComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['overseas_embassy']},
          },

          {
            path: 'oversea-user', component: TabLayoutComponent,  canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office', 'recipient', 'judgment_list_office', 'classify_folder', 'print_and_notify', 'approval','overseas_embassy','overseas_management','ministry_of_labor'] },
            children: [
              { path: '', component: OverseaUserComponent },
            ]
          },
        ]
      },
      {
        path: 'receipts', component: CriminalReceiptApplicationComponent, children: [
          { path: '', redirectTo: 'bulletin-list', pathMatch: 'full' },
          {
            path: 'bulletin-list', component: CriminalReceiptApplicationRecordComponent, children: [
              { path: ':criminalKey', component: CriminalReceiptApplicationDisplayComponent }
            ]
          },
        ]
      },
      {
        path: 'approval', component: CriminalRecordApproveComponent,
        canActivate: [UserPermissionGuard], data: { permissions: ['approval'] },
        children: [
          { path: '', redirectTo: '12Day', pathMatch: 'full' },
          {
            path: 'digital_letter1', component: CriminalRecordApproveApplicationComponent, children: [
              { path: '', redirectTo: 'approval', pathMatch: 'full' },
              {
                path: ':tabKey', component: ApproveLetterDigitalComponent, children: [
                  {
                    path: ':id', component: ApproveLetterDigitalRouteComponent, children: [
                      { path: '', redirectTo: 'application', pathMatch: 'full' },
                      // the issued tab shows the printable bulletin instead of the application,
                      // so the guard sends those records to `bulletin` before this form is built
                      { path: `application`, component: LetterOfCondemnationPrintComponent, canActivate: [DigitalIssuedRedirectGuard] },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent, canActivate: [DigitalIssuedRedirectGuard] },
                      { path: `bulletin`, component: ApproveLetterDigitalBulletinComponent },
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'digital_letter2', component: CriminalRecordApproveApplicationComponent, children: [
              { path: '', redirectTo: 'approval', pathMatch: 'full' },
              {
                path: ':tabKey', component: ApproveLetterDigitalComponent, children: [
                  {
                    path: ':id', component: ApproveLetterDigitalRouteComponent, children: [
                      { path: '', redirectTo: 'application', pathMatch: 'full' },
                      // the issued tab shows the printable bulletin instead of the application,
                      // so the guard sends those records to `bulletin` before this form is built
                      { path: `application`, component: LetterOfCondemnationPrintComponent, canActivate: [DigitalIssuedRedirectGuard] },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent, canActivate: [DigitalIssuedRedirectGuard] },
                      { path: `bulletin`, component: ApproveLetterDigitalBulletinComponent },
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'digital_letter3', component: CriminalRecordApproveApplicationComponent, children: [
              { path: '', redirectTo: 'approval', pathMatch: 'full' },
              {
                path: ':tabKey', component: ApproveLetterDigitalComponent, children: [
                  {
                    path: ':id', component: ApproveLetterDigitalRouteComponent, children: [
                      { path: '', redirectTo: 'application', pathMatch: 'full' },
                      // the issued tab shows the printable bulletin instead of the application,
                      // so the guard sends those records to `bulletin` before this form is built
                      { path: `application`, component: LetterOfCondemnationPrintComponent, canActivate: [DigitalIssuedRedirectGuard] },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent, canActivate: [DigitalIssuedRedirectGuard] },
                      { path: `bulletin`, component: ApproveLetterDigitalBulletinComponent },
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: ':statusKey', component: CriminalRecordApproveApplicationComponent, children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriminalRecordApproveApplicationRouteComponent, children: [
                  {
                    path: ':id', component: CriminalGroupRequestFormAppRouteComponent, children: [
                      { path: '', redirectTo: 'group-listing', pathMatch: 'full' },
                      { path: `group-listing`, component: CriminalGroupRequestFormListingComponent },
                      { path: `group-listing-template`, component: AppCriminalGroupRequestFormSignComponent },
                      { path: `group-listing-template-display-all`, component: CriminalGroupRequestFormListingTemplateDisplayAllComponent },
                    ]
                  }
                ]
              }
            ]
          },
        ]
      },
      {
        path: 'criticizes', component: CriticizesComponent, children: [
          { path: '', redirectTo: 'request-latter', pathMatch: 'full' },
          {
            path: 'request-latter', component: CriticizesRouteComponent, children: [
              { path: '', redirectTo: 'pending', pathMatch: 'full' },
              {
                path: ':tabKey', component: CriticizesListingComponent, children: [
                  {
                    path: ':id', component: CitizenProfileCriminalRecordComponent, children: [
                      { path: '', redirectTo: 'criminal-record', pathMatch: 'full' },
                      { path: `criminal-record`, component: LetterOfCondemnationPrintComponent },
                      { path: `profile`, component: CvFormCondemnationPrintComponent },
                      { path: `attachments`, component: ViewAttachmentCondemnComponent },

                    ]
                  }
                ]
              },
            ]
          },
          {
            path: 'profile', component: CriticizesRouteComponent, children: [
              { path: '', redirectTo: 'khmer', pathMatch: 'full' },
              { path: ':tabKey', component: CitizenProfileComponent },
              { path: 'form/:id', component: CvFormComponent }
            ]
          },
        ]
      },
      {
        path: 'groups-account', component: GroupUsersComponent
      },
      {
        path: 'holiday', component: PublicHolidayComponent
      },
      {
        path: 'reports', component: CriminalRecordReportsComponent, children: [
          // { path: '', redirectTo: '0', pathMatch: 'full' },
          // { path: '0', component: DataReportComponent },
          { path: 'confirm-form', component: ReportConfirmFormComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']},
          },
          { path: 'provide-fingerprint', component: ReportProvideFingerprintComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['criminal_applications_office']},
          },
          { path: 'paid-form', component: ReportPaidFormComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient']},
          },
          { path: 'paid-form-delivery', component: ReportPaidFormDeliveryComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient']},
          },
          { path: 'mol-paid-report', component: ReportMolPaidComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['admin_mol_request']},
          },
          { path: 'apply-paid-form', component: ReportPaidApplyOnlineComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient']},
          },
          { path: 'paid-online', component: ReportPaidOnlineComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient','criminal_applications_office_online']},
          },
          { path: 'paid-monthly-report', component: PaidMonthlyReportComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient','criminal_applications_office_online']},
          },
          { path: 'paid-online-process', component: ReportPaidOnlineProcessComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient','criminal_applications_office_online']},
          },
          { path: 'verify-online-report', component: VerifyOnlineReportComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['recipient','criminal_applications_office_online']},
          },
          { path: 'decree-form', component: ReportDecreeFormComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['judgment_list_office','classify_folder']},
          },
          { path: 'decree-report-mol', component: ReportDecreeWithMolComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['judgment_list_office','classify_folder']},
          },
          { path: 'decree-form-already-paid', component: ReportDecreeFormAlreadyPaidComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['judgment_list_office']},
          },
          { path: 'folder-done', component: ForderDoneFormComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['classify_folder']},
          },
          { path: 'daily-folder-report', component: DailyFolderReportComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['classify_folder']},
          },
          { path: 'mol-submit-report', component: MolSubmitReportComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_labor']},
          },
          { path: 'mod-submit-report', component: ModSubmitReportComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['ministry_of_defense', 'admin_mod_request']},
          },
          { path: 'report-withdraw', component: ReportWithdrawOnlineComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['print_and_notify']},
          },
          { path: 'report-do-expire', component: ReportDoExpireComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['print_and_notify']},
          },
          { path: 'oversea-paid', component: OverseaPaidComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['overseas_management']},
          },
          { path: 'oversea-complete', component: OverseaCompletedComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['overseas_management']},
          },
          { path: 'oversea-withdraw', component: OverseaWithdrawComponent,
            canActivate: [UserPermissionGuard], data: { permissions: ['overseas_management']},
          },
        ]
      },
      {
        path: 'statistics', component: CriminalStatisticsComponent, children: [
          // { path: '', redirectTo: '0', pathMatch: 'full' },
        ]
      },


    ]
  },


]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriminalRecordRoutingModule { }
