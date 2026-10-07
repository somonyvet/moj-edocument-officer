import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { GeoStore } from '../../../stores/geo.store';
import { GeoCommunesFormComponent } from '../geo-communes-form/geo-communes-form.component';

@Component({
    selector: 'app-geo-communes',
    templateUrl: './geo-communes.component.html',
    styleUrls: ['./geo-communes.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoCommunesComponent implements OnInit {
  tabs = criminal_tabs.geo_commune;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ស្រុក/ខណ្ឌ`;

  constructor(private route: ActivatedRoute,
    public store: GeoStore,
    public criminal: CriminalStore,
    public auth: AuthStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលឃុំ/សង្កាត់`;
    this.criminal.componentDialog = GeoCommunesFormComponent;


    this.route.params.subscribe(async params => {
      this.tabs = criminal_tabs.geo_commune?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/geo/${params?.id}/communes` }))
      this.loading = true;
      this.params = params;
      if (this.params){
        this.store.fetchSelectedDistrict(this.params.id, val => {})
      }
      this.store.fetchCommunes(params?.id, res => {
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
      data: { title: 'Delete Communes', memo: 'If this district is using in other list you cannot delete communes.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteCommune(item.key, (success, error) => {
          if (success) {
            this.snackBar.open('Communes has been deleted.', 'done', { duration: 2000 });
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
