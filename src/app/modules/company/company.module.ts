import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { CompanyRoutingModule } from './company-routing.module';
import { CompanyFormComponent } from './pages/company-form/company-form.component';
import { CompanyListComponent } from './pages/company-list/company-list.component';

@NgModule({
  declarations: [
    CompanyListComponent,
    CompanyFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CompanyRoutingModule,
  ]
})

export class CompanyModule {}
