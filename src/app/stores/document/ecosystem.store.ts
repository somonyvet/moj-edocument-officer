import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IEcosystem } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { pushToArray } from 'src/app/shared/services/convert.service';

@Injectable({ providedIn: 'root' })
export class EcosystemStore {
    @observable data: IEcosystem[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: IEcosystem = null;
    @observable done: boolean = false;
    @observable fetching: boolean = false;

    constructor(
        private ds: DatabaseService,
    ) { }

    @action
    async unsubscribe() {
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        Promise.resolve()
    }

    @action
    checkExist(nameKey: any, field: string) {
        return this.ds.ecosystemFireRef(ref => ref.where(field, '==', nameKey));
    }
    @observable fetchManagementLevelsRef: Subscription = null;
    @action
    fetchItems(callback: (items: Array<IEcosystem>) => void): void {
        this.fetchManagementLevelsRef && this.fetchManagementLevelsRef.unsubscribe();
        this.fetchManagementLevelsRef = this.ds.ecosystemFireRef(ref => ref.orderBy('node').orderBy('order')).valueChanges().subscribe((docs) => {
            const items = docs.map((m, index) => ({ ...m, index: index + 1 }));
            callback && callback(items);
        });
    }

    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (businessOwners: Array<IEcosystem>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.ecosystemRef(null).valueChanges().subscribe((docs) => {
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
            .ecosystemRef(this.lastVisible)
            .get()
            .toPromise();
        const items = pushToArray(data) as IEcosystem[];
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
    async save(item: IEcosystem, callback: (status: boolean, error: string) => void) {
        this.process = true;
        const batch = this.ds.batch()
        // if (item?.isPrimary) {
        //     const doc = await this.ds.ecosystemFireRef(ref => ref.where('isPrimary', '==', true)).get().toPromise();
        //     const items = pushToArray(doc);
        //     items?.map(m => {
        //         batch.set(this.ds.ecosystemRef().doc(m?.key).ref, { isPrimary: false }, { merge: true });
        //     })
        // }
        batch.set(this.ds.ecosystemRef().doc(item?.key).ref, item, { merge: true });
        batch.commit().then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        }).finally(() => {
            this.process = false;
        })
    }

    @action
    delete(item: IEcosystem) {
        return this.ds.ecosystemRef().doc(item?.key).delete()
    }
}
