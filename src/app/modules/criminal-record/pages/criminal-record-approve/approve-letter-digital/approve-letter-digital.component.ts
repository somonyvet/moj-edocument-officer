import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CriminalStore } from '../../../stores/criminal.store';
import { ActivatedRoute, Router } from '@angular/router';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { APPLICATION_TYPE_OBJ } from 'src/app/dummy/status';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';

@Component({
    selector: 'app-approve-letter-digital',
    templateUrl: './approve-letter-digital.component.html',
    styleUrls: ['./approve-letter-digital.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ApproveLetterDigitalComponent implements OnInit {
  tabs = criminal_tabs.internal_process_applications;
  STATUS_OBJ = STATUS_OBJ;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស`;
  statusKey : string = null;
  applicationTypeKey: number = null;

  isApproved: boolean = false;
  isScanQrCode = false;
  focusSearch: boolean = false;
  searchString: string = '';

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    const parentPath = this.route.parent?.snapshot?.url[0]?.path;
    if(parentPath == "digital_letter1"){
        this.title = "សំណើរសុំព្រឹត្តិបត្រលេខ ១"
        this.applicationTypeKey = APPLICATION_TYPE_OBJ['application-no-i']?.key;
    }else if(parentPath == "digital_letter3"){
        this.title = "សំណើរសុំព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច"
        this.applicationTypeKey = APPLICATION_TYPE_OBJ['application-no-iii']?.key;
    }else{
        this.title = "សំណើរសុំព្រឹត្តិបត្រលេខ ២"
        this.applicationTypeKey = APPLICATION_TYPE_OBJ['application-no-ii']?.key;
    }
    const letterTitle = this.title;

    this.route.params.subscribe(async params => {
      this.loading = true;
      this.params = params;

      // every side-nav item carries its own single tab
      const letterName = letterTitle.replace('សំណើរសុំ', '');
      const tabSet = params?.tabKey == "rejected" ? criminal_tabs.internal_process_reject
        : params?.tabKey == "issued" ? criminal_tabs.internal_process_issued
        : criminal_tabs.internal_process_approval?.filter(m => m?.key == params?.tabKey);
      this.tabs = tabSet?.map(m => ({ ...m, path: `/criminal-record/approval/${parentPath}/${m?.key}` }))
      this.title = params?.tabKey == "rejected" ? `បដិសេធ${letterName}`
        : params?.tabKey == "issued" ? `ចេញ${letterName}`
        : letterTitle;

      const { currentDepartment, config, employee } = this.auth;
      console.log("profile",employee)
      if(this.params?.tabKey == "approval"){
        this.store?.fetchCriminalRequestApprovalData(currentDepartment?.key,()=>{
          this.loading = false;
        }, this.applicationTypeKey)
      }else if(this.params?.tabKey == "approved"){
        this.store?.fetchCriminalApprovedData(currentDepartment?.key,()=>{
          this.loading = false;
        }, this.applicationTypeKey)
      }else if(this.params?.tabKey == "rejected"){
        this.store?.fetchCriminalRejectedData(currentDepartment?.key,()=>{
          this.loading = false;
        }, this.applicationTypeKey)
      }else if(this.params?.tabKey == "issued"){
        this.store?.fetchCriminalIssuedData(currentDepartment?.key,()=>{
          this.loading = false;
        }, this.applicationTypeKey)
      }
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
    const { currentDepartment } = this.auth
    if(this.params?.tabKey == "approval"){
      this.store?.fetchMoreCriminalRequestApprovalData(currentDepartment?.key,()=>{
        this.loading = false;
      }, this.applicationTypeKey)
    }else if(this.params?.tabKey == "approved"){
      this.store?.fetchMoreCriminalApprovedData(currentDepartment?.key,()=>{
        this.loading = false;
      }, this.applicationTypeKey)
    }else if(this.params?.tabKey == "rejected"){
      this.store?.fetchMoreCriminalRejectedData(currentDepartment?.key,()=>{
        this.loading = false;
      }, this.applicationTypeKey)
    }else if(this.params?.tabKey == "issued"){
      this.store?.fetchMoreCriminalIssuedData(currentDepartment?.key,()=>{
        this.loading = false;
      }, this.applicationTypeKey)
    }
  }


  isRejected(item: any): boolean {
    return item?.internal_status?.key === STATUS_OBJ.INTERNAL_PROCESS_REJECT.key;
  }

  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
  }
  
  onScanQrCode(value) {
    this.isScanQrCode = false
    if(value){
      this.isScanQrCode = true
      this.searchString = null;
      this.store.emptySearch = false
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }
}

