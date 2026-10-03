import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentInListingComponent } from './document-in-listing/document-in-listing.component';
import { DocumentListingPanelComponent } from './document-listing-panel.component';
import { DocumentSearchListingComponent } from './document-search-listing/document-search-listing.component';


const routes: Routes = [
    {
        path: '', component: DocumentListingPanelComponent,
        children: [
            { path: '', redirectTo: 'received_document', pathMatch: 'full' },
            {
                path: ':id', component: DocumentInListingComponent
            },
            {
                path: 'search/docs', component: DocumentSearchListingComponent
            },
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DocumentListingRoutingModule { }
