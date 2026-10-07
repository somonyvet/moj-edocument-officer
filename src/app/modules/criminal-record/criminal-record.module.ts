import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { SharedModule } from 'src/app/shared/shared.module';
import { CriminalApplicationComponent } from './pages/criminal-application/criminal-application.component';
import { CriminalRecordRoutingModule } from './criminal-record-routing.module';
import { CriminalApplicationRecordComponent } from './pages/criminal-application/criminal-application-record/criminal-application-record.component';
import { CriminalApplicationRouteComponent } from './pages/criminal-application/criminal-application-route/criminal-application-route.component';
import { CriminalApplicationRouteSearchComponent } from './pages/criminal-application/criminal-application-route-search/criminal-application-route-search.component';
import { GeoDataComponent } from './pages/geo-data/geo-data.component';
import { GeoProvincesComponent } from './pages/geo-data/geo-provinces/geo-provinces.component';
import { GeoDistrictComponent } from './pages/geo-data/geo-district/geo-district.component';
import { GeoCommunesComponent } from './pages/geo-data/geo-communes/geo-communes.component';
import { GeoVillagesComponent } from './pages/geo-data/geo-villages/geo-villages.component';
import { GeoProvinceFormComponent } from './pages/geo-data/geo-province-form/geo-province-form.component';
import { GeoDistrictsFormComponent } from './pages/geo-data/geo-districts-form/geo-districts-form.component';
import { GeoCommunesFormComponent } from './pages/geo-data/geo-communes-form/geo-communes-form.component';
import { GeoVillagesFormComponent } from './pages/geo-data/geo-villages-form/geo-villages-form.component';
import { CriminalRecordVerifyComponent } from './pages/criminal-record-verify/criminal-record-verify.component';
import { CriminalVerifyRouteComponent } from './pages/criminal-record-verify/criminal-verify-route/criminal-verify-route.component';
import { CriminalVerifyApplication1Component } from './pages/criminal-record-verify/criminal-verify-application1/criminal-verify-application1.component';
import { CriminalVerifyApplication2Component } from './pages/criminal-record-verify/criminal-verify-application2/criminal-verify-application2.component';
import { CriminalVerifyApplication3Component } from './pages/criminal-record-verify/criminal-verify-application3/criminal-verify-application3.component';
import { CriticizesComponent } from './pages/criticizes/criticizes.component';
import { CriticizesRouteComponent } from './pages/criticizes/criticizes-route/criticizes-route.component';
import { CriticizesListingComponent } from './pages/criticizes/criticizes-listing/criticizes-listing.component';
import { CvFormComponent } from './pages/criminal-record-form/cv-form/cv-form.component';
import { CitizenProfileComponent } from './pages/criticizes/citizen-profile/citizen-profile.component';
import { CitizenProfileCriminalRecordComponent } from './pages/criticizes/citizen-profile-criminal-record/citizen-profile-criminal-record.component';
import { CitizenProfileCriminalFormComponent } from './pages/criticizes/citizen-profile-criminal-form/citizen-profile-criminal-form.component';
import { NationalDataComponent } from './pages/national-data/national-data.component';
import { NationalFormComponent } from './pages/national-data/national-form/national-form.component';
import { CriminalApplicationCitizenRouteComponent } from './pages/criminal-application/criminal-application-citizen-route/criminal-application-citizen-route.component';
import { CriminalSettingComponent } from './pages/criminal-setting/criminal-setting.component';
import { CriminalRecordFlowComponent } from './pages/criminal-setting/criminal-record-flow/criminal-record-flow.component';
import { CriminalRecordFlowFormComponent } from './pages/criminal-setting/criminal-record-flow-form/criminal-record-flow-form.component';
import { NationalityComponent } from './pages/nationality/nationality.component';
import { NationalityFormComponent } from './pages/nationality/nationality-form/nationality-form.component';
import { CriminalRecordCategoriesComponent } from './pages/criminal-record-categories/criminal-record-categories.component';
import { CriminalRecordCategoriesFormComponent } from './pages/criminal-record-categories/criminal-record-categories-form/criminal-record-categories-form.component';
import { DocNotesComponent } from './pages/doc-notes/doc-notes.component';
import { DocNotesFormComponent } from './pages/doc-notes/doc-notes-form/doc-notes-form.component';
import { ApplyApplicationCriminalRecordComponent } from './pages/apply-application-criminal-record/apply-application-criminal-record.component';
import { CriminalRecordApproveComponent } from './pages/criminal-record-approve/criminal-record-approve.component';
import { CriminalRecordApproveApplicationComponent } from './pages/criminal-record-approve/criminal-record-approve-application/criminal-record-approve-application.component';
import { CriminalRecordApproveApplicationRouteComponent } from './pages/criminal-record-approve/criminal-record-approve-application-route/criminal-record-approve-application-route.component';
import { CriminalRecordApprovalRouteComponent } from './pages/criminal-record-approve/criminal-record-approval-route/criminal-record-approval-route.component';
import { CriminalRecordLetterKhComponent } from './pages/criminal-record-form/criminal-record-letter-kh/criminal-record-letter-kh.component';
import { CriminalRecordLetterEnComponent } from './pages/criminal-record-form/criminal-record-letter-en/criminal-record-letter-en.component';
import { CriminalRecordLetterFrComponent } from './pages/criminal-record-form/criminal-record-letter-fr/criminal-record-letter-fr.component';
import { CriminalLatterComponent } from './pages/criminal-latter/criminal-latter.component';
import { CriminalLatterRouterComponent } from './pages/criminal-latter/criminal-latter-router/criminal-latter-router.component';
import { CriminalLatterTabsComponent } from './pages/criminal-latter/criminal-latter-tabs/criminal-latter-tabs.component';
import { TutorialComponent } from './pages/tutorial/tutorial.component';
import { TutorialDocumentComponent } from './pages/tutorial/tutorial-document/tutorial-document.component';
import { TutorialVideoComponent } from './pages/tutorial/tutorial-video/tutorial-video.component';
import { TutorialVideoFormComponent } from './pages/tutorial/tutorial-video-form/tutorial-video-form.component';
import { TutorialDocumentFormComponent } from './pages/tutorial/tutorial-document-form/tutorial-document-form.component';
import { TutorialFaqComponent } from './pages/tutorial/tutorial-faq/tutorial-faq.component';
import { QuillModule } from 'ngx-quill';
import { CriminalOnlineApplicationRouteComponent } from './pages/criminal-online-application-route/criminal-online-application-route.component';
import { CriminalApplicationApplyInPlaceComponent } from './pages/criminal-application-apply-in-place/criminal-application-apply-in-place.component';
import { CriminalApplicationBulletinListComponent } from './pages/criminal-application-bulletin-list/criminal-application-bulletin-list.component';
import { DecreeInputFormComponent } from './components/decree-input-form/decree-input-form.component';
import { ReceiveApplicationFormComponent } from './components/receive-application-form/receive-application-form.component';
import { CriminalLatterPrintRouteComponent } from './pages/criminal-latter/criminal-latter-print-route/criminal-latter-print-route.component';
import { ReceiveHardPaperFormComponent } from './components/receive-hard-paper-form/receive-hard-paper-form.component';
import { OfficerCreateApplicationConfirmComponent } from './components/officer-create-application-confirm/officer-create-application-confirm.component';
import { CriminalGroupRequestFormComponent } from './pages/criminal-group-request-form/criminal-group-request-form.component';
import { CriminalGroupRequestFormRouteComponent } from './pages/criminal-group-request-form/criminal-group-request-form-route/criminal-group-request-form-route.component';
import { CriminalGroupRequestFormAppComponent } from './pages/criminal-group-request-form/criminal-group-request-form-app/criminal-group-request-form-app.component';
import { CriminalGroupRequestFormAppRouteComponent } from './pages/criminal-group-request-form/criminal-group-request-form-app-route/criminal-group-request-form-app-route.component';
import { CriminalGroupRequestFormPaidComponent } from './pages/criminal-group-request-form/criminal-group-request-form-paid/criminal-group-request-form-paid.component';
import { CriminalGroupRequestFormListingComponent } from './pages/criminal-group-request-form/criminal-group-request-form-listing/criminal-group-request-form-listing.component';
import { AddGroupRequestFormComponent } from './pages/criminal-group-request-form/add-group-request-form/add-group-request-form.component';
import { AddDocToGroupComponent } from './pages/criminal-group-request-form/add-doc-to-group/add-doc-to-group.component';
import { CriminalReceiptApplicationComponent } from './pages/criminal-receipt-application/criminal-receipt-application.component';
import { CriminalReceiptApplicationRecordComponent } from './pages/criminal-receipt-application/criminal-receipt-application-record/criminal-receipt-application-record.component';
import { CriminalReceiptApplicationDisplayComponent } from './pages/criminal-receipt-application/criminal-receipt-application-display/criminal-receipt-application-display.component';
import { CrimianlReceiptLetterComponent } from './pages/criminal-receipt-application/crimianl-receipt-letter/crimianl-receipt-letter.component';
import { CriminalReceiptPrintDialogComponent } from './components/criminal-receipt-print-dialog/criminal-receipt-print-dialog.component';
import { PrintReceiptDialogComponent } from './components/print-receipt-dialog/print-receipt-dialog.component';
import { GroupUsersComponent } from './pages/group-users/group-users.component';
import { AddGroupUserAccountComponent } from './pages/group-users/add-group-user-account/add-group-user-account.component';
import { AddGroupUserComponent } from './pages/group-users/add-group-user/add-group-user.component';
import { CriminalLatterOfficerChooseNationalityComponent } from './components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component';
import { CriminalLatterOfficerChooseNationalityKhmerComponent } from './components/criminal-latter-officer-choose-nationality-khmer/criminal-latter-officer-choose-nationality-khmer.component';
import { CriminalApplyExcelImportComponent } from './components/criminal-apply-excel-import/criminal-apply-excel-import.component';
import { PublicHolidayComponent } from './pages/public-holiday/public-holiday.component';
import { AddPublicHolidayComponent } from './pages/public-holiday/add-public-holiday/add-public-holiday.component';
import { CriminalRecordByFolderComponent } from './pages/criminal-record-by-folder/criminal-record-by-folder.component';
import { AppCriminalGroupRequestFormSignComponent } from './pages/criminal-group-request-form/app-criminal-group-request-form-sign/app-criminal-group-request-form-sign.component';
import { ClassifyCriminalRemainingComponent } from './pages/criminal-group-request-form/classify-criminal-remaining/classify-criminal-remaining.component';
import { ClassifyRemainingNumberComponent } from './pages/criminal-group-request-form/classify-criminal-remaining/classify-remaining-number/classify-remaining-number.component';
import { GroupUserDetailComponent } from './pages/group-users/group-user-detail/group-user-detail.component';
import { CriminalRecordApprovalComponent } from './pages/criminal-record-approval/criminal-record-approval.component';
import { CriminalGroupRequestFormListingInputNumberComponent } from './pages/criminal-group-request-form-listing-input-number/criminal-group-request-form-listing-input-number.component';
import { CriminalGroupRequestFormListingTemplateInputNumberComponent } from './pages/criminal-group-request-form-listing-template-input-number/criminal-group-request-form-listing-template-input-number.component';
import { CriminalGroupRequestFormListingTemplateDisplayAllComponent } from './pages/criminal-group-request-form-listing-template-display-all/criminal-group-request-form-listing-template-display-all.component';
import { CriminalLetterAddReceiveNoComponent } from './pages/criminal-letter-add-receive-no/criminal-letter-add-receive-no.component';
import { CriminalRecordLetterKhPrintComponent } from './components/criminal-record-letter-kh-print/criminal-record-letter-kh-print.component';
import { CriminalApplicationPaymentComponent } from './pages/criminal-application-payment/criminal-application-payment.component';
import { ApplicationPaymentComponent } from './components/application-payment/application-payment.component';
import { MinistryOfLaborComponent } from './pages/ministry-of-labor/ministry-of-labor.component';
import { MolListingComponent } from './pages/ministry-of-labor/mol-listing/mol-listing.component';
import { PrintFinishReviewDialogComponent } from './components/print-finish-review-dialog/print-finish-review-dialog.component';
import { CriminalRecordReportsComponent } from './pages/criminal-record-reports/criminal-record-reports.component';
import { DataReportComponent } from './pages/criminal-record-reports/data-report/data-report.component';
import { CriminalStatisticsComponent } from './pages/criminal-statistics/criminal-statistics.component';
import { CriminalRecordAppyDataEntryComponent } from './pages/criminal-record-appy-data-entry/criminal-record-appy-data-entry.component';
import { CriminalRecordConfirmDataEntryComponent } from './pages/criminal-record-confirm-data-entry/criminal-record-confirm-data-entry.component';
import { CriminalRecordApprovedDataEntryComponent } from './pages/criminal-record-approved-data-entry/criminal-record-approved-data-entry.component';
import { CriminalRecordRejectedDataEntryComponent } from './pages/criminal-record-rejected-data-entry/criminal-record-rejected-data-entry.component';
import { CriminalRecordCompletedDataEntryComponent } from './pages/criminal-record-completed-data-entry/criminal-record-completed-data-entry.component';
import { CriminalRecordApprovedModDataEntryComponent } from './pages/criminal-record-approved-mod-data-entry/criminal-record-approved-mod-data-entry.component';
import { DecreeConfirmDialogComponent } from './components/decree-confirm-dialog/decree-confirm-dialog.component';
import { CriminalPaymentComponent } from './pages/criminal-payment/criminal-payment.component';
import { CriminalRecordLetterEnPrintComponent } from './components/criminal-record-letter-en-print/criminal-record-letter-en-print.component';
import { CriminalRecordLetterFrPrintComponent } from './components/criminal-record-letter-fr-print/criminal-record-letter-fr-print.component';
import { CriminalApplicationDirectComponent } from './pages/criminal-application-direct/criminal-application-direct.component';
import { CriminalApplicationDirectLetter1Component } from './pages/criminal-application-direct-letter1/criminal-application-direct-letter1.component';
import { CriminalApplicationDirectLetter2Component } from './pages/criminal-application-direct-letter2/criminal-application-direct-letter2.component';
import { CriminalApplicationDirectLetter2ModComponent } from './pages/criminal-application-direct-letter2-mod/criminal-application-direct-letter2-mod.component';
import { CriminalApplicationDirectLetter3Component } from './pages/criminal-application-direct-letter3/criminal-application-direct-letter3.component';
import { CriminalApplicationDirectLetter3GeneralComponent } from './pages/criminal-application-direct-letter3-general/criminal-application-direct-letter3-general.component';
import { CriminalApplicationDirectLetter3MolComponent } from './pages/criminal-application-direct-letter3-mol/criminal-application-direct-letter3-mol.component';
import { CriminalApplicationDirectLetter3BusinessComponent } from './pages/criminal-application-direct-letter3-business/criminal-application-direct-letter3-business.component';
import { LetterOfCondemnationThreeComponent } from './pages/criminal-record-form/letter-of-condemnation-three/letter-of-condemnation-three.component';
import { CriminalRecordApprovalTopMComponent } from './pages/criminal-record-approval-top-m/criminal-record-approval-top-m.component';
import { CriminalScanFingerPrintDialogComponent } from './components/criminal-scan-finger-print-dialog/criminal-scan-finger-print-dialog.component';
import { CriminalApplicationFullviewDialogComponent } from './pages/criminal-application/criminal-application-fullview-dialog/criminal-application-fullview-dialog.component';
import { CriminalApplicationEditDialogComponent } from './components/criminal-application-edit-dialog/criminal-application-edit-dialog.component';
import { ReportConfirmFormComponent } from './pages/criminal-record-reports/report-confirm-form/report-confirm-form.component';
import { ReportProvideFingerprintComponent } from './pages/criminal-record-reports/report-provide-fingerprint/report-provide-fingerprint.component';
import { ReportPaidFormComponent } from './pages/criminal-record-reports/report-paid-form/report-paid-form.component';
import { ReportPaidFormDeliveryComponent } from './pages/criminal-record-reports/report-paid-form-delivery/report-paid-form-delivery.component';
import { ReportMolPaidComponent } from './pages/criminal-record-reports/report-mol-paid/report-mol-paid.component';
import { ReportDecreeFormComponent } from './pages/criminal-record-reports/report-decree-form/report-decree-form.component';
import { ReportDecreeFormAlreadyPaidComponent } from './pages/criminal-record-reports/report-decree-form-already-paid/report-decree-form-already-paid.component';
import { ViewAttachPdfDialogComponent } from './pages/criminal-application/view-attach-pdf-dialog/view-attach-pdf-dialog.component';
import { LetterThreeFormComponent } from './pages/letter-three-form/letter-three-form.component';
import { LetterOfCondemnationFormInFullviewComponent } from './pages/letter-of-condemnation-form-in-fullview/letter-of-condemnation-form-in-fullview.component';
import { CriminalRecordLetterKhPrintFullviewComponent } from './components/criminal-record-letter-kh-print-fullview/criminal-record-letter-kh-print-fullview.component';
import { CriminalRecordLetterEnPrintFullviewComponent } from './components/criminal-record-letter-en-print-fullview/criminal-record-letter-en-print-fullview.component';
import { CriminalRecordLetterFrPrintFullviewComponent } from './components/criminal-record-letter-fr-print-fullview/criminal-record-letter-fr-print-fullview.component';
import { CriminalLetterPrintByLanguageComponent } from './components/criminal-letter-print-by-language/criminal-letter-print-by-language.component';
import { ForderDoneFormComponent } from './pages/criminal-record-reports/forder-done-form/forder-done-form.component';
import { Letter3InputPrintComponent } from './pages/letter3-input-print/letter3-input-print.component';
import { CriminalRecordFormLetter3InputComponent } from './pages/letter3-input-print/criminal-record-form-letter3-input/criminal-record-form-letter3-input.component';
import { Letter3InputPrintDialogComponent } from './components/letter3-input-print-dialog/letter3-input-print-dialog.component';
import { DailyFolderReportComponent } from './pages/criminal-record-reports/daily-folder-report/daily-folder-report.component';
import { FolderReportComponent } from './pages/criminal-record-reports/folder-report/folder-report.component';
import { MolPaymentComponent } from './pages/mol-payment/mol-payment.component';
import { MolCriminalRecordVerifyComponent } from './pages/mol-criminal-record-verify/mol-criminal-record-verify.component';
import { MolSubmitReportComponent } from './pages/criminal-record-reports/mol-submit-report/mol-submit-report.component';
import { ModSubmitReportComponent } from './pages/criminal-record-reports/mod-submit-report/mod-submit-report.component';
import { ReportDecreeWithMolComponent } from './pages/criminal-record-reports/report-decree-with-mol/report-decree-with-mol.component';
import { AssistantPaymentComponent } from './pages/assistant-payment/assistant-payment.component';
import { AssistantCriminalRecordVerifyComponent } from './pages/assistant-criminal-record-verify/assistant-criminal-record-verify.component';
import { CriminalPaymentOptionComponent } from './pages/criminal-payment-option/criminal-payment-option.component';
import { PaymentOptionFormComponent } from './pages/criminal-payment-option/payment-option-form/payment-option-form.component';
import { EmbassyComponent } from './pages/embassy/embassy.component';
import { EmbassyFormComponent } from './pages/embassy/embassy-form/embassy-form.component';
import { ReportPaidOnlineComponent } from './pages/criminal-record-reports/report-paid-online/report-paid-online.component';
import { OverseaReportComponent } from './pages/criminal-record-reports/oversea-report/oversea-report.component';
import { OverseaApplicationComponent } from './pages/oversea-application/oversea-application.component';
import { OverseaUserComponent } from './pages/oversea-user/oversea-user.component';
import { OverseaUserFormComponent } from './pages/oversea-user/oversea-user-form/oversea-user-form.component';
import { ManualPaidOnlineComponent } from './components/manual-paid-online/manual-paid-online.component';
import { CriminalRecordPaidOnlineComponent } from './pages/criminal-record-paid-online/criminal-record-paid-online.component';
import { ReportWithdrawOnlineComponent } from './pages/criminal-record-reports/report-withdraw-online/report-withdraw-online.component';
import { OverseaCompletedComponent } from './pages/criminal-record-reports/oversea-completed/oversea-completed.component';
import { OverseaWithdrawComponent } from './pages/criminal-record-reports/oversea-withdraw/oversea-withdraw.component';
import { OverseaPaidComponent } from './pages/criminal-record-reports/oversea-paid/oversea-paid.component';
import { ReportPaidApplyOnlineComponent } from './pages/criminal-record-reports/report-paid-apply-online/report-paid-apply-online.component';
import { ReportPaidOnlineProcessComponent } from './pages/criminal-record-reports/report-paid-online-process/report-paid-online-process.component';
import { ChangeDateProcessDocComponent } from './components/change-date-process-doc/change-date-process-doc.component';
import { RemarkApplicationComponent } from './components/remark-application/remark-application.component';
import { CriminalLetter1InputPrintComponent } from './pages/criminal-letter1-input-print/criminal-letter1-input-print.component';
import { CriminalLetter1FormComponent } from './pages/criminal-letter1-input-print/criminal-letter1-form/criminal-letter1-form.component';
import { CriminalLetter2InputPrintComponent } from './pages/criminal-letter2-input-print/criminal-letter2-input-print.component';
import { CriminalLetter2FormComponent } from './pages/criminal-letter2-input-print/criminal-letter2-form/criminal-letter2-form.component';
import { CriminalLetter3BusinessInputPrintComponent } from './pages/criminal-letter3-business-input-print/criminal-letter3-business-input-print.component';
import { CriminalLetter3BusinessFormComponent } from './pages/criminal-letter3-business-input-print/criminal-letter3-business-form/criminal-letter3-business-form.component';
import { Letter2PrintDialogComponent } from './components/letter2-print-dialog/letter2-print-dialog.component';
import { CriminalRecordLetter2KhPrintComponent } from './components/criminal-record-letter2-kh-print/criminal-record-letter2-kh-print.component';
import { PrintVerifiedComponent } from './pages/print-verified/print-verified.component';
import { PrintVerifiedListingComponent } from './pages/print-verified/print-verified-listing/print-verified-listing.component';
import { PrintVerifiedDocumentsComponent } from './pages/print-verified/print-verified-documents/print-verified-documents.component';
import { PrintVerifiedApplicationComponent } from './pages/print-verified/print-verified-application/print-verified-application.component';
import { PrintVerifiedCriminalLanguageFormComponent } from './pages/print-verified/print-verified-criminal-language-form/print-verified-criminal-language-form.component';
import { WithdrawOnlineComponent } from './pages/withdraw-online/withdraw-online.component';
import { WithdrawOnlineRouteComponent } from './pages/withdraw-online/withdraw-online-route/withdraw-online-route.component';
import { ScanExpireDateComponent } from './pages/scan-expire-date/scan-expire-date.component';
import { ReportDoExpireComponent } from './pages/criminal-record-reports/report-do-expire/report-do-expire.component';
import { CriminalPaymentOnlineDraftComponent } from './pages/criminal-payment-online-draft/criminal-payment-online-draft.component';
import { VerifyOnlineReportComponent } from './pages/criminal-record-reports/verify-online-report/verify-online-report.component';
import { PaidMonthlyReportComponent } from './pages/criminal-record-reports/paid-monthly-report/paid-monthly-report.component';
import { ApproveLetterDigitalComponent } from './pages/criminal-record-approve/approve-letter-digital/approve-letter-digital.component';
import { ApproveLetterDigitalRouteComponent } from './pages/criminal-record-approve/approve-letter-digital-route/approve-letter-digital-route.component';
import { ApproveLetterDigitalBulletinComponent } from './pages/criminal-record-approve/approve-letter-digital-bulletin/approve-letter-digital-bulletin.component';
import { CriminalRecordLetterKhViewComponent } from './components/criminal-record-letter-kh-view/criminal-record-letter-kh-view.component';
import { ApproveLetterDigitalDetailsComponent } from './pages/criminal-record-approve/approve-letter-digital-details/approve-letter-digital-details.component';
export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    CriminalApplicationComponent,
    CriminalApplicationRecordComponent,
    CriminalApplicationRouteComponent,
    CriminalApplicationRouteSearchComponent,
    GeoDataComponent,
    GeoProvincesComponent,
    GeoDistrictComponent,
    GeoCommunesComponent,
    GeoVillagesComponent,
    GeoProvinceFormComponent,
    GeoDistrictsFormComponent,
    GeoCommunesFormComponent,
    GeoVillagesFormComponent,
    CriminalRecordVerifyComponent,
    CriminalVerifyRouteComponent,
    CriminalVerifyApplication1Component,
    CriminalVerifyApplication2Component,
    CriminalVerifyApplication3Component,
    CriticizesComponent,
    CriticizesRouteComponent,
    CriticizesListingComponent,
    CvFormComponent,
    CitizenProfileComponent,
    CitizenProfileCriminalRecordComponent,
    CitizenProfileCriminalFormComponent,
    NationalDataComponent,
    NationalFormComponent,
    CriminalApplicationCitizenRouteComponent,
    NationalityComponent,
    NationalityFormComponent,
    CriminalRecordCategoriesComponent,
    CriminalRecordCategoriesFormComponent,
    DocNotesComponent,
    DocNotesFormComponent,
    CriminalSettingComponent,
    CriminalRecordFlowComponent,
    CriminalRecordFlowFormComponent,
    ApplyApplicationCriminalRecordComponent,
    CriminalRecordApproveComponent,
    CriminalRecordApproveApplicationComponent,
    CriminalRecordApproveApplicationRouteComponent,
    CriminalRecordApprovalRouteComponent,
    CriminalRecordLetterKhComponent,
    CriminalRecordLetterEnComponent,
    CriminalRecordLetterFrComponent,
    CriminalLatterComponent,
    CriminalLatterRouterComponent,
    CriminalLatterTabsComponent,
    TutorialComponent,
    TutorialDocumentComponent,
    TutorialVideoComponent,
    TutorialVideoFormComponent,
    TutorialDocumentFormComponent,
    TutorialFaqComponent,
    CriminalOnlineApplicationRouteComponent,
    CriminalApplicationApplyInPlaceComponent,
    CriminalApplicationBulletinListComponent,
    DecreeInputFormComponent,
    ReceiveApplicationFormComponent,
    CriminalLatterPrintRouteComponent,
    ReceiveHardPaperFormComponent,
    OfficerCreateApplicationConfirmComponent,
    CriminalGroupRequestFormComponent,
    CriminalGroupRequestFormRouteComponent,
    CriminalGroupRequestFormAppComponent,
    CriminalGroupRequestFormAppRouteComponent,
    CriminalGroupRequestFormPaidComponent,
    CriminalGroupRequestFormListingComponent,
    AddGroupRequestFormComponent,
    AddDocToGroupComponent,
    CriminalReceiptApplicationComponent,
    CriminalReceiptApplicationRecordComponent,
    CriminalReceiptApplicationDisplayComponent,
    CrimianlReceiptLetterComponent,
    CriminalReceiptPrintDialogComponent,
    PrintReceiptDialogComponent,
    GroupUsersComponent,
    AddGroupUserAccountComponent,
    AddGroupUserComponent,
    CriminalLatterOfficerChooseNationalityComponent,
    CriminalLatterOfficerChooseNationalityKhmerComponent,
    CriminalApplyExcelImportComponent,
    PublicHolidayComponent,
    AddPublicHolidayComponent,
    CriminalRecordByFolderComponent,
    AppCriminalGroupRequestFormSignComponent,
    ClassifyCriminalRemainingComponent,
    ClassifyRemainingNumberComponent,
    GroupUserDetailComponent,
    CriminalRecordApprovalComponent,
    CriminalGroupRequestFormListingInputNumberComponent,
    CriminalGroupRequestFormListingTemplateInputNumberComponent,
    CriminalGroupRequestFormListingTemplateDisplayAllComponent,
    CriminalLetterAddReceiveNoComponent,
    CriminalRecordLetterKhPrintComponent,
    CriminalApplicationPaymentComponent,
    ApplicationPaymentComponent,
    MinistryOfLaborComponent,
    MolListingComponent,
    PrintFinishReviewDialogComponent,
    CriminalRecordAppyDataEntryComponent,
    CriminalRecordConfirmDataEntryComponent,
    CriminalRecordApprovedDataEntryComponent,
    CriminalRecordRejectedDataEntryComponent,
    CriminalRecordCompletedDataEntryComponent,
    CriminalRecordApprovedModDataEntryComponent,
    CriminalRecordReportsComponent,
    DataReportComponent,
    CriminalStatisticsComponent,
    DecreeConfirmDialogComponent,
    CriminalRecordLetterEnPrintComponent,
    CriminalPaymentComponent,
    CriminalRecordLetterFrPrintComponent,
    CriminalApplicationDirectComponent,
    CriminalApplicationDirectLetter1Component,
    CriminalApplicationDirectLetter2Component,
    CriminalApplicationDirectLetter2ModComponent,
    CriminalApplicationDirectLetter3Component,
    CriminalApplicationDirectLetter3GeneralComponent,
    CriminalApplicationDirectLetter3MolComponent,
    CriminalApplicationDirectLetter3BusinessComponent,
    LetterOfCondemnationThreeComponent,
    CriminalRecordApprovalTopMComponent,
    CriminalScanFingerPrintDialogComponent,
    CriminalApplicationFullviewDialogComponent,
    CriminalApplicationEditDialogComponent,
    ReportConfirmFormComponent,
    ReportProvideFingerprintComponent,
    ReportPaidFormComponent,
    ReportPaidFormDeliveryComponent,
    ReportMolPaidComponent,
    ReportDecreeFormComponent,
    ReportDecreeFormAlreadyPaidComponent,
    ViewAttachPdfDialogComponent,
    LetterThreeFormComponent,
    LetterOfCondemnationFormInFullviewComponent,
    CriminalRecordLetterKhPrintFullviewComponent,
    CriminalRecordLetterEnPrintFullviewComponent,
    CriminalRecordLetterFrPrintFullviewComponent,
    CriminalLetterPrintByLanguageComponent,
    ForderDoneFormComponent,
    Letter3InputPrintComponent,
    CriminalRecordFormLetter3InputComponent,
    Letter3InputPrintDialogComponent,
    DailyFolderReportComponent,
    FolderReportComponent,
    MolPaymentComponent,
    MolCriminalRecordVerifyComponent,
    MolSubmitReportComponent,
    ModSubmitReportComponent,
    ReportDecreeWithMolComponent,
    AssistantPaymentComponent,
    AssistantCriminalRecordVerifyComponent,
    CriminalPaymentOptionComponent,
    PaymentOptionFormComponent,
    EmbassyComponent,
    EmbassyFormComponent,
    ReportPaidOnlineComponent,
    OverseaReportComponent,
    OverseaApplicationComponent,
    OverseaUserComponent,
    OverseaUserFormComponent,
    ManualPaidOnlineComponent,
    CriminalRecordPaidOnlineComponent,
    ReportWithdrawOnlineComponent,
    OverseaCompletedComponent,
    OverseaWithdrawComponent,
    OverseaPaidComponent,
    ReportPaidApplyOnlineComponent,
    ReportPaidOnlineProcessComponent,
    ChangeDateProcessDocComponent,
    RemarkApplicationComponent,
    CriminalLetter1InputPrintComponent,
    CriminalLetter1FormComponent,
    CriminalLetter2InputPrintComponent,
    CriminalLetter2FormComponent,
    CriminalLetter3BusinessInputPrintComponent,
    CriminalLetter3BusinessFormComponent,
    Letter2PrintDialogComponent,
    CriminalRecordLetter2KhPrintComponent,
    PrintVerifiedComponent,
    PrintVerifiedListingComponent,
    PrintVerifiedDocumentsComponent,
    PrintVerifiedApplicationComponent,
    PrintVerifiedCriminalLanguageFormComponent,
    WithdrawOnlineComponent,
    WithdrawOnlineRouteComponent,
    ScanExpireDateComponent,
    ReportDoExpireComponent,
    CriminalPaymentOnlineDraftComponent,
    VerifyOnlineReportComponent,
    PaidMonthlyReportComponent,
    ApproveLetterDigitalComponent,
    ApproveLetterDigitalRouteComponent,
    ApproveLetterDigitalBulletinComponent,
    CriminalRecordLetterKhViewComponent,
    ApproveLetterDigitalDetailsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    LottieComponent,
    CriminalRecordRoutingModule,
    QuillModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideLottieOptions({ player: playerFactory }),
  ],
})
export class CriminalRecordModule { }
