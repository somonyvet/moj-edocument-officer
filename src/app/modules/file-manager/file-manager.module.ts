import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileManagerRoutingModule } from './file-manager-routing.module';
import { QuillModule } from 'ngx-quill';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddFileTagComponent } from './pages/file-tag/add-file-tag/add-file-tag.component';
import { FileTagComponent } from './pages/file-tag/file-tag.component';
import { UpdateFileTagComponent } from './pages/file-tag/update-file-tag/update-file-tag.component';
import { FolderListComponent } from './pages/folder-list/folder-list.component';
import { PinnboardShareMyFileComponent } from './pages/pinnboard-share-my-file/pinnboard-share-my-file.component';
import { PinnedBoardComponent } from './pages/pinned-board/pinned-board.component';
import { PublicSharedComponent } from './pages/public-shared/public-shared.component';
import { ShareWithMeComponent } from './pages/share-with-me/share-with-me.component';
import { SharedWithOtherComponent } from './pages/shared-with-other/shared-with-other.component';
import { TrashComponent } from './pages/trash/trash.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FavoriteComponent } from './pages/favorite/favorite.component';
import { NewFolderComponent } from './components/new-folder/new-folder.component';
import { OpenFileDocComponent } from './components/open-file-doc/open-file-doc.component';
import { ShareMyFileComponent } from './components/share-my-file/share-my-file.component';
import { StopShareMyFileComponent } from './components/stop-share-my-file/stop-share-my-file.component';
import { PostBannerPageComponent } from './pages/post-banner-page/post-banner-page.component';
import { BookDocumentationPageComponent } from './pages/book-documentation-page/book-documentation-page.component';
import { VideoDocumentationPageComponent } from './pages/video-documentation-page/video-documentation-page.component';
import { AddNewPostBannerComponent } from './pages/post-banner-page/add-new-post-banner/add-new-post-banner.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { AddVideoDocumentComponent } from './pages/video-documentation-page/add-video-document/add-video-document.component';
import { AddBookDocumentComponent } from './pages/book-documentation-page/add-book-document/add-book-document.component';
import { VideoJsPlayerComponent } from './components/video-js-player/video-js-player.component';
import { FilterDocumentsComponent } from './pages/filter-documents/filter-documents.component';

@NgModule({
  declarations: [
    FileTagComponent,
    AddFileTagComponent,
    UpdateFileTagComponent,
    OpenFileDocComponent,
    ShareWithMeComponent,
    StopShareMyFileComponent,
    PinnboardShareMyFileComponent,
    DashboardComponent,
    PinnedBoardComponent,
    PublicSharedComponent,
    SharedWithOtherComponent,
    FolderListComponent,
    TrashComponent,
    NewFolderComponent,
    FavoriteComponent,
    ShareMyFileComponent,
    PostBannerPageComponent,
    BookDocumentationPageComponent,
    VideoDocumentationPageComponent,
    AddNewPostBannerComponent,
    AddVideoDocumentComponent,
    AddBookDocumentComponent,
    VideoJsPlayerComponent,
    FilterDocumentsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FileManagerRoutingModule,
    LazyLoadImageModule,

    QuillModule.forRoot(),
  ]
})
export class FileManagerModule { }
