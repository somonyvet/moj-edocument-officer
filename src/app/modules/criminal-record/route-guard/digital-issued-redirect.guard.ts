import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

/**
 * An issued record has nothing left to review, so its details open on the printable bulletin.
 * The empty child path still redirects to `application`, so without this guard the heavy
 * application form is activated for a moment before the redirect to `bulletin` lands.
 * Redirecting here happens during recognition, so that component is never created.
 */
@Injectable({
  providedIn: 'root'
})
export class DigitalIssuedRedirectGuard  {
  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    let parent = route.parent;
    let tabKey: any = null;
    let id: any = null;
    while (parent) {
      id = id || parent.params?.id;
      tabKey = tabKey || parent.params?.tabKey;
      parent = parent.parent;
    }
    if (tabKey !== 'issued' || !id) return true;

    // .../{tabKey}/{id}/{child} -> .../{tabKey}/{id}/bulletin
    const segments = state.url.split('?')[0].split('/');
    segments[segments.length - 1] = 'bulletin';
    return this.router.parseUrl(segments.join('/'));
  }
}
