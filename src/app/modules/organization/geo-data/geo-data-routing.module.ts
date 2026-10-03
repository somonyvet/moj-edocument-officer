import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeoDataCommuneComponent } from './pages/geo-data-commune/geo-data-commune.component';
import { GeoDataDistrictComponent } from './pages/geo-data-district/geo-data-district.component';
import { GeoDataVillageComponent } from './pages/geo-data-village/geo-data-village.component';
import { GeoDataComponent } from './pages/geo-data/geo-data.component';
import { GeoGroupComponent } from './pages/geo-group/geo-group.component';


const routes: Routes = [
  { path: "", component: GeoDataComponent },
  { path: ":id/districts", component: GeoDataDistrictComponent },
  { path: ":pid/:id/communes", component: GeoDataCommuneComponent },
  { path: ":pid/:did/:id/villages", component: GeoDataVillageComponent },
  { path: ":pid/:did/:cid/:id/groups", component: GeoGroupComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class GeoDataRoutingModule { }
