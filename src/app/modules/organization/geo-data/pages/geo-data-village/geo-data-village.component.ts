import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { Geo } from '../../stores/geo.store';
import { VillageChangeCommuneFormComponent } from '../village-change-commune-form/village-change-commune-form.component';
import { VillageFormComponent } from '../village-form/village-form.component';

@Component({
    selector: 'app-geo-data-village',
    templateUrl: './geo-data-village.component.html',
    styleUrls: ['./geo-data-village.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoDataVillageComponent implements OnInit, OnDestroy {
  communeKey: string;
  districtKey: string;
  provinceKey: string;

  constructor(
    public geo: Geo,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.params.forEach(params => {
      this.communeKey = params["id"];
      this.districtKey = params["did"];
      this.provinceKey = params["pid"];

      this.geo.fetchCommunesCallback(this.districtKey, (docs) => {
        this.geo.selectedCommune = docs.filter(m => m.key === this.communeKey)[0];
      })

      this.geo.fetchVillages(this.communeKey)
    })
  }
  ngOnDestroy(): void {
    const { fetchCommuneRef, fetchVillageRef } = this.geo;
    fetchCommuneRef && fetchCommuneRef.unsubscribe();
    fetchVillageRef && fetchVillageRef.unsubscribe();
  }

  create(item?:any) {
    const dialogRef = this.dialog.open(VillageFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '35vw',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(result => { });
  }

  changeCommune(item?:any) {
    const dialogRef = this.dialog.open(VillageChangeCommuneFormComponent, {
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

  delete(item: any) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete District', memo: 'If this district is using in other list you cannot delete district.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.geo.deleteVillage(item.key, (success, error) => {
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
