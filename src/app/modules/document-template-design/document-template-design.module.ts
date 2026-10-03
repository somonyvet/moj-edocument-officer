import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTemplateDesignFormComponent } from './document-template-design-form/document-template-design-form.component';
import { DocumentTemplateDesignComponent } from './document-template-design/document-template-design.component';
import { DocumentTemplateRoutingModule } from './document-template-design-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    DocumentTemplateDesignFormComponent,
    DocumentTemplateDesignComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentTemplateRoutingModule
  ]
})
export class DocumentTemplateDesignModule { }
