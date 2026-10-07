import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { Geo } from '../../stores/geo.store';
import { GeoGroupFormComponent } from '../geo-group-form/geo-group-form.component';

@Component({
    selector: 'app-geo-group',
    templateUrl: './geo-group.component.html',
    styleUrls: ['./geo-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoGroupComponent implements OnInit {
  communeKey: string;
  districtKey: string;
  provinceKey: string;
  villageKey: string;

  constructor(
    public geo: Geo,
    private snackBar: MatSnackBar,
    private auth: AuthStore,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.params.forEach(params => {
      this.villageKey = params["id"];
      this.communeKey = params["cid"];
      this.districtKey = params["did"];
      this.provinceKey = params["pid"];

      this.geo.fetchVillageCallback(this.communeKey, (docs) => {
        this.geo.selectedVillage = docs.filter(m => m.key === this.villageKey)[0];
      })

      this.geo.fetchGroups(this.villageKey)
    })
  }
  ngOnDestroy(): void {

  }
  create(item?:any) {
    const dialogRef = this.dialog.open(GeoGroupFormComponent, {
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
