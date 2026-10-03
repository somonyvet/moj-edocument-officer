import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentApplicationFormCommentsComponent } from '../../shared/components/document-application-form-comments/document-application-form-comments.component';
import { DocumentApplicationFormInfoComponent } from '../../shared/components/document-application-form-info/document-application-form-info.component';
import { InboxApplicationComponent } from './inbox-application/inbox-application.component';
import { InboxDocumentNotedComponent } from './inbox-application/inbox-document-noted/inbox-document-noted.component';
import { InboxNotedComponent } from './inbox-application/inbox-noted/inbox-noted.component';
import { InboxWorkplaceAccountComponent } from './inbox-workplace-account/inbox-workplace-account.component';

const routes: Routes = [
    { path: '', component: InboxApplicationComponent,children:[
        { path: '', redirectTo: 'docs', pathMatch: 'full' },
        { path: 'docs', component: InboxNotedComponent },
        { path: 'reports', component: InboxDocumentNotedComponent },
    ]},
   
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InboxRoutingModule { }
