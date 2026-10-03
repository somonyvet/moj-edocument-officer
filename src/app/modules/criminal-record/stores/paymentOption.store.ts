import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from "rxjs";
import { orderBy, pushToArray } from "src/app/shared/services/convert.service";
import { DataService } from "src/app/shared/services/data.service";


@Injectable({ providedIn: 'root' })
export class paymentOptionStore {
  @observable public data = [];
  @observable public loading = false;
  @observable public process = false;
  @observable public empty = false;

  constructor(private ds: DataService) { }

  @action
  async subscribe() {
    this.fetchDataRef?.unsubscribe();
    this.data = [];
    Promise.resolve()
  }

  fetchDataRef: Subscription = null;
  @action
  fetchData() {
    this.loading = true;
    this.fetchDataRef?.unsubscribe();
    this.fetchDataRef = this.ds.paymentOptionsRef(ref=>ref.orderBy('nationality.name')).valueChanges().subscribe((docs) => {
      this.data = docs;
      console.log('this.data',this.data)
      if (docs.length === 0) this.empty = true;
      else this.empty = false;
      this.loading = false;
    })
  }

  @action
  async getData() {
    const ref = await this.ds.paymentOptionsRef(ref=>ref.orderBy('nationality.name')).get().toPromise();
    return pushToArray(ref);
  }

  @action
  addNew(ref: any, item: any, callback) {
    this.process = true;
    ref.doc(item.key).set(item, { merge: true }).then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  delete(ref: any, item: any, callback) {
    this.process = true;
    ref.doc(item.key).delete().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }
}
