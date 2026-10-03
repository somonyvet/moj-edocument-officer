import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnderContructionComponent } from 'src/app/shared/components/under-contruction/under-contruction.component';
import { CompanyFormComponent } from './pages/company-form/company-form.component';
import { CompanyListComponent } from './pages/company-list/company-list.component';

const routes: Routes = [
  // {
  //   path: '', component: UnderContructionComponent,
  // },
  {
    path: '', component: CompanyListComponent, children: [
      { path: "", redirectTo: "all", pathMatch: "full" },
    ]
  },
  { path: ":id", component: CompanyFormComponent }

  // CompanyFormComponent
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
