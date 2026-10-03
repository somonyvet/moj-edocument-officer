import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { IQuarter } from '../interfaces/document.interface';

@Injectable({ providedIn: 'root' })
export class TimeScopeStore {
    @observable data: any[] = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;

    constructor(
        private ds: DatabaseService,
    ) { }

    @action
    unsubscribe(): void {
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
    }

    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (businessOwners: Array<IQuarter>) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.quarterRef(ref => ref.orderBy('order')).valueChanges().subscribe((docs) => {
            this.data = docs.map((m: any, index) => ({ ...m, index: index + 1 }));
            this.loading = false;
            this.empty = docs.length === 0;
            callback && callback(this.data);
        });
    }

    @action
    delete(item: IQuarter) {
        return this.ds.quarterRef().doc(item?.key).delete()
    }

}
