import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IOfficer, IRemarkOfficer, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { orderBy, pushToArray } from 'src/app/shared/services/convert.service';
import { IMmeProgram, IMmeSubProgram } from 'src/app/interfaces/mme';

@Injectable({ providedIn: 'root' })
export class MmeSubActivitiesStore {
  @observable data: any[] = [];
  @observable dataSourceBudget: any[] = [];
  @observable process: boolean = false;
  @observable loading: boolean = false;
  @observable empty: boolean = false;
  @observable lastYearVisible: IYearProgram = null;
  @observable lastVisible: IMmeProgram = null;
  @observable done: boolean = false;
  @observable fetching: boolean = false;

  constructor(
    private ds: DatabaseService,
  ) { }

  @action
  unsubscribe(): void {
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
  }

  @action
  checkExist(nameKey: any, field: string) {
    return this.ds.remarkFireRef(ref => ref.where(field, '==', nameKey));
  }

  @action
  async fetchOfficers(): Promise<IOfficer[]> {
    const items = await this.ds.officerRef(ref => ref.where('isDelete', '==', false)).get().toPromise()
    return orderBy(pushToArray(items), 'officerIdNo')
  }

  @observable fetchDataRef: Subscription = null;
  @action
  fetchYearData(callback?: (businessOwners: Array<IRemarkOfficer>) => void): void {
    this.loading = true;
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    this.fetchDataRef = this.ds.mmeYearProgramRef().valueChanges().subscribe((docs) => {
      this.data = docs.map((m, index) => ({ ...m, index: index + 1 }));
      this.loading = false;
      this.empty = docs.length === 0;
      if (docs.length >= APPS.size) {
        this.lastYearVisible = docs[docs.length - 1];
        this.done = false;
      } else {
        this.done = true;
        this.lastYearVisible = null;
      }
      this.empty = docs.length === 0;
      this.fetching = false;
      callback && callback(this.data);
    });
  }

  @action
  fetchData(ref: any, callback): void {
    this.loading = true;
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    this.fetchDataRef = ref.valueChanges().subscribe((docs) => {
      this.data = docs.map((m, index) => ({ ...m, index: index + 1 }));
      this.loading = false;
      this.empty = docs.length === 0;
      if (docs.length >= APPS.size) {
        this.lastVisible = docs[docs.length - 1];
        this.done = false;
      } else {
        this.done = true;
        this.lastYearVisible = null;
      }
      this.empty = docs.length === 0;
      this.fetching = false;
      callback && callback(this.data);
    });
  }

  @observable fetchParentRef: Subscription = null;
  @observable fetchSubParentRef: Subscription = null;
  @observable mainActivitiesData: any;
  @observable clusterData: any;
  @observable parentData: any;
  @observable submainProgram: any;

  @action
  async fetchMainActivites(idParent: string, callback) {
    this.fetching = true;
    this.fetchParentRef && this.fetchParentRef.unsubscribe()
    this.fetchParentRef = await this.ds.mmeProgramRef().doc(idParent).valueChanges().subscribe(res => {
      this.mainActivitiesData = res;
      this.fetching = false;
      callback && callback(this.mainActivitiesData);
    })
  }

  @action
  async fetchCluster(callback) {
    this.fetching = true;
    this.fetchParentRef && this.fetchParentRef.unsubscribe()
    this.fetchParentRef = await this.ds.mmeProgramRef().doc(this.mainActivitiesData?.parentKey).valueChanges().subscribe(res => {
      this.clusterData = res;
      this.fetching = false;
      callback && callback(this.clusterData);
    })
  }

  @action
  async fetchSubParent(callback) {
    this.fetching = true;
    this.fetchSubParentRef && this.fetchSubParentRef.unsubscribe()
    this.fetchSubParentRef = await this.ds.mmeProgramRef().doc(this.clusterData?.parentKey).valueChanges().subscribe(res => {
      this.submainProgram = res;
      this.fetching = false;
      callback && callback(this.parentData);
    })
  }

  @action
  async fetchParent(callback) {
    this.fetching = true;
    this.fetchParentRef && this.fetchParentRef.unsubscribe()
    this.fetchParentRef = await this.ds.mmeProgramRef().doc(this.submainProgram?.parentKey).valueChanges().subscribe(res => {
      this.parentData = res;
      this.fetching = false;
      callback && callback(this.parentData);
    })
  }

  @action
  fetchSourceBudget(callback): void {
    this.loading = true;
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    // mmeProgramRef()
    this.fetchDataRef = this.ds.mmeSourceBudgetRef().valueChanges().subscribe((docs) => {
      this.dataSourceBudget = docs.map((m, index) => ({ ...m, index: index + 1 }));
      this.loading = false;
      this.empty = docs.length === 0;
      if (docs.length >= APPS.size) {
        this.lastVisible = docs[docs.length - 1];
        this.done = false;
      } else {
        this.done = true;
        this.lastYearVisible = null;
      }
      this.empty = docs.length === 0;
      this.fetching = false;
      callback && callback(this.dataSourceBudget);
    });
  }

  @action
  async fetchMore(): Promise<void> {
    if (!this.lastVisible || this.fetching || this.done) return;
    this.fetching = true;
    const data = await this.ds
      .remarksRef(this.lastVisible)
      .get()
      .toPromise();
    const items = pushToArray(data) as IMmeProgram[];
    if (items.length >= APPS.size) {
      this.lastVisible = items[items.length - 1];
      this.done = false;
    } else {
      this.done = true;
      this.lastVisible = null;
    }
    this.data = this.data.concat(
      items.map((m, index) => ({ ...m, index: index + 1 }))
    );
    this.fetching = false;
  }

  @action
  saveYear(item: IYearProgram, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.mmeYearProgramRef()
      .doc(item.key)
      .set(item, { merge: true })
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }
  @action
  save(ref: any, item: IMmeSubProgram, callback: (status: boolean, error: string) => void) {
    this.process = true;
    ref
      .doc(item.key)
      .set(item, { merge: true })
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }

  @action
  delete(ref: any, item: IMmeProgram, callback: (status: boolean, error: string) => void) {
    this.process = true;
    ref
      .doc(item.key)
      .delete()
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }

  @action
  saveSourceBudget(item: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.mmeSourceBudgetRef()
      .doc(item.key)
      .set(item, { merge: true })
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }


  @action
  async fetchYearProgram(config): Promise<IMmeProgram[]> {
    const { startFromLevel } = config;
    const docs = await this.ds.mmeYearFilterRef(ref => {
      return ref.orderBy('created_at')
    }).get().toPromise();
    const departments = pushToArray(docs).filter(m => m?.isDelete === false);
    return departments;
  }

}
