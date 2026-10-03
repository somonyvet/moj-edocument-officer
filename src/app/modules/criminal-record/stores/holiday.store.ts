import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from "rxjs";
import { orderBy } from "src/app/shared/services/convert.service";
import { DataService } from "src/app/shared/services/data.service";
import { formatFormDate, toKhDate } from "src/app/shared/services/mapping.service";


@Injectable({ providedIn: 'root' })
export class HolidayStore {
  @observable public data = [];
  @observable public loading = false;
  @observable public process = false;
  @observable public empty = false;

  constructor(private ds: DataService) { }

  @action
  async subscribe(){
    this.fetchDataRef?.unsubscribe();
    this.data=[];
    Promise.resolve()
  }

  fetchDataRef: Subscription = null;
  @action
  fetchData(year: number) {
    this.loading = true;
    this.fetchDataRef?.unsubscribe();
    this.fetchDataRef = this.ds.publicHolidayRef(ref => ref.where('year.key', '>=', year)).valueChanges().subscribe((docs) => {
      this.data = orderBy(docs?.map((m: any) => {
        return { ...m, date_kh: toKhDate(formatFormDate(m?.date)), to_date_kh: toKhDate(formatFormDate(m?.to_date)) }
      }), 'date');
      if (docs.length === 0) this.empty = true;
      else this.empty = false;
      this.loading = false;
    })
  }

  @action
  addNew(ref: any, item: any, callback) {
    this.process = true;
    ref.doc(item.key).set(item).then(() => {
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
