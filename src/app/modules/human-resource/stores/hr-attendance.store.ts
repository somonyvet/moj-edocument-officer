import { IAttendance } from './../../../interfaces/attendance';
import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { APPS } from 'src/app/dummy/config';

@Injectable({ providedIn: 'root' })
export class HrAttendanceStore {
    @observable data: IAttendance[] = [];
    @observable empty: boolean = false;
    @observable fetching: boolean = false;
    @observable searching: boolean = false;

    @observable lastVisible: IAttendance = null;
    @observable fetchDataRef: Subscription = null;

    constructor(
        private ds: DatabaseService,
        private auth: AuthStore,
    ) { }

    @action
    unsubscribe() {
        this.fetchDataRef?.unsubscribe();
    }

    officerAttendanceGroupByOfficerId(objectArray, property) {
        return objectArray.reduce(function (accumulator, currentObject) {
            let officer = currentObject[property];

            if (!accumulator[officer.officerId]) {
                accumulator[officer.officerId] = {
                    officer,
                    attendance: [],
                };
            }

            delete currentObject[property];
            accumulator[officer.officerId].attendance.push(currentObject);

            return accumulator;
        }, {});
    }

    @action
    async fetchHrAttendances(startDateKey: string, endDateKey: string,) {
        try {
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef =
                this.ds
                    .everyOfficerAttendancesRef(startDateKey, endDateKey,)
                    .valueChanges()
                    .subscribe((docs) => {
                        let groupedAttendanceObj = this.officerAttendanceGroupByOfficerId(docs, "officer");
                        let items: IAttendance[] = Object.values(groupedAttendanceObj);
                        this.data = items.map((f, index) => ({
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
    async fetchMoreHrAttendances(startDateKey: string, endDateKey: string,) {
        try {
            if (!this.lastVisible) return;
            this.fetchDataRef?.unsubscribe();
            this.fetching = true;
            this.fetchDataRef = this.ds
                .everyOfficerAttendancesRef(startDateKey, endDateKey, this.lastVisible)
                .valueChanges()
                .subscribe(docs => {
                    const lastIndex = this.lastVisible['rowIndex'];

                    let groupedAttendanceObj = this.officerAttendanceGroupByOfficerId(docs, "officer");
                    let groupItems: IAttendance[] = Object.values(groupedAttendanceObj);

                    const items = groupItems.map((f, index) => ({
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