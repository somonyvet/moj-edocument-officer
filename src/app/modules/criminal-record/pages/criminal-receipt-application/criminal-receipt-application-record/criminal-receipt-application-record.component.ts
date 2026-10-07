import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-receipt-application-record',
    templateUrl: './criminal-receipt-application-record.component.html',
    styleUrls: ['./criminal-receipt-application-record.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalReceiptApplicationRecordComponent implements OnInit {
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,

  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.criminal.newButtonName = `បញ្ចូលពាក្យស្នើសុំ`;
    this.criminal.routerCreate = `/criminal-record/form/khmer/application-no-iii`;
    this.store.fetchCriminalRecords(STATUS_OBJ['REVIEW'],null,null,null,false,res=>{
      this.loading = false;
    })

  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
    this.searchString = null;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { displayStatus } = this.criminal
    // this.store.fetchMoreCriminalRecords(displayStatus, null, false, null, res => {
    //   this.loading = false;
    // })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
  }

}
