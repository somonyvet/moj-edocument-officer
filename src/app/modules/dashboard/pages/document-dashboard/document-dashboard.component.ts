import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CHAT_ROOM_TYPE_OBJ } from 'src/app/dummy/chat';
import { LIST_DOC_ARRAY } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';
import { ChatStore } from 'src/app/stores/chat.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DocListingStore } from 'src/app/stores/document/doc-listing.store';
import { IPageInfo } from 'ngx-virtual-scroller';
import { DOCUMENT } from '@angular/common';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';

@Component({
  selector: 'app-document-dashboard',
  templateUrl: './document-dashboard.component.html',
  styleUrls: ['./document-dashboard.component.scss']
})
export class DocumentDashboardComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  @ViewChild('headerPromote') headerPromote: ElementRef;
  @ViewChild('fullPromote') fullPromote: ElementRef;
  loading: boolean = true;
  defaultAvatar = PHOTO_LIB.EMPTY_AVATAR
  toggleRightBar: boolean = true;
  LIST_DOC_ARRAY = LIST_DOC_ARRAY;

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public store: DocumentStore,
    public auth: AuthStore,
    private router: Router,
    private changeRef: ChangeDetectorRef,
    private chatStore: ChatStore,
    public docListStore: DocListingStore,
  ) { }

  ngOnInit(): void {
    const { uid, accountActive } = this.auth;
    // if (!accountActive) {
    //   this.router.navigate(['/personal'])
    //   return;
    // }
    this.store.fetchUrgentDocument(uid)
    this.store.fetchOfficerData(uid);
    this.store.fetchPinedDocument(uid)
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked(): void {
    this.changeRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.store.subscriptionFetchUserDocument()
  }

  _onDocument(item: IHeaderInformation) {
    this.router.navigate([`/document/${item?.key}/comments`])
  }

  fetchMoreAccounts(event: IPageInfo) {
    // if (event.endIndex !== this.store.officerData.length - 1) return;
    // const { profile, currentDepartment } = this.auth
    // this.store.fetchMore(profile, currentDepartment, this.listTypeDoc)
  }

  _onChat(event) {
    this.chatStore.openConversation(event, null, CHAT_ROOM_TYPE_OBJ.PRIVATE);
  }

  onToggleRightBar() {
    const element = document.getElementsByClassName('doc-dashboard-page-nav')
    const btn_toggle = document.getElementsByClassName('btn-toggle-right-bar')
    const right_bar_content = document.getElementsByClassName('doc-dashboard-page-nav-content')
    if (this.toggleRightBar) {
      this.toggleRightBar = !this.toggleRightBar
      element[0].setAttribute('style', 'right:-360px')
      btn_toggle[0].setAttribute('style', 'transform: rotate(-180deg);')
      right_bar_content[0].setAttribute('style', 'opacity: 0;')
    } else {
      this.toggleRightBar = !this.toggleRightBar
      element[0].setAttribute('style', 'right:0px')
      btn_toggle[0].setAttribute('style', 'transform: rotate(0deg);')
      right_bar_content[0].setAttribute('style', 'opacity: 1;')
    }
  }

  onClickProfile() {
    this.router.navigate(['/officer-application-form'])
  }
}
