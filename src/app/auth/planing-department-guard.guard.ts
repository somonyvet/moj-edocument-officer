import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PlaningDepartmentGuardService } from './planing-department-guard.service';

@Injectable({
  providedIn: 'root'
})
export class PlaningDepartmentGuardGuard implements CanActivate {
  constructor(
    private planingDepartmentGuardService : PlaningDepartmentGuardService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

}
