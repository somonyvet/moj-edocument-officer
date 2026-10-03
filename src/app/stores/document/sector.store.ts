import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { ICategory, IPosition } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { pushToArray } from 'src/app/shared/services/convert.service';

@Injectable({ providedIn: 'root' })
export class SectorStore {
    @observable data: ICategory[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: IPosition = null;
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
        return this.ds.sectorsFireRef(ref => ref.where(field, '==', nameKey));
    }


    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (businessOwners: Array<ICategory>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.sectorsRef().valueChanges().subscribe((docs) => {
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
            .sectorsRef(this.lastVisible)
            .get()
            .toPromise();
        const items = pushToArray(data) as ICategory[];
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
    save(item: ICategory, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.sectorsFireRef()
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
