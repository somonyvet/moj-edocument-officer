import { Injectable } from '@angular/core';
import { tap, map, switchMap, first } from 'rxjs/operators';
import { of } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  constructor(private afAuth: AngularFireAuth,
    private db: AngularFireDatabase) {
    this.updateOnUser().subscribe();
    this.updateOnDisconnect().subscribe();
    this.updateOnAway();
  }

  getUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  getPresence(uid: string) {
    return this.db.object(`status/${uid}`).valueChanges();
  }

  getUIDStatusObject(uid: string) {
    return this.db.object(`status/${uid}`)
  }

  async setPresence(status: string) {
    const user = await this.getUser();
    if (user) {
      return this.db.object(`status/${user.uid}`).update({ status, timestamp: this.timestamp });
    }
  }


  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  updateOnUser() {
    const connection = this.db.object('.info/connected').valueChanges().pipe(
      map(connected => connected ? 'online' : 'offline')
    );
    return this.afAuth.authState.pipe(
      switchMap(user => user ? connection : of('offline')),
      tap(status => this.setPresence(status))
    );
  }

  updateOnDisconnect() {
    return this.afAuth.authState.pipe(
      tap(user => {
        if (user) {
          this.db.object(`status/${user.uid}`).query.ref.onDisconnect()
            .update({
              status: 'offline',
              timestamp: this.timestamp
            });
        }
      })
    );
  }

  updateOnAway() {
    document.onvisibilitychange = (e) => {
      if (document.visibilityState === 'hidden') {
        this.setPresence('away');
      } else {
        this.setPresence('online');
      }
    };
  }

}
