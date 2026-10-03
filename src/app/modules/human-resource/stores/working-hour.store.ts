import { Injectable } from "@angular/core";
import { observable, action, } from 'mobx';
import { IWorkingHour } from "src/app/interfaces/attendance";
import { IOfficer } from "src/app/interfaces/document/document.interface";
import { DatabaseService } from "src/app/shared/services/database.service";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthStore } from "src/app/stores/auth.store";
import { APPS } from "src/app/dummy/config";
import { Subscription } from "rxjs";


@Injectable({ providedIn: 'root' })
export class WorkingHourStore {
    constructor(
        private ds: DatabaseService,
        private afs: AngularFirestore,
        private auth: AuthStore,
    ) { }
    @observable activeKey = '';
    @observable data: IWorkingHour[] = [];
    @observable officers: IOfficer[] = [];
    @observable tmpOfficers: IOfficer[] = [];

    @observable lastVisible: IWorkingHour;
    @observable empty: boolean = false;

    @observable loading: boolean = true;
    @observable done: boolean = false;
    @observable fetching: boolean = false;
    @observable process: boolean = false;
    @observable searching: boolean = false;


    @observable emptyOfficers: boolean = false;

    @observable workingHour: IWorkingHour;
    @observable getOfficerByWHSubscription: Subscription;
    @observable whSearchSubscription: Subscription;

    @action
    unsubscribe() {
        this.getOfficerByWHSubscription?.unsubscribe();
        this.whSearchSubscription?.unsubscribe();
    }

    @action
    async createOrUpdateWorkingHour(
        workingHour?: IWorkingHour,
        isDelete?: boolean,
    ) {
        try {
            this.process = true;
            if (isDelete) {
                console.log('delete working hour');

                await this.getOfficersByWorkingHour(workingHour.key);

                const batch = this.ds.batch();
                const officeRef = this.ds.officerFireRef();
                const workingHourRef = this.ds.workingHoursFireRef();

                this.officers.map((officer) => {
                    batch.update(officeRef.doc(officer.key), { workingHourKey: null });
                });

                batch.update(workingHourRef.doc(workingHour.key), {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: this.auth.User,
                });

                await batch.commit();
            } else {
                if (workingHour.key) {
                    workingHour.updatedAt = new Date();
                    workingHour.updatedBy = this.auth.User;
                    await this.ds.workingHoursRef().doc(workingHour.key).update(workingHour);
                } else {
                    workingHour.key = this.afs.createId();
                    workingHour.createdAt = new Date();
                    workingHour.createdBy = this.auth.User;
                    await this.ds.workingHoursRef().doc(workingHour.key).set(workingHour);
                }
            }
            this.process = false;
            return true;
        } catch (err) {
            console.log('create or update working hour error: ', err);
            this.process = false;
            return false;
        }
    }

    @action
    async fetchWorkingHour(key: string) {
        try {
            this.fetching = true;
            const docSnap = await this.ds
                .workingHoursRef().doc(key)
                .get()
                .toPromise();
            this.workingHour = docSnap.data();
            this.fetching = false;

        } catch (err) {
            this.fetching = false;
            console.log('fetch working hour error: ', err);
        }
    }


    @action
    async getOfficersByWorkingHour(workingHourKey: string) {
        try {
            this.loading = true;
            this.getOfficerByWHSubscription = this.ds
                .officerByWorkingHourRef(workingHourKey)
                .valueChanges()
                .subscribe(
                    (result) => {
                        let index = 1;
                        this.officers = result.map(
                            (officer) => {
                                officer.rowIndex = index; index++;
                                return officer;
                            });
                        this.emptyOfficers = (this.officers.length === 0);
                        this.loading = false;
                    }
                );
        } catch (err) {
            this.loading = false;
            console.log('fetch officers on working hours by workingHour error: ', err);
        }
    }

    @action
    async fetchOfficersByDepartment(departmentKey: string) {
        try {
            this.fetching = true;
            const querySnap = await this.ds
                .officerByDepartmentRef(departmentKey, this.activeKey)
                .get()
                .toPromise();
            const docs = querySnap.docs;
            let index = 1;
            this.tmpOfficers = docs.map((m) => {
                let item = m.data();
                item.rowIndex = index;
                index++;
                return item;
            });


            this.empty = (this.tmpOfficers.length === 0);
            this.fetching = false;
        } catch (err) {
            this.fetching = false;
            console.log('fetch officers on working hours by department error: ', err);
        }
    }

    @action
    async addWorkingHourToOfficers(officers: IOfficer[], workingHourKey: string, callback) {
        this.process = true;
        const batch = this.ds.batch();
        const officeRef = this.ds.officerFireRef();

        officers.map(m => batch.update(officeRef.doc(m.key), { workingHourKey: m['isSelected'] ? workingHourKey : null }));

        batch.commit().then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        }).finally(() => {
            this.process = false;
        })
    }

    @action
    async removeOfficerFromWorkingHour(officer: IOfficer, callback) {
        this.process = true;
        const officeRef = this.ds.officerRef().doc(officer.key);
        let removeOfficer = officeRef.update({ workingHourKey: null });
        removeOfficer.then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        }).finally(() => {
            this.process = false;
        })
    }

    @action
    async search(value: string) {
        try {
            this.searching = true;
            // this.whSearchSubscription?.unsubscribe();
            this.whSearchSubscription = this.ds.workingHoursSearchRef(value).valueChanges().subscribe((docs) => {
                let index = 1;
                this.data = docs.map((value) => {
                    value['index'] = index;
                    index++;
                    return value;
                });

                this.empty = docs.length === 0;
                this.searching = false;
            })
        } catch (e) {
            this.searching = false;
            console.log('search error: ', e);

        }

    }
}