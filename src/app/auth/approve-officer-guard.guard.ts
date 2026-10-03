import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthStore } from '../stores/auth.store';

@Injectable({
  providedIn: 'root'
})
export class ApproveOfficerGuardGuard implements CanActivate {

  constructor(
    private auth : AuthStore,
    private router : Router,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(!this.auth?.currentDepartment?.approveOfficerForm){
      return true;
    }
    else this.router.navigate(['/hr/officers/applications/listing'])
  }

}
