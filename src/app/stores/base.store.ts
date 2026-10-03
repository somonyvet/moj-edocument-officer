import { observable, action,} from "mobx";
import { Injectable } from "@angular/core";
import { DataService } from "../shared/services/data.service";
import { pushToArray, pushToObject } from "../shared/services/convert.service";
import { toGeoData } from "../shared/services/mapping.service";

@Injectable({ providedIn: 'root' })
export class BaseStore {
  @observable public data = [];
  @observable public subjectScore = [];
  @observable public selectedGrade = null;
  @observable public sessionShift = [];
  @observable public campusGroup = [];
  @observable public loading = false;
  @observable public config = null;
  @observable public process = false;
  @observable public empty = false;

  @observable public templateItems: any[] = [];
  @observable public templateGroups: any[] = [];
  @observable public totalTemplateItems: 0;

  @observable public options: any[] = [];
  @observable public STRING_TOPIC: any[] = [];
  @observable public TOPIC_STRINGS: any[] = [];
  @observable public TOPIC_FILE: any[] = [];

  @observable public STRING_TOPIC_ANSWERS: any[] = [];
  @observable public WORD_BANK: any[] = [];


  subscribeBaseData: any = null;
  constructor(private ds: DataService) { }


  async fetchList(ref: any) {
    this.process = true;
    const docs = await ref.get().toPromise();
    const data = pushToArray(docs)
    this.process = false;
    return data;
  }

  async fetchDoc(ref: any) {
    this.process = true;
    const doc = await ref.get().toPromise();
    const data = pushToObject(doc)
    this.process = false;
    return data;
  }

  @action
  fetchData(ref: any) {
    this.loading = true;
    this.subscribeBaseData = ref.valueChanges().subscribe((docs) => {
      this.options = [];
      this.WORD_BANK = [];
      this.data = docs;
      this.empty = docs.length === 0;
      this.loading = false;
    })
  }

  @action
  addNewSub(collection: string, item: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const ref = this.ds.collectionFireRef(collection).doc(item.key)
    const schoolRef = this.ds.collectionFireRef("stores").doc(item.schoolKey).collection(collection).doc(item.key)

    batch.set(ref, item)
    batch.set(schoolRef, item)
    batch.commit().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  updateData(items: Array<any>) {
    items.map(m=> {
      const ref = this.ds.fireRef().collection("posts")
      const batch = this.ds.batch()
      batch.update(ref.doc(m.key), {
        province: toGeoData(m.province),
      })
      // batch.commit().then(()=>{
      //   console.log('done');
      // })
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
  edit(ref: any, item: any, callback) {
    this.process = true;
    ref.doc(item.key).update(item).then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  update(ref: any, item: any, callback) {
    this.process = true;
    ref.doc(item.key).update(item).then(() => {
      this.process = false;
      callback(true, item)
    }).catch(error => {
      this.process = false;
      callback(false, error)
    });
  }

  @action
  updateSub(collection: string, item: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const ref = this.ds.collectionFireRef(collection).doc(item.key)
    const schoolRef = this.ds.collectionFireRef("stores").doc(item.schoolKey).collection(collection).doc(item.key)

    batch.update(ref, item)
    batch.update(schoolRef, item)
    batch.commit().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  deleteSub(collection: string, item: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const ref = this.ds.collectionFireRef(collection).doc(item.key)
    const schoolRef = this.ds.collectionFireRef("stores").doc(item.schoolKey).collection(collection).doc(item.key)

    batch.delete(ref)
    batch.delete(schoolRef)
    batch.commit().then(() => {
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
