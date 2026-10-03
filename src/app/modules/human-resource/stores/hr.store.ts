import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { pushToArray } from 'src/app/shared/services/convert.service';

@Injectable({ providedIn: 'root' })
export class HrStore {
    @observable data: IOfficer[] = [];
    @observable empty: boolean = false;
    @observable lastVisible: IOfficer = null;
    @observable fetchDataRef: Subscription = null;
    @observable selectedOfficer: IOfficer = null;
    @observable fetchSelectedOfficerRef: Subscription = null;
    @observable toggleMainL: boolean = false;

    constructor(
        private ds: DatabaseService,
    ) { }

    @action
    async fetchList(ref: AngularFirestoreCollection) {
        const docs = await ref.get().toPromise();
        return pushToArray(docs);
    }

    @action
    async subscribeSelectedOfficer() {
        this.fetchSelectedOfficerRef?.unsubscribe()
        this.selectedOfficer = null;
        Promise.resolve()
    }

    @action
    fetchSelectedOfficer(key: string, callback) {
        this.fetchSelectedOfficerRef?.unsubscribe()
        if (key === 'na') {
            this.selectedOfficer = null;
            callback && callback(this.selectedOfficer)
            return;
        }
        this.fetchSelectedOfficerRef = this.ds.officerRef().doc(key).valueChanges().subscribe(doc => {
            this.selectedOfficer = doc;
            callback && callback(this.selectedOfficer)
        })
    }

    @action
    async unsubscribe(): Promise<void> {
        this.data = [];
        this.empty = false;
        this.lastVisible = null;
        this.fetchDataRef?.unsubscribe()
        Promise.resolve()
    }

    @action
    async fetchData(statusKey: number, workplaceKey: string, searchText: string, callback: (items: any[]) => void) {
        await this.unsubscribe();
        this.fetchDataRef = this.ds.officersRef(statusKey, workplaceKey, null, searchText).valueChanges().subscribe(docs => {
            this.data = docs.map((f, index) => ({
                ...f,
                rowIndex: index + 1,
                uri: f?.file ? transformImageSameTokenNo(f?.file?.downloadUrl || f?.file?.downloadURL, '200').uri : f?.photo ? transformImageSameTokenNo(f?.photo?.downloadUrl || f?.photo?.downloadURL, '200').uri : PHOTO_LIB.EMPTY_AVATAR,
            }));
            if (docs?.length >= APPS.size) {
                this.lastVisible = this.data[this.data.length - 1];
            } else {
                this.lastVisible = null;
            }
            this.empty = this.data?.length === 0;
            callback && callback(this.data)
        })
    }

    @action
    async fetchMore(statusKey: number, workplaceKey: string, callback: (items: any[]) => void) {
        if (!this.lastVisible) return;
        this.fetchDataRef?.unsubscribe();
        this.fetchDataRef = this.ds.officersRef(statusKey, workplaceKey, this.lastVisible, null).valueChanges().subscribe(docs => {
            const lastIndex = this.lastVisible?.rowIndex;
            const items = docs.map((f, index) => ({
                ...f,
                rowIndex: index + 1 + lastIndex,
                uri: f?.file ? transformImageSameTokenNo(f?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY_AVATAR,
            }));
            this.data = this.data.concat(items)
            if (docs?.length >= APPS.size) {
                this.lastVisible = this.data[this.data.length - 1];
            } else {
                this.lastVisible = null;
            }
            callback && callback(this.data)
        })
    }


}
