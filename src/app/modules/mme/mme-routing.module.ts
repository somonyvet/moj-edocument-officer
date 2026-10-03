import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainSidenavLayoutComponent } from "src/app/layouts/main-layout/main-sidenav-layout/main-sidenav-layout.component";
import { UnderContructionComponent } from "src/app/shared/components/under-contruction/under-contruction.component";
import { ApprovalTypeComponent } from "./pages/approval/approval-type/approval-type.component";
import { HomeComponent } from "./pages/home/home.component";
import { AchievementStatusComponent } from "./pages/settings/achievement-status/achievement-status.component";
import { PlaningLevelComponent } from "./pages/settings/planing-level/planing-level.component";
import { TimeScopeComponent } from "./pages/settings/time-scope/time-scope.component";
import { YearProgramComponent } from "./pages/settings/year-program/year-program.component";

const routes: Routes = [
  { path: '', redirectTo:'under-construction' , pathMatch:'full'},
  {path:'under-construction',component:UnderContructionComponent},
  {
    path: 'home',component: HomeComponent,
    children: [
      { path: '', redirectTo:'approval' , pathMatch:'full'},
      { path: 'approval', component: ApprovalTypeComponent,

      },
      { path: 'settings', redirectTo:'settings/data' , pathMatch:'full'},
      { path: 'settings/:id',component: MainSidenavLayoutComponent,
        children: [
          { path: '', redirectTo:'planing-category' , pathMatch:'full'},
          { path:'planing-category',component: PlaningLevelComponent},
          { path: "achievement-status", component: AchievementStatusComponent },
          { path: "year-program", component: YearProgramComponent },
          { path: "time-scope", component: TimeScopeComponent },
        ]
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MmeRoutingModule { }
