import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentTemplateFullSetPreviewComponent } from '../document-preview/document-template-full-set-preview/document-template-full-set-preview.component';
import { DocumentTemplateDesignFormComponent } from './document-template-design-form/document-template-design-form.component';
import { DocumentTemplateDesignComponent } from './document-template-design/document-template-design.component';

const routes: Routes = [
  {
    path: 'form/:id', component: DocumentTemplateDesignComponent, children: [
      { path: '', redirectTo: 'design', pathMatch: 'full' },
      { path: 'design', component: DocumentTemplateDesignFormComponent },
    ]
  },
  { path: ':id/full-set-template', component: DocumentTemplateFullSetPreviewComponent },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentTemplateRoutingModule { }
