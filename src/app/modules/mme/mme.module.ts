import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
// import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { MmeRoutingModule } from "./mme-routing.module";
import { ApprovalTypeComponent } from "./pages/approval/approval-type/approval-type.component";
import { HomeComponent } from './pages/home/home.component';
import { AchievementStatusFormComponent } from "./pages/settings/achievement-status/achievement-status-form/achievement-status-form.component";
import { AchievementStatusComponent } from "./pages/settings/achievement-status/achievement-status.component";
import { PlaningLevelFormComponent } from "./pages/settings/planing-level/planing-level-form/planing-level-form.component";
import { PlaningLevelComponent } from "./pages/settings/planing-level/planing-level.component";
import { TimeScopeFormComponent } from "./pages/settings/time-scope/time-scope-form/time-scope-form.component";
import { TimeScopeComponent } from "./pages/settings/time-scope/time-scope.component";
import { YearProgramFormComponent } from "./pages/settings/year-program/year-program-form/year-program-form.component";
import { YearProgramComponent } from "./pages/settings/year-program/year-program.component";

@NgModule({
  declarations: [
    HomeComponent,
    PlaningLevelComponent,
    PlaningLevelFormComponent,
    AchievementStatusComponent,
    AchievementStatusFormComponent,
    YearProgramFormComponent,
    YearProgramComponent,
    TimeScopeComponent,
    TimeScopeFormComponent,
    ApprovalTypeComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MmeRoutingModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],

})
export class MmeModule { }
