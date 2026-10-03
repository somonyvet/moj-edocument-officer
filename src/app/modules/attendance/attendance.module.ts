import { AttendanceNavComponent } from './pages/attendance-nav/attendance-nav.component';
import { SharedModule } from './../../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceMainComponent } from './pages/attendance-main/attendance-main.component';
import { AttendanceRoutingModule } from './attendance-routing.module';



@NgModule({
  declarations: [
    AttendanceMainComponent,
    AttendanceNavComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AttendanceRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AttendanceModule { }
