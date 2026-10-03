import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from "rxjs-compat";
import { pushToArray } from "src/app/shared/services/convert.service";
import { DataService } from "src/app/shared/services/data.service";


@Injectable({ providedIn: 'root' })
export class embassyStore {
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
  @action
  async getNational() {
    const docs = await this.ds.countriesRef().get().toPromise()
    let countries = pushToArray(docs)
    return countries;
  }

  fetchDataRef: Subscription = null;
  @action
  fetchData() {
    this.loading = true;
    this.fetchDataRef?.unsubscribe();
    this.fetchDataRef = this.ds.embassyRef().valueChanges().subscribe((docs) => {
      this.data = docs;
      console.log('this.data', this.data);
      if (docs.length === 0) this.empty = true;
      else this.empty = false;
      this.loading = false;
    })
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
