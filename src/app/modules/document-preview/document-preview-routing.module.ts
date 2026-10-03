import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentApplicationFormCommentsComponent } from 'src/app/shared/components/document-application-form-comments/document-application-form-comments.component';
import { DocumentApplicationFormInfoComponent } from 'src/app/shared/components/document-application-form-info/document-application-form-info.component';
import { DocumentApplicationFormLatterHeadComponent } from '../document/document-application-form/document-application-form-latter-head/document-application-form-latter-head.component';
import { DocumentApplicationFormWorkplacesComponent } from '../document/document-application-form/document-application-form-workplaces/document-application-form-workplaces.component';
import { InboxWorkplaceAccountComponent } from '../inbox/inbox-workplace-account/inbox-workplace-account.component';
import { DocumentFullSetPreviewComponent } from './document-full-set-preview/document-full-set-preview.component';
import { DocumentPreviewInComponent } from './document-preview-in/document-preview-in.component';
import { DocumentPreviewComponent } from './document-preview/document-preview.component';

const routes: Routes = [
  {
    path: ':id', component: DocumentPreviewComponent,
    children: [
      { path: '', redirectTo: 'comments', pathMatch: 'full' },
      { path: 'latter-head', component: DocumentApplicationFormLatterHeadComponent },
      { path: 'comments', component: DocumentApplicationFormCommentsComponent },
      { path: 'information', component: DocumentApplicationFormInfoComponent },
      { path: 'workplaces', component: DocumentApplicationFormWorkplacesComponent },
    ]
  },

  { path: ':id', component: DocumentPreviewInComponent },
  {
    path: 'preview/:id/:departmentKey/:isParent/design', component: DocumentPreviewInComponent,
    children: [
      { path: '', redirectTo: 'comments', pathMatch: 'full' },
      { path: 'comments', component: DocumentApplicationFormCommentsComponent },
      { path: 'members', component: InboxWorkplaceAccountComponent },
      { path: 'information', component: DocumentApplicationFormInfoComponent },
    ]
  },

  { path: 'full-set/:id', component: DocumentFullSetPreviewComponent },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentPreviewRoutingModule { }
