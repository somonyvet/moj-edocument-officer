import { observable, action, } from 'mobx';
import { Injectable } from "@angular/core";
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { pushToArray } from 'src/app/shared/services/convert.service';
import { DOC_CATEGORY_OBJ } from 'src/app/dummy/status';

@Injectable({ providedIn: 'root' })
export class AnnouncementStore {
    @observable data: any[] = [];
    @observable institutions: any[] = [];
    @observable category: any[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: any = null;
    @observable done: boolean = false;
    @observable fetching: boolean = false;

    constructor(
      private ds: DatabaseService,
  ) { }

  @action
  unsubscribe(): void {
      this.fetchDataRef && this.fetchDataRef.unsubscribe();
  }

  @observable fetchDataRef: Subscription = null;
  @action
  fetchData(callback?: (businessOwners: Array<any>) => void): void {
      this.loading = true;
      this.fetchDataRef && this.fetchDataRef.unsubscribe();
      this.fetchDataRef = this.ds.documentHeaderRef(ref=>{
        let condition = ref
        .where('document_category.key','==',DOC_CATEGORY_OBJ.announcement?.key)
        .where('isDelete','==',false)
        .orderBy('created_at','desc');
        return condition.limit(APPS.size);
      }).valueChanges().subscribe((docs) => {
          this.data = docs.map((m:any, index) => ({ ...m, index: index + 1 }));
          this.loading = false;
          this.empty = docs.length === 0;
          if (docs.length >= APPS.size) {
              this.lastVisible = docs[docs.length - 1];
              this.done = false;
          } else {
              this.done = true;
              this.lastVisible = null;
          }
          this.empty = docs.length === 0;
          this.fetching = false;
          callback && callback(this.data);
      });
  }

  @action
  async fetchMore(): Promise<void> {
      if (!this.lastVisible || this.fetching || this.done) return;
      this.fetching = true;
      const data = await this.ds
          .documentHeaderRef(ref => {
            const {created_at} = this.lastVisible
            let condition = ref.where('document_category.key','==',DOC_CATEGORY_OBJ.announcement?.key)
            .where('isDelete','==',false)
            .startAfter(created_at)
            .orderBy('created_at','desc');
            return condition.limit(APPS.size);
          })
          .get()
          .toPromise();
      const items = pushToArray(data) as any[];
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
  save(item: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.documentHeaderRef()
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
  async getInstitution() {
    return pushToArray(await this.ds.institutionRef().ref.where("isDelete", "==", false).orderBy("name").get());
  }

  @action
  async getCategory() {
    const dataFire = await this.ds.categoryRef().ref.where('isDelete', '==', false).get()
    return pushToArray(dataFire);
  }

  @action
  async searchOfficer(str){
    const ref = await this.ds?.officerRef().ref.where('isDelete', '==', false).where('keyword', 'array-contains', str).limit(10).get();
    return pushToArray(ref);
  }

}
