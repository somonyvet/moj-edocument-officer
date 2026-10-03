import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentManagerComponent } from './pages/document-manager/document-manager.component';
import { DocumentDashboardComponent } from './pages/document-dashboard/document-dashboard.component';
import { DocumentOverviewComponent } from './pages/document-overview/document-overview.component';
import { DocumentUrgentComponent } from './pages/document-dashboard/document-urgent/document-urgent.component';
import { DocumentPinedComponent } from './pages/document-dashboard/document-pined/document-pined.component';
import { DocumentFinalComponent } from './pages/document-dashboard/document-final/document-final.component';
import { AllDocumentsComponent } from './pages/all-documents/all-documents.component';
import { AlreadySignDocumentsComponent } from './pages/already-sign-documents/already-sign-documents.component';
import { ViodDocumentsComponent } from './pages/viod-documents/viod-documents.component';
import { HistoryDocumentsComponent } from './pages/history-documents/history-documents.component';
import { DashboardRouterComponent } from './pages/dashboard-router/dashboard-router.component';
import { FinalDocumentListsComponent } from './pages/final-document-lists/final-document-lists.component';
import { NgAudioRecorderModule } from 'ng-audio-recorder';
import { ApprovedDocsComponent } from './pages/approved-docs/approved-docs.component';
import { NotYetApproveDocsComponent } from './pages/not-yet-approve-docs/not-yet-approve-docs.component';
import { HomeComponent } from './pages/home/home.component';
// import { IonicModule } from '@ionic/angular';
import { HomeDocumentComponent } from './pages/home/home-document/home-document.component';
import { HomeDocumentNavComponent } from './pages/home/home-document-nav/home-document-nav.component';
import { HomeDocumentListingComponent } from './pages/home/home-document-listing/home-document-listing.component';
import { ReceivedDocumentComponent } from './pages/home/received-document/received-document.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { InboxApplicationPreviewComponent } from './pages/inbox-application-preview/inbox-application-preview.component';
import { ArchivedDocumentComponent } from './pages/home/archived-document/archived-document.component';
import { ArchivedDocumentPreviewComponent } from './pages/home/archived-document/archived-document-preview/archived-document-preview.component';
import { ArchivedDocumentAttachmentComponent } from './pages/home/archived-document/archived-document-attachment/archived-document-attachment.component';
import { MoreDocumentDetailViewComponent } from './pages/home/archived-document/more-document-detail-view/more-document-detail-view.component';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    DocumentManagerComponent,
    DocumentDashboardComponent,
    DocumentOverviewComponent,
    DocumentUrgentComponent,
    DocumentPinedComponent,
    DocumentFinalComponent,
    AllDocumentsComponent,
    AlreadySignDocumentsComponent,
    ViodDocumentsComponent,
    HistoryDocumentsComponent,
    DashboardRouterComponent,
    FinalDocumentListsComponent,
    ApprovedDocsComponent,
    NotYetApproveDocsComponent,
    HomeComponent,
    HomeDocumentComponent,
    HomeDocumentNavComponent,
    HomeDocumentListingComponent,
    ReceivedDocumentComponent,
    InboxApplicationPreviewComponent,
    ArchivedDocumentComponent,
    ArchivedDocumentPreviewComponent,
    ArchivedDocumentAttachmentComponent,
    MoreDocumentDetailViewComponent,

  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    NgAudioRecorderModule,
    LottieModule,
    LottieModule.forRoot({ player: playerFactory }),
    // IonicModule.forRoot(),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class DashboardModule { }
