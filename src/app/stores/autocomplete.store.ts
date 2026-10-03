
import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import {  REGISTER_ITEM_STATUS_OBJ } from 'src/app/dummy/status';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { DataService } from '../shared/services/data.service';

@Injectable({providedIn:'root'})
export class AutoCompleteStore {
    @observable data: Array<any> = [];
    @observable filterdata: Array<any> = [];
    @observable filter: Array<any> = [];
    @observable filterdatas: Array<any> = [];
    @observable collectionData: Array<any> = [];
    @observable singleData: any;
    @observable process: boolean = false;
    @observable deleteProcess: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    constructor(private ds: DataService) { }

    @action
    fetchCollectionByCompany(collection: any, companyKey: any, fieldOrder, callback) {
        this.ds.autoCollectionByCompanyRef(collection, companyKey, fieldOrder).valueChanges().subscribe(docs => {
            callback(docs);
        })
    }

    @action
    fetchAutoCompleted(ref: AngularFirestoreCollection, callback) {
        ref.valueChanges().subscribe(docs => {
            this.filterdata = docs;
            callback(docs);
        })
    }

    @action
    fetchAutoData(collection) {
        this.ds.autoColelctionRef(collection).valueChanges().subscribe(data => {
            this.filterdata = data;
        })
    }

    @action
    fetchAutoDataCallBack(collection, callback) {
        this.ds.autoColelctionRef(collection).valueChanges().subscribe(data => {
            this.filterdata = data;
            callback(data);
        })
    }

    @action
    fecthitemsCallback(collectionName: string, companyKey: string, callback) {
        this.ds.fecthitemsMaterial(collectionName, companyKey).valueChanges().subscribe(data => {
            this.filterdata = data;
            callback(data)
        })
    }

    @action
    async fetchSearchCompanyMaterial(collectionName: string, companyKey, field: string, search: any, callback) {
        return this.ds.autosearchListingMaterialRef(collectionName, companyKey, field, search).valueChanges().subscribe(docs => {
            this.filterdata = docs;
            callback(docs)
        });
    }


    @action
    async fetchSearchRegisterCo(companyKey, field, search, callback) {
        return this.ds.autoSearchRegisterCoRef(companyKey, field, search).valueChanges().subscribe(docs => {
            this.filterdata = docs;
            callback(docs)
        });
    }

    @action
    async fetchSearchImportStockItem(companyKey, field, search, callback) {
        return this.ds.autoSearchListingItemRef(companyKey, field, search).valueChanges().subscribe(docs => {
            this.filterdata = docs;
            callback(docs)
        });
    }

    @action
    async fetchSearch(collectionName: string, field: string, search: any, callback) {
        return this.ds.autosearchListingRef(collectionName, field, search).valueChanges().subscribe(docs => {
            this.filterdata = docs;
            callback(docs)
        });
    }
    
    @action
    async sfetchSearch(collectionName: string, field: string, search: any, callback) {
        return this.ds.autosearchListingRef(collectionName, field, search).valueChanges().subscribe(docs => {
            this.filterdatas = docs;
            callback(docs)
        });
    }


    @action
    fecthitems(collectionName: string, companyKey: string, typeKey: any, field: string) {
        this.ds.fecthitems(collectionName, companyKey, typeKey, field).valueChanges().subscribe(data => {
            this.filterdata = data;
        })
    }

    @action
    async fetchSearchByCompany(collectionName: string, companyKey: string, typeKey: any, field: string, search: any, callback) {
        return this.ds.searchfilterListingByCompanyTypeRef(collectionName, companyKey, typeKey, field, search).valueChanges().subscribe(docs => {
            this.filterdata = docs;
            callback(true, docs)
        });
    }

    @action
    fecthitemsF(collectionName: string, companyKey: string, field: string) {
        this.ds.fecthitemsf(collectionName, companyKey, field).valueChanges().subscribe(data => {
            this.filterdata = data;
        })
    }

    @action
    async fetchSearchByCompanyF(collectionName: string, companyKey: string, field: string, search: any, callback) {
        if (search) {
            return this.ds.searchfilterListingByCompanyTypeReff(collectionName, companyKey, field, search).valueChanges().subscribe(docs => {
                this.filterdata = docs;
                callback(docs)
            });
        } else {
            callback([])
        }
    }



    @action
    fecthRegisteritems(collectionName: string, companyKey: string, field: string, condistion: string) {
        this.ds.fecthRegisterItems(collectionName, companyKey, field).valueChanges().subscribe(data => {
            const gdata: any = data;

            switch (condistion) {
                case "register_co":
                    return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_co_form);
                    break;
                case "pickup_bill":
                    return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_pickup_bill);
                    break;
                case "pickup_inspect":
                    return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_pickup_inspection);
                    break;
                case "register_soo":
                    return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_pickup_inspection);
                    break;
                default:
                    // return this.filterdata = gdata
                    break;
            }

        })
    }

    @action
    fecthRegisterCO(collectionName: string, companyKey: string, field: string, condistion: string) {
        this.ds.fecthRegisterCO(collectionName, companyKey, field).valueChanges().subscribe(data => {
            const gdata: any = data;
            switch (condistion) {
                case "register_co":
                    return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_co_form);
                default:
                    // return this.filterdata = gdata
                    break;
            }

        })
    }

    @action
    async fetchRegisterItemSearchByCompany(collectionName: string, companyKey: string, field: string, search: any, condistion: string, callback) {
        if (search) {
            return this.ds.searchfilterRegisterItemByCompanyTypeRef(collectionName, companyKey, field, search).valueChanges().subscribe(data => {
                const gdata: any = data;
                switch (condistion) {
                    case "register_co":
                        return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_co_form);
                        break;
                    case "pickup_bill":
                        return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_pickup_bill);
                        break;
                    case "pickup_inspect":
                        return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_pickup_inspection);
                        break;
                    case "register_soo":
                        return this.filterdata = gdata.filter(m => m.register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key && !m.pending_pickup_inspection);
                        break;
                    default:
                        // return this.filterdata = gdata
                        break;
                }
                callback(data)
            });
        } else {
            callback([])
        }
    }

}


