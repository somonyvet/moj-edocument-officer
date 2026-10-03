import { observable, action, } from "mobx";
import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";
import { CriminalService } from "../../criminal-record/services/criminal.service";
import { STATUS_OBJ } from "src/app/dummy/appinfo";

@Injectable({ providedIn: 'root' })
export class OverviewStore {
    @observable empty: boolean = false;
    @observable selectedCriminal: any = null;
    criminalRecordsRef: Subscription = null;
    fetchCitizenRef: Subscription = null;

    constructor(private ds: CriminalService) { }

    @action
    async unsubscribe() {
        this.criminalRecordsRef?.unsubscribe()
        this.selectedCriminal = null;
        Promise.resolve()
    }

    @action
    fetchSelectedCriminal(criminalKey: string, callback?: (item: any) => void) {
        this.criminalRecordsRef?.unsubscribe()
        this.criminalRecordsRef = this.ds.criminalRecordRef().doc(criminalKey).valueChanges().subscribe((item: any) => {
            this.selectedCriminal = item;
            if (item) {
                const showDraft=[STATUS_OBJ?.DRAFT?.key,STATUS_OBJ?.APPLY?.key]?.includes(item?.status?.key)
                this.selectedCriminal = {
                    ...item,
                    showDraft,
                }
            }
            callback?.(this.selectedCriminal)
        })
    }

    @action
    fetchCitizen(key: string, callback?: (item:any) => void) {
      this.fetchCitizenRef?.unsubscribe();
      this.fetchCitizenRef = this.ds.citizensRef().doc(key).valueChanges().subscribe(doc=>{
        callback && callback(doc);
      })
    }
}
