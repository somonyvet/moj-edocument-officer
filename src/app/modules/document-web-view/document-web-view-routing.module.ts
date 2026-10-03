import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentWebViewDesignFormComponent } from './document-web-view-design-form/document-web-view-design-form.component';
import { DocumentWebViewDesignComponent } from './document-web-view-design/document-web-view-design.component';

const routes: Routes = [
    {
        path: 'form/:id/:departmentKey', component: DocumentWebViewDesignComponent, children: [
            { path: '', redirectTo: 'design', pathMatch: 'full' },
            { path: 'design', component: DocumentWebViewDesignFormComponent },
        ]
    },

]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DocumentWebViewRoutingModule { }
