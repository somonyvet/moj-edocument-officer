import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentRoutingModule } from './document-routing.module';
import { DocumentApplicationComponent } from './document-application/document-application.component';
import { DocumentApplicationFormComponent } from './document-application-form/document-application-form.component';
import { DocumentFormItemComponent } from './document-form-item/document-form-item.component';
import { DocumentApplicationDepartmentFormComponent } from './document-application-department-form/document-application-department-form.component';
import { DocumentFlowComponent } from './document-flow/document-flow.component';
import { DocumentApplicationDesignComponent } from './document-application-design/document-application-design.component';
import { DocumentApplicationPreviewComponent } from './document-application-preview/document-application-preview.component';
import { DocumentApplicationDepartmentDesignComponent } from './document-application-department-design/document-application-department-design.component';
import { DocumentApplicationDepartmentContentComponent } from './document-application-department-content/document-application-department-content.component';
import { DocumentApplicationDepartmentSuccessComponent } from './document-application-department-success/document-application-department-success.component';
import { AddNumberRefDocumentApplicationDepartmentComponent } from './document-application-department-form/add-number-ref-document-application-department/add-number-ref-document-application-department.component';
import { DocumentDepartmentFormComponent } from './document-department-form/document-department-form.component';
import { DocumentConfirmReleasedComponent } from './document-confirm-released/document-confirm-released.component';
import { DocumentNotedComponent } from './document-application/document-noted/document-noted.component';
import { DocumentRouterComponent } from './document-application/document-router/document-router.component';
import { DocumentStreamFormComponent } from './document-stream-form/document-stream-form.component';
import { DocumentHeadOptionComponent } from './document-head-option/document-head-option.component';
import { DocumentCompleteComponent } from './document-complete/document-complete.component';
import { DocumentVoidComponent } from './document-void/document-void.component';
import { DocumentApprovalComponent } from './document-approval/document-approval.component';
import { DocumentApplicationFormLatterHeadComponent } from './document-application-form/document-application-form-latter-head/document-application-form-latter-head.component';
import { DocumentApplicationFormWorkplacesComponent } from './document-application-form/document-application-form-workplaces/document-application-form-workplaces.component';
import { DocumentReportFormComponent } from './document-application-form/document-report-form/document-report-form.component';
import { ContainerApprovalNoteComponent } from './document-approval/container-approval-note/container-approval-note.component';
import { WrittingApprovalNoteComponent } from './document-approval/container-approval-note/writting-approval-note/writting-approval-note.component';
import { SelectApprovalNoteComponent } from './document-approval/container-approval-note/select-approval-note/select-approval-note.component';
import { AddRemarkComponent } from './document-approval/container-approval-note/writting-approval-note/add-remark/add-remark.component';
import { DocumentAddCustomStyleComponent } from './document-add-custom-style/document-add-custom-style.component';

@NgModule({
  declarations: [
    DocumentApplicationComponent,
    DocumentApplicationFormComponent,
    DocumentFormItemComponent,
    DocumentApplicationDepartmentFormComponent,
    DocumentFlowComponent,
    DocumentApplicationDesignComponent,
    DocumentApplicationPreviewComponent,
    DocumentApplicationDepartmentDesignComponent,
    DocumentApplicationDepartmentContentComponent,
    DocumentApplicationDepartmentSuccessComponent,
    AddNumberRefDocumentApplicationDepartmentComponent,
    DocumentDepartmentFormComponent,
    DocumentConfirmReleasedComponent,
    DocumentNotedComponent,
    DocumentRouterComponent,
    DocumentStreamFormComponent,
    DocumentHeadOptionComponent,
    DocumentCompleteComponent,
    DocumentVoidComponent,
    DocumentApprovalComponent,
    DocumentApplicationFormLatterHeadComponent,
    DocumentApplicationFormWorkplacesComponent,
    DocumentReportFormComponent,
    ContainerApprovalNoteComponent,
    WrittingApprovalNoteComponent,
    SelectApprovalNoteComponent,
    AddRemarkComponent,
    DocumentAddCustomStyleComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentRoutingModule,
  ]
})
export class DocumentModule { }
