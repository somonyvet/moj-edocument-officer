import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxRoutingModule } from './inbox-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { InboxApplicationComponent } from './inbox-application/inbox-application.component';
import { InboxRouterComponent } from './inbox-application/inbox-router/inbox-router.component';
import { InboxNotedComponent } from './inbox-application/inbox-noted/inbox-noted.component';
import { InboxDocumentNotedComponent } from './inbox-application/inbox-document-noted/inbox-document-noted.component';
import { InboxWorkplaceAccountComponent } from './inbox-workplace-account/inbox-workplace-account.component';

@NgModule({
  declarations: [
    InboxApplicationComponent,
    InboxRouterComponent,
    InboxNotedComponent,
    InboxDocumentNotedComponent,
    InboxWorkplaceAccountComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InboxRoutingModule,
  ]
})
export class InboxModule { }
