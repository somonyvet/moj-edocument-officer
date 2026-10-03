import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { IAchievementStatus } from '../interfaces/document.interface';

@Injectable({ providedIn: 'root' })
export class AchievementStatusStore {
  @observable data: any[] = [];
  @observable process: boolean = false;
  @observable loading: boolean = true;
  @observable empty: boolean = false;
  @observable lastVisible: IAchievementStatus = null;
  @observable fetchDataRef: Subscription = null;

  constructor(
    private ds: DatabaseService,
  ) { }

  @action
  unsubscribe() {
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
  }

  @action
  fetchData(callback?: (item: any[]) => void): void {
    this.loading = true;
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    this.fetchDataRef = this.ds.achievementStatusRef(ref => ref.orderBy('order')).valueChanges().subscribe((docs: any[]) => {
      this.data = docs;
      this.loading = false;
      this.empty = docs.length === 0;
      callback && callback(this.data);
    });
  }

  @action
  save(item: IAchievementStatus, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.achievementStatusRef().doc(item.key).set(item, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  delete(item: IAchievementStatus, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.achievementStatusRef().doc(item.key).delete()
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }

}
