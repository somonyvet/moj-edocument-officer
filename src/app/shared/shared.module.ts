import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobxAngularModule } from 'mobx-angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { MaterialModule } from '../modules/material.module';
import { ContextMenuModule } from 'ngx-contextmenu';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DeleteComponent } from './components/delete/delete.component';
import { OrgChartComponent } from './components/org-chart/org-chart.component';
import { OrgChartNodeComponent } from './components/org-chart/org-chart-node.component';
import { getCompanyPipe } from './pipes/getcompany.pipe';
import { coStatusPipe } from './pipes/getcostatus.pipe';
import { CancelComponent } from './components/cancel/cancel.component';
import { ColumnVisibleComponent } from './components/column-visible/column-visible.component';
import { CommandBarComponent } from '../modules/file-manager/components/command-bar/command-bar.component';
import { CompanyFieldComponent } from './components/company-field/company-field.component';
import { EmptyComponent } from './components/empty/empty.component';
import { LineLoadingComponent } from './components/line-loading/line-loading.component';
import { NetInfoComponent } from './components/net-info/net-info.component';
import { PlaceholderCardComponent } from './components/placeholder-card/placeholder-card.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { NavChartComponent } from '../layouts/nav-chart/nav-chart.component';
import { CheckWorkplacePipe, DateOnlyPipe, DocStatusPipe, FilterDataPipe, FilterUserPermissionApprovalPipe, FindDocumentAccountPipe, ValidateUrlPipe, validDataPipe, validDobPipe, WorkplaceCompletedReportPipe, WorkplaceReportPipe } from './pipes/date-only.pipe';
import { ConvertWorkingHourPipe, DateDayKh, DateKh, DateMonthKhPipe, DateTimeKh, DateTimePipe, DateYearKh, KhmerDatePipe, KhmerDateDisplayPipe, khmerNumberPipe, MonthFrPipe, arrNumberToStrPipe, PipeCut0 } from './pipes/date-time.pipe';
import { IconDrivePipe } from './pipes/icon-drive.pipe';
import { ConfirmOverwriteComponent } from '../modules/file-manager/components/confirm-overwrite/confirm-overwrite.component';
import { DeleteForeverComponent } from '../modules/file-manager/components/delete-forever/delete-forever.component';
import { FileInfoComponent } from '../modules/file-manager/components/file-info/file-info.component';
import { ListItemsComponent } from '../modules/file-manager/components/list-items/list-items.component';
import { RenameFileComponent } from '../modules/file-manager/components/rename-file/rename-file.component';
import { RightClickMenuComponent } from '../modules/file-manager/components/right-click-menu/right-click-menu.component';
import { RightMenuComponent } from './components/right-menu/right-menu.component';
import { FolderSizePipe, imageSizePipe } from './pipes/folder-size.pipe';
import { AddUserShareComponent } from '../modules/file-manager/components/add-user-share/add-user-share.component';
import { GetShareLinkComponent } from '../modules/file-manager/components/get-share-link/get-share-link.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { ShareWithUserComponent } from '../modules/file-manager/components/share-with-user/share-with-user.component';
import { DeleteShareFileComponent } from '../modules/file-manager/components/delete-share-file/delete-share-file.component';
import { FileInfoNameDocComponent } from '../modules/file-manager/components/file-info-name-doc/file-info-name-doc.component';
import { FileNameDocComponent } from '../modules/file-manager/components/file-name-doc/file-name-doc.component';
import { FileTypeDocComponent } from '../modules/file-manager/components/file-type-doc/file-type-doc.component';
import { QuickAccessCommandbarComponent } from '../modules/file-manager/components/quick-access-commandbar/quick-access-commandbar.component';
import { QuickAccessListItemComponent } from '../modules/file-manager/components/quick-access-list-item/quick-access-list-item.component';
import { QuickAccessComponent } from '../modules/file-manager/components/quick-access/quick-access.component';
import { SettingsDetailComponent } from './components/settings-detail/settings-detail.component';
import { SiteMapNameComponent } from './components/site-map-name/site-map-name.component';
import { DocDocRefPipe } from './pipes/doc-doc-ref.pipe';
import { DocRefDatePipe } from './pipes/doc-ref-date.pipe';
import { DocKeyRefPipe, DocRefPipe } from './pipes/doc-ref.pipe';
import { FileExtensionPipe } from './pipes/file-extension.pipe';
import { FileNameRefPipe } from './pipes/file-name-ref.pipe';
import { fileLengthPipe, FileSizePipe } from './pipes/file-size.pipe';
import { CheckListFileDoc, CheckListFileImg, FilterCheckListPipe, FilterCountriesList, FilterDocFiles, FilterDocParent, FilterImgFiles, FilterNationalList } from './pipes/filter-check-list.pipe';
import { FilterFolderPathPipe } from './pipes/filter-folder-path.pipe';
import { NotMol, UserJobPipe } from './pipes/user-job.pipe';
import { FilterListingComponent } from '../modules/file-manager/components/filter-listing/filter-listing.component';
import { UploadTaskComponent } from './components/upload-task/upload-task.component';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { OpenFileComponent } from '../modules/file-manager/components/open-file/open-file.component';
import { AdminlayoutComponent } from '../layouts/adminlayout/adminlayout.component';
import { AuthlayoutComponent } from '../layouts/authlayout/authlayout.component';
import { TabLayoutComponent } from '../layouts/tab-layout/tab-layout.component';
import { CommentChartComponent } from '../layouts/comment-chart/comment-chart.component';
import { HeaderComponent } from '../layouts/header/header.component';
import { LayoutComponent } from '../layouts/layout/layout.component';
import { SidebarComponent } from '../layouts/sidebar/sidebar.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ConfirmSuccessComponent } from './components/confirm-success/confirm-success.component';
import { PeopleCardComponent } from './components/people-card/people-card.component';
import { RemoveFirebaseTextPipe, SafePipe } from './pipes/safeHtml.pipe';
import { PinDocPipe } from './pipes/pin-doc.pipe';
import { EmptyDocumentComponent } from './components/empty-document/empty-document.component';
import { AvatarOfficerComponent } from './components/avatar-officer/avatar-officer.component';
import { NgxKjuaModule } from 'ngx-kjua';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { CommentListingComponent } from './components/comment-listing/comment-listing.component';
import { SubCommentListingComponent } from './components/sub-comment-listing/sub-comment-listing.component';
import { MomentModule } from 'ngx-moment';
import { ConfirmDeleteComponent } from './components/confirm-delete/confirm-delete.component';
import { DocumentApplicationItemSectionFormComponent } from './components/document-application-item-section-form/document-application-item-section-form.component';
import { DocumentApplicationItemHeaderFormComponent } from './components/document-application-item-header-form/document-application-item-header-form.component';
import { DocumentApplicationItemFormComponent } from './components/document-application-item-form/document-application-item-form.component';
import { DocumentAppApproverFormComponent } from './components/document-app-approver-form/document-app-approver-form.component';
import { SignatureViewComponent } from './components/signature-view/signature-view.component';
import { OfficerProfileListComponent } from './components/officer-profile-list/officer-profile-list.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { InboxFormComponent } from '../modules/inbox/inbox-form/inbox-form.component';
import { PrefixFocusAndSelectPipe, ScrollToBottomDirective } from './directive/prefix-focus-and-select.pipe';
import { TopManagementPositionComponent } from './components/top-management-position/top-management-position.component';
import { DocumentFormComponent } from '../modules/document/document-form/document-form.component';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { AvatarComponent } from './components/avatar/avatar.component';
import { OfficerTitleComponent } from './components/officer-title/officer-title.component';
import { OfficerAvatarComponent } from './components/officer-avatar/officer-avatar.component';
import { DocumentApplicationFormCommentsComponent } from './components/document-application-form-comments/document-application-form-comments.component';
import { DocumentApplicationFormInfoComponent } from './components/document-application-form-info/document-application-form-info.component';
import { DocumentCardComponent } from './components/document-card/document-card.component';
import { WorkplaceAccountFormComponent } from './components/workplace-account-form/workplace-account-form.component';
import { ChooseTemplateDialogComponent } from './components/choose-template-dialog/choose-template-dialog.component';
import { TemplateDialogSetupComponent } from './components/template-dialog-setup/template-dialog-setup.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { SideListItemSkeletonLoadingComponent } from './components/side-list-item-skeleton-loading/side-list-item-skeleton-loading.component';
import { DocumentSkeletonLoadingComponent } from './components/document-skeleton-loading/document-skeleton-loading.component';
import { ConfirmApprovalComponent } from './components/confirm-approval/confirm-approval.component';
import { DocumentApplicationWorkplaceFormComponent } from './components/document-application-workplace-form/document-application-workplace-form.component';
import { DocumentAddPersonWorkplaceFormComponent } from './components/document-add-person-workplace-form/document-add-person-workplace-form.component';
import { DocumentAddBlockNoteComponent } from './components/document-add-block-note/document-add-block-note.component';
import { UnderContructionComponent } from './components/under-contruction/under-contruction.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

export function playerFactory() {
  return player;
}

import { SearchFilterBoxComponent } from './components/search-filter-box/search-filter-box.component';
import { DocumentAssessDeniedComponent } from './components/document-assess-denied/document-assess-denied.component';
import { KhmerDateFormPickerComponent } from './components/khmer-date-form-picker/khmer-date-form-picker.component';
import { TotalPresentPipe, TotalAbsentPipe, DisplayAttendancePipe } from './pipes/hr-attendance.pipe';
import { DocumentViewComponent } from './components/document-view/document-view.component';
import { ReportFilterPeriodComponent } from './components/report-filter-period/report-filter-period.component';
import { EmptyDataComponent } from './components/empty-data/empty-data.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { DisplayKhmerDateComponent } from './components/display-khmer-date/display-khmer-date.component';
import { CriminalRecordFormRouteComponent } from '../modules/criminal-record/pages/criminal-record-form/criminal-record-form-route/criminal-record-form-route.component';
import { CriminalRecordFormComponent } from '../modules/criminal-record/pages/criminal-record-form/criminal-record-form.component';
import { LetterOfCondemnationComponent } from '../modules/criminal-record/pages/criminal-record-form/letter-of-condemnation/letter-of-condemnation.component';
import { CvFormCondemnComponent } from '../modules/criminal-record/pages/criminal-record-form/cv-form-condemn/cv-form-condemn.component';
import { ViewAttachmentCondemnComponent } from './components/view-attachment-condemn/view-attachment-condemn.component';
import { LetterOfCondemnationPrintComponent } from './components/letter-of-condemnation-print/letter-of-condemnation-print.component';
import { LetterOfCondemnationPrintCompactComponent } from './components/letter-of-condemnation-print-compact/letter-of-condemnation-print-compact.component';
import { CvFormCondemnationPrintComponent } from './components/cv-form-condemnation-print/cv-form-condemnation-print.component';
import { CriminalApplicationDecreeComponent } from './components/criminal-application-decree/criminal-application-decree.component';
import { CriminalApplicationDecreeFormComponent } from './components/criminal-application-decree-form/criminal-application-decree-form.component';
import { MojDocumentCommentComponent } from './components/moj-document-comment/moj-document-comment.component';
import { ConfirmCriminalApplicationFormComponent } from './components/confirm-criminal-application-form/confirm-criminal-application-form.component';
import { MojDocumentCommentPublicComponent } from './components/moj-document-comment-public/moj-document-comment-public.component';
import { FilterArrayWithFieldIndex } from './pipes/filter-array.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ReviewCriminalApplicationComponent } from './components/review-criminal-application/review-criminal-application.component';
import { ConfirmStatusTextComponent } from './components/confirm-status-text/confirm-status-text.component';
import { ReportFilterByPostComponent } from './components/report-filter-by-post/report-filter-by-post.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { StatisticChartViewComponent } from '../modules/criminal-record/pages/statistic-chart-view/statistic-chart-view.component';
import { LightboxModule } from 'ngx-lightbox';
import { CriminalRecordTemplateComponent } from './components/criminal-record-template/criminal-record-template.component';
import { AppScanQrCodeComponent } from './components/app-scan-qr-code/app-scan-qr-code.component';
import { CheckHaveTranslatePipe, GenderFr, GetEnglishCopyCountPipe, GetFrenchCopyCountPipe, GetKhmerAmount, GetKhmerCopyCountPipe, IsMolApply } from './pipes/check-have-translate.pipe';
import { GeoDisplayPipe } from './pipes/geo-display.pipe';
import { removeImgWhiteSpacePipe } from './pipes/image.pipe';
import { CommentDecreeGuiltyComponent } from './components/comment-decree-guilty/comment-decree-guilty.component';
import { AddMoreSpaceToString, AddMoreSpaceToStringAddress, FormatNum3digitPipe, KhmerNumAddress, MoreSpaceEnAddress, NicknameSpace, RemoveStringPip, StringUpperCase, stringDoubleSpace } from './pipes/strings.pipe';
import { ReportFilterSelectedPeriodComponent } from './components/report-filter-selected-period/report-filter-selected-period.component';
import { MolLetterOfCondemnationPrintComponent } from './components/mol-letter-of-condemnation-print/mol-letter-of-condemnation-print.component';
import { EmbassyTakeVerifyDocumentComponent } from './components/embassy-take-verify-document/embassy-take-verify-document.component';
import { WithdrawAddressDisplayComponent } from './components/withdraw-address-display/withdraw-address-display.component';
import { PaidOnlineInformationComponent } from './components/paid-online-information/paid-online-information.component';
import { AttachFileOverseaComponent } from './components/attach-file-oversea/attach-file-oversea.component';
import { ReportFilterHourComponent } from './components/report-filter-hour/report-filter-hour.component';
import { StartProcessDocDialogComponent } from './components/start-process-doc-dialog/start-process-doc-dialog.component';
import { ReportFilterSelectedMonthComponent } from './components/report-filter-selected-month/report-filter-selected-month.component';
import { ShowVerifyQRComponent } from './components/show-verify-qr/show-verify-qr.component';
import { DocumentApprovalProgressComponent } from '../modules/criminal-record/components/document-approval-progress/document-approval-progress.component';
import { DigitalApprovalFormComponent } from './components/digital-approval-form/digital-approval-form.component';
import { DecreeResultViewComponent } from './components/decree-result-view/decree-result-view.component';
import { CommentDecreeViewComponent } from './components/comment-decree-view/comment-decree-view.component';
import { StatusPillComponent } from './components/status-pill/status-pill.component';

const customDefaultOptions = {
  scrollThrottlingTime: 0,
  scrollDebounceTime: 0,
  scrollAnimationTime: 750,
  checkResizeInterval: 1000,
  resizeBypassRefreshThreshold: 5,
  modifyOverflowStyleOfParentScroll: true,
  stripedTable: false
};


const components = [
  GeoDisplayPipe,
  KhmerDatePipe,
  KhmerDateDisplayPipe,
  WorkplaceReportPipe,
  fileLengthPipe,
  SafePipe,
  getCompanyPipe,
  coStatusPipe,
  DeleteComponent,
  AuthlayoutComponent,
  TabLayoutComponent,
  DateOnlyPipe,
  DateTimePipe,
  NavChartComponent,
  NetInfoComponent,
  PrimaryButtonComponent,
  PlaceholderComponent,
  ColumnVisibleComponent,
  SpinnerComponent,
  EmptyComponent,
  CommandBarComponent,
  IconDrivePipe,
  CancelComponent,
  CompanyFieldComponent,
  LineLoadingComponent,
  PlaceholderCardComponent,
  PlaceholderCardComponent,
  RenameFileComponent,
  RightMenuComponent,
  RightClickMenuComponent,
  FileInfoComponent,
  DeleteForeverComponent,
  ListItemsComponent,
  FolderSizePipe,
  ConfirmOverwriteComponent,
  GetShareLinkComponent,
  SearchFormComponent,
  AddUserShareComponent,
  ShareWithUserComponent,
  DeleteShareFileComponent,
  FileTypeDocComponent,
  FileInfoNameDocComponent,
  SiteMapNameComponent,
  QuickAccessListItemComponent,
  QuickAccessCommandbarComponent,
  FileNameRefPipe,
  FileNameDocComponent,
  FilterCheckListPipe,
  QuickAccessComponent,
  SettingsDetailComponent,
  FileSizePipe,
  FileExtensionPipe,
  DocDocRefPipe,
  DocRefDatePipe,
  DocRefPipe,
  UserJobPipe,
  FilterFolderPathPipe,
  SanitizeHtmlPipe,
  FilterListingComponent,
  AdminlayoutComponent,
  UploadTaskComponent,
  OpenFileComponent,
  PlaceholderComponent,
  AvatarOfficerComponent,
  SidebarComponent,
  HeaderComponent,
  CommentChartComponent,
  LayoutComponent,
  DocKeyRefPipe,
  ConfirmSuccessComponent,
  PeopleCardComponent,
  PinDocPipe,
  EmptyDocumentComponent,
  DocStatusPipe,
  CommentListingComponent,
  SubCommentListingComponent,
  FindDocumentAccountPipe,
  FilterDataPipe,
  validDataPipe,
  CheckWorkplacePipe,
  DocumentApplicationItemSectionFormComponent,
  DocumentApplicationItemHeaderFormComponent,
  DocumentApplicationItemFormComponent,
  ConfirmDeleteComponent,
  DocumentAppApproverFormComponent,
  SignatureViewComponent,
  OfficerProfileListComponent,
  ChangePasswordComponent,
  InboxFormComponent,
  PrefixFocusAndSelectPipe,
  RemoveFirebaseTextPipe,
  TopManagementPositionComponent,
  DocumentFormComponent,
  AvatarComponent,
  OfficerTitleComponent,
  OfficerAvatarComponent,
  imageSizePipe,
  DocumentApplicationFormCommentsComponent,
  DocumentApplicationFormInfoComponent,
  WorkplaceCompletedReportPipe,
  DocumentCardComponent,
  ScrollToBottomDirective,
  WorkplaceAccountFormComponent,
  ValidateUrlPipe,
  ChooseTemplateDialogComponent,
  TemplateDialogSetupComponent,
  SideListItemSkeletonLoadingComponent,
  DocumentSkeletonLoadingComponent,
  ConfirmApprovalComponent,
  DateDayKh,
  DateMonthKhPipe,
  DateYearKh,
  DateKh,
  SearchFilterBoxComponent,
  DocumentAssessDeniedComponent,
  KhmerDateFormPickerComponent,
  DocumentApplicationWorkplaceFormComponent,
  DocumentAddPersonWorkplaceFormComponent,
  DocumentAddBlockNoteComponent,
  UnderContructionComponent,
  SkeletonLoaderComponent,
  DocumentViewComponent,
  FilterDocParent,
  CheckListFileImg,
  CheckListFileDoc,
  FilterImgFiles,
  FilterDocFiles,
  ReportFilterPeriodComponent,
  EmptyDataComponent,
  FilterNationalList,
  FilterCountriesList,
  DisplayKhmerDateComponent,
  //============================used more than two modules
  CriminalRecordFormRouteComponent,
  CriminalRecordFormComponent,
  LetterOfCondemnationComponent,
  CvFormCondemnComponent,
  ViewAttachmentCondemnComponent,
  LetterOfCondemnationPrintComponent,
  LetterOfCondemnationPrintCompactComponent,
  CvFormCondemnationPrintComponent,
  ConvertWorkingHourPipe,
  TotalPresentPipe,
  TotalAbsentPipe,
  DisplayAttendancePipe,
  FilterUserPermissionApprovalPipe,
  FilterArrayWithFieldIndex,
  ReviewCriminalApplicationComponent,
  khmerNumberPipe,
  DateTimeKh,
  ReportFilterByPostComponent,
  StatisticChartViewComponent,
  CheckHaveTranslatePipe,
  validDobPipe,
  CriminalApplicationDecreeComponent,
  CriminalApplicationDecreeFormComponent,
  MojDocumentCommentComponent,
  ConfirmCriminalApplicationFormComponent,
  MojDocumentCommentPublicComponent,
  ConfirmStatusTextComponent,
  CriminalRecordTemplateComponent,
  AppScanQrCodeComponent,
  removeImgWhiteSpacePipe,
  NicknameSpace,
  AddMoreSpaceToString,
  AddMoreSpaceToStringAddress,
  StringUpperCase,
  MoreSpaceEnAddress,
  stringDoubleSpace,
  KhmerNumAddress,
  GetKhmerCopyCountPipe,
  GetEnglishCopyCountPipe,
  GetFrenchCopyCountPipe,
  MonthFrPipe,
  ReportFilterSelectedPeriodComponent,
  arrNumberToStrPipe,
  PipeCut0,
  GetKhmerAmount,
  GenderFr,
  NotMol,
  IsMolApply,
  EmbassyTakeVerifyDocumentComponent,
  ReportFilterHourComponent,
  FormatNum3digitPipe,
  RemoveStringPip,
  ReportFilterSelectedMonthComponent,
  DocumentApprovalProgressComponent,
  DigitalApprovalFormComponent,
  DecreeResultViewComponent,
  StatusPillComponent,
  OrgChartComponent,
  OrgChartNodeComponent,
];
const modules = [
  CommonModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  MobxAngularModule,
  HttpClientModule,
  HttpClientJsonpModule,
  ReactiveFormsModule,
  MobxAngularModule,
  MaterialModule,
  NgxDocViewerModule,
  InfiniteScrollModule,
  ContextMenuModule,
  VirtualScrollerModule,
  CKEditorModule,
  NgxKjuaModule,
  // NgbModule,
  NgbTimepickerModule,
  MomentModule,
  NgxSkeletonLoaderModule,
  NgxUsefulSwiperModule,
  EditorModule,
  PdfViewerModule,
  NgxChartsModule,
  NgApexchartsModule,
  LightboxModule,

];

@NgModule({
  declarations: [
    ...components,
    CommentDecreeGuiltyComponent,
    MolLetterOfCondemnationPrintComponent,
    WithdrawAddressDisplayComponent,
    PaidOnlineInformationComponent,
    AttachFileOverseaComponent,
    StartProcessDocDialogComponent,
    ShowVerifyQRComponent,
    CommentDecreeViewComponent,
  ],
  imports: [
    ...modules,
    LottieModule.forRoot({ player: playerFactory }),
  ],
  exports: [
    ...components,
    ...modules,
  ],
  providers: [{
    provide: 'virtual-scroller-default-options', useValue: customDefaultOptions
  }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
