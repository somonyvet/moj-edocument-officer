import { observable, action } from "mobx";
import { Injectable } from "@angular/core";
import { DataService } from "../shared/services/data.service";
import { Observable, of, Subscription } from "rxjs";
import { distinct } from "rxjs/operators";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { pushToObject } from "../shared/services/convert.service";

@Injectable({providedIn:'root'})
export class BookDocumentStore {

  @observable public loading = false;
  @observable public fetching = false;
  @observable public process = false;
  @observable public empty = false;

  @observable public data = [];
  @observable public selectedItem: any = null;

  @observable fetchBookDocumentRef: any = null;
  @observable fetchBookDocumentsRef: any = null;

  constructor(
    private ds: DataService,
    private afs: AngularFirestore
  ) { }

  @action
  clearSelected() {
    this.selectedItem = null;
  }

  @action
  fetchBookDocumentCallback(callback) {
    this.fetchBookDocumentsRef = this.ds.bookDocumentRef().valueChanges().subscribe(docs => {
      callback(docs);
    });
  }

  @action
  async fetchBookDocumentByKeyCallback(key: string, callback: (posterData: any) => void) {
    try {
      const result = pushToObject(await this.ds.bookDocumentRef().doc(key).get().toPromise());
      callback(result);
    } catch (error) {
    }
  }

  @action
  fetchBookDocument() {
    this.loading = true;
    this.ds.bookDocumentRef().valueChanges()
      .subscribe(docs => {
        this.data = docs;
        this.empty = docs.length === 0;
        this.loading = false;
      });
  }

  @action
  addBookDocument(f: any, callback) {
    this.loading = true;
    this.ds.bookDocumentRef().doc(f.key).set(f).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  updateBookDocument(f: any, callback) {
    this.loading = true;
    this.ds.bookDocumentRef().doc(f.key).update(f).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  deleteBookDocument(f: any, callback) {
    this.ds.bookDocumentRef().doc(f.key).delete().then(() => {
      callback(true);
    }).catch(error => {
      alert(error);
      callback(false, null)
    })
  }

  // ----------------------------------------------------------------------------

  lastVisible: any = null;
  infinite: Observable<any[]>;

  @observable public orderBy = null;
  @observable public searchText = null;
  @observable public filter = null;

  @observable fetchPosterRef_lazyLoading: Subscription;

  infiniteData(data: any) {
    this.infinite = of(data).pipe(distinct((p: any) => p.key));
  }

  @action
  async fetchData(search: any, filter: any, orderBy: any) {
    this.orderBy = orderBy;
    this.searchText = search;
    this.filter = filter;
    this.loading = true;
    this.fetching = false;
    this.lastVisible = null;

    if(this.fetchPosterRef_lazyLoading) this.fetchPosterRef_lazyLoading.unsubscribe();

    const ref = this.lazyDataRef(this.lastVisible, search, filter, orderBy);
    this.fetchPosterRef_lazyLoading = ref.snapshotChanges().subscribe((response: any) => {
      this.data = [];

      if (!response.length) {
        this.loading = false;
        this.fetching = false;
        this.empty = true;
        return false;
      }

      this.lastVisible = response[response.length - 1].payload.doc;

      for (let item of response) {
        this.data.push(item.payload.doc.data() as any);
      }

      this.data = this.data.map((f: any, index: number) => ({
        ...f,
        rowIndex: index + 1
      }))

      this.infiniteData(this.data);
      this.loading = false
      this.fetching = false;

      return true;
    }, (error: any) => {
      this.loading = false;
    });
  }

  @action
  async fetchDataMore() {
    this.fetching = true;

    this.lazyDataRef(this.lastVisible, this.searchText, this.filter, this.orderBy).get().subscribe(response => {
      if (!response.docs.length) {
        this.loading = false
        this.fetching = false;
        return;
      }

      this.lastVisible = response.docs[response.docs.length - 1];

      for (let item of response.docs) {
        this.data.push(item.data() as any);
      }

      this.data = this.data.map((f: any, index: number) => ({
        ...f,
        rowIndex: index + 1
      }))

      this.fetching = false;
      this.infiniteData(this.data);

      return;
    }, (error: any) => {
      this.fetching = false;
    });
  }

  lazyDataRef(lastVisible: any, search: any, filter: any, orderBy: any) {
    return this.afs.collection<any>("book-documents", ref => {
      let keyword = search ? search.toUpperCase() : "~N/A~";
      let condition = ref.where('isDeleted', '==', filter?.isDeleted || false)
        .orderBy('dateKey', "desc").orderBy('createdAt', 'desc').limit(10);

      if(search) {
        condition = condition.where("keyword", "array-contains", keyword);
      }

      if (lastVisible) {
        condition = condition.startAfter(lastVisible)
      }

      return condition;
    })
  }

}
