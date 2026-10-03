import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { APPS } from 'src/app/dummy/config';
import { IHoliday } from "src/app/interfaces/attendance";

@Injectable({ providedIn: 'root' })
export class HrHolidayStore {
    @observable data: IHoliday[] = [];
    @observable empty: boolean = false;
    @observable process: boolean = false;
    @observable fetching: boolean = false;
    @observable searching: boolean = false;

    @observable lastVisible: IHoliday = null;
    @observable fetchDataRef: Subscription = null;

    constructor(
        private ds: DatabaseService,
        private auth: AuthStore,
    ) { }

    @action
    unsubscribe() {
        this.fetchDataRef?.unsubscribe();
    }

    @action
    async fetchHrHolidays() {
        try {
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef =
                this.ds
                    .hrHolidaysRef()
                    .valueChanges()
                    .subscribe((docs) => {
                        this.data = docs.map((f, index) => ({
                            ...f,
                            rowIndex: index + 1,
                        }));

                        if (docs?.length >= APPS.size) {
                            this.lastVisible = this.data[this.data.length - 1];
                        } else {
                            this.lastVisible = null;
                        }

                        this.empty = this.data?.length === 0;
                        this.fetching = false;
                    });
        } catch (err) {
            this.fetching = false;
        }

    }

    @action
    async fetchMoreHrHolidays() {
        try {
            if (!this.lastVisible) return;
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef = this.ds
                .hrHolidaysRef(this.lastVisible)
                .valueChanges()
                .subscribe(docs => {
                    const lastIndex = this.lastVisible['rowIndex'];

                    const items = docs.map((f, index) => ({
                        ...f,
                        rowIndex: index + 1 + lastIndex,
                    }));
                    this.data = this.data.concat(items);
                    if (docs?.length >= APPS.size) {
                        this.lastVisible = this.data[this.data.length - 1];
                    } else {
                        this.lastVisible = null;
                    }
                    this.fetching = false;
                })
        } catch (err) {
            this.fetching = false;
        }

    }

    @action
    save(item: IHoliday, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.hrHolidaysRef()
            .doc(item.key)
            .set(item, { merge: true })
            .then(() => {
                callback(true, null);
            }).catch(error => {
                callback(false, error);
            }).finally(() => {
                this.process = false;
            })
    }
}