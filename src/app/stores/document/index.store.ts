import { observable, action, toJS } from 'mobx';
import { Injectable } from '@angular/core';
import { IDepartment, IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS, DOCUMENT_NOTED_OBJECT, DOCUMENT_TYPE_OBJECT, REPORT_PERIOD_OBJECT } from 'src/app/dummy/config';
import { toUserWorkplaceKey } from 'src/app/shared/services/mapping.service';
import { pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';


@Injectable({ providedIn: 'root' })
export class InboxStore {
    @observable documents: IHeaderInformation[] = [];
    @observable documentNoted: IHeaderInformation[] = [];
    @observable documentNotedList: IHeaderInformation[] = [];

    @observable selectedFilterPeriodDocNoted: any = REPORT_PERIOD_OBJECT.this_month;
    @observable selectedFilterStatusDocNoted: any = DOCUMENT_NOTED_OBJECT.all;
    @observable selectedDepartment: IDepartment = null;
    @observable loading: boolean = true;
    @observable lastVisible: IHeaderInformation = null;
    @observable fetching: boolean = false;
    @observable done: boolean = false;

    constructor(
        protected ds: DatabaseService,
    ) { }

    fetchInboxDocumentNotedRef: Subscription = null;
    @action
    fetchInboxDocumentNoted(departmentKey: string, uid: string, callback?: (items: IHeaderInformation[]) => void) {
        this.lastVisible = null;
        this.fetchInboxDocumentNotedRef = this.ds.headerDocumentRef(ref =>
            ref.where('peopleKeys', 'array-contains', uid)
                .where('isDelete', '==', false)
                .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
                .orderBy('created_at', 'desc')
                .limit(APPS.size)
        ).valueChanges().subscribe(docs => {
            this.documentNotedList = docs?.map(doc => {
                return { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
            });
            if (docs.length >= APPS.size) {
                this.lastVisible = this.documentNotedList[this.documentNotedList.length - 1]
            } else {
                this.lastVisible = null
            }
            callback && callback(this.documentNoted)
        })
    }
    @action
    async fetchMore(departmentKey: string, uid: string) {
        if (!this.lastVisible || this.fetching || this.done) return;
        this.fetching = true;
        const data = await this.ds
            .headerDocumentRef(ref => {
                let condition = ref.where('peopleKeys', 'array-contains', uid)
                    .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
                    .where('isDelete', '==', false)
                if (this.lastVisible) {
                    const { created_at } = this.lastVisible
                    condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
                } else {
                    condition = condition.orderBy('created_at', 'desc');
                }
                return condition.limit(APPS.size);
            })
            .get()
            .toPromise();
        const items = pushToArray(data) as IHeaderInformation[];
        if (items.length >= APPS.size) {
            this.lastVisible = items[items.length - 1];
            this.done = false;
        } else {
            this.done = true;
            this.lastVisible = null;
        }
        this.documentNotedList = this.documentNotedList.concat(items?.map(doc => {
            return { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
        }));
        this.fetching = false;
    }

    @action
    unsubscribeInboxDocumentNotedRef() {
        this.fetchInboxDocumentNotedRef && this.fetchInboxDocumentNotedRef.unsubscribe()
        this.lastVisible = null;
    }

    fetchInboxNotedRef: Subscription = null;
    @action
    async fetchInboxNoted(departmentKey: string, uid: string, callback?: (items: IHeaderInformation[]) => void) {
        const department = await this.ds.departmentFireRef().doc(departmentKey).get().toPromise();
        this.selectedDepartment = pushToObject(department) as IDepartment;
        this.fetchInboxNotedRef = this.ds.headerDocumentRef(ref =>
            ref.where('receivedWorkplaceKeys', 'array-contains', uid)
                .orderBy('created_at', 'desc')
                .limit(7)
        ).valueChanges().subscribe((docs: IHeaderInformation[]) => {
            this.documentNoted = docs.map(doc => {
                return { ...doc, coverFile: doc?.coverFile ? { ...doc?.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
            });
            callback && callback(this.documentNoted)
        })
    }

    @action
    unsubscribeInboxNoted() {
        this.fetchInboxNotedRef && this.fetchInboxNotedRef.unsubscribe()
    }

    fetchInboxDocumentsRef: Subscription = null;
    @action
    fetchInboxDocuments(departmentKey: string, uid: string, periodKey: string, callback?: (items: IHeaderInformation[]) => void) {
        this.loading = true;
        this.fetchInboxDocumentsRef = this.ds.headerDocumentRef(ref => {
            let condition = ref
                .where('isDelete', '==', false)
                .where('receivedWorkplaceKeys', 'array-contains', uid)
                .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.MEMO.key)
                .orderBy('created_at', 'desc');
            return condition.limit(APPS.size)
        }).valueChanges().subscribe(docs => {
            this.documents = docs.map(doc => {
                return { ...doc, coverFile: doc?.coverFile ? { ...doc?.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
            });;
            if (docs.length >= APPS.size) {
                this.lastVisible = this.documents[this.documents.length - 1]
            } else {
                this.lastVisible = null
            }
            callback && callback(this.documents)
            this.loading = false;
        })
    }

    @action
    async fetchMoreInbox(departmentKey: string, uid: string) {
        if (!this.lastVisible || this.fetching || this.done) return;
        this.fetching = true;
        const data = await this.ds
            .headerDocumentRef(ref => {
                let condition = ref.where('receivedWorkplaceKeys', 'array-contains', uid)
                    .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.MEMO.key)
                    .where('isDelete', '==', false)
                if (this.lastVisible) {
                    const { created_at } = this.lastVisible
                    condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
                } else {
                    condition = condition.orderBy('created_at', 'desc');
                }
                return condition.limit(APPS.size);
            })
            .get()
            .toPromise();
        const items = pushToArray(data) as IHeaderInformation[];
        if (items.length >= APPS.size) {
            this.lastVisible = items[items.length - 1];
            this.done = false;
        } else {
            this.done = true;
            this.lastVisible = null;
        }
        this.documents = this.documents.concat(items?.map(doc => {
            return { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
        }));
        this.fetching = false;
    }

    @action
    unsubscribeInbox() {
        this.fetchInboxDocumentsRef && this.fetchInboxDocumentsRef.unsubscribe()
        this.documents = [];
    }

}


