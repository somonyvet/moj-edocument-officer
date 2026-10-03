import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceMainComponent } from './pages/attendance-main/attendance-main.component';
import { AttendanceNavComponent } from './pages/attendance-nav/attendance-nav.component';

const routes: Routes = [
  {
    path: '', component: AttendanceMainComponent,
    children: [{
      path: '', component: AttendanceNavComponent,
    }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
