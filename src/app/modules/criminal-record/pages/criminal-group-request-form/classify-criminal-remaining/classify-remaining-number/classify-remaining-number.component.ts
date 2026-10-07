import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { criminal_tabs } from 'src/app/modules/criminal-record/dummy/criminal.dummy';
import { CriminalStore } from 'src/app/modules/criminal-record/stores/criminal.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-classify-remaining-number',
    templateUrl: './classify-remaining-number.component.html',
    styleUrls: ['./classify-remaining-number.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ClassifyRemainingNumberComponent implements OnInit {

  tabs = criminal_tabs.folder_criminal_un_classify;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `បញ្ជីលេខរៀង`;

  isApproved: boolean = false;
  urgent: any = null;
  
  constructor(public store:CriminalApplicationStore,
    private criminal:CriminalStore,
    public auth:AuthStore,) { }

  ngOnInit(): void {
    this.loading = true;
      this.store.fetchCriminalUnClassify(res => {
        this.loading = false;
      })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    this.store.fetchMoreCriminalUnClassify( res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }



}
