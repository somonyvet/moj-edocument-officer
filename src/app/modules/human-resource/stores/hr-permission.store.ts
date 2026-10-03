import { LEAVE_REQUEST_TYPE } from './../../../dummy/status';
import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { APPS } from 'src/app/dummy/config';
import { ILeaveRequest } from "src/app/interfaces/attendance";

@Injectable({ providedIn: 'root' })
export class HrPermissionStore {
    @observable data: ILeaveRequest[] = [];
    @observable empty: boolean = false;
    @observable fetching: boolean = false;
    @observable searching: boolean = false;

    @observable lastVisible: ILeaveRequest = null;
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
    async fetchHrPermissions() {
        try {
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef =
                this.ds
                    .officerLeaveRequestRef(LEAVE_REQUEST_TYPE.PERMISSION.key)
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
    async fetchMoreHrPermissions() {
        try {
            if (!this.lastVisible) return;
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef = this.ds
                .officerLeaveRequestRef(LEAVE_REQUEST_TYPE.PERMISSION.key, this.lastVisible)
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
}