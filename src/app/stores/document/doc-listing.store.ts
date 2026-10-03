import { observable, action, toJS, } from 'mobx';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LIST_TYPE } from 'src/app/dummy/status';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';

@Injectable({ providedIn: 'root' })
export class DocListingStore {
    @observable data = [];
    @observable process: boolean = false;
    @observable loading: boolean = true;
    @observable empty: boolean = false;
    @observable lastVisible: any = null;
    @observable done: boolean = false;
    @observable fetching: boolean = false;

    @observable total = null;

    constructor(
        private ds: DatabaseService,
        private db: AngularFirestore
    ) { }

    @observable fetchApprovalDocumentRef: Subscription = null;
    @action
    fetchApprovalDocument(uid: string, field: string, isReleased: boolean) {
        this.loading = true;
        this.fetchApprovalDocumentRef && this.fetchApprovalDocumentRef.unsubscribe()
        this.fetchApprovalDocumentRef = this.ds.documentApprovalRef(uid, this.lastVisible, field, isReleased).valueChanges().subscribe(docs => {
            this.data = docs?.map((doc: any) => {
                return { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
            })
            this.empty = docs.length === 0;
            if (docs.length >= APPS.size) {
                this.lastVisible = docs[docs.length - 1];
                this.done = false;
            } else {
                this.done = true;
                this.lastVisible = null;
            }
            this.loading = false;
        })
    }

    @action
    async fetchApprovalDocumentMore(uid: string, field: string, isReleased: boolean) {
        if (!this.lastVisible || this.fetching || this.done) return;
        this.fetching = true;
        const items = pushToArray(await this.ds.documentApprovalRef(uid, this.lastVisible, field, isReleased).get().toPromise());
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
    async updateTestData() {

        // const array = ["YqZ9NDcRVQRGl69hSTkR", "vu8nDWoM4vraL7khwfiF"]
        // const doc = await this.ds.dbRef().collection("users", ref => ref
        //     .where("keyword", "array-contains-any", array)
        //     .where("keywordData", "array-contains", "SPS")
        // ).get().toPromise()
        // const data = pushToArray(doc)

        // const userKey = "5fYll47Zyl6GoVGjW075"

        // const array = ["YqZ9NDcRVQRGl69hSTkR", "vu8nDWoM4vraL7khwfiF"]
        // // const array = [
        // //     { key: "CAMM", total: 1 },
        // //     { key: "THA", total: 3 },
        // // ]

        // const obj1 = {
        //     ABA: {
        //         key: "ABA",
        //         name: "ABA",
        //         total: 1,
        //     }
        // }

        // const obj2 = {
        //     ABC: {
        //         key: "ABC",
        //         name: "ABC",
        //         total: 1,
        //     }
        // }

        // this.ds.dbRef().collection("users").doc(userKey).set({
        //     // keyword: this.ds.fireFieldValue().arrayUnion(...array)
        //     // items: this.ds.fireFieldValue().arrayUnion(...array),

        //     // 'items': this.ds.fireFieldValue().arrayUnion([{
        //     //     'total': this.ds.fireFieldValue().increment(1),
        //     //     'key': "CAM",
        //     // }])

        //     [`items.ABA.total`]: this.ds.fireFieldValue().increment(1)

        // }, { merge: true }).then(() => {
        //     console.log('done');
        // })

    }

    @action
    unsubscribe(): void {
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.data = [];
        this.loading = true;
        this.empty = false;
        this.done = false;
        this.lastVisible = null;
    }

    @observable fetchDataRef: Subscription = null;
    @action
    fetchData(user: any, currentDepartment: any, listType: any, callback?: any): void {
        this.loading = true;
        this.fetchDataRef && this.fetchDataRef.unsubscribe();
        this.fetchDataRef = this.ds.documentListingRef(user, currentDepartment, listType, null).valueChanges().subscribe((docs) => {
            if (listType.key === LIST_TYPE.recent_docs.key && docs && docs.length > 0) {
                docs.forEach(async (m: any, index) => {
                    const docItem = await this.ds.dbRef().collection("documents_header", ref => ref.where("isDelete", "==", false)).doc(m.key).get().toPromise()
                    const dataItem = pushToObject(docItem)

                    if (dataItem) {
                        this.data.push({
                            ...dataItem,
                            index: index + 1
                        })
                    }
                })
            } else {

                let docItem = docs
                if (listType.key === LIST_TYPE.not_yet_approved_doc.key && docs && docs.length > 0) {
                    docItem = docs.filter((m: any) => {
                        const workplaces = m.workplaces
                        return (workplaces.find((m: any) => m?.key === currentDepartment?.key && m?.isActive))
                    })

                    this.total = docItem.length || 0
                }

                this.data = docItem.map((m: any, index) => ({ ...m, index: index + 1 }));
            }

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
    async fetchMore(user: any, currentDepartment: any, listType: any): Promise<void> {
        if (!this.lastVisible || this.fetching || this.done) return;
        this.fetching = true;
        const data = await this.ds
            .documentListingRef(user, currentDepartment, listType, null)
            .get()
            .toPromise();
        const items = pushToArray(data) as Array<any>;
        if (items.length >= APPS.size) {
            this.lastVisible = items[items.length - 1];
            this.done = false;
        } else {
            this.done = true;
            this.lastVisible = null;
        }

        if (listType.key === LIST_TYPE.recent_docs.key && items && items.length > 0) {

            items.forEach(async (m: any, index) => {
                const docItem = await this.ds.dbRef().collection("documents_header", ref => ref.where("isDelete", "==", false)).doc(m.key).get().toPromise()
                const dataItem = pushToObject(docItem)

                if (dataItem) {
                    this.data = this.data.concat(
                        [
                            {
                                ...dataItem,
                                index: index + 1
                            }
                        ]
                    );
                }
            })
        } else {

            let docItem = items
            if (listType.key === LIST_TYPE.not_yet_approved_doc.key && items && items.length > 0) {
                docItem = items.filter((m: any) => {
                    const workplaces = m.workplaces
                    return (workplaces.find((m: any) => m?.key === currentDepartment?.key && m?.isActive))
                })
            }

            this.data = this.data.concat(
                docItem.map((m, index) => ({ ...m, index: index + 1 }))
            );
        }

        this.fetching = false;
    }

}
