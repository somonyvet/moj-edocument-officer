import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { AuthStore } from 'src/app/stores/auth.store';
import { HrStore } from '../../../stores/hr.store';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
    selector: 'app-officer-application-listing',
    templateUrl: './officer-application-listing.component.html',
    styleUrls: ['./officer-application-listing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerApplicationListingComponent implements OnInit, OnDestroy {
  tabs = tabs.hr_officers_listing;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  statusKey: number = STATUS_OBJ.SUBMITTED.key;

  // form: FormGroup;
  // search: AbstractControl;
  subscriptionRef: Subscription = null;
  loadingSearch: boolean = false;
  constructor(private route: ActivatedRoute,
    public store: HrStore,
    public auth: AuthStore,
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {

    // this.form = this.fb.group({
    //   search: [null]
    // })
    // this.search = this.form.controls['search'];

    this.route.params.subscribe(async params => {
      this.tabs = tabs.hr_officers_listing?.map(m => ({ ...m, path: `/hr/officers/applications/${m?.key}` }));
      this.loading = true;
      this.params = params;
      const { currentDepartment } = this.auth
      switch (params?.docTypeKey) {
        case 'listing':
          this.statusKey = STATUS_OBJ.ACTIVE.key;
          break;
        default:
          this.statusKey = STATUS_OBJ.SUBMITTED.key;
          break;
      }
      await this.store.fetchData(this.statusKey, currentDepartment?.key, null, res => {
        this.loading = false;
      })

      // this.subscriptionRef = this.search?.valueChanges
      //   .pipe(
      //     debounceTime(300),
      //     tap(() => this.loadingSearch = true),
      //     switchMap(value => this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
      //       this.loadingSearch = false;
      //     }))
      //   ).subscribe();


    })
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { currentDepartment } = this.auth
    await this.store.fetchMore(this.statusKey, currentDepartment?.key, res => {
      this.loadingMore = false;
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.unsubscribe()
    this.subscriptionRef?.unsubscribe()
  }

  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    this.loadingSearch = true;
    const { currentDepartment } = this.auth
    this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
      this.loadingSearch = false;
    })
  }

}
