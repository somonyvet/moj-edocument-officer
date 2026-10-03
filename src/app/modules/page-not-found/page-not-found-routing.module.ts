import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { PageNoDataComponent } from './pages/page-no-data/page-no-data.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PageUnderConstructionComponent } from './pages/page-under-construction/page-under-construction.component';

const routes: Routes = [
    { path:'',component: PageNoDataComponent},
    { path: '404', component: PageNotFoundComponent },
    { path: 'access-denied', component: AccessDeniedComponent },
    { path: 'page-under-construction', component: PageUnderConstructionComponent },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PageNotFoundRoutingModule { }
