import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { HrStore } from '../../stores/hr.store';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-human-resource-listing',
  templateUrl: './human-resource-listing.component.html',
  styleUrls: ['./human-resource-listing.component.scss']
})
export class HumanResourceListingComponent implements OnInit, OnDestroy {
  tabs = tabs.hr_officers;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  statusKey: number = STATUS_OBJ.SUBMITTED.key;

  loadingSearch: boolean = false;
  constructor(private route: ActivatedRoute,
    public store: HrStore,
    public auth: AuthStore,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tabs = tabs.hr_officers?.map(m => ({ ...m, path: `/hr/officers/approval/${m?.key}` }));
      this.loading = true;
      this.params = params;
      
      switch (params?.docTypeKey) {
        case 'all':
          this.statusKey = STATUS_OBJ.SUBMITTED.key;
          break;
        case 'confirm':
          this.statusKey = STATUS_OBJ.ACTIVE.key;
          break;
        case 'draft':
          this.statusKey = STATUS_OBJ.PENDING.key;
          break;

        default:
          this.statusKey = STATUS_OBJ.SUBMITTED.key;
          break;
      }
      this.store.fetchData(this.statusKey, null, null, res => {
        this.loading = false;
      })
      // this.subscriptionRef = this.search?.valueChanges
      //   .pipe(
      //     debounceTime(300),
      //     tap(() => this.loadingSearch = true),
      //     switchMap(value => this.store.fetchData(this.statusKey, null, value, data => {
      //       this.loadingSearch = false;
      //     }))
      //   ).subscribe();
    })
  }

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    await this.store.fetchMore(this.statusKey, null, res => {
      this.loadingMore = false;
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.unsubscribe()
    // this.subscriptionRef?.unsubscribe()
  }

  trackByIdx(i:number) {
    return i;
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  onSearch(value){
    this.loadingSearch = true;

    this.store.fetchData(this.statusKey, null, value, data => {
      this.loadingSearch = false;
    })
  }
}
