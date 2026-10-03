import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthStore } from '../stores/auth.store';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  userSubscription: Subscription;
  userDataSubscription: Subscription;

  constructor(
    public auth: AuthStore,
    public router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isLoggedIn !== true) {
      this.router.navigate(['login'])
    }
    return true;
  }


}