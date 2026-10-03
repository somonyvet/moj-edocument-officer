import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { ACCOUNT_PERMISSION_OBJECT, APPS, DOCUMENT_TYPE_OBJECT } from 'src/app/dummy/config';
import { IDocument, IHeaderInformation, ISettings, IStreamDocument, IUserPermission } from 'src/app/interfaces/document/document.interface';
import { ConvertService, orderBy, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { docStatusObj, DOC_CATEGORY_ARRAY, DOC_CATEGORY_OBJ } from 'src/app/dummy/status';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { fromNow, MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from '../auth.store';

@Injectable({ providedIn: 'root' })
export class MemoStore {

    @observable headerPinedDocuments: IHeaderInformation[] = [];
    @observable tabs: any[] = [];
    @observable tabsInbox: any[] = [];
    @observable tabsPreviewInbox: any[] = [];
    @observable tabsPreview: any[] = [];

    @observable data: IHeaderInformation[] = [];
    @observable empty: boolean = false;
    @observable lastVisible: IHeaderInformation = null;
    @observable fetchDataRef: Subscription = null;
    /**TODO: For reply document by create a new report document */
    @observable headerDocument: IHeaderInformation = null;

    @observable fetchDocumentRef: Subscription = null;
    @observable fetchDocumentHeaderRef: Subscription = null;
    @observable fetchDocumentStreamOfficersRef: Subscription = null;
    @observable documentDataDoc: IDocument = null;
    @observable officers: any[] = [];
    @observable incomingFlowOffice: string[] = [];
    @observable internalFlowOffice: string[] = [];
    @observable outgoingFlowOffice: string[] = [];
    @observable documentSections: any[] = [];
    @observable userPermission: any[] = [];
    @observable allUserPermission: any[] = [];
    @observable workplaces: any[] = [];
    @observable userPermissionCompeted: any[] = [];
    @observable documentStreamOfficers: IStreamDocument[] = [];
    @observable documentReceivedWorkplaces: any[] = [];


    @observable documentByParentDoc = [];
    @observable documentParentDoc = null;

    @observable toggleMainL: boolean = false;
    @observable tabKey: string = 'approval';
    @observable emptySearch: boolean = false;
    @observable process: boolean = false;
    @observable finalDocument: any = false;
    @observable periodText: any = null;
    @observable fromDateNum: any = null;
    @observable toDateNum: any = null;

    constructor(
        private ds: DatabaseService,
        private auth: AuthStore,
    ) { }

    @action
    async unsubscribeSelectedDoc(): Promise<void> {
        this.documentDataDoc = null;
        this.headerDocument = null;

        this.incomingFlowOffice = [];
        this.internalFlowOffice = [];
        this.outgoingFlowOffice = [];
        this.documentSections = [];
        this.userPermission = [];
        this.allUserPermission = [];
        this.workplaces = [];
        this.userPermissionCompeted = [];
        this.documentStreamOfficers = [];
        this.documentReceivedWorkplaces = [];

        this.fetchDocumentSectionRef?.unsubscribe()
        this.fetchDocumentRef?.unsubscribe()
        this.fetchDocumentHeaderRef?.unsubscribe()
        this.fetchDocumentStreamOfficersRef?.unsubscribe()
        this.documentAccountPermissionRef?.unsubscribe()
        Promise.resolve()
    }


    @observable fetchDocumentSectionRef: Subscription = null;
    @action
    async fetchDocumentSections(key: string, param: any, callback: (doc: any[]) => void): Promise<void> {
        // const header = pushToObject(await this.ds.headerDocumentRef().doc<IHeaderInformation>(key).get().toPromise());
        this.fetchDocumentSectionRef && this.fetchDocumentSectionRef.unsubscribe()
        this.fetchDocumentSectionRef = this.ds.documentRef().doc(key).collection('sections', ref => ref.orderBy('page_key')).valueChanges().subscribe(data => {
            this.documentSections = data.filter(m => !m?.isRejected);
            this.documentReceivedWorkplaces = data.filter(m => !m?.isRejected && !m?.isHeader && !m?.isInfo);

            // this.tabsInbox = tabs.document_tabs_inbox.map(m => ({ key: m?.key, label: m?.label, path: `/inbox/preview/${header?.key}/${header?.workplace?.key}/${param?.isParent}/design/${m?.key}` }))
            // this.tabsPreviewInbox = tabs.document_tabs_inbox.map(m => ({ key: m?.key, label: m?.label, path: `/document/preview/${header?.key}/${header?.workplace?.key}/${param?.isParent}/design/${m?.key}` }))
            // const documentTabsPreview = tabs.document_tabs_preview.filter(m => m.key !== "workplaces")
            // this.tabsPreview = documentTabsPreview.map(m => ({ key: m?.key, label: m?.label, path: `/document/${header?.key}/${m?.key}` }))
            // this.tabs = tabs.document_tabs_no_task.map(m => ({ key: m?.key, label: m?.label, path: `/documents/form/${header?.key}/${header?.workplace?.key}/design/${m?.key}` }))
            // if (this.documentSections.find(m => m?.type?.key === 8 && !m?.isHeader && !m?.isInfo)) {
            //   this.tabs = tabs.document_tabs.map(m => ({ key: m?.key, label: m?.label, path: `/documents/form/${header?.key}/${header?.workplace?.key}/design/${m?.key}` }))

            //   this.tabsPreview = tabs.document_tabs_preview.map(m => ({ key: m?.key, label: m?.label, path: `/document/${header?.key}/${m?.key}` }))
            // }
            //   this.tabsPreview = tabs.document_tabs_preview.map(m => ({ key: m?.key, label: m?.label, path: `/document/${header?.key}/${m?.key}` }))
            // }

            callback && callback(this.documentSections)
        })
    }

    @observable fetchDocumentByParentsRef: Subscription = null;
    @action
    async fetchDocumentByParents(docKey: string) {
        const documentByParentData = await this.ds.documentHeaderRef(ref => ref.where('doc_parentData', 'array-contains', docKey)).get().toPromise()
        this.documentByParentDoc = pushToArray(documentByParentData);
        this.documentParentDoc = this.documentByParentDoc.find((f: any) => f?.doc_parent === null) as any;
        return this.documentByParentDoc
    }

    @action
    fetchDocumentStreamOfficers(headerKey: string, callback: (doc: IStreamDocument[]) => void) {
        this.fetchDocumentStreamOfficersRef && this.fetchDocumentStreamOfficersRef.unsubscribe()
        this.fetchDocumentStreamOfficersRef = this.ds.headerDocumentOfficerCheckedRef(headerKey, ref => ref.orderBy('profile.position.order')).valueChanges().subscribe(data => {
            this.documentStreamOfficers = (data as IStreamDocument[]);
            callback && callback(this.documentStreamOfficers)
        })
    }

    @action
    async fetchDocumentsDoc(key: string, callback: (doc: IDocument) => void) {
        this.fetchDocumentRef?.unsubscribe()
        this.fetchDocumentRef = this.ds.documentRef().doc<IDocument>(key).valueChanges().subscribe(data => {
            this.documentDataDoc = data;
            callback && callback(this.documentDataDoc)
        })
    }

    @observable documentAccountPermissionRef: Subscription = null;
    @action
    fetchDocumentAccountPermission = async (header: IHeaderInformation, config: ISettings, callback: (doc: IUserPermission[]) => void) => {
        this.documentAccountPermissionRef = this.ds.documentAccountPermissionRef(header?.key, ref => ref.orderBy('created_at')).valueChanges().subscribe(data => {
            this.userPermission = MappingService.orderByDesc(data.filter(m => !m.isDelete), 'approval_order');
            this.allUserPermission = data;
            this.userPermissionCompeted = this.userPermission.filter(m => m?.completedTask === true)
            this.workplaces = this.getWorkPlace(header?.workplaces, config)
            callback && callback(this.userPermission)
        })
    }

    @observable moreDocuments: any[] = [];
    @observable moreDocumentsRef: Subscription = null;
    @action
    fetchMoreDocuments = async (header: IHeaderInformation) => {
        this.moreDocumentsRef?.unsubscribe()

        if (!header?.more_report_headerRef) {
            this.moreDocuments = []
            return
        }
        this.moreDocumentsRef = this.ds.headerDocumentRef(ref => ref.where("more_report_headerRef", "==", header?.more_report_headerRef)).valueChanges().subscribe(data => {
            this.moreDocuments = orderBy(data.filter(m => !m.isDelete), 'created_at');
        })
    }

    getWorkPlace(workplaces, config) {
        return (workplaces?.filter(m => m?.ranking?.order >= config?.startFromLevel?.order) || [])
            .map(m => {
                const hasApproved = this.userPermission?.find(r => r?.workplaceKey === m?.key && r?.permission?.key !== ACCOUNT_PERMISSION_OBJECT.readOnly?.key)
                if (!m?.isActive) return { ...m, hasApproved: true }
                return { ...m, hasApproved: hasApproved ? true : false }
            });
    }

    @action
    async fetchDocumentHeader(headerKey: string, callback: (doc: IHeaderInformation) => void) {
        // await this.unsubscribeSelectedDoc()
        // const doc = pushToObject(await this.ds.headerDocumentRef().doc<IHeaderInformation>(headerKey).get().toPromise());
        // const { uid } = this.auth;
        // this.headerDocument = doc ? {
        //     ...doc,
        //     photoUrl: doc?.owner_profile?.file?.downloadUrl ? transformImageSameTokenNo(doc?.owner_profile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY,
        //     amTimeAgo: fromNow(doc?.created_at?.toDate(), true),
        //     isChecked: doc?.visitor_keys?.find(m => m === uid) ? true : false,
        // } : null;
        // if (doc) {
        //     const { incomingFlowOffice, internalFlowOffice, outgoingFlowOffice } = doc;
        //     this.incomingFlowOffice = incomingFlowOffice || [];
        //     this.internalFlowOffice = internalFlowOffice || [];
        //     this.outgoingFlowOffice = outgoingFlowOffice || [];
        // } else {
        //     this.incomingFlowOffice = [];
        //     this.internalFlowOffice = [];
        //     this.outgoingFlowOffice = [];
        //     this.documentSections = [];
        // }
        // callback && callback(this.headerDocument)
        const { uid } = this.auth;

        this.fetchDocumentHeaderRef && this.fetchDocumentHeaderRef.unsubscribe()
        this.fetchDocumentHeaderRef = this.ds.headerDocumentRef().doc<IHeaderInformation>(headerKey).valueChanges().subscribe(doc => {
            this.finalDocument = doc?.final || false
            this.headerDocument = doc ? {
                ...doc,
                photoUrl: doc?.owner_profile?.file?.downloadUrl ? transformImageSameTokenNo(doc?.owner_profile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY,
                amTimeAgo: fromNow(doc?.created_at?.toDate(), true),
                isChecked: doc?.visitor_keys?.find(m => m === uid) ? true : false,
            } : null;
            if (doc) {
                const { incomingFlowOffice, internalFlowOffice, outgoingFlowOffice } = doc;
                this.incomingFlowOffice = incomingFlowOffice || [];
                this.internalFlowOffice = internalFlowOffice || [];
                this.outgoingFlowOffice = outgoingFlowOffice || [];
            } else {
                this.incomingFlowOffice = [];
                this.internalFlowOffice = [];
                this.outgoingFlowOffice = [];
                this.documentSections = [];
            }
            callback && callback(this.headerDocument)
        })
    }

    @action
    async unsubscribe(): Promise<void> {
        this.data = [];
        this.empty = false;
        this.lastVisible = null;
        this.headerDocument = null;
        this.fetchDataRef?.unsubscribe()
        Promise.resolve()
    }

    @action
    async fetchPinedDocument(uid: string) {
        await this.unsubscribe();
        this.fetchDataRef = this.ds.userPinedRef(uid, ref => ref.orderBy('created_at', 'desc').limit(APPS.limitSD))
            .valueChanges().subscribe(async data => {
                if (Array.isArray(data) && data.length > 0) {
                    this.headerPinedDocuments = []
                    await Promise.all(data.map(async (item: any) => {
                        const docItem = await pushToObject(await this.ds.headerDocumentRef(ref => ref.where("isDelete", "==", false)).doc(item.key).get().toPromise())
                        if (docItem) this.headerPinedDocuments.push(docItem)
                    }))
                    this.headerPinedDocuments = this.headerPinedDocuments

                    this.data = this.headerPinedDocuments.map((f, index) => ({
                        ...f,
                        rowIndex: index + 1
                    }));
                } else {
                    this.headerPinedDocuments = []
                    this.data = []
                }

                this.empty = this.data?.length === 0;
            })
    }

    @action
    async fetchData(uid: string, workplaceKey: string, params: any, callback: (items: any[]) => void) {
        await this.unsubscribe();
        const { tabKey, docTypeKey } = params;
        this.fetchDataRef = this.ds.headerDocumentRef(ref => {
            let condition = ref
                .where('isDelete', '==', false)
                .where('document_category.key', '==', DOC_CATEGORY_OBJ.edoc.key)
            if (tabKey === 'approval') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where('approvedByKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.released.key)
                        break;
                    case 'urgent':
                        condition = condition
                            .where('approvedByKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.released.key)
                            .where('priority.key', '==', 2)
                        break;
                    case 'confirm':
                        condition = condition
                            .where('completedByKeys', 'array-contains', uid)
                            .where('doc_status.key', '!=', docStatusObj.hold.key)
                            .orderBy('doc_status.key')
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'received-document') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where('receivedWorkplaceKeys', 'array-contains', uid)
                        // .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.MEMO.key)
                        break;
                    case 'urgent':
                        condition = condition
                            .where('receivedWorkplaceKeys', 'array-contains', uid)
                            // .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.MEMO.key)
                            .where('priority.key', '==', 2)
                        break;
                    case 'report':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'urgent') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where("peopleKeys", "array-contains", uid)
                            .where("priority.key", "==", 2)
                            .orderBy("doc_status.key")
                        break;

                    default:
                        break;
                }
            } else if (tabKey === 'my-files') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                        break;
                    case 'in_progress':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.released.key)
                        break;
                    case 'approved':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('final', '==', true)
                        break;
                    case 'void':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.void.key)
                        break;
                    case 'done':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.final.key)
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'cc-files') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where('ccKeys', 'array-contains', uid)
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'archived') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where("peopleKeys", "array-contains", uid)
                            .where("doc_parent", "==", null)
                        break;

                    default:
                        break;
                }
            } else if (tabKey === 'rejected') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where("peopleKeys", "array-contains", uid)
                            .where("doc_status.key", "==", docStatusObj.void.key)
                        break;

                    default:
                        break;
                }
            }

            if (this.lastVisible) {
                const { created_at } = this.lastVisible
                condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
            } else {
                condition = condition.orderBy('created_at', 'desc');
            }
            return condition.limit(APPS.size)
        }).valueChanges().subscribe(docs => {
            this.data = docs.map((f, index) => ({
                ...f,
                rowIndex: index + 1,
                photoUrl: f?.owner_profile?.file?.downloadUrl ? transformImageSameTokenNo(f?.owner_profile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY,
                amTimeAgo: fromNow(f?.created_at?.toDate(), true),
                isChecked: f?.visitor_keys?.find(m => m === uid) ? true : false,
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
    async fetchMore(uid: string, workplaceKey: string, params: any, callback: (items: any[]) => void) {
        if (!this.lastVisible) return;
        this.fetchDataRef?.unsubscribe();
        const { tabKey, docTypeKey } = params;
        this.fetchDataRef = this.ds.headerDocumentRef(ref => {
            let condition = ref
                .where('isDelete', '==', false)
                .where('document_category.key', '==', DOC_CATEGORY_OBJ.edoc.key)

            if (tabKey === 'approval') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where('approvedByKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.released.key)
                        break;

                    case 'urgent':
                        condition = condition
                            .where('approvedByKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.released.key)
                            .where('priority.key', '==', 2)
                        break;
                    case 'confirm':
                        condition = condition
                            .where('completedByKeys', 'array-contains', uid)
                            .where('doc_status.key', '!=', docStatusObj.hold.key)
                            .orderBy('doc_status.key')
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'received-document') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where('receivedWorkplaceKeys', 'array-contains', uid)
                            .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.MEMO.key)
                        break;
                    case 'report':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'urgent') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where("peopleKeys", "array-contains", uid)
                            .where("priority.key", "==", 2)
                            .orderBy("doc_status.key")
                        break;

                    default:
                        break;
                }
            } else if (tabKey === 'my-files') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                        break;
                    case 'in_progress':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.released.key)
                        break;
                    case 'approved':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('final', '==', true)
                        break;
                    case 'void':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.void.key)
                        break;
                    case 'done':
                        condition = condition
                            .where('peopleKeys', 'array-contains', uid)
                            .where('doc_status.key', '==', docStatusObj.final.key)
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'archived') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where("peopleKeys", "array-contains", uid)
                            .where("doc_status.key", "==", docStatusObj.final.key)
                        break;

                    default:
                        break;
                }
            } else if (tabKey === 'rejected') {
                switch (docTypeKey) {
                    case 'all':
                        condition = condition
                            .where("peopleKeys", "array-contains", uid)
                            .where("doc_status.key", "==", docStatusObj.void.key)
                        break;

                    default:
                        break;
                }
            }

            if (this.lastVisible) {
                const { created_at } = this.lastVisible
                condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
            } else {
                condition = condition.orderBy('created_at', 'desc');
            }
            return condition.limit(APPS.size)
        }).valueChanges().subscribe(docs => {
            const lastIndex = this.lastVisible?.rowIndex;
            const items = docs.map((f, index) => ({
                ...f,
                rowIndex: index + 1 + lastIndex,
                photoUrl: f?.owner_profile?.file?.downloadUrl ? transformImageSameTokenNo(f?.owner_profile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY,
                amTimeAgo: fromNow(f?.created_at?.toDate(), true),
                isChecked: f?.visitor_keys?.find(m => m === uid) ? true : false,
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

    @action
    async fetchSearch(uid: string, workplaceKey: string, params: any, searchText: string, stopRecursive: boolean, callback: (items: any[]) => void) {
        this.emptySearch = true;
        await this.unsubscribe();
        const { tabKey, docTypeKey } = params;
        this.fetchDataRef = this.ds.headerDocumentRef(ref => {
            let condition = ref
                .where('isDelete', '==', false)
                .where('document_category.key', '==', DOC_CATEGORY_OBJ.edoc.key)
            if (searchText) {
                searchText = searchText.toLocaleUpperCase();
                condition = condition.where('keyword', 'array-contains', searchText)
            }
            if (tabKey === 'approval') {
                switch (docTypeKey) {
                    case 'all':
                        if (searchText) {
                            condition = condition
                                .where('doc_status.key', '==', docStatusObj.released.key)
                        } else {
                            condition = condition
                                .where('approvedByKeys', 'array-contains', uid)
                                .where('doc_status.key', '==', docStatusObj.released.key)
                        }
                        break;
                    case 'urgent':
                        if (searchText) {
                            condition = condition
                                .where('doc_status.key', '==', docStatusObj.released.key)
                                .where('priority.key', '==', 2)
                        } else {
                            condition = condition
                                .where('approvedByKeys', 'array-contains', uid)
                                .where('doc_status.key', '==', docStatusObj.released.key)
                                .where('priority.key', '==', 2)
                        }
                        break;
                    case 'confirm':
                        if (searchText) {
                            condition = condition
                                .where('doc_status.key', '!=', docStatusObj.hold.key)
                                .orderBy('doc_status.key')
                        } else {
                            condition = condition
                                .where('completedByKeys', 'array-contains', uid)
                                .where('doc_status.key', '!=', docStatusObj.hold.key)
                                .orderBy('doc_status.key')
                        }
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'received-document') {
                switch (docTypeKey) {
                    case 'all':
                        if (searchText) {
                            condition = condition
                                .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.MEMO.key)
                        }
                        else {
                            condition = condition
                                .where('receivedWorkplaceKeys', 'array-contains', uid)
                                .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.MEMO.key)
                        }
                        break;
                    case 'report':
                        if (searchText) {
                            condition = condition
                                .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
                        } else {
                            condition = condition
                                .where('peopleKeys', 'array-contains', uid)
                                .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
                        }
                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'urgent') {
                switch (docTypeKey) {
                    case 'all':
                        if (searchText) {
                            condition = condition
                                .where("priority.key", "==", 2)
                                .orderBy("doc_status.key")
                        }
                        else {
                            condition = condition
                                .where("peopleKeys", "array-contains", uid)
                                .where("priority.key", "==", 2)
                                .orderBy("doc_status.key")
                        }

                        break;

                    default:
                        break;
                }
            } else if (tabKey === 'my-files') {
                switch (docTypeKey) {
                    case 'all':
                        if (searchText) {

                        }
                        else {
                            condition = condition
                                .where('peopleKeys', 'array-contains', uid)
                        }
                        break;
                    case 'in_progress':
                        if (searchText) {
                            condition = condition
                                .where('doc_status.key', '==', docStatusObj.released.key)
                        }
                        else {
                            condition = condition
                                .where('peopleKeys', 'array-contains', uid)
                                .where('doc_status.key', '==', docStatusObj.released.key)
                        }

                        break;
                    case 'approved':
                        if (searchText) {
                            condition = condition
                                .where('final', '==', true)
                        }
                        else {
                            condition = condition
                                .where('peopleKeys', 'array-contains', uid)
                                .where('final', '==', true)
                        }
                        break;
                    case 'void':
                        if (searchText) {
                            condition = condition
                                .where('doc_status.key', '==', docStatusObj.void.key)
                        }
                        else {
                            condition = condition
                                .where('peopleKeys', 'array-contains', uid)
                                .where('doc_status.key', '==', docStatusObj.void.key)
                        }

                        break;
                    case 'done':
                        if (searchText) {
                            condition = condition
                                .where('doc_status.key', '==', docStatusObj.final.key)
                        }
                        else {
                            condition = condition
                                .where('peopleKeys', 'array-contains', uid)
                                .where('doc_status.key', '==', docStatusObj.final.key)
                        }

                        break;
                    default:
                        break;
                }
            } else if (tabKey === 'archived') {
                switch (docTypeKey) {
                    case 'all':
                        if (searchText) {
                            condition = condition
                                .where("doc_status.key", "==", docStatusObj.final.key)
                        }
                        else {
                            condition = condition
                                .where("peopleKeys", "array-contains", uid)
                                .where("doc_status.key", "==", docStatusObj.final.key)
                        }

                        break;

                    default:
                        break;
                }
            } else if (tabKey === 'rejected') {
                switch (docTypeKey) {
                    case 'all':
                        if (searchText) {
                            condition = condition
                                .where("doc_status.key", "==", docStatusObj.void.key)
                        } else {
                            condition = condition
                                .where("peopleKeys", "array-contains", uid)
                                .where("doc_status.key", "==", docStatusObj.void.key)
                        }
                        break;

                    default:
                        break;
                }
            }

            if (this.lastVisible) {
                const { created_at } = this.lastVisible
                condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
            } else {
                condition = condition.orderBy('created_at', 'desc');
            }
            return condition.limit(APPS.size)
        }).valueChanges().subscribe(docs => {

            //filter only document that user can access;
            this.data = docs.map((f, index) => ({
                ...f,
                rowIndex: index + 1,
                photoUrl: f?.owner_profile?.file?.downloadUrl ? transformImageSameTokenNo(f?.owner_profile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY,
                amTimeAgo: fromNow(f?.created_at?.toDate(), true),
                isChecked: f?.visitor_keys?.find(m => m === uid) ? true : false,
            })).filter(f => {
                if (tabKey === 'approval') {
                    switch (docTypeKey) {
                        case 'all':
                            return f?.approvedByKeys?.find(i => i === uid)
                            break;
                        case 'urgent':
                            return f?.approvedByKeys?.find(i => i === uid)
                            break;
                        case 'confirm':
                            return f?.completedByKeys?.find(i => i === uid)
                            break;
                        default:
                            break;
                    }
                } else if (tabKey === 'received-document') {
                    switch (docTypeKey) {
                        case 'all':
                            return f?.receivedWorkplaceKeys?.find(i => i === uid)
                            break;
                        case 'report':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;
                        default:
                            break;
                    }
                } else if (tabKey === 'urgent') {
                    switch (docTypeKey) {
                        case 'all':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;

                        default:
                            break;
                    }
                } else if (tabKey === 'my-files') {
                    switch (docTypeKey) {
                        case 'all':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;
                        case 'in_progress':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;
                        case 'approved':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;
                        case 'void':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;
                        case 'done':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;
                        default:
                            break;
                    }
                } else if (tabKey === 'archived') {
                    switch (docTypeKey) {
                        case 'all':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;
                        default:
                            break;
                    }
                } else if (tabKey === 'rejected') {
                    switch (docTypeKey) {
                        case 'all':
                            return f?.peopleKeys?.find(i => i === uid)
                            break;

                        default:
                            break;
                    }
                }
            });
            if ((docs?.length >= APPS.size) && this.data?.length === 0) {
                if (!stopRecursive) {
                    this.lastVisible = docs[docs?.length - 1]
                    this.fetchSearch(uid, workplaceKey, params, searchText, true, res => { })
                }
            } else {
                this.lastVisible = null;
            }
            this.emptySearch = this.data?.length === 0;
            callback && callback([])
        })
    }

    @action
    priorityDocument(status: any, uid: string, callback: (status: boolean, error: string) => void) {
        this.process = true;
        this.ds.headerDocumentRef().doc(this.headerDocument.key).update({
            priority: status,
            updated_by: uid,
            updated_at: this.ds.serverTimestamp(),
        }).then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        }).finally(() => {
            this.process = false;
        })
    }

    @action
    async pinAndUnpinDocument(uid: string, document: IHeaderInformation, callback: (status: boolean, error: string) => void) {
        this.process = true;
        const userPinDoc = await this.ds.userPinedRef(uid).doc(document.key).get().toPromise();
        if (userPinDoc.exists) {
            this.ds.userPinedRef(uid).doc(document.key).delete().then(() => {
                callback(true, null)
            }).catch(error => {
                callback(false, error)
            }).finally(() => {
                this.process = false;
            })
        } else {
            this.ds.userPinedRef(uid).doc(document.key).set({
                key: document.key,
                created_at: this.ds.serverTimestamp(),
                date_key: ConvertService.toDateKey(new Date()),
                page_key: ConvertService.pageKey(),
                keyword: document?.keyword || [],
            }, { merge: true }).then(() => {
                callback(true, null)
            }).catch(error => {
                callback(false, error)
            }).finally(() => {
                this.process = false;
            })
        }
    }

}
