import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrganizationRoutingModule } from './organization-routing.module';
import { DepartmentComponent } from './department/department.component';
import { TemplateComponent } from './template/template.component';
import { GeneralDepartmentComponent } from './general-department/general-department.component';
import { GeneralDepartmentFormComponent } from './general-department/general-department-form/general-department-form.component';
import { DepartmentFormComponent } from './department/department-form/department-form.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { AddEditUserAccountComponent } from './user-account/add-edit-user-account/add-edit-user-account.component';
import { RankingComponent } from './ranking/ranking.component';
import { RankingFormComponent } from './ranking/ranking-form/ranking-form.component';
import { TemplateDocumentComponent } from './template/template-document/template-document.component';
import { TemplateDocumentFormComponent } from './template/template-document-form/template-document-form.component';
import { TemplateRouteComponent } from './template-route/template-route.component';
import { ManagementLevelComponent } from './management-level/management-level.component';
import { ManagementLevelFormComponent } from './management-level/management-level-form/management-level-form.component';
import { PositionComponent } from './position/position.component';
import { PositionFormComponent } from './position/position-form/position-form.component';
import { OfficerOfficeFormComponent } from './user-account/officer-office-form/officer-office-form.component';
import { InstitutionComponent } from './institution/institution.component';
import { InstitutionFormComponent } from './institution/institution-form/institution-form.component';
import { SettingsComponent } from './settings/settings.component';
import { DepartmentHierarchyComponent } from './department/department-hierarchy/department-hierarchy.component';
import { NgxOrgChartModule } from 'ngx-org-chart';
import { CategoryComponent } from './category/category.component';
import { CategoryFormComponent } from './category/category-form/category-form.component';
import { OfficeInDepartmentComponent } from './department/office-in-department/office-in-department.component';
import { RemarkDocumentComponent } from './remark-document/remark-document.component';
import { RemarkFormComponent } from './remark-document/remark-form/remark-form.component';
import { FileSectionComponent } from './file-section/file-section.component';
import { FileSectionFormComponent } from './file-section/file-section-form/file-section-form.component';
import { MmeProgramComponent } from './mme-program/mme-program.component';
import { YearProgramComponent } from './year-program/year-program.component';
import { YearProgramFormComponent } from './year-program/year-program-form/year-program-form.component';
import { MainMmeProgramFormComponent } from './mme-program/main-mme-program-form/main-mme-program-form.component';
import { SourceBudgetMmeComponent } from './source-budget-mme/source-budget-mme.component';
import { SourceBudgetFormComponent } from './source-budget-mme/source-budget-form/source-budget-form.component';
import { MmeSubProgramComponent } from './mme-sub-program/mme-sub-program.component';
import { MmeSubFormComponent } from './mme-sub-program/mme-sub-form/mme-sub-form.component';
import { ClusterOfActivitiesComponent } from './cluster-of-activities/cluster-of-activities.component';
import { ClusterOfActivitiesFormComponent } from './cluster-of-activities/cluster-of-activities-form/cluster-of-activities-form.component';
import { MainActivitiesComponent } from './main-activities/main-activities.component';
import { MainActivitiesFormComponent } from './main-activities/main-activities-form/main-activities-form.component';
import { SubActivitiesComponent } from './sub-activities/sub-activities.component';
import { SubActivitiesFormComponent } from './sub-activities/sub-activities-form/sub-activities-form.component';
import { DescribeActivitiesComponent } from './sub-activities/describe-activities/describe-activities.component';
import { DescribeActivitiesFormComponent } from './sub-activities/describe-activities/describe-activities-form/describe-activities-form.component';
import { IndicatorsComponent } from './sub-activities/indicators/indicators.component';
import { FirstQuarterComponent } from './sub-activities/indicators/first-quarter/first-quarter.component';
import { SecondQuarterComponent } from './sub-activities/indicators/second-quarter/second-quarter.component';
import { ThirdQuarterComponent } from './sub-activities/indicators/third-quarter/third-quarter.component';
import { FourthQuarterComponent } from './sub-activities/indicators/fourth-quarter/fourth-quarter.component';
import { MainProgramComponent } from './main-mme-program/main-program/main-program.component';
import { MainProgramFormComponent } from './main-mme-program/main-program/main-program-form/main-program-form.component';
import { SubProgramComponent } from './main-mme-program/sub-program/sub-program.component';
import { SubProgramFormComponent } from './main-mme-program/sub-program/sub-program-form/sub-program-form.component';
import { ProgramForUserComponent } from './program-for-user/program-for-user.component';
import { ProgramForUserFormComponent } from './program-for-user/program-for-user-form/program-for-user-form.component';
import { ImportDataComponent } from './import-data/import-data.component';
import { AddPeopleCcDocumentComponent } from './department/add-people-cc-document/add-people-cc-document.component';
import { AddPeopleReceivedDocumentComponent } from './department/add-people-received-document/add-people-received-document.component';
import { DocumentReportingComponent } from './document-reporting/document-reporting.component';
import { VisaTypeComponent } from './visa-type/visa-type.component';
import { VisaTypeFormComponent } from './visa-type/visa-type-form/visa-type-form.component';
import { SupplierListingComponent } from './supplier-listing/supplier-listing.component';
import { SupplierFormComponent } from './supplier-listing/supplier-form/supplier-form.component';
import { PostListingComponent } from './post-listing/post-listing.component';
import { PostFormComponent } from './post-listing/post-form/post-form.component';
import { StockAdjustmentComponent } from './stock-adjustment/stock-adjustment.component';
import { StockTransferComponent } from './stock-transfer/stock-transfer.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { AnnouncementFormComponent } from './announcement/announcement-form/announcement-form.component';
import { EcosystemAppsComponent } from './ecosystem-apps/ecosystem-apps.component';
import { EcosystemFormComponent } from './ecosystem-apps/ecosystem-form/ecosystem-form.component';

@NgModule({
  declarations: [
    DepartmentComponent,
    TemplateComponent,
    GeneralDepartmentComponent,
    GeneralDepartmentFormComponent,
    DepartmentFormComponent,
    UserAccountComponent,
    AddEditUserAccountComponent,
    RankingComponent,
    RankingFormComponent,
    TemplateDocumentComponent,
    TemplateDocumentFormComponent,
    TemplateRouteComponent,
    ManagementLevelComponent,
    ManagementLevelFormComponent,
    PositionComponent,
    PositionFormComponent,
    OfficerOfficeFormComponent,
    InstitutionComponent,
    InstitutionFormComponent,
    SettingsComponent,
    DepartmentHierarchyComponent,
    CategoryComponent,
    CategoryFormComponent,
    OfficeInDepartmentComponent,
    RemarkDocumentComponent,
    RemarkFormComponent,
    FileSectionComponent,
    FileSectionFormComponent,
    MmeProgramComponent,
    YearProgramComponent,
    YearProgramFormComponent,
    MainMmeProgramFormComponent,
    SourceBudgetMmeComponent,
    SourceBudgetFormComponent,
    MmeSubProgramComponent,
    MmeSubFormComponent,
    ClusterOfActivitiesComponent,
    ClusterOfActivitiesFormComponent,
    MainActivitiesComponent,
    MainActivitiesFormComponent,
    SubActivitiesComponent,
    SubActivitiesFormComponent,
    DescribeActivitiesComponent,
    DescribeActivitiesFormComponent,
    IndicatorsComponent,
    FirstQuarterComponent,
    SecondQuarterComponent,
    ThirdQuarterComponent,
    FourthQuarterComponent,
    MainProgramComponent,
    MainProgramFormComponent,
    SubProgramComponent,
    SubProgramFormComponent,
    ProgramForUserComponent,
    ProgramForUserFormComponent,
    ImportDataComponent,
    AddPeopleCcDocumentComponent,
    AddPeopleReceivedDocumentComponent,
    DocumentReportingComponent,
    VisaTypeComponent,
    VisaTypeFormComponent,
    SupplierListingComponent,
    SupplierFormComponent,
    PostListingComponent,
    PostFormComponent,
    StockAdjustmentComponent,
    StockTransferComponent,
    AnnouncementComponent,
    AnnouncementFormComponent,
    EcosystemAppsComponent,
    EcosystemFormComponent,
    
  ],
  imports: [
    CommonModule,
    SharedModule,
    OrganizationRoutingModule,
    NgxOrgChartModule
  ]
})
export class OrganizationModule { }
