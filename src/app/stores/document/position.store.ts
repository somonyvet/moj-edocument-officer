import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IPosition } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { ConvertService, pushToArray } from 'src/app/shared/services/convert.service';
import { CriminalService } from 'src/app/modules/criminal-record/services/criminal.service';
import { addDays, formatFormDate, MappingService, toDateKey, toEmployee, toYearKey, workingDayMinus } from 'src/app/shared/services/mapping.service';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { AuthStore } from '../auth.store';

@Injectable({ providedIn: 'root' })
export class PositionStore {
    @observable data: IPosition[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: IPosition = null;
    @observable done: boolean = false;
    @observable fetching: boolean = false;

    @observable criminal_folder: any = null;
    @observable criminal_folder_items: any[] = [];

    @observable emptySearch: boolean = false;
    @observable searchResult: any[] = [];
    @observable searching: boolean = true;

    constructor(
        private ds: DatabaseService,
        private db: CriminalService,
        private criminalStore: CriminalApplicationStore,
        private auth: AuthStore,
    ) { }

    @action
    async fetchCriminalCategory() {
        const items = await this.ds.criminalRecordCategoryRef(ref => ref.orderBy('name')).get().toPromise()
        return pushToArray(items)
    }

    @action
    async fetchCriminalCanClassify(item: any) {
        const { release_date_key } = item;
        const items = await this.db.criminalRecordsRef(ref => ref
            .where('folder_key_ref', '==', null)
            .where('application_type.key','==',3)
            .where('withdraw_date_key', '==', release_date_key)
            .orderBy('decree_at')
        ).get().toPromise();
        return pushToArray(items)
    }

    @action
    async searchCriminalForClassify(str: string) {
        str = str.toLocaleUpperCase();
        this.searchResult = [];
        this.emptySearch = false;
        this.searching = true;
        let ref = this.db.criminalRecordsRef(ref => ref
            .where('keyword', 'array-contains', str)
            .where('folder_key_ref', '==', null)
            .where('application_type.key','==',3)
            .where('status.key', '==', STATUS_OBJ.DECREE.key)
            .limit(10)
        )
        const result = await ref.get().toPromise();
        this.searchResult = pushToArray(result);
        if (this.searchResult.length === 0) {
            this.emptySearch = true;
        } else {
            this.emptySearch = false;
        }
        this.searching = false;
    }


    @action
    async fetchCriminalCanClassifyByDate(release_date: any) {
        const items = await this.db.criminalRecordsRef(ref => ref
            .where('folder_key_ref', '==', null)
            .where('application_type.key','==',3)
            .where('withdraw_date_key', '==', ConvertService.toDateKey(release_date))
            .orderBy('decree_at')
        ).get().toPromise();
        const itemsData = pushToArray(items)
        const gItems = MappingService.groupBy(itemsData, 'criminal_folder_no', 'decree_at')
        return {
            items: itemsData,
            gItems: gItems,
        }
    }

    @action
    async fetchCriminalForClassify(item: any, folderKey: any) {
        const { folder_no_items, release_date_key } = item;
        const items = await this.db.criminalRecordsRef(ref => ref.where('folder_key_ref', '==', folderKey)
            .where('withdraw_date_key', '==', release_date_key)
            .where('application_type.key','==',3)
            .where('criminal_folder_no', 'in', folder_no_items).orderBy('decree_at')
        ).get().toPromise();
        return pushToArray(items)
    }

    @action
    unsubscribe(): void {
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
    }

    @action
    checkExist(nameKey: any, field: string) {
        return this.ds.positionFireRef(ref => ref.where(field, '==', nameKey));
    }


    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (businessOwners: Array<IPosition>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.positionRef().valueChanges().subscribe((docs) => {
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
            .positionRef(this.lastVisible)
            .get()
            .toPromise();
        const items = pushToArray(data) as IPosition[];
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
    save(item: IPosition, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.positionRef()
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

    @action
    async saveGroup(folder: any, callback: (status: boolean, error: string) => void) {
        this.process = true;
        const batch = this.ds.batch();
        const items = pushToArray(await this.db.criminalRecordRef(ref => ref.where('folder_key_ref', '==', folder?.key)).get().toPromise());
        items?.map(criminal => {
            const { criminal_record_category } = criminal;
            const { period_process_document, release_date } = folder;
            const created_at_update = addDays(release_date, period_process_document?.key * -1);
            batch.set(this.db.criminalRecordRef().doc(criminal?.key).ref, {
                request_approval_workplace: folder?.request_approval_workplace || criminal?.request_approval_workplace,
                workplaceKeys: folder?.workplaceKeys || criminal?.workplaceKeys,
                workplaces: folder?.workplaces || criminal?.workplaces,
                criminal_record_category: folder?.category_folder || criminal_record_category,
                apply_at: created_at_update,
                review_at: created_at_update,
                created_at: created_at_update,
                date_key: toDateKey(created_at_update),
                withdraw_date: release_date,
                withdraw_date_key: toDateKey(release_date),
                status: STATUS_OBJ.CLASSIFY,
            }, { merge: true })
        })
        batch.set(this.ds.groupRequestFormRef().doc(folder?.key).ref, folder, { merge: true });
        batch.commit().then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        }).finally(() => {
            this.process = false;
        })
    }

    @action
    async deleteGroup(folder: any) {
        const batch = this.ds.batch();
        const items = pushToArray(await this.db.criminalRecordRef(ref => ref.where('folder_key_ref', '==', folder?.key)).get().toPromise());
        items?.map(m => {
            batch.set(this.db.criminalRecordRef().doc(m?.key).ref, {
                folder_key_ref: null,
                folder_by: null,
                folder_at: null,
                status: STATUS_OBJ.DECREE,
            }, { merge: true })
        })
        batch.delete(this.db.groupRequestFormRef().doc(folder?.key).ref)
        return batch.commit()
    }


    @action
    async addCriminalToFolder(criminal: any, folder: any, account: any) {
        const batch = this.ds.batch();
        const { criminal_folder_no, criminal_record_category } = criminal;

        // const holidays = await this.criminalStore?.fetchHoliday(toYearKey(serverDateTime))
        // const created_at_update = addDays(formatFormDate(release_date), period_process_document?.key * -1);
        // const created_at_update = workingDayMinus(holidays, formatFormDate(release_date), period_process_document?.key)

        batch.set(this.db.criminalRecordRef().doc(criminal?.key).ref, {
            folder_key_ref: folder?.key,
            folder_by: account,
            folder_at: this.ds.serverTimestamp(),
            workplaceKeys: folder?.workplaceKeys || criminal?.workplaceKeys,
            workplaces: folder?.workplaces || criminal?.workplaces,
            request_approval_workplace:folder.request_approval_workplace,
            criminal_record_category: folder?.category_folder || criminal_record_category,
            // apply_at: created_at_update,
            // review_at: created_at_update,
            // created_at: created_at_update,
            // date_key: toDateKey(created_at_update),
            // withdraw_date: release_date,
            // withdraw_date_key: toDateKey(formatFormDate(release_date)),
            status: STATUS_OBJ.CLASSIFY,
        }, { merge: true })
        batch.set(this.db.groupRequestFormRef().doc(folder?.key).ref, {
            criminal_records: this.ds.fireFieldValue().arrayUnion(criminal?.key),
            updated_by: account,
            updated_at: this.ds.serverTimestamp(),
            keyword: this.ds.fireFieldValue().arrayUnion(`${criminal_folder_no}`),
            folder_no_items: this.ds.fireFieldValue().arrayUnion(`${criminal_folder_no}`),
        }, { merge: true })
        return batch.commit()
    }

    @action
    removeCriminalFromFolder(criminal: any, folder: any, account: any) {
        const batch = this.ds.batch();
        const { criminal_folder_no } = criminal;
        batch.set(this.db.criminalRecordRef().doc(criminal?.key).ref, {
            folder_key_ref: null,
            folder_by: null,
            folder_at: null,
            status: STATUS_OBJ.DECREE,
            workplaces:[],
            workplaceKeys:[],
            request_approval_workplace:[],
        }, { merge: true })
        batch.set(this.db.groupRequestFormRef().doc(folder?.key).ref, {
            criminal_records: this.ds.fireFieldValue().arrayRemove(criminal?.key),
            keyword: this.ds.fireFieldValue().arrayRemove(`${criminal_folder_no}`),
            folder_no_items: this.ds.fireFieldValue().arrayRemove(`${criminal_folder_no}`),
            updated_by: account,
            updated_at: this.ds.serverTimestamp()
        }, { merge: true })
        return batch.commit()
    }

}
