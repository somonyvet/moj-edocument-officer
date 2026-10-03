import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnderContructionComponent } from 'src/app/shared/components/under-contruction/under-contruction.component';

const routes: Routes = [
  {
    path: '', component: UnderContructionComponent,
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingRoutingModule { }
