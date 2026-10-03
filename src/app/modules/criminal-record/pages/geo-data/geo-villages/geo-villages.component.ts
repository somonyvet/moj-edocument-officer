import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { GeoStore } from '../../../stores/geo.store';
import { GeoVillagesFormComponent } from '../geo-villages-form/geo-villages-form.component';

@Component({
  selector: 'app-geo-villages',
  templateUrl: './geo-villages.component.html',
  styleUrls: ['./geo-villages.component.scss']
})
export class GeoVillagesComponent implements OnInit {
  tabs = criminal_tabs.geo_village;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ឃុំ/សង្កាត់`;

  constructor(private route: ActivatedRoute,
    public store: GeoStore,
    public criminal: CriminalStore,
    public auth: AuthStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;

    this.criminal.newButtonName = `បញ្ចូលភូមិ`;
    this.criminal.componentDialog = GeoVillagesFormComponent;

    this.route.params.subscribe(async params => {
      this.tabs = criminal_tabs.geo_village?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/geo/${params?.id}/villages` }))
      this.loading = true;
      this.params = params;
      if (this.params){
        this.store.fetchSelectedCommune(this.params.id, val => {})
      }
      this.store.fetchVillageCallback(params?.id, res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.subscribeVillage()
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
      data: { title: 'Delete Villages', memo: 'If this villages is using in other list you cannot delete village.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteVillage(item.key, (success, error) => {
          if (success) {
            this.snackBar.open('Villages has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
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
