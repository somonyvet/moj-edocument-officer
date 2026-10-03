import { Injectable } from '@angular/core';
import { action, observable } from 'mobx';
import { IAdjustmentHeader, ITransferHeader } from '../interfaces/product.interface';
import { pushToArray, sum } from '../shared/services/convert.service';
import { DataService } from '../shared/services/data.service';

@Injectable({ providedIn: 'root' })
export class InventoryAdjustmentStore {
    @observable public data: any[] = null;
    @observable public loading: boolean = false;
    @observable public empty: boolean = false;
    @observable public done: boolean = false;
    @observable public fetching: boolean = false;
    @observable public process: boolean = false;

    public lastVisible: any = null;

    @observable public adjustmentHeader: any = null;
    @observable public adjustmentItems: any[] = [];
    @observable public totalCost: any = null;
    @observable public totalQty: any = null;

    constructor(
        private ds: DataService,
    ) { }

    @observable fetchAdjustmentHeaderRef: any = null;
    @action
    fetchAdjustmentHeader(key: string, callback?: (header: IAdjustmentHeader) => void) {
        this.fetchAdjustmentHeaderRef = this.ds.stockAdjustmentRef().doc(key)
            .valueChanges()
            .subscribe((doc: IAdjustmentHeader) => {
                this.adjustmentHeader = doc;
                if (callback) callback(doc || null);
            })
    }

    @observable fetchAdjustmentItemRef: any = null;
    @action
    fetchAdjustmentItem(key, callback?) {
        this.fetchAdjustmentItemRef = this.ds.stockAdjustmentRef().doc(key)
            .collection('stock_adjustment_items', ref => ref.orderBy('page_key'))
            .valueChanges()
            .subscribe(docs => {
                this.adjustmentItems = docs;
                this.totalCost = sum(docs, "total")
                this.totalQty = sum(docs, "stockQty")
                if (callback) callback(docs)
            })
    }

    async released(header: IAdjustmentHeader, callback) {
        const batch = this.ds.batch();
        const headerRef = this.ds.stockAdjustmentFireRef().doc(header.key);
        const itemRef = this.ds.stockAdjustmentFireRef().doc(header.key).collection('stock_adjustment_items');
        batch.set(headerRef, header, { merge: true })
        this.adjustmentItems.forEach(m => {
            batch.set(itemRef.doc(m.key), {
                ...m,
                headerKey: header.key,
                movementStatus: header.movementStatus,
                branch: header.branch
            }, { merge: true })
        })
        batch.commit().then(() => {
            this.process = false;
            callback(true, null);
        }).catch(error => {
            this.process = false;
            callback(false, error);
        })
    }

}
