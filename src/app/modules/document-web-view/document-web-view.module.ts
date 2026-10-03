import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentWebViewDesignComponent } from './document-web-view-design/document-web-view-design.component';
import { DocumentWebViewDesignFormComponent } from './document-web-view-design-form/document-web-view-design-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentWebViewRoutingModule } from './document-web-view-routing.module';



@NgModule({
  declarations: [
    DocumentWebViewDesignComponent,
    DocumentWebViewDesignFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentWebViewRoutingModule
  ]
})
export class DocumentWebViewModule { }
