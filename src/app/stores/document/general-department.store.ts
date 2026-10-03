import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IDepartment, IPosition, ISettings } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { pushToArray } from 'src/app/shared/services/convert.service';

@Injectable({ providedIn: 'root' })
export class GeneralDepartmentStore {
    @observable data: IDepartment[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: IDepartment = null;
    @observable done: boolean = false;
    @observable fetching: boolean = false;

    //form
    @observable position: IPosition[] = [];
    @observable positionCarbonCopy: IPosition[] = [];
    constructor(
        private ds: DatabaseService,
    ) { }

    @action
    async fetchManagementLevel() {
        const docs = await this.ds.rankingFireRef(ref => ref.orderBy('order')).get().toPromise()
        return pushToArray(docs)
    }

    @action
    async fetchRanking() {
        const docs = await this.ds.managementLevelFireRef(ref => ref.orderBy('order')).get().toPromise();
        return pushToArray(docs)
    }

    @action
    unsubscribe(): void {
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
    }

    @action
    checkExist(nameKey: string) {
        return this.ds.departmentFireRef(ref => ref.where('isDelete', '==', false).where('nameKey', '==', nameKey));
    }

    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(config: ISettings, callback?: (businessOwners: Array<IDepartment>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.departmentRef(null).valueChanges().subscribe((docs) => {
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
    async fetchMore(config: ISettings): Promise<void> {
        if (!this.lastVisible || this.fetching || this.done) return;
        this.fetching = true;
        const data = await this.ds
            .departmentRef(this.lastVisible)
            .get()
            .toPromise();
        const items = pushToArray(data) as IDepartment[];
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
    save(item: IDepartment, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.departmentFireRef()
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
}
