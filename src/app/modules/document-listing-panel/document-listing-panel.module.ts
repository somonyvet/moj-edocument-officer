import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentListingPanelComponent } from './document-listing-panel.component';
import { DocumentListingRoutingModule } from './document-listing-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentInListingComponent } from './document-in-listing/document-in-listing.component';
import { DocumentSearchListingComponent } from './document-search-listing/document-search-listing.component';



@NgModule({
  declarations: [
    DocumentListingPanelComponent,
    DocumentInListingComponent,
    DocumentSearchListingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentListingRoutingModule
  ]
})
export class DocumentListingPanelModule { }
