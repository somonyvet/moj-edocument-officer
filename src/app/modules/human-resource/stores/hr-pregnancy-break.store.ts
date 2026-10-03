import { pushToObject } from 'src/app/shared/services/convert.service';
import { LEAVE_REQUEST_TYPE, statusObj } from './../../../dummy/status';
import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { APPS } from 'src/app/dummy/config';
import { ILeaveRequest } from "src/app/interfaces/attendance";

@Injectable({ providedIn: 'root' })
export class HrPregnancyBreakStore {
    @observable data: ILeaveRequest[] = [];
    @observable empty: boolean = false;
    @observable fetching: boolean = false;
    @observable searching: boolean = false;
    @observable loading: boolean = false;
    @observable process: boolean = false;

    @observable lastVisible: ILeaveRequest = null;
    @observable fetchDataRef: Subscription = null;
    @observable pbSearchSubscription: Subscription = null;

    constructor(
        private ds: DatabaseService,
        private auth: AuthStore,
    ) { }

    @action
    unsubscribe() {
        this.fetchDataRef?.unsubscribe();
    }

    @action
    async fetchHrPregnancyBreaks() {
        try {
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef =
                this.ds
                    .officerLeaveRequestRef(LEAVE_REQUEST_TYPE.PREGENCY_BREAK.key)
                    .valueChanges()
                    .subscribe(async (docs) => {
                        let dataArr = [];
                        for (let index = 0; index < docs.length; index++) {
                            const element = docs[index];
                            const officerKey = element.officerKeys[0];
                            const officer = await this.fetchOfficer(officerKey);

                            dataArr = [...dataArr, {
                                ...element,
                                rowIndex: index + 1,
                                officer,
                            }];
                        }

                        this.data = dataArr;

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
    async fetchMoreHrPregnancyBreaks() {
        try {
            if (!this.lastVisible) return;
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef = this.ds
                .officerLeaveRequestRef(LEAVE_REQUEST_TYPE.PREGENCY_BREAK.key, this.lastVisible)
                .valueChanges()
                .subscribe(async (docs) => {
                    const lastIndex = this.lastVisible['rowIndex'];
                    let dataArr = [];

                    for (let index = 0; index < docs.length; index++) {
                        const element = docs[index];
                        const officerKey = element.officerKeys[0];
                        const officer = await this.fetchOfficer(officerKey);

                        dataArr = [...dataArr, {
                            ...element,
                            rowIndex: index + 1 + lastIndex,
                            officer,
                        }];
                    }

                    this.data = this.data.concat(dataArr);
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
    save(item: ILeaveRequest, callback: (status: boolean, error: string) => void) {
        this.process = true;
        item.type = LEAVE_REQUEST_TYPE.PREGENCY_BREAK;
        item.status = statusObj.active;

        this.ds.officerLeaveRequestCollectionRef()
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



    // @action
    // async search(value: string) {
    //     try {
    //         this.searching = true;
    //         this.pbSearchSubscription?.unsubscribe();
    //         this.pbSearchSubscription = this.ds.officerLeaveRequestSearchRef(LEAVE_REQUEST_TYPE.PREGENCY_BREAK.key, value).valueChanges().subscribe((docs) => {
    //             let index = 1;
    //             this.data = docs.map((value) => {
    //                 value['index'] = index;
    //                 index++;
    //                 return value;
    //             });

    //             this.empty = docs.length === 0;
    //             this.searching = false;
    //         })
    //     } catch (e) {
    //         this.searching = false;
    //     }
    // }

    @action
    async fetchOfficer(key: string) {
        try {
            let snap = await this.ds.officerRef().doc(key).get().toPromise();
            return pushToObject(snap);
        } catch (e) {
        }
    }
}