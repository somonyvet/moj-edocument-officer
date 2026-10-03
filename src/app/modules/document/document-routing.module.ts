import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentApplicationDepartmentContentComponent } from './document-application-department-content/document-application-department-content.component';
import { DocumentApplicationDepartmentDesignComponent } from './document-application-department-design/document-application-department-design.component';
import { DocumentApplicationDepartmentFormComponent } from './document-application-department-form/document-application-department-form.component';
import { DocumentApplicationDepartmentSuccessComponent } from './document-application-department-success/document-application-department-success.component';
import { DocumentApplicationDesignComponent } from './document-application-design/document-application-design.component';
import { DocumentApplicationFormCommentsComponent } from '../../shared/components/document-application-form-comments/document-application-form-comments.component';
import { DocumentApplicationFormInfoComponent } from '../../shared/components/document-application-form-info/document-application-form-info.component';
import { DocumentApplicationFormLatterHeadComponent } from './document-application-form/document-application-form-latter-head/document-application-form-latter-head.component';
import { DocumentApplicationFormWorkplacesComponent } from './document-application-form/document-application-form-workplaces/document-application-form-workplaces.component';
import { DocumentApplicationFormComponent } from './document-application-form/document-application-form.component';
import { DocumentApplicationPreviewComponent } from './document-application-preview/document-application-preview.component';
import { DocumentApplicationComponent } from './document-application/document-application.component';
import { DocumentNotedComponent } from './document-application/document-noted/document-noted.component';
import { DocumentRouterComponent } from './document-application/document-router/document-router.component';
import { DocumentFlowComponent } from './document-flow/document-flow.component';

const routes: Routes = [
    { path: '', component: DocumentRouterComponent },
    {
        path: 'memo/:departmentKey/:notedStatus/:docStatus/:ownerNotedStatus',
        component: DocumentApplicationComponent,
        children: [
            { path: '', component: DocumentNotedComponent },
        ]
    },
    {
        path: '', component: DocumentApplicationComponent, children: [
            { path: '', redirectTo: 'all/last7docs', pathMatch: 'full' },
            { path: ':departmentKey/:statusKey/:periodKey', component: DocumentNotedComponent },
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
        path: 'department-form/:id/:cid', component: DocumentApplicationDepartmentDesignComponent, children: [
            { path: '', redirectTo: 'setup', pathMatch: 'full' },
            { path: 'setup', component: DocumentApplicationDepartmentFormComponent },
            { path: 'content', component: DocumentApplicationDepartmentContentComponent },
            { path: 'success', component: DocumentApplicationDepartmentSuccessComponent },
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DocumentRoutingModule { }
