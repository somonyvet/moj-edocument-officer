import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AuthStore } from 'src/app/stores/auth.store';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionGuard  {
  constructor(private auth: AuthStore, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.permissionChange.pipe(
      filter(permissions => permissions !== null),
      take(1),
      map(permissions => {
        if(this.auth?.root){
          return true;
        }else{
          const expectedPermission = route.data['permissions']; // Get expected role from route data
          if (!permissions?.length || !expectedPermission) {
            return this.router.parseUrl('/'); // Redirect to home
          }
          return permissions?.find(f1=>expectedPermission?.find(f2=>f2 === f1)) ? true : false; // Check if user has the expected role
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserDirectionGuard  {
  constructor(private auth: AuthStore, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.permissionChange.pipe(
      filter(permissions => permissions !== null),
      take(1),
      map(permissions => {
        if(this.auth?.root){
          return true;
        }else{
          if(permissions?.includes('letter_1')){
            this.router.navigate(['/criminal-record/applications/letter1'])
            return false;
          }else if(permissions?.includes('letter_2')){
            console.log('route')
            this.router.navigate(['/criminal-record/applications/letter2'])
            return false;
          }else if(permissions?.includes('admin_mod_request')){
            this.router.navigate(['/criminal-record/decree-record/application/letter2-mod/decree'])
            return false;
          }else{
            return true;
          }
        }
      })
    );

  }

}

@Injectable({
  providedIn: 'root'
})
export class DecreeRecordDirectionGuard  {
  constructor(private auth: AuthStore, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.permissionChange.pipe(
      filter(permissions => permissions !== null),
      take(1),
      map(permissions => {
        if(!this.auth?.root && permissions?.includes('admin_mod_request') && !permissions?.includes('judgment_list_office')){
          return this.router.parseUrl('/criminal-record/decree-record/application/letter2-mod/decree');
        }
        return this.router.parseUrl('/criminal-record/decree-record/review');
      })
    );
  }
}