import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentPreviewComponent } from './document-preview/document-preview.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentPreviewRoutingModule } from './document-preview-routing.module';
import { DocumentConfirmSubmittedComponent } from './document-confirm-submitted/document-confirm-submitted.component';
import { DocumentFullSetPreviewComponent } from './document-full-set-preview/document-full-set-preview.component';
import { DocumentPreviewInComponent } from './document-preview-in/document-preview-in.component';
import { DocumentTemplateFullSetPreviewComponent } from './document-template-full-set-preview/document-template-full-set-preview.component';

@NgModule({
  declarations: [
    DocumentPreviewComponent,
    DocumentConfirmSubmittedComponent,
    DocumentFullSetPreviewComponent,
    DocumentPreviewInComponent,
    DocumentTemplateFullSetPreviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentPreviewRoutingModule
  ]
})
export class DocumentPreviewModule { }
