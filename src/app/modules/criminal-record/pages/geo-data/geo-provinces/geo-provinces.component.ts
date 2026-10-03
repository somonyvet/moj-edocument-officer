import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { GeoStore } from '../../../stores/geo.store';
import { GeoProvinceFormComponent } from '../geo-province-form/geo-province-form.component';

@Component({
  selector: 'app-geo-provinces',
  templateUrl: './geo-provinces.component.html',
  styleUrls: ['./geo-provinces.component.scss']
})
export class GeoProvincesComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.geo_provinces;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `រាជធានី/ខេត្ត`;

  constructor(private route: ActivatedRoute,
    public store: GeoStore,
    public criminal: CriminalStore,
    public auth: AuthStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
    ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលរាជធានី/ខេត្ត`;
    this.criminal.newIDName = 'province';
    // this.criminal.routerCreate = `/criminal-record/applications/geo/provinces/draft`;
    this.criminal.componentDialog = GeoProvinceFormComponent;
    this.tabs = criminal_tabs.geo_provinces?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/geo/provinces` }))
    this.route.params.subscribe(async params => {
      this.loading = false;
      this.params = params;
      this.store.fetchProvince(res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.store.subscribeProvinces()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {
    // if (e.endIndex !== this.store.data?.length - 1) return
    // this.loadingMore = true;
    // const { currentDepartment } = this.auth
    // await this.store.fetchMore(this.statusKey, currentDepartment?.key, res => {
    //   this.loadingMore = false;
    // })
  }

  onDelete(item: any) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Province', memo: 'If this Province is using in other list you cannot delete province.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteProvince(item.key, (success, error) => {
          if (success) {
            this.snackBar.open('Province has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  // create(item?: any) {
  //   const dialogRef = this.dialog.open(GeoProvinceFormComponent, {
  //     data: { item: item },
  //     panelClass: 'cs-dialog-wrapper',
  //     width: '580px',
  //     height: '96vh',
  //     disableClose: true,
  //     role: 'dialog',
  //   });
  //   dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  // }
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
