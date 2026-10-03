import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { GeoStore } from '../../stores/geo.store';
import { NationalityStore } from '../../stores/nationality.store';
import { GeoProvinceFormComponent } from '../geo-data/geo-province-form/geo-province-form.component';
import { NationalityFormComponent } from './nationality-form/nationality-form.component';

@Component({
  selector: 'app-nationality',
  templateUrl: './nationality.component.html',
  styleUrls: ['./nationality.component.scss']
})
export class NationalityComponent implements OnInit {
  tabs = criminal_tabs.add_nationality;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `សញ្ជាតិ`;
  cri;

  searchString = null;
  focusSearch: boolean = false;

  constructor(private route: ActivatedRoute,
    public store: NationalityStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cri = this.criminal
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលសញ្ជាតិ`;
    this.criminal.newIDName = 'nationality';
    // this.criminal.routerCreate = `/criminal-record/applications/geo/provinces/draft`;
    this.criminal.componentDialog = NationalityFormComponent;
    this.tabs = criminal_tabs.add_nationality?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/nationalities` }))
    this.route.params.subscribe(async params => {
      this.loading = false;
      this.params = params;
      this.store.fetchNationality(res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.store.subscribeNationality()
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
      data: { title: 'Delete Nationlity', memo: 'If this Nationlity is using in other list you cannot delete province.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteNationalities(item.key, (success, error) => {
          if (success) {
            this.snackBar.open('Nationlity has been deleted.', 'done', { duration: 2000 });
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
    this.searchString = value;
    if(!value) return;
    this.store?.fetchSearchCountry(value?.toUpperCase())
  }

  onFocusSearch() {
    this.focusSearch = true;
  }

}
