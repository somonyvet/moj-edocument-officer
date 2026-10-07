import { Geo } from './../../stores/geo.store';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IGeo } from '../../interfaces/geo';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProvinceFormComponent } from '../province-form/province-form.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { tabs } from 'src/app/dummy/tabs';


@Component({
    selector: 'app-geo-data',
    templateUrl: './geo-data.component.html',
    styleUrls: ['./geo-data.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GeoDataComponent implements OnInit, OnDestroy {
  dbName: any;
  item: any;
  tabs = tabs.geodata;
  loading:boolean=true;
  constructor(
    public geo: Geo,
    public router: Router,
    private auth: AuthStore,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.geo.fetchProvince(res=>{
      this.loading=false;
    });
  }
  ngOnDestroy() {
    const { fetchProvinceRef } = this.geo;
    fetchProvinceRef && fetchProvinceRef.unsubscribe();
  }

  create(item?:any) {
    const dialogRef = this.dialog.open(ProvinceFormComponent, {
      data: {item:item},
      panelClass: 'cs-dialog-wrapper',
      width: '35vw',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(result => { });
  }

  _onScroll(event){}

  delete(item: IGeo) {
    // let dialogRef = this.dialog.open(DeleteComponent, {
    //   data: {title:'Delete Province',memo:'If this district is using in other list you cannot delete district.',name:item.name},
    //   width: '35vw',
    //   disableClose: true,
    //   role: 'dialog',
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if(result==='yes'){
    //     this.geo.deleteProvince(item.key,(success,error)=>{
    //       if (success) {
    //         this.snackBar.open('Province has been deleted.', 'done', { duration: 2000 });
    //       }
    //       else {
    //         this.snackBar.open(error, 'Error')
    //       }
    //     })
    //   }
    // });
  }
}
