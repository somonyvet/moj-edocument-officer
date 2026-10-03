import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from "rxjs";
import { PHOTO_LIB } from "src/app/dummy/appinfo";
import { APPS } from "src/app/dummy/config";
import { transformImageSameTokenNo } from "src/app/shared/services/fireStorage.service";
import { fromNow } from "src/app/shared/services/mapping.service";
import { CriminalService } from "../../criminal-record/services/criminal.service";

@Injectable({ providedIn: 'root' })
export class ApplicationStore {
    @observable toggleMainL: boolean = false;
    @observable module: any = null;
    @observable newButtonName: string = `បញ្ចូលពាក្យស្នើសុំ`;
    @observable newIDName: string = ``;
    @observable params: any = null;
    @observable data: any[] = [];
    @observable lastVisible: any = null;
    @observable empty: boolean = false;

    constructor(private ds: CriminalService) { }

    @action
    async unsubscribe() {
        this.fetchCitizensRef?.unsubscribe()
        this.data = []
        this.lastVisible = null;
        Promise.resolve()
    }

    fetchCitizensRef: Subscription = null;
    @action
    async fetchCriminalRecords(uid: string, callback?: (items: any) => void) {
        await this.unsubscribe()
        this.lastVisible = null;
        this.fetchCitizensRef = this.ds.criminalRecordUserListingRef(uid, null).valueChanges().subscribe(docs => {
            this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
            this.empty = this.data.length === 0;
            this.lastVisible = null;
            if (docs.length >= APPS.size) {
                this.lastVisible = this.data[this.data.length - 1];
            }
            callback?.(this.data)
        })
    }


    @action
    fetchMoreCriminalRecords(uid: string, callback?: (items: any) => void) {
        try {
            if (!this.lastVisible) {
                return;
            } else {
                this.fetchCitizensRef?.unsubscribe()
                this.fetchCitizensRef = this.ds.criminalRecordUserListingRef(uid, this.lastVisible).valueChanges().subscribe(data => {
                    const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
                    this.data = this.data.concat(docs)
                    if (docs.length >= APPS.size) {
                        this.lastVisible = this.data[this.data.length - 1]
                    } else {
                        this.lastVisible = null
                    }
                    callback?.(this.data)
                })
            }
        } catch (e) {
            alert(e)
        }
    }

}
