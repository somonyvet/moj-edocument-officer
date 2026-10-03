import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IOfficer, IRemarkOfficer } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { orderBy, pushToArray } from 'src/app/shared/services/convert.service';

@Injectable({ providedIn: 'root' })
export class RemarkStore {
    @observable data: IRemarkOfficer[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: IRemarkOfficer = null;
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
    async fetchOfficers():Promise<IOfficer[]> {
        const items = await this.ds.officerRef(ref => ref.where('isDelete', '==', false)).get().toPromise()
        return orderBy(pushToArray(items), 'officerIdNo')
    }

    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (businessOwners: Array<IRemarkOfficer>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.remarksRef().valueChanges().subscribe((docs) => {
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
            .remarksRef(this.lastVisible)
            .get()
            .toPromise();
        const items = pushToArray(data) as IRemarkOfficer[];
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
    save(item: IRemarkOfficer, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.remarksRef()
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
