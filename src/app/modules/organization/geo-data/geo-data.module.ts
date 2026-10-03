import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeoDataRoutingModule } from './geo-data-routing.module';
import { GeoDataCommuneComponent } from './pages/geo-data-commune/geo-data-commune.component';
import { GeoDataDistrictComponent } from './pages/geo-data-district/geo-data-district.component';
import { GeoDataVillageComponent } from './pages/geo-data-village/geo-data-village.component';
import { GeoDataComponent } from './pages/geo-data/geo-data.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Geo } from './stores/geo.store';
import { ProvinceFormComponent } from './pages/province-form/province-form.component';
import { DistrictFormComponent } from './pages/district-form/district-form.component';
import { CommuneFormComponent } from './pages/commune-form/commune-form.component';
import { VillageFormComponent } from './pages/village-form/village-form.component';
import { GeoGroupComponent } from './pages/geo-group/geo-group.component';
import { GeoGroupFormComponent } from './pages/geo-group-form/geo-group-form.component';
import { VillageChangeCommuneFormComponent } from './pages/village-change-commune-form/village-change-commune-form.component';

@NgModule({
  declarations: [
    GeoDataComponent,
    GeoDataCommuneComponent,
    GeoDataDistrictComponent,
    GeoDataVillageComponent,
    ProvinceFormComponent,
    DistrictFormComponent,
    CommuneFormComponent,
    VillageFormComponent,
    GeoGroupComponent,
    GeoGroupFormComponent,
    VillageChangeCommuneFormComponent
  ],
  imports: [
    CommonModule,
    GeoDataRoutingModule,
    SharedModule,
  ],
  providers:[
    Geo
  ]
})
export class GeoDataModule { }
