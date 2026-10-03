import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IRanking } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { AngularFirestore, DocumentData, QuerySnapshot } from '@angular/fire/compat/firestore';
import { toCapitalize } from 'src/app/shared/services/mapping.service';

@Injectable({ providedIn: 'root' })
export class searchStore {
    @observable data: IRanking[] = [];
    @observable documentData: any[] = [];
    @observable categoryData: any[] = [];
    @observable institutionData: any[] = [];
    @observable departmentData: any[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: IRanking = null;
    @observable done: boolean = false;
    @observable fetching: boolean = false;

    constructor(
        private ds: DatabaseService,
        private db: AngularFirestore
    ) { }

    @action
    unsubscribe(): void {
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
    }

    @action
    checkExist(nameKey: any, field: string) {
        return this.ds.rankingFireRef(ref => ref.where(field, '==', nameKey));
    }

    @action
    async fetchCategory() {
        this.categoryData = pushToArray(await this.ds.categoryFireRef().get().toPromise());
    }

    @action
    async fetchInstitution() {
        this.institutionData = pushToArray(await this.ds.institutionFireRef().get().toPromise());
    }

    @action
    async fetchDepartment(callback) {
        this.departmentData = pushToArray(await this.ds.departmentFireRef(ref => ref.orderBy('node').orderBy('order')).get().toPromise());
        callback(this.departmentData)
    }



    @action
    async fetchSearchData(form) {
        this.process = true;
        this.documentData = pushToArray(await this.ds.documentHeaderRef(ref => {
            let condition = ref.orderBy("created_at", "desc")
            const { documentID, documentType, documentSource, department, isFilterDate, fromDate, toDate } = form;

            if (documentID) {
                condition = condition.where("keyword", 'array-contains', toCapitalize(documentID))
            }
            
            if (isFilterDate) {
                condition = condition.where("created_at", ">=", fromDate).where("created_at", "<=", toDate)
            }
            if (documentType) {
                condition = condition.where("category.key", "==", documentType?.key)
            }
            if (documentSource) {
                condition = condition.where("organizationRef.key", "==", documentSource?.key)
            }
            if (department) {
                condition = condition.where("workplace.key", "==", department?.key)
            };
            return condition;
        }).get().toPromise());
        this.process = false;
    }


    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (businessOwners: Array<IRanking>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.rankingRef(null).valueChanges().subscribe((docs) => {
            this.data = docs.map((m, index) => ({ ...m, index: index + 1 }));
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
            .rankingRef(this.lastVisible)
            .get()
            .toPromise();
        const items = pushToArray(data) as IRanking[];
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
    save(item: IRanking, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.rankingRef()
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
    delete(item: IRanking, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.rankingRef()
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
    async fetchAll() {
        this.fetching = true;
        const ref = await this.db.collection<IRanking>('ranking', ref => {
            let condition = ref.where('isDelete', '==', false)
            return condition;
        }).get().toPromise() as QuerySnapshot<DocumentData>;
        const arrData = pushToArray(ref)
        this.fetching = false;
        return arrData;
    }
}
