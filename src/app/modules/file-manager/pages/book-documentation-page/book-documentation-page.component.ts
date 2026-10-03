import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { BookDocumentStore } from 'src/app/stores/book-document.store';

@Component({
  selector: 'app-book-documentation-page',
  templateUrl: './book-documentation-page.component.html',
  styleUrls: ['./book-documentation-page.component.scss']
})
export class BookDocumentationPageComponent implements OnInit {

  APP_IMG = ''
  APP_SUBTITLE = ''
  APP_INFO = `This folder is empty.`

  ismobile;
  queryParams;
  activeParams;
  loading: boolean = false;

  constructor(
    public store: BookDocumentStore,
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
    this.router.navigate(['/file-manager/book-documentation/add-book'])
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
    this.router.navigate(['/file-manager/book-documentation/add-book/' + selectedItem?.key]);
  }

  delete(selectedItem) {
    this.store.updateBookDocument({
      ...selectedItem,
      isDeleted: true,
      updatedAt: new Date(),
      updatedBy: this.auth.User,
    }, result => { })
  }

}
