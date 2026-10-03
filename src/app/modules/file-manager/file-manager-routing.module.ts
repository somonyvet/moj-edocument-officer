import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from 'src/app/modules/file-manager/pages/dashboard/dashboard.component';
import { TrashComponent } from 'src/app/modules/file-manager/pages/trash/trash.component';
import { FavoriteComponent } from './pages/favorite/favorite.component';
import { PinnedBoardComponent } from './pages/pinned-board/pinned-board.component';
import { PublicSharedComponent } from './pages/public-shared/public-shared.component';
import { ShareWithMeComponent } from './pages/share-with-me/share-with-me.component';
import { SharedWithOtherComponent } from './pages/shared-with-other/shared-with-other.component';
import { AddFileTagComponent } from './pages/file-tag/add-file-tag/add-file-tag.component';
import { FileTagComponent } from './pages/file-tag/file-tag.component';
import { TabLayoutComponent } from 'src/app/layouts/tab-layout/tab-layout.component';
import { FileManagerLayoutComponent } from 'src/app/layouts/file-manager-layout/file-manager-layout.component';
import { PostBannerPageComponent } from './pages/post-banner-page/post-banner-page.component';
import { BookDocumentationPageComponent } from './pages/book-documentation-page/book-documentation-page.component';
import { VideoDocumentationPageComponent } from './pages/video-documentation-page/video-documentation-page.component';
import { AddNewPostBannerComponent } from './pages/post-banner-page/add-new-post-banner/add-new-post-banner.component';
import { AddBookDocumentComponent } from './pages/book-documentation-page/add-book-document/add-book-document.component';
import { AddVideoDocumentComponent } from './pages/video-documentation-page/add-video-document/add-video-document.component';
import { FilterDocumentsComponent } from './pages/filter-documents/filter-documents.component';
import { UnderContructionComponent } from 'src/app/shared/components/under-contruction/under-contruction.component';

const routes: Routes = [
  { path: "", redirectTo: "files", pathMatch: "full" },
  { path: 'under-construction', component: UnderContructionComponent },
  {
    path: 'files',
    component: FileManagerLayoutComponent,
    children: [
      { path: "", redirectTo: "my_files", pathMatch: "full" },
      { path: "my_files", component: DashboardComponent },
      { path: "filter-documents", component: FilterDocumentsComponent },
      { path: "my_files/:id", component: DashboardComponent },
      { path: "pinned-board", component: PinnedBoardComponent },
      { path: "pinned-board/:id", component: PinnedBoardComponent },
      { path: "public-shared", component: PublicSharedComponent },
      { path: "public-shared/:id", component: PublicSharedComponent },

      { path: "shared-with-other", component: SharedWithOtherComponent },
      { path: "shared-with-other/:id", component: SharedWithOtherComponent },

      { path: "trash", component: TrashComponent },
      { path: "favorite", component: FavoriteComponent },

      { path: "shared-with-me", component: ShareWithMeComponent },
      { path: "shared-with-me/:id", component: ShareWithMeComponent },

      {
        path: "", component: TabLayoutComponent,
        children: [
          { path: "", redirectTo: "tags", pathMatch: "full" },

          { path: "tags", component: FileTagComponent },
          { path: "tags/add-tag", component: AddFileTagComponent },

          { path: "post-banner", component: PostBannerPageComponent },
          { path: "post-banner/add-post-banner", component: AddNewPostBannerComponent },
          { path: "post-banner/add-post-banner/:key", component: AddNewPostBannerComponent },

          { path: "book-documentation", component: BookDocumentationPageComponent },
          { path: "book-documentation/add-book", component: AddBookDocumentComponent },
          { path: "book-documentation/add-book/:key", component: AddBookDocumentComponent },

          { path: "video-documentation", component: VideoDocumentationPageComponent },
          { path: "video-documentation/add-video", component: AddVideoDocumentComponent },
          { path: "video-documentation/add-video/:key", component: AddVideoDocumentComponent },
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileManagerRoutingModule { }
