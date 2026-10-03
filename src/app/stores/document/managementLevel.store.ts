import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IManagementLevel } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { pushToArray } from 'src/app/shared/services/convert.service';

@Injectable({ providedIn: 'root' })
export class ManagementLevelStore {
    @observable data: IManagementLevel[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: IManagementLevel = null;
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
        return this.ds.managementLevelFireRef(ref => ref.where(field, '==', nameKey));
    }
    @observable fetchManagementLevelsRef: Subscription = null;
    @action
    fetchManagementLevels(callback: (items: Array<IManagementLevel>) => void): void {
        this.fetchManagementLevelsRef && this.fetchManagementLevelsRef.unsubscribe();
        this.fetchManagementLevelsRef = this.ds.managementLevelFireRef(ref => ref.orderBy('node').orderBy('order')).valueChanges().subscribe((docs) => {
            const items = docs.map((m, index) => ({ ...m, index: index + 1 }));
            callback && callback(items);
        });
    }

    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (businessOwners: Array<IManagementLevel>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.managementLevelRef(null).valueChanges().subscribe((docs) => {
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
            .managementLevelRef(this.lastVisible)
            .get()
            .toPromise();
        const items = pushToArray(data) as IManagementLevel[];
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
    save(item: IManagementLevel, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.managementLevelRef()
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
