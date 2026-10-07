import { HrPermissionFormComponent } from './pages/human-resource-permission/human-resource-permission-form/human-resource-permission-form.component';
import { HrMissionsFormComponent } from './pages/human-resource-missions/human-resource-missions-form/human-resource-missions-form.component';
import { HrHolidayFormComponent } from './pages/human-resource-holidays/human-resource-holidays-form/human-resource-holidays-form.component';
import { AssignUserGroupWorkingHourComponent } from './pages/human-resource-working-hour/assign-user-group-working-hour/assign-user-group-working-hour.component';
import { HumanResourceWorkingHourComponent } from './pages/human-resource-working-hour/human-resource-working-hour.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
// import { IonicModule } from '@ionic/angular';
import { HumanResourceRoutingModule } from './human-resource-routing.module';
import { HumanResourceComponent } from './pages/human-resource/human-resource.component';
import { HumanResourceNavComponent } from './pages/human-resource-nav/human-resource-nav.component';
import { HumanResourceListingComponent } from './pages/human-resource-listing/human-resource-listing.component';
import { HumanResourceProfileComponent } from './pages/human-resource-profile/human-resource-profile.component';
import { OfficerEducationLevelComponent } from './pages/officer-profile/officer-education-level/officer-education-level.component';
import { OfficerFamilyInfoComponent } from './pages/officer-profile/officer-family-info/officer-family-info.component';
import { OfficerForeignLanguageComponent } from './pages/officer-profile/officer-foreign-language/officer-foreign-language.component';
import { OfficerPersonalInfoComponent } from './pages/officer-profile/officer-personal-info/officer-personal-info.component';
import { OfficerPraiseComponent } from './pages/officer-profile/officer-praise/officer-praise.component';
import { OfficerProfileComponent } from './pages/officer-profile/officer-profile.component';
import { OfficerPunishmentComponent } from './pages/officer-profile/officer-punishment/officer-punishment.component';
import { OfficerVocationalTrainingLevelComponent } from './pages/officer-profile/officer-vocational-training-level/officer-vocational-training-level.component';
import { OfficerWorkHistoryComponent } from './pages/officer-profile/officer-work-history/officer-work-history.component';
import { OfficerApplicationFormComponent } from './pages/officer-application-form/officer-application-form.component';
import { HumanResourceApprovalComponent } from './pages/human-resource-approval/human-resource-approval.component';
import { HumanResourceApprovalWorkplaceComponent } from './pages/human-resource-approval-workplace/human-resource-approval-workplace.component';
import { OfficerApplicationFormPreviewComponent } from './pages/officer-application-form-preview/officer-application-form-preview.component';
import { FormPersonalInformationComponent } from './pages/officer-personal-info/form-personal-information/form-personal-information.component';
import { OfficerApplicationListingComponent } from './pages/officer-personal-info/officer-application-listing/officer-application-listing.component';
import { OfficerApplicationFormPreviewBiographyComponent } from './pages/officer-application-form-preview-biography/officer-application-form-preview-biography.component';
import { OfficerApplicationFormPreviewRouteComponent } from './pages/officer-application-form-preview-route/officer-application-form-preview-route.component';
import { HrApprovalCommentsComponent } from './components/hr-approval-comments/hr-approval-comments';
import { HrCommentListingComponent } from './components/comment-listing/hr-comment-listing.component';
import { HumanResourceMissionsComponent } from './pages/human-resource-missions/human-resource-missions.component';
import { HumanResourcePermissionComponent } from './pages/human-resource-permission/human-resource-permission.component';
import { HumanResourcePregnancyBreakComponent } from './pages/human-resource-pregnancy-break/human-resource-pregnancy-break.component';
import { HumanResourceMyFilesComponent } from './pages/human-resource-my-files/human-resource-my-files.component';
import { HumanResourceArchivedComponent } from './pages/human-resource-archived/human-resource-archived.component';
import { HumanResourceRejectedComponent } from './pages/human-resource-rejected/human-resource-rejected.component';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { OfficerProfileFormComponent } from './pages/officer-personal-info/officer-profile-form/officer-profile-form.component';
import { OfficerFormPreviewRouteComponent } from './pages/officer-personal-info/officer-form-preview-route/officer-form-preview-route.component';
import { AttachmentDialogComponent } from './pages/officer-personal-info/attachment-dialog/attachment-dialog.component';
import { ViewAttachmentComponent } from './pages/officer-personal-info/view-attachment/view-attachment.component';
import { AddEditWorkingHourComponent } from './pages/human-resource-working-hour/add-edit-working-hour/add-edit-working-hour.component';
import { OfficerListWorkingHourComponent } from './pages/human-resource-working-hour/officer-list-working-hour/officer-list-working-hour.component';
import { HumanResourceAttendancesComponent } from './pages/human-resource-attendances/human-resource-attendances.component';
import { HumanResourceHolidaysComponent } from './pages/human-resource-holidays/human-resource-holidays.component';
import { HRPregnancyBreakFormComponent } from './pages/human-resource-pregnancy-break/human-resource-pregnancy-break-form/human-resource-pregnancy-break-form.component';
import { HumanResourceMissionsListComponent } from './pages/human-resource-missions/human-resource-missions-list/human-resource-missions-list.component';

// import { LetterOfCondemnationComponent } from './pages/officer-profile/letter-of-condemnation/letter-of-condemnation.component';
import { FirstBulletinOfCriminalKhComponent } from './pages/officer-profile/first-bulletin-of-criminal-kh/first-bulletin-of-criminal-kh.component';
import { SecondBulletinOfCriminalKhComponent } from './pages/officer-profile/second-bulletin-of-criminal-kh/second-bulletin-of-criminal-kh.component';
import { ThirdCondemnationBulletinComponent } from './pages/officer-profile/third-condemnation-bulletin/third-condemnation-bulletin.component';
import { ThirdBulletinOfCriminalFrComponent } from './pages/officer-profile/third-bulletin-of-criminal-fr/third-bulletin-of-criminal-fr.component';
import { ThirdBulletinOfCriminalKhComponent } from './pages/officer-profile/third-bulletin-of-criminal-kh/third-bulletin-of-criminal-kh.component';
import { ThirdBulletinOfCriminalEngComponent } from './pages/officer-profile/third-bulletin-of-criminal-eng/third-bulletin-of-criminal-eng.component';

export function playerFactory() {
  return player;
}
@NgModule({
  declarations: [
    HumanResourceComponent,
    HumanResourceNavComponent,
    HumanResourceListingComponent,
    HumanResourceProfileComponent,
    OfficerProfileComponent,
    OfficerPersonalInfoComponent,
    OfficerEducationLevelComponent,
    OfficerVocationalTrainingLevelComponent,
    OfficerWorkHistoryComponent,
    OfficerPraiseComponent,
    OfficerPunishmentComponent,
    OfficerFamilyInfoComponent,
    OfficerForeignLanguageComponent,
    OfficerApplicationFormComponent,
    HumanResourceApprovalComponent,
    HumanResourceApprovalWorkplaceComponent,
    OfficerApplicationFormPreviewComponent,
    FormPersonalInformationComponent,
    OfficerApplicationListingComponent,
    OfficerApplicationFormPreviewBiographyComponent,
    OfficerApplicationFormPreviewRouteComponent,
    HrApprovalCommentsComponent,
    HrCommentListingComponent,
    HumanResourceMissionsComponent,
    HumanResourcePermissionComponent,
    HumanResourcePregnancyBreakComponent,
    HumanResourceMyFilesComponent,
    HumanResourceArchivedComponent,
    HumanResourceRejectedComponent,
    OfficerProfileFormComponent,
    OfficerFormPreviewRouteComponent,
    AttachmentDialogComponent,
    ViewAttachmentComponent,
    FirstBulletinOfCriminalKhComponent,
    SecondBulletinOfCriminalKhComponent,
    ThirdBulletinOfCriminalFrComponent,
    ThirdBulletinOfCriminalKhComponent,
    ThirdBulletinOfCriminalEngComponent,
    ThirdCondemnationBulletinComponent,
    HumanResourceWorkingHourComponent,
    AddEditWorkingHourComponent,
    AssignUserGroupWorkingHourComponent,
    OfficerListWorkingHourComponent,
    HumanResourceAttendancesComponent,
    HumanResourceHolidaysComponent,
    HumanResourcePermissionComponent,
    HumanResourceMissionsComponent,
    HumanResourcePregnancyBreakComponent,
    HRPregnancyBreakFormComponent,
    HrHolidayFormComponent,
    HrMissionsFormComponent,
    HrPermissionFormComponent,
    HumanResourceMissionsListComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    HumanResourceRoutingModule,
    // IonicModule.forRoot(),
    LottieComponent,
  ], schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideLottieOptions({ player: playerFactory }),
  ],
})
export class HumanResourceModule { }
