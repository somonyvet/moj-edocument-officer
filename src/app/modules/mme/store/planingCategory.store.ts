import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { IPlaningCategory } from '../interfaces/document.interface';

@Injectable({ providedIn: 'root' })
export class PlaningCategoryStore {
  @observable data: any[] = [];
  @observable process: boolean = false;
  @observable loading: boolean = true;
  @observable empty: boolean = false;
  @observable lastVisible: IPlaningCategory = null;
  @observable fetchDataRef: Subscription = null;

  constructor(
    private ds: DatabaseService,
  ) { }

  @action
  unsubscribe(){
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
  }

  @action
  fetchData(callback?: (item: any[]) => void): void {
    this.loading = true;
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    this.fetchDataRef = this.ds.planingCategoryRef(ref=>ref.orderBy('order')).valueChanges().subscribe((docs: any[]) => {
      this.data = docs;
      this.loading = false;
      this.empty = docs.length === 0;
      callback && callback(this.data);
    });
  }

  @action
  save(item: IPlaningCategory, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.planingCategoryRef().doc(item.key).set(item, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  delete(item: IPlaningCategory, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.planingCategoryRef().doc(item.key).delete()
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }

}
