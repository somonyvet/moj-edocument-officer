import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { ISettings } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
    @observable data:ISettings=null;
    @observable process: boolean = false;
    @observable loading: boolean = true;

    constructor(
        private ds: DatabaseService,
    ) { }

    @action
    unsubscribe(): void {
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
    }


    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(callback?: (settings: ISettings) => void): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.settingsRef().valueChanges().subscribe((docs) => {
            this.data =docs;
            callback && callback(this.data);
        });
    }

    @action
    save(item: ISettings, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.settingsRef()
            .set(item, { merge: true })
            .then(() => {
                callback(true, null)
            }).catch(error => {
                callback(false, error)
            }).finally(() => {
                this.process = false;
            })
    }
}
