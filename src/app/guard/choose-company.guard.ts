import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChooseCompanyGuard implements CanActivate  {
  constructor(private afAuth: AngularFireAuth, private router: Router, public authService: AuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.afAuth.authState.take(1).map(user => !!user).do(async loggedIn => {
      if (loggedIn) {
        return true;
      }
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  }
}
