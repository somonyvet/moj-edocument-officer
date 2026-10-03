import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyGuestReportComponent } from './daily-guest-report/daily-guest-report.component';
import { DailyOperationsReportComponent } from './daily-operations-report/daily-operations-report.component';
import { EverydayNationalityReportComponent } from './everyday-nationality-report/everyday-nationality-report.component';
import { SideNavReportDocComponent } from './side-nav-report-doc/side-nav-report-doc.component';
import { VisitorApplyToCamboComponent } from './visitor-apply-to-cambo/visitor-apply-to-cambo.component';

const routes: Routes = [
  {
    path: "", component: SideNavReportDocComponent, children: [
      { path: '', redirectTo: 'everyday-nationality-report', pathMatch: 'full' },
      { path: 'everyday-nationality-report', component: EverydayNationalityReportComponent},
      { path: 'daily-operations-report', component: DailyOperationsReportComponent },
      { path: 'visitor-apply-to-cambo', component: VisitorApplyToCamboComponent },
      { path: 'daily-guest-report', component: DailyGuestReportComponent },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportDocRoutingModule { }
