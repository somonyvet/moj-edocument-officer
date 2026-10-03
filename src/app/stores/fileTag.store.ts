import { observable, action } from "mobx";
import { Injectable } from "@angular/core";
import { DataService } from "../shared/services/data.service";

@Injectable({providedIn:'root'})
export class FileTag {
  @observable public data = null;
  @observable public loading = false;
  @observable public process = false;
  @observable public empty = false;
  @observable selectedItem: any = null;


  constructor(
    private ds: DataService,
  ) { }

  @action
  clearSelected() {
    this.selectedItem = null;
  }
  @action
  updatetag(f: any, callback) {
    this.loading = true;
    this.ds.firestore().collection('file_tags').doc(f.key).update(f).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @observable fetchTagColorRef: any = null;
  @action
  fetchTagColor(callback) {
    this.fetchTagColorRef = this.ds.fileTagsRef()
      .valueChanges().subscribe(docs => {
        callback(docs);
      });
  }



  @action
  deleteDoc(collectionName: string, f: any, callback) {
    this.ds.collectionRef(collectionName).doc(f.key).delete().then(() => {
      callback(true);
    }).catch(error => {
      alert(error);
      callback(false, null)
    })
  }

  @action
  fetchData() {
    this.loading = true;
    this.ds.fileTagsRef().valueChanges()
      .subscribe(docs => {
        this.data = docs;
        this.empty = docs.length === 0;
        this.loading = false;
      });
  }

  @action
  fetchMenuData() {
    this.loading = true;
    this.ds.fileTagsRefMenu().valueChanges()
      .subscribe(docs => {
        this.data = docs;
        this.empty = docs.length === 0;
        this.loading = false;
      });
  }
}
