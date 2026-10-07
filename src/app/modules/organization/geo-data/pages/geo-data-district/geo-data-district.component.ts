import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { IDistrict } from '../../interfaces/geo';
import { Geo } from '../../stores/geo.store';
import { DistrictFormComponent } from '../district-form/district-form.component';

@Component({
    selector: 'app-geo-data-district',
    templateUrl: './geo-data-district.component.html',
    styleUrls: ['./geo-data-district.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoDataDistrictComponent implements OnInit, OnDestroy {
  provinceKey: string;

  dbName: any;

  constructor(
    public geo: Geo,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private auth: AuthStore,

    private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.params.forEach(params => {
      this.provinceKey = params["id"];
      this.geo.fetchProvinceCallback((docs) => {
        this.geo.selectedProvince = docs.filter(m => m.key === this.provinceKey)[0];
      })
      this.geo.fetchDistricts(this.provinceKey)
    })
  }
  ngOnDestroy(): void {
    const { fetchProvinceRef, fetchDistrictRef } = this.geo;
    fetchProvinceRef && fetchProvinceRef.unsubscribe();
    fetchDistrictRef && fetchDistrictRef.unsubscribe();
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(DistrictFormComponent, {
      data: { item: item, provinceKey: this.provinceKey },
      panelClass: 'cs-dialog-wrapper',
      width: '35vw',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(result => { });
  }

  delete(item: IDistrict) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete District', memo: 'If this district is using in other list you cannot delete district.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.geo.deleteDistrict(item.key, (success, error) => {
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


}
