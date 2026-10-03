import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { PosterStore } from 'src/app/stores/poster.store';
import { VideoDocumentStore } from 'src/app/stores/video-document.store';

@Component({
  selector: 'app-video-documentation-page',
  templateUrl: './video-documentation-page.component.html',
  styleUrls: ['./video-documentation-page.component.scss']
})
export class VideoDocumentationPageComponent implements OnInit {

  APP_IMG = ''
  APP_SUBTITLE = ''
  APP_INFO = `This folder is empty.`

  ismobile;
  queryParams;
  activeParams;
  loading: boolean = false;

  constructor(
    public store: VideoDocumentStore,
    private auth: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    public breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    this.store.fetchData(null, null, null);
    this.breakpointObserver
    .observe(['(max-width: 736px)'])
    .subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.ismobile = state.matches;
      } else {
        this.ismobile = state.matches;
      }
    });

    this.APP_INFO = `File Manager lets you access your stuff on every computer and mobile device.`
    this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Ffolder.svg?alt=media&token=75877285-6cf8-40d6-a96b-711684c78f75`
    this.APP_SUBTITLE = `Drag file here or add files by using the "New" button.`;
  }

  create() {
    this.router.navigate(['/file-manager/video-documentation/add-video'])
  }

  toggleSidebar;

  togglesidebar() {
    let body = document.getElementsByClassName("page-wrapper")[0];
    body.classList.toggle("toggled-sidebar");
    this.toggleSidebar = !this.toggleSidebar;
    localStorage.setItem("toggleSidebar", this.toggleSidebar)
  }

  async scrollHandler(e: { endIndex: number; }, size: number) {
    if (size < 10) return;
    if (e.endIndex === size - 1) await this.store.fetchDataMore();
  }

  trackByIdx(i: any) {
    return i;
  }

  onSelectedItem(item) {
    this.store.selectedItem = item;
  }

  update(selectedItem) {
    this.router.navigate(['/file-manager/video-documentation/add-video/' + selectedItem?.key]);
  }

  delete(selectedItem) {
    this.store.updateVideoDocument({
      ...selectedItem,
      isDeleted: true,
      updatedAt: new Date(),
      updatedBy: this.auth.User,
    }, result => { })
  }

}
