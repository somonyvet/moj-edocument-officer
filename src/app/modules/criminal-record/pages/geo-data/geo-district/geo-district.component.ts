import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { GeoStore } from '../../../stores/geo.store';
import { GeoDistrictsFormComponent } from '../geo-districts-form/geo-districts-form.component';

@Component({
    selector: 'app-geo-district',
    templateUrl: './geo-district.component.html',
    styleUrls: ['./geo-district.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoDistrictComponent implements OnInit {
  tabs = criminal_tabs.geo_district;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `រាជធានី/ខេត្ត`;

  constructor(private route: ActivatedRoute,
    public store: GeoStore,
    public criminal: CriminalStore,
    public auth: AuthStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `ស្រុក/ខណ្ឌ`;
    // this.criminal.routerCreate = `/criminal-record/applications/geo/provinces/draft`;
    this.criminal.componentDialog = GeoDistrictsFormComponent;
    this.route.params.subscribe(async params => {
      this.tabs = criminal_tabs.geo_district?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/geo/${params?.id}/districts` }))
      this.loading = true;
      this.params = params;
      if (this.params){
        this.store.fetchSelectedProvince(this.params?.id)
      }
      this.store.fetchDistricts(params?.id, res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.store.subscribeDistrict()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  onDelete(item: any) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete District', memo: 'If this district is using in other list you cannot delete district.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteDistrict(item.key, (success, error) => {
          if (success) {
            this.snackBar.open('District has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  async scrollHandler(e) {
    // if (e.endIndex !== this.store.data?.length - 1) return
    // this.loadingMore = true;
    // const { currentDepartment } = this.auth
    // await this.store.fetchMore(this.statusKey, currentDepartment?.key, res => {
    //   this.loadingMore = false;
    // })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    // this.loadingSearch = true;
    // const { currentDepartment } = this.auth
    // this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
    //       this.loadingSearch = false;
    // })
  }

}
