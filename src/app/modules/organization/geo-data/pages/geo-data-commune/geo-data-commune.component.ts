import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { ICommunes } from '../../interfaces/geo';
import { Geo } from '../../stores/geo.store';
import { CommuneFormComponent } from '../commune-form/commune-form.component';

@Component({
    selector: 'app-geo-data-commune',
    templateUrl: './geo-data-commune.component.html',
    styleUrls: ['./geo-data-commune.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoDataCommuneComponent implements OnInit, OnDestroy {
  districtKey: string;
  provinceKey: string;

  constructor(
    public geo: Geo,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.forEach(params => {
      this.provinceKey = params["pid"];
      this.districtKey = params["id"];
      this.geo.fetchDistrictsCallback(this.provinceKey, (docs) => {
        this.geo.selectedDistrict = docs.filter(m => m.key === this.districtKey)[0];
      })
      this.geo.fetchCommunes(this.districtKey)
    })
  }
  ngOnDestroy(): void {
    const { fetchCommuneRef, fetchDistrictRef } = this.geo;
    fetchCommuneRef && fetchCommuneRef.unsubscribe();
    fetchDistrictRef && fetchDistrictRef.unsubscribe();
  }

  create(item?:any) {
    const dialogRef = this.dialog.open(CommuneFormComponent, {
      data: { item: item, districtKey: this.districtKey },
      panelClass: 'cs-dialog-wrapper',
      width: '35vw',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(result => { });
  }

  delete(item: ICommunes) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete District', memo: 'If this district is using in other list you cannot delete district.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.geo.deleteCommune(item.key, (success, error) => {
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
