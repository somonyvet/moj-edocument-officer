import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CriminalStore } from '../../stores/criminal.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
  selector: 'app-assistant-criminal-record-verify',
  templateUrl: './assistant-criminal-record-verify.component.html',
  styleUrls: ['./assistant-criminal-record-verify.component.scss']
})
export class AssistantCriminalRecordVerifyComponent implements OnInit {
  tabs = criminal_tabs.internal_process_applications;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សំណើរសុំព្រឹត្តិបត្រថ្កោលទោសពលករ`;

  urgent: any = null;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  STATUS_OBJ = STATUS_OBJ
  focusSearch: boolean = false;

  statusMoreThan: string = null;
  displayStatus: any = null;
  MOL_workplace_key: string = null;

  constructor(
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private ds: DataService,
  ) {
    const { config } = this.auth;
    this.MOL_workplace_key = config.department_labor?.key
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.loading = true;
      const { module } = this.criminal;
      const displayStatus = params?.tabKey === 'paid' ? STATUS_OBJ.PAID : STATUS_OBJ.DECREE;
      this.statusMoreThan = params?.tabKey === 'paid' ? '==' : '>=';
      this.criminal.displayStatus = displayStatus;
      await this.store.fetchAssistantPayment(displayStatus, this.statusMoreThan, true , res => {
        this.loading = false;
      })
      this.tabs = criminal_tabs.verify_mol?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/assistant/${m?.key}` }))
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
    const { displayStatus } = this.criminal
    this.store.fetchAssistantPaymentMore(displayStatus,this.statusMoreThan, true, res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.searchString = value;
    if (value) {
      this.store.getSearchAssistantPayment(this.criminal.displayStatus, this.statusMoreThan, value.toUpperCase())
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
  }
}
