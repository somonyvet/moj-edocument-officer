import { MainActivitiesComponent } from './main-activities/main-activities.component';
import { ClusterOfActivitiesComponent } from './cluster-of-activities/cluster-of-activities.component';
import { YearProgramComponent } from './year-program/year-program.component';
import { MmeProgramComponent } from './mme-program/mme-program.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainSidenavLayoutComponent } from 'src/app/layouts/main-layout/main-sidenav-layout/main-sidenav-layout.component';
import { TabLayoutComponent } from 'src/app/layouts/tab-layout/tab-layout.component';
import { CategoryComponent } from './category/category.component';
import { DepartmentHierarchyComponent } from './department/department-hierarchy/department-hierarchy.component';
import { DepartmentComponent } from './department/department.component';
import { FileSectionComponent } from './file-section/file-section.component';
import { GeneralDepartmentComponent } from './general-department/general-department.component';
import { InstitutionComponent } from './institution/institution.component';
import { ManagementLevelComponent } from './management-level/management-level.component';
import { PositionComponent } from './position/position.component';
import { RankingComponent } from './ranking/ranking.component';
import { RemarkDocumentComponent } from './remark-document/remark-document.component';
import { SettingsComponent } from './settings/settings.component';
import { TemplateRouteComponent } from './template-route/template-route.component';
import { TemplateDocumentComponent } from './template/template-document/template-document.component';
import { TemplateComponent } from './template/template.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { SourceBudgetMmeComponent } from './source-budget-mme/source-budget-mme.component';
import { MmeSubProgramComponent } from './mme-sub-program/mme-sub-program.component';
import { SubActivitiesComponent } from './sub-activities/sub-activities.component';
import { MainProgramComponent } from './main-mme-program/main-program/main-program.component';
import { ProgramForUserComponent } from './program-for-user/program-for-user.component';
import { ImportDataComponent } from './import-data/import-data.component';
import { DocumentReportingComponent } from './document-reporting/document-reporting.component';
import { VisaTypeComponent } from './visa-type/visa-type.component';
import { SupplierListingComponent } from './supplier-listing/supplier-listing.component';
import { PostListingComponent } from './post-listing/post-listing.component';
import { StockTransferComponent } from './stock-transfer/stock-transfer.component';
import { StockAdjustmentComponent } from './stock-adjustment/stock-adjustment.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { EcosystemAppsComponent } from './ecosystem-apps/ecosystem-apps.component';

const routes: Routes = [
  {
    path: "", component: MainSidenavLayoutComponent, children: [
      { path: '', redirectTo: 'templates', pathMatch: 'full' },
      {
        path: "templates", component: TemplateRouteComponent, children: [
          { path: '', redirectTo: 'data', pathMatch: 'full' },
          { path: "data", component: TemplateComponent },
          { path: "documents", component: TemplateDocumentComponent },
        ]
      },
      { path: "general-department", component: GeneralDepartmentComponent },
      {
        path: "department", component: TabLayoutComponent, children: [
          { path: '', redirectTo: 'listing', pathMatch: 'full' },
          { path: 'listing', component: DepartmentComponent },
          { path: 'hierarchy', component: DepartmentHierarchyComponent },
        ]
      },

      {
        path: "mme-program", component: TabLayoutComponent, children: [
          { path: '', redirectTo: 'main-program', pathMatch: 'full' },
          { path: 'main-program', component: MainProgramComponent },
        ]
      },
      {
        path: "program", component: TabLayoutComponent, children: [
          { path: '', redirectTo: 'mme-program', pathMatch: 'full' },
          { path: 'mme-program', component: MmeProgramComponent },
          { path: ':keyPath/:id', component: MmeSubProgramComponent },
          // { path: ':id/mme-sub-program', component: MmeSubProgramComponent },
          // { path: ':subid/cluster-of-activities', component: ClusterOfActivitiesComponent },
          // { path: ':clusterid/main-activities', component: MainActivitiesComponent},
          // { path: ':mainid/sub-activities', component: SubActivitiesComponent},
        ]
      },
      {
        path: "user-program", component: TabLayoutComponent, children: [
          { path: '', redirectTo: 'mme-program', pathMatch: 'full' },
          { path: 'mme-program', component: ProgramForUserComponent },
          { path: ':keyPath/:id', component: ProgramForUserComponent },
          // { path: ':id/mme-sub-program', component: MmeSubProgramComponent },
          // { path: ':subid/cluster-of-activities', component: ClusterOfActivitiesComponent },
          // { path: ':clusterid/main-activities', component: MainActivitiesComponent},
          // { path: ':mainid/sub-activities', component: SubActivitiesComponent},
        ]
      },

      { path: ':id/mme-sub-program', component: MmeSubProgramComponent },
      { path: "year-program", component: YearProgramComponent },
      { path: "source-budget", component: SourceBudgetMmeComponent },
      { path: "officers", component: UserAccountComponent },
      { path: "category", component: CategoryComponent },
      { path: "sectors", component: FileSectionComponent },
      { path: "positions", component: PositionComponent },

      { path: "visa_types", component: VisaTypeComponent },
      { path: "supplier", component: SupplierListingComponent },
      { path: "post", component: PostListingComponent },

      { path: "stock-adjustment/:id", component: StockAdjustmentComponent },
      { path: "stock-transfer/:id", component: StockTransferComponent },

      { path: "ranking", component: RankingComponent },
      { path: "management-level", component: ManagementLevelComponent },
      { path: "ecosystem", component: EcosystemAppsComponent },

      { path: "institutions", component: InstitutionComponent },
      { path: "remark", component: RemarkDocumentComponent },

      { path: "import-data", component: ImportDataComponent },

      { path: "document-reporting", component: DocumentReportingComponent },


      {
        path: "geo",
        loadChildren: () => import('./geo-data/geo-data.module').then(m => m.GeoDataModule)
      },

      { path: "settings", component: SettingsComponent },
      { path: 'announcement', component: AnnouncementComponent },

    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
