import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { APPS } from '../dummy/config';
import firebase from 'firebase/compat/app';
import { pushToObject, pushToArray, ConvertService } from '../shared/services/convert.service';
import { DataService } from '../shared/services/data.service';

@Injectable({providedIn:'root'})
export class CompanyStore {
    @observable data: any = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;


    @observable items: Array<any> = [];

    @observable singleData: any;
    @observable deleteProcess: boolean = false;
    @observable empty: boolean = false;
    @observable totalPage: number = 1;
    @observable totalSize: number = 0;
    @observable totalRow: number = 0;
    @observable pageIndex: number = 1;
    @observable coFomData = [];
    @observable departmentData = [];
    @observable countryData = [];
    @observable company: any;


    @observable orderBy: any = "code";
    @observable filterStatus: any = 0;
    @observable lastVisible: any = null;
    @observable firstVisible: any = null;
    @observable startIndex: number = 0;
    @observable startNo: number = 0;

    @observable profile: any = null;
    @observable selectedCompany: any = null;
    @observable histories: Array<any> = [];

    constructor(
        private ds: DataService,

    ) {
        
    }



    @action
    async addItem(collectionName: string, statiticFeild: string, f: any, callback) {
        this.process = true;
        const batch = this.ds.batch();
        const statisticRef = this.ds.statisticBatchRef();
        const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key);
        const StatiticCollection = f.company.key + '_' + statiticFeild
        batch.set(settingRef, f);
        batch.update(statisticRef, { [`${StatiticCollection}`]: firebase.firestore.FieldValue.increment(1) });
        batch.commit().then(() => {
            callback(true, null);
        }).catch((error) => {
            alert(error);
            callback(false, error)
        }).finally(() => {
            this.process = false;
        })
    }

    @action
    fetchRowIndex(index: number) {
        if (index === 0) {
            this.startNo = this.startIndex;
        }
        return this.startIndex + index;
    }
    @action
    deleteBatchData(collectionName: string, statiticFeild: string, f: any, callback) {
        const batch = this.ds.batch();
        const statisticRef = this.ds.statisticBatchRef();
        const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key)

        const StatiticCollection = f.company.key + '_' + statiticFeild
        batch.update(settingRef, { isDelete: true })
        batch.update(statisticRef, { [`${StatiticCollection}`]: firebase.firestore.FieldValue.increment(-1) });
        batch.commit().then(() => {
            callback(true, null);
        }).catch((error) => {
            alert(error);
            callback(false, error)
        }).finally(() => {
            this.process = false;
        })
    }

    @action
    async fetchData(collectionName: string, company, routerName: string, url: any, icon: any, menuName: string, uid: string, statisticName: string, orderBy: string) {
        this.orderBy = orderBy;
        this.loading = true;
        this.lastVisible = null;
        this.filterStatus = 0;
        this.company = company;
        const docs = await this.ds.ListingByCompanyRef(collectionName, company.key, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
        const statisticDoc = await this.ds.environmentRef().get().toPromise();
        const statisticData = pushToObject(statisticDoc);
        this.data = pushToArray(docs);
        this.items = this.data;
        if (!docs.empty) {
            this.lastVisible = this.data[this.data.length - 1];
            this.firstVisible = this.data[0];
        }
        const totalRow = statisticData[`${statisticName}`];
        this.totalRow = totalRow;
        this.totalSize = totalRow;
        const i = parseInt(`${this.totalSize / APPS.size}`);
        const j = this.totalSize % APPS.size > 0 ? 1 : 0;
        this.totalPage = i + j;
        this.pageIndex = 1;
        this.startIndex = 1;
        this.empty = this.data.length === 0;
        this.loading = false;
        this.ds.userprofileRef().doc(uid).collection("histories").doc(routerName).set({
            url: url,
            name: menuName,
            login_date: new Date(),
            page_key: ConvertService.pageKey(),
            key: routerName,
            icon: icon,
        })
    }

    @action
    async fetchNext(collectionName: string) {
        if (this.pageIndex === this.totalPage) return;
        this.loading = true;
        const docs = await this.ds.ListingByCompanyRef(collectionName, this.company.key, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
        if (!docs.empty) {
            this.data = pushToArray(docs);
            this.lastVisible = this.data[this.data.length - 1];
            this.firstVisible = this.data[0];
            this.items = this.items.concat(this.data);
        }
        this.startIndex = (this.pageIndex * APPS.size) + 1;
        this.pageIndex = this.pageIndex + 1;
        this.loading = false;
    }

    @action
    async fetchBack() {
        this.loading = true;
        const dataSize = this.data.length;
        const list = this.items.slice(0, this.items.length - dataSize)
        this.items = list;
        const docs = list.slice(list.length - APPS.size, list.length);
        this.data = docs;
        if (this.data.length > 0) {
            this.lastVisible = this.data[this.data.length - 1];
            this.firstVisible = this.data[0];
        }
        this.pageIndex = this.pageIndex - 1;
        this.startIndex = this.startNo - APPS.size
        this.loading = false;
    }

    @action
    async fetchFilter(collectionName: string, statusKey: any, statisticName: string, orderBy: string) {
        this.loading = true;
        this.lastVisible = null;
        this.orderBy = orderBy;
        this.filterStatus = statusKey;
        const docs = await this.ds.ListingByCompanyRef(collectionName, this.company.key, this.lastVisible, this.orderBy, statusKey).get().toPromise();
        const statisticDoc = await this.ds.environmentRef().get().toPromise();
        const statisticData = pushToObject(statisticDoc);
        this.data = pushToArray(docs);
        this.items = this.data;
        if (!docs.empty) {
            this.lastVisible = this.data[this.data.length - 1];
            this.firstVisible = this.data[0];
        }
        const totalRow = statisticData[`${statisticName}`];
        this.totalRow = totalRow;
        this.totalSize = totalRow;
        const i = parseInt(`${this.totalSize / APPS.size}`);
        const j = this.totalSize % APPS.size > 0 ? 1 : 0;
        this.totalPage = i + j;
        this.pageIndex = 1;
        this.startIndex = 1;
        this.empty = this.data.length === 0;
        this.loading = false;
    }

    @action
    async fetchSearch(collectionName: string, companyKey: string, field: string, search: any) {
        return this.ds.searchListingByCompanyRef(collectionName, companyKey, field, search).valueChanges().subscribe(docs => {
            this.data = docs;
        });
    }

}
