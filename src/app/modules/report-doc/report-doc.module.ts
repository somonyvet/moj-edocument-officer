import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportDocRoutingModule } from './report-doc-routing.module';
import { SideNavReportDocComponent } from './side-nav-report-doc/side-nav-report-doc.component';
import { EverydayNationalityReportComponent } from './everyday-nationality-report/everyday-nationality-report.component';
import { DailyOperationsReportComponent } from './daily-operations-report/daily-operations-report.component';
import { VisitorApplyToCamboComponent } from './visitor-apply-to-cambo/visitor-apply-to-cambo.component';
import { DailyGuestReportComponent } from './daily-guest-report/daily-guest-report.component';

@NgModule({
  declarations: [
  
    SideNavReportDocComponent,
       EverydayNationalityReportComponent,
       DailyOperationsReportComponent,
       VisitorApplyToCamboComponent,
       DailyGuestReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReportDocRoutingModule
  ]
})

export class ReportDocModule {}
