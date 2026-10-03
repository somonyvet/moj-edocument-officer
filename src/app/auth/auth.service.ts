import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { first } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) { }

  isLoggedIn() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }
  
  authRef() {
    return this.afAuth
  }

  canActiveRef() {
    return this.afAuth.user
  }

  emailSignUp(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  emailSignIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signOut() {
    return this.afAuth.signOut();
  }

}
