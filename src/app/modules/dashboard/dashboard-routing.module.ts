import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentApplicationFormCommentsComponent } from 'src/app/shared/components/document-application-form-comments/document-application-form-comments.component';
import { DocumentApplicationFormInfoComponent } from 'src/app/shared/components/document-application-form-info/document-application-form-info.component';
import { DocumentApplicationDesignComponent } from '../document/document-application-design/document-application-design.component';
import { DocumentApplicationFormLatterHeadComponent } from '../document/document-application-form/document-application-form-latter-head/document-application-form-latter-head.component';
import { DocumentApplicationFormWorkplacesComponent } from '../document/document-application-form/document-application-form-workplaces/document-application-form-workplaces.component';
import { DocumentApplicationFormComponent } from '../document/document-application-form/document-application-form.component';
import { DocumentApplicationPreviewComponent } from '../document/document-application-preview/document-application-preview.component';
import { DocumentFlowComponent } from '../document/document-flow/document-flow.component';
import { OfficerApplicationFormComponent } from '../human-resource/pages/officer-application-form/officer-application-form.component';
import { InboxWorkplaceAccountComponent } from '../inbox/inbox-workplace-account/inbox-workplace-account.component';
import { AllDocumentsComponent } from './pages/all-documents/all-documents.component';
import { ApprovedDocsComponent } from './pages/approved-docs/approved-docs.component';
import { DocumentDashboardComponent } from './pages/document-dashboard/document-dashboard.component';
import { ArchivedDocumentAttachmentComponent } from './pages/home/archived-document/archived-document-attachment/archived-document-attachment.component';
import { ArchivedDocumentPreviewComponent } from './pages/home/archived-document/archived-document-preview/archived-document-preview.component';
import { ArchivedDocumentComponent } from './pages/home/archived-document/archived-document.component';
import { HomeDocumentListingComponent } from './pages/home/home-document-listing/home-document-listing.component';
import { HomeDocumentNavComponent } from './pages/home/home-document-nav/home-document-nav.component';
import { HomeDocumentComponent } from './pages/home/home-document/home-document.component';
import { HomeComponent } from './pages/home/home.component';
import { ReceivedDocumentComponent } from './pages/home/received-document/received-document.component';
import { InboxApplicationPreviewComponent } from './pages/inbox-application-preview/inbox-application-preview.component';
import { NotYetApproveDocsComponent } from './pages/not-yet-approve-docs/not-yet-approve-docs.component';

const routes: Routes = [
  { path: 'officer-application-form', component: OfficerApplicationFormComponent, },
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    children:[
      {
        path: '', component: HomeComponent, children: [
          { path: '', redirectTo: 'documents', pathMatch: 'full' },
          {
            path: 'documents', component: HomeDocumentNavComponent, children: [
              { path: '', redirectTo: 'my-files/all', pathMatch: 'full' },
              {
                path: ':tabKey/:docTypeKey', component: HomeDocumentListingComponent, children: [
                  { path: '', redirectTo: 'na', pathMatch: 'full' },

                  { path: ':docKey', component: HomeDocumentComponent,
                    children: [
                      { path: '', redirectTo: 'comments', pathMatch: 'full' },
                      { path: 'comments', component: DocumentApplicationFormCommentsComponent },
                      // { path: 'members', component: InboxWorkplaceAccountComponent },
                      { path: 'information', component: DocumentApplicationFormInfoComponent },
                    ]
                  },
                  { path: 'preview/:docKey',component: ReceivedDocumentComponent,
                    children: [
                      { path: '', redirectTo: 'comments', pathMatch: 'full' },
                      { path: 'comments', component: DocumentApplicationFormCommentsComponent },
                      { path: 'workplace', component: InboxWorkplaceAccountComponent },
                      { path: 'information', component: DocumentApplicationFormInfoComponent },
                    ]
                  },
                  { path: 'archived/:docKey' , component: ArchivedDocumentComponent,
                    children: [
                      { path: '', redirectTo: 'comments', pathMatch: 'full' },
                      {path: 'comments', component: ArchivedDocumentPreviewComponent},
                      {path: 'attachment', component: ArchivedDocumentAttachmentComponent}
                    ]
                  }
                ]
              },
            ]
          },
          { path: 'workplace', component: AllDocumentsComponent },
          { path: 'workplace/approval-documents', component: NotYetApproveDocsComponent },
          { path: 'workplace/approved-documents', component: ApprovedDocsComponent },
        ]
      },
      {
        path: 'form/:id/:departmentKey', component: DocumentApplicationDesignComponent, children: [
            { path: '', redirectTo: 'design', pathMatch: 'full' },
            {
                path: 'design', component: DocumentApplicationFormComponent, children: [
                    { path: '', redirectTo: 'comments', pathMatch: 'full' },
                    { path: 'latter-head', component: DocumentApplicationFormLatterHeadComponent },
                    { path: 'comments', component: DocumentApplicationFormCommentsComponent },
                    { path: 'information', component: DocumentApplicationFormInfoComponent },
                    { path: 'workplaces', component: DocumentApplicationFormWorkplacesComponent },
                ]
            },
            { path: 'flow', component: DocumentFlowComponent },
            { path: 'preview', component: DocumentApplicationPreviewComponent }
        ]
      },
      {
          path: 'preview/:id/:departmentKey/:isParent/design', component: InboxApplicationPreviewComponent,
          children: [
              { path: '', redirectTo: 'comments', pathMatch: 'full' },
              { path: 'comments', component: DocumentApplicationFormCommentsComponent },
              { path: 'members', component: InboxWorkplaceAccountComponent },
              { path: 'information', component: DocumentApplicationFormInfoComponent },
          ]
      },
    ]
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
