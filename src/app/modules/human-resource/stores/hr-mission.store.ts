import { IOfficer } from './../../../interfaces/document/document.interface';
import { statusObj } from 'src/app/dummy/status';
import { LEAVE_REQUEST_TYPE } from './../../../dummy/status';
import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ILeaveRequest } from "src/app/interfaces/attendance";

@Injectable({ providedIn: 'root' })
export class HrMissionStore {
    @observable data: ILeaveRequest[] = [];
    @observable empty: boolean = false;
    @observable fetching: boolean = false;
    @observable searching: boolean = false;
    @observable process: boolean = false;
    @observable officersMission: IOfficer[] = [];

    @observable activeKey: string = '';

    @observable lastVisible: ILeaveRequest = null;
    @observable fetchDataRef: Subscription = null;
    @observable mSearchSubscription: Subscription = null;


    constructor(
        private ds: DatabaseService,
        private auth: AuthStore,
    ) { }

    @action
    unsubscribe() {
        this.fetchDataRef?.unsubscribe();
        this.mSearchSubscription?.unsubscribe();
    }

    // @action
    // async fetchHrMissions() {
    //     try {
    //         this.fetchDataRef?.unsubscribe();
    //         this.fetching = true;
    //         this.fetchDataRef =
    //             this.ds
    //                 .officerLeaveRequestRef(LEAVE_REQUEST_TYPE.MISSION.key)
    //                 .valueChanges()
    //                 .subscribe((docs) => {
    //                     this.data = docs.map((f, index) => ({
    //                         ...f,
    //                         rowIndex: index + 1,
    //                     }));

    //                     if (docs?.length >= APPS.size) {
    //                         this.lastVisible = this.data[this.data.length - 1];
    //                     } else {
    //                         this.lastVisible = null;
    //                     }

    //                     this.empty = this.data?.length === 0;
    //                     this.fetching = false;
    //                 });
    //     } catch (err) {
    //         console.log(err);
    //         console.log('fail to fetch hr Mission');
    //         this.fetching = false;
    //     }

    // }

    // @action
    // async fetchMoreHrMissions() {
    //     try {
    //         if (!this.lastVisible) return;
    //         this.fetchDataRef?.unsubscribe();
    //         this.fetching = true;
    //         this.fetchDataRef = this.ds
    //             .officerLeaveRequestRef(LEAVE_REQUEST_TYPE.MISSION.key, this.lastVisible)
    //             .valueChanges()
    //             .subscribe(docs => {
    //                 const lastIndex = this.lastVisible['rowIndex'];

    //                 const items = docs.map((f, index) => ({
    //                     ...f,
    //                     rowIndex: index + 1 + lastIndex,
    //                 }));
    //                 this.data = this.data.concat(items);
    //                 if (docs?.length >= APPS.size) {
    //                     this.lastVisible = this.data[this.data.length - 1];
    //                 } else {
    //                     this.lastVisible = null;
    //                 }
    //                 this.fetching = false;
    //             })
    //     } catch (err) {
    //         console.log(err);
    //         console.log('fail to fetch hr Mission');
    //         this.fetching = false;
    //     }

    // }


    @action
    save(item: ILeaveRequest, callback: (status: boolean, error: string) => void) {
        this.process = true;
        item.type = LEAVE_REQUEST_TYPE.MISSION;
        item.status = statusObj.active;
        if (item.isDeleted) {
            this.activeKey = '';
            this.officersMission = [];
        }

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

    @action
    async search(value: string) {
        try {
            this.searching = true;
            this.mSearchSubscription?.unsubscribe();
            this.mSearchSubscription = this.ds.officerLeaveRequestSearchRef(LEAVE_REQUEST_TYPE.MISSION.key, value).valueChanges().subscribe((docs) => {
                let index = 1;
                this.data = docs.map((value) => {
                    value['index'] = index;
                    index++;
                    return value;
                });

                if (this.officersMission.length === 0) {
                    let selectedIndex = this.data.findIndex(({ key }) => this.activeKey === key);

                    if (selectedIndex !== -1) {
                        this.fetchOfficersFromMission(this.data[selectedIndex]?.officerKeys);
                    }
                }


                this.empty = docs.length === 0;
                this.searching = false;
            })
        } catch (e) {
            this.searching = false;
            console.log('search error: ', e);
        }

    }

    @action
    async fetchOfficersFromMission(officerKeys: string[]) {
        try {
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef =
                this.ds
                    .officerRef((ref) => {
                        return ref
                            .where('key', 'in', officerKeys)
                            .where('isDelete', '==', false);
                    })
                    .valueChanges()
                    .subscribe((docs) => {
                        this.officersMission = docs;
                        this.empty = this.data?.length === 0;
                        this.fetching = false;
                    });
        } catch (err) {
            console.log(err);
            console.log('fail to get officer from Mission');
            this.fetching = false;
        }
    }
}