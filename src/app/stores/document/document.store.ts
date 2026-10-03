import { async } from '@angular/core/testing';
import { IBlockNote, IUpdate } from './../../interfaces/document/document.interface';
import { observable, action, toJS, } from 'mobx';
import { Injectable } from '@angular/core';
import { IComment, IDepartment, IDocument, IHeaderInformation, IHeaderMovement, IInstitution, IOfficer, IReplyDocument, ISettings, IStreamDocument, IUserPermission, IViewer } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { docStatusObj, requestEditStatus } from 'src/app/dummy/status';
import { ConvertService, orderBy, pushObjArray, pushStringArray, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { Subscription, merge, BehaviorSubject, Observable } from 'rxjs';
import { ACCOUNT_PERMISSION_OBJECT, APPS, DOCUMENT_NOTED_OBJECT, FLOW_TYPE_OBJECT, OFFICE_OR_OFFICER_OBJECT, REPORT_PERIOD_OBJECT, WORKPLACE_FEATURES_OBJ } from 'src/app/dummy/config';
import { MappingService, groupBy, toDepartmentNoWorkplace, toFlatten, toOfficer, toUniq, toUserWorkplaceKey, pageKey, getFromDateToDate, toEmployee, toWorkplace, fromNow } from 'src/app/shared/services/mapping.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { tabs } from 'src/app/dummy/tabs';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { ISearchDocument } from 'src/app/interfaces/settings';
import { FlatTreeControl } from '@angular/cdk/tree';
import { map } from 'rxjs/operators';
import { CollectionViewer, SelectionChange, DataSource } from '@angular/cdk/collections';
import { AuthStore } from '../auth.store';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';

@Injectable({ providedIn: 'root' })
export class DocumentStore {
  @observable tabs: any[] = [];
  @observable tabsInbox: any[] = [];
  @observable tabsPreviewInbox: any[] = [];
  @observable tabsPreview: any[] = [];
  @observable done: boolean = false;
  //for form data
  @observable documentAccounts: any[] = [];
  @observable documentWorkplaces: any[] = [];
  @observable documentAssistantAccounts: any[] = [];

  @observable params: any = null;
  @observable selectedDepartment: IDepartment = null;
  @observable selectedWorkplace: any = null;
  @observable selectedFilterPeriodDocNoted: any = REPORT_PERIOD_OBJECT.this_month;
  @observable selectedFilterStatusDocNoted: any = DOCUMENT_NOTED_OBJECT.all;

  @observable documentSearch: IDocument[] = [];
  @observable documentRecentSearch: IDocument[] = [];
  @observable userPermission: any[] = [];

  @observable documentData: IDocument[] = [];
  @observable headerDocuments: IHeaderInformation[] = [];
  @observable ownerDocuments: IHeaderInformation[] = [];

  @observable headerSignedDocuments: IHeaderInformation[] = [];
  @observable headerFinalDocuments: IHeaderInformation[] = [];
  @observable headerPriorityDocuments: IHeaderInformation[] = [];
  @observable headerVoidDocuments: IHeaderInformation[] = [];

  @observable documentNoted: IHeaderInformation[] = [];
  @observable documentSections: any[] = [];
  @observable documentReceivedWorkplaces: any[] = [];

  @observable documentRequest: IHeaderInformation[] = [];
  @observable loading: boolean = true;
  @observable empty: boolean = false;

  @observable peoplesInDoc: any[] = [];
  @observable officeInDoc: any[] = [];

  @observable documentApproval: IHeaderInformation[] = [];
  @observable totalDocumentApproval: number = 0;
  @observable emptyApproval: boolean = false;
  @observable loadingApproval: boolean = true;

  @observable documentUrgent: IHeaderInformation[] = [];
  @observable emptyUrgent: boolean = false;
  @observable loadingUrgent: boolean = true;

  @observable documentFinal: IHeaderInformation[] = [];
  @observable emptyFinal: boolean = false;
  @observable loadingFinal: boolean = true;

  @observable documentIn: IHeaderInformation[] = [];
  @observable documentInWorkPlace: IHeaderInformation[] = [];

  @observable loadingDocumentIn: boolean = true;

  @observable headerPinedDocuments: IHeaderInformation[] = [];
  @observable emptyPined: boolean = false;
  @observable loadingPined: boolean = true;

  @observable loadingSearch: boolean = false;

  @observable departmentData: IDepartment[] = [];
  @observable departmentOfficerData: IOfficer[] = [];
  @observable institutionData: IInstitution[] = [];
  @observable documentDataDoc: IDocument = null;
  @observable documentCommentsData: any[] = [];
  @observable documentCommentsHeaderData: any[] = [];
  @observable documentCommentsChildData: any[] = [];
  @observable workplaceReceivedJob: any[] = [];
  @observable documentViewersData: any[] = [];

  @observable childDataDoc: IDocument = null;
  @observable process: boolean = false;
  @observable process_edit: boolean = false;
  @observable lastVisible: IHeaderInformation = null;



  @observable incomingFileStream: any[] = [];
  @observable internalFileStream: any[] = [];
  @observable outgoingFileStream: any[] = [];

  @observable documentFlow: any[] = [];

  //form
  @observable peopleAndWorkplace: any[] = [];
  @observable officers: any[] = [];
  @observable incomingFlowOffice: string[] = [];
  @observable internalFlowOffice: string[] = [];
  @observable outgoingFlowOffice: string[] = [];
  @observable uploadPercent: any = null;

  @observable workplaces: any[] = [];
  @observable userPermissionCompeted: any[] = [];

  @observable officerData: any = [];
  @observable fetching: boolean = false;
  @observable loadingOfficer: boolean = true;

  @observable dataMap = new Map<{ key: string, name: string }, any[]>([]);
  @observable rootLevelNodes: any[] = [];

  constructor(
    protected ds: DatabaseService,
    protected storage: AngularFireStorage,
    private storageService: FireStorageService,
    private fun: AngularFireFunctions,
    private auth: AuthStore,
  ) { }

  initialData(): DynamicFlatNode[] {
    return this.rootLevelNodes.map(name => new DynamicFlatNode(name, 0, true));
  }

  getChildren(node: { key: string, name: string }): any {
    const item = Array.from(this.dataMap).find(m => m[0].key === node.key);
    return item?.length > 1 ? item[1] : []
  }
  isExpandable(node: any): boolean {
    const item = Array.from(this.dataMap).find(m => m[0].key === node?.key);
    return item?.length > 1 && item[1].length > 0 ? true : false;
  }

  @action
  async fetchAssistantOfficer(assistantOfficerList: any[]): Promise<void> {
    let workplacePositionKeys: any[] = [];
    assistantOfficerList.map(m => {
      workplacePositionKeys = workplacePositionKeys.concat(m?.positionAssistantKeys?.map(r => ({ key: `${m?.key}_${r}`, workplaceKey: m?.key, ranking: m?.ranking })))
    })
    const docs = await Promise.all(workplacePositionKeys?.map(async row => {
      const item = pushToArray(await this.ds.officerRef(ref => ref.where('positionWorkplaceKeys', 'array-contains', row?.key)).get().toPromise());
      return item.map(m => ({ ...m, workplaceKey: row?.workplaceKey, ranking: row?.ranking }))
    }))
    this.documentAssistantAccounts = toFlatten(docs).map(m => {
      return {
        ...m,
        permission: ACCOUNT_PERMISSION_OBJECT.canConfirm,
        isActive: true,
      }
    })
  }

  @action
  async fetchDocumentAccount(documentWorkplacePath: IDepartment[], workplaces: IDepartment[], employee: IOfficer, currentDepartment: IDepartment): Promise<void> {
    const workplacesKeys = workplaces?.map(m => m?.key);
    const fixedWorkplaces = documentWorkplacePath?.filter(m => m?.isWorkplace);
    let userPermissionData: any[] = [];
    let documentWorkplaces: any[] = [];
    fixedWorkplaces?.map(m => {
      const { headerOfficer, topManagement } = m;
      headerOfficer?.map(r => {
        userPermissionData = pushObjArray(userPermissionData, {
          ...r,
          permission: ACCOUNT_PERMISSION_OBJECT.canApproved,
          workplaceKey: m?.key,
          ranking: m?.ranking,
          isActive: workplacesKeys.includes(m?.key)
        })
      })
      topManagement?.map(r => {
        userPermissionData = pushObjArray(userPermissionData, {
          ...r,
          permission: ACCOUNT_PERMISSION_OBJECT.canApproved,
          workplaceKey: m?.key,
          ranking: m?.ranking,
          isActive: workplacesKeys.includes(m?.key)
        })
      })
    })
    documentWorkplacePath?.map(m => {
      documentWorkplaces = pushObjArray(documentWorkplaces, {
        ...toWorkplace(m),
        isActive: workplacesKeys.includes(m?.key),
        allowUsed: workplaces.find(r => r?.key === m?.key)?.allowUsed || false,
      })
    })
    const item = {
      ...toEmployee(employee),
      permission: ACCOUNT_PERMISSION_OBJECT.canConfirm,
      workplaceKey: currentDepartment?.key,
      ranking: currentDepartment?.ranking,
      isActive: true,
    }
    userPermissionData = pushObjArray(userPermissionData, item)
    this.documentAccounts = orderBy(userPermissionData, "position.order");
    this.documentWorkplaces = orderBy(documentWorkplaces, "order");
  }

  @observable fetchOfficerRef: Subscription = null;
  @action
  fetchOfficerData(uid: string) {
    this.fetchOfficerRef && this.fetchOfficerRef.unsubscribe()
    this.fetchOfficerRef = this.ds.officerRef(ref => {
      let condition = ref.where('isDelete', '==', false)
      condition = condition.orderBy('officerIdNo')
      return condition
    }).valueChanges().subscribe((data: IOfficer[]) => {
      this.officerData = data?.filter(m => m?.key !== uid)
      if (data.length >= 12) {
        this.lastVisible = this.officerData[this.officerData.length - 1]
      } else {
        this.lastVisible = null
      }
      this.loadingOfficer = false;
    })
  }

  @action
  fetchOfficerMore() {
    // try {
    //   if (!this.lastVisible) {
    //     return;
    //   } else {
    //     this.fetching = true;
    //     this.loadingOfficer = true;
  }


  @action
  async fetchWorkplaceDocument(workplaceKeys: string[]) {
    let arrayItem = []
    if (workplaceKeys.length > 10) {

      let w1 = []
      let w2 = []
      workplaceKeys.map((m: any, index) => {
        if (index <= 9) w1.push(m)
        if (index > 9) w2.push(m)
      })

      const itemDoc1 = await this.ds.departmentFireRef(ref => ref.where('key', 'in', w1)).get().toPromise()
      const itemData1 = pushToArray(itemDoc1)
      if (itemData1.length > 0) arrayItem = arrayItem.concat(itemData1)

      const itemDoc2 = await this.ds.departmentFireRef(ref => ref.where('key', 'in', w2)).get().toPromise()
      const itemData2 = pushToArray(itemDoc2)
      if (itemData2.length > 0) arrayItem = arrayItem.concat(itemData2)

      return orderBy(arrayItem, "node")
    } else {
      const items = await this.ds.departmentFireRef(ref => ref.where('key', 'in', workplaceKeys)).get().toPromise()
      return orderBy(pushToArray(items), "node")
    }
  }

  @action
  async fetchInstitutionsDocument() {
    const items = await this.ds.institutionFireRef(ref => ref.where('isDelete', '==', false)).get().toPromise()
    return orderBy(pushToArray(items), "name")
  }

  @action
  async fetchCategoriesDocument() {
    const items = await this.ds.categoryFireRef(ref => ref.where('isDelete', '==', false)).get().toPromise()
    return orderBy(pushToArray(items), "name")
  }

  @action
  async fetchRemarkOfficersDocument(uid) {
    const items = await this.ds.remarkFireRef(ref => ref.where('officer.key', '==', uid)).get().toPromise()
    return orderBy(pushToArray(items), "name")
  }
  @action
  fetchRemarkTextOfficer(uid, callback: (res: any) => void) {
    this.loading = true;
    this.ds.remarkTextRef().doc(uid).collection('remarkTexts', ref => ref.orderBy('remarkText')).valueChanges().subscribe(res => {
      callback(res);
      this.loading = false;
      return res;
    })
  }



  // @observable fetchOfficerRef: Subscription = null;
  // @action
  // fetchOfficerData() {
  //     this.fetchOfficerRef && this.fetchOfficerRef.unsubscribe()
  //     this.fetchOfficerRef = this.ds.officerRef(ref => {
  //       let condition = ref.orderBy("created_at", "desc").limit(12)
  //       if (this.lastVisible) {
  //         const { created_at } = this.lastVisible
  //         condition = condition.startAfter(created_at)
  //       }
  //       return condition
  //     }).valueChanges().subscribe(data => {
  //       this.officerData = this.officerData.concat(data)
  //       if (data.length >= 12) {
  //         this.lastVisible = this.officerData[this.officerData.length - 1]
  //       } else {
  //         this.lastVisible = null
  //       }
  //       this.loadingOfficer = false;
  //       this.fetching = false;
  //     })
  //   }
  // } catch (e) {
  // }

  @action
  async fetchSelectedDocumentAccount(header: IHeaderInformation) {
    const { workplaceAssistants } = header;
    const workplaceAssistantsKeys = toFlatten(workplaceAssistants?.map(m => {
      const positionAssistantKeys = m?.positionAssistantKeys
      return positionAssistantKeys
    })) || [];
    const items = await this.ds.documentHeaderRef().doc(header.key).collection("user_permission").get().toPromise()
    const accounts = pushToArray(items);
    this.documentAccounts = accounts?.filter(m => !m?.isDelete && !workplaceAssistantsKeys.includes(m?.profile?.position?.key))
    this.documentAssistantAccounts = accounts?.filter(m => !m?.isDelete && workplaceAssistantsKeys.includes(m?.profile?.position?.key))
    this.userPermission = accounts;
    return accounts;
  }

  @action
  async fetchDocumentUserPermission(callback) {
    this.ds.documentHeaderRef().doc(this.headerDocument.key).collection("user_permission").valueChanges().subscribe(docs => {
      callback(docs)
    })
  }

  @action
  addDocumentAccountReport(header: IHeaderInformation, permission: IUserPermission, callback: (success: boolean, error: string) => void) {
    const batch = this.ds.batch();
    batch.set(this.ds.documentAccountPermissionWorkplaceRef(header.key).doc(permission?.key).ref, permission, { merge: true })
    batch.set(this.ds.documentHeaderRef().doc(header?.key).ref, {
      accountKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
      receivedWorkplaceKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
    }, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      alert(error)
      callback(false, error)
    })
  }

  @action
  removeDocumentAccountReport(header: IHeaderInformation, permission: IUserPermission, callback: (success: boolean, error: string) => void) {
    const batch = this.ds.batch();
    batch.set(this.ds.documentAccountPermissionWorkplaceRef(header.key).doc(permission?.key).ref, {
      ...permission,
      isActive: false,
      isDelete: true,
    }, { merge: true })
    batch.set(this.ds.documentHeaderRef().doc(header?.key).ref, {
      accountKeys: this.ds.fireFieldValue().arrayRemove(permission?.accountKey),
      receivedWorkplaceKeys: this.ds.fireFieldValue().arrayRemove(permission?.accountKey),
    }, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      alert(error)
      callback(false, error)
    })
  }


  @action
  addDocumentAccount(header: IHeaderInformation, permission: IUserPermission, callback: (success: boolean, error: string) => void) {
    const batch = this.ds.batch();
    batch.set(this.ds.documentAccountPermissionRef(header.key).doc(permission?.key).ref, permission, { merge: true })
    if (permission?.permission?.key === 1) {
      batch.set(this.ds.documentHeaderRef().doc(header?.key).ref, {
        peopleKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
        readOnlyKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
        approvedByKeys: this.ds.fireFieldValue().arrayRemove(permission?.accountKey),
        accountKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
      }, { merge: true })
    } else {
      batch.set(this.ds.documentHeaderRef().doc(header?.key).ref, {
        accountKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
        peopleKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
        approvedByKeys: this.ds.fireFieldValue().arrayUnion(permission?.accountKey),
        readOnlyKeys: this.ds.fireFieldValue().arrayRemove(permission?.accountKey)
      }, { merge: true })
    }

    const upperLevelDocs = this.approvalUserPermission.filter(m => m.key !== permission.key && m?.approval_order >= permission?.approval_order)
    upperLevelDocs.map((m) => {
      batch.set(this.ds.documentAccountPermissionRef(header.key).doc(m?.key).ref, { approval_order: m.approval_order + 1 }, { merge: true })
    })

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      alert(error)
      callback(false, error)
    })
  }

  @action
  removeDocumentAccount(header: IHeaderInformation, accountKey: string, uid: string) {
    const batch = this.ds.batch();
    batch.set(this.ds.documentAccountPermissionRef(header.key).doc(accountKey).ref, {
      isDelete: true,
      isActive: false,
      deleted_by: uid,
      deleted_at: this.ds.serverTimestamp()
    }, { merge: true })
    batch.set(this.ds.documentHeaderRef().doc(header?.key).ref, {
      peopleKeys: this.ds.fireFieldValue().arrayRemove(accountKey),
      approvedByKeys: this.ds.fireFieldValue().arrayRemove(accountKey),
      accountKeys: this.ds.fireFieldValue().arrayRemove(accountKey),
    }, { merge: true })
    batch.commit().then(() => {

    }).catch(error => {
      alert(error)
    })
  }

  @action
  calApprovalOrder(header, previousData, currentData) {
    const batch = this.ds.batch();

    batch.set(this.ds.documentAccountPermissionRef(header.key).doc(previousData.key).ref, {
      approval_order: currentData.approval_order
    }, { merge: true })
    batch.set(this.ds.documentAccountPermissionRef(header.key).doc(currentData.key).ref, {
      approval_order: previousData.approval_order
    }, { merge: true })

    batch.commit().then(() => {
    }).catch(error => {
      alert(error)
    })
  }

  @action
  setRecentUserSearch(item: IHeaderInformation, accountKey: string) {
    const batch = this.ds.batch();
    batch.set(this.ds.userRef().doc(accountKey).collection('recent_search').doc(item.key).ref, item, { merge: true })
    batch.commit().then(() => {
    }).catch(error => {
      alert(error)
    })


  }

  @action
  removeRecentUserSearch(item: IHeaderInformation, accountKey: string) {
    const batch = this.ds.batch();
    batch.delete(this.ds.userRef().doc(accountKey).collection('recent_search').doc(item.key).ref)
    batch.commit().then(() => {
    }).catch(error => {
      alert(error)
    })
  }

  @action
  saveViewer(profile: IOfficer, headerKey: string) {
    const item: IViewer = {
      key: profile.key,
      full_name: profile?.displayName,
      file: profile?.file || null,
      created_at: this.ds.serverTimestamp(),
      page_key: pageKey()
    }
    this.ds.viewersRef(headerKey).doc(item.key).set(item, { merge: true })
  }

  @action
  async fetchSelectedDepartment(workplaceKey: string): Promise<IDepartment> {
    if (!workplaceKey) return null;
    const doc = await this.ds.departmentFireRef().doc(workplaceKey).get().toPromise();
    const item = pushToObject(doc) as IDepartment;
    return item;
  }

  @action
  async fetchCurrentDepartment(departmentKey: string) {
    const doc = await this.ds.departmentFireRef().doc(departmentKey).get().toPromise();
    this.selectedDepartment = pushToObject(doc);
    return this.selectedDepartment;
  }

  @action
  async uploadBase64(baseUrl, fileName: string) {
    const uploadTask = this.storage.ref('/documents_covers').child(fileName).putString(baseUrl, 'base64', { contentType: 'image/jpeg' });
    this.uploadPercent = uploadTask.percentageChanges();
    const downloadURL: any = (await uploadTask.then(async (f) => {
      return f.ref.getDownloadURL()
    }));
    return downloadURL
  }

  @action
  async fetchManagementLevel() {
    const docs = await this.ds.managementLevelFireRef(ref => ref.orderBy('order')).get().toPromise();
    return pushToArray(docs)
  }

  @action
  async fetchDocumentOfHeader(headerKey: string) {
    const doc = await this.ds.documentRef().doc(headerKey).get().toPromise()
    return pushToObject(doc)
  }
  @action
  async fetchUserPermissions(headerKey: string) {
    const doc = await this.ds.documentAccountPermissionRef(headerKey).get().toPromise()
    this.userPermission = pushToArray(doc)
    return this.userPermission;
  }


  @action
  async fetchAssistantOfDepartment(positionKey: string, workplaceKey: string): Promise<any[]> {
    const docs = await this.ds.officerRef(ref => ref.where('positionKeys', 'array-contains', positionKey).where('currentDepartment.key', '==', workplaceKey)).get().toPromise()
    return pushToArray(docs)
  }

  @action
  fetchSearchDocuments(keywordVal: any) {
    return this.ds.documentRef().valueChanges()
  }


  @action
  async fetchRecentSearchData(uid: string, isFileManager?: boolean) {
    if (isFileManager) {
      const docs = await this.ds.userRef().doc(uid).collection('recent_search_file', ref => ref.orderBy('updated_at', 'desc').limit(15)).get().toPromise();
      this.documentRecentSearch = pushToArray(docs)
    } else {
      const docs = await this.ds.userRef().doc(uid).collection('recent_search', ref => ref.orderBy('updated_at', 'desc').limit(15)).get().toPromise();
      this.documentRecentSearch = pushToArray(docs)
    }
  }


  @action
  async fetchSearchData(root: boolean, uid: string) {
    const docs = await this.ds.documentHeaderRef(ref => {
      let cond = ref.where('isDelete', '==', false)
      if (!root) {
        cond = cond.where('peopleKeys', 'array-contains', uid)
      }
      return cond.orderBy('created_at', 'desc').limit(15)
    }).get().toPromise();
    this.documentSearch = pushToArray(docs)
    return this.documentSearch
  }

  @action
  async fetchSearch(keyword: any, root: boolean, uid: string, callback: (items: any[]) => void) {
    if (typeof keyword === 'string') {
      const word = keyword ? keyword?.toUpperCase() : null
      const docs = await this.ds.documentHeaderRef(ref => {
        let condition = ref.where('isDelete', '==', false);
        if (word) {
          condition = condition.where('keyword', 'array-contains', word)
        }
        return condition.orderBy('created_at', 'desc').limit(APPS.smallsize)
      }).get().toPromise();
      this.documentSearch = pushToArray(docs)?.map(m => {
        return { ...m, photoUrl: m?.owner_profile?.file?.downloadUrl ? transformImageSameTokenNo(m?.owner_profile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY_AVATAR }
      })
      callback(this.documentSearch)
    }
  }

  @action
  async fetchSearchFile(keyword: any, callback) {
    this.loadingSearch = true
    if (typeof keyword === 'string') {

      const data: ISearchDocument = {
        word1: keyword,
        // word1: "បណ្អា",
      }
      const result = await this.fun.httpsCallable('SearchContentDocument')(data).toPromise()
      this.loadingSearch = false
      this.documentSearch = result
      callback(this.documentSearch)
    } else {

      this.loadingSearch = false
    }
  }

  @observable fetchFileStreamRef: Subscription = null;
  @action
  fetchFileStream(docKey: string, administrationOffice: IDepartment, callback?: (items: any[]) => void) {
    this.fetchFileStreamRef && this.fetchFileStreamRef.unsubscribe()
    this.fetchFileStreamRef = this.ds.headerDocumentFileStreamRef(docKey).valueChanges().subscribe(docs => {
      this.documentFlow = docs;
      //start from new flow
      if (docs.length === 0) {
        let incomingOffice: any[] = docs.filter(m => m?.flowType?.key === FLOW_TYPE_OBJECT.INCOMING.key);
        const findAdministrationOffice = incomingOffice.find(m => m.key === administrationOffice?.key);
        if (!findAdministrationOffice) {
          const { headerOfficer } = administrationOffice;
          const item = {
            ...administrationOffice,
            flowType: FLOW_TYPE_OBJECT.INCOMING,
            dataType: OFFICE_OR_OFFICER_OBJECT.OFFICE,
            flowPageKey: ConvertService.pageKey(),
            officeKey: administrationOffice.key,
            key: `${FLOW_TYPE_OBJECT.INCOMING.key}_${administrationOffice.key}`
          }
          incomingOffice.push(item)
          this.incomingFlowOffice.push(item.key)
          this.documentFlow.push(item)
          const officerByPosition = orderBy(headerOfficer, "position.order")
          officerByPosition.map(officer => {
            const officerFlow = {
              ...officer,
              flowType: FLOW_TYPE_OBJECT.INCOMING,
              dataType: OFFICE_OR_OFFICER_OBJECT.OFFICER,
              officeKeyRef: item.key,
              onlyInfo: false,
              flowPageKey: ConvertService.pageKey(),
              originalOfficeKey: administrationOffice.key,
              requiredApprove: true,
              officerKey: officer.key,
              key: `${FLOW_TYPE_OBJECT.INCOMING.key}_${officer?.position?.key}_${officer.key}`
            }
            incomingOffice.push(officerFlow)
            this.documentFlow.push(officerFlow)
          })
        }
        const incomingOfficeItems = incomingOffice.filter(m => m.dataType?.key === OFFICE_OR_OFFICER_OBJECT.OFFICE.key);
        this.incomingFileStream = incomingOfficeItems.map(m => {
          const officerData = orderBy(incomingOffice.filter(r =>
            r.officeKeyRef === m?.key &&
            r.dataType?.key === OFFICE_OR_OFFICER_OBJECT.OFFICER.key
          ), "position.order", "desc")
          return { ...m, officerData }
        })
      }
      //generate after save some flow
      else {
        this.incomingFileStream = this.incomingFlowOffice.map(m => {
          const office = docs.find(r => r.key === m)
          const officerData = orderBy(docs.filter(r => r.officeKeyRef === m && r.dataType?.key === OFFICE_OR_OFFICER_OBJECT.OFFICER.key), "position.order", "desc")
          return {
            ...office,
            officerData
          }
        })
        this.internalFileStream = this.internalFlowOffice.map(m => {
          const office = docs.find(r => r.key === m)
          const officerData = orderBy(docs.filter(r => r.officeKeyRef === m && r.dataType?.key === OFFICE_OR_OFFICER_OBJECT.OFFICER.key), "position.order", "desc")
          return {
            ...office,
            officerData
          }
        })
        this.outgoingFileStream = this.outgoingFlowOffice.map(m => {
          const office = docs.find(r => r.key === m)
          const officerData = orderBy(docs.filter(r => r.officeKeyRef === m && r.dataType?.key === OFFICE_OR_OFFICER_OBJECT.OFFICER.key), "position.order", "desc")
          return {
            ...office,
            officerData
          }
        })
      }
      callback && callback(this.documentFlow)
    })
  }

  @action
  saveDocumentFlow(flowTypeObject: any, callback: (status: boolean, error: string) => void): void {
    this.process = true;
    const batch = this.ds.batch();
    this.documentFlow.map(m => {
      batch.set(this.ds.headerDocumentFileStreamRef(this.documentDataDoc?.key).doc(m.key).ref, m, { merge: true })
    })
    this.peopleAndWorkplace.map(m => {
      batch.set(this.ds.headerDocumentFileStreamRef(this.documentDataDoc?.key).doc(m.key).ref, m, { merge: true })
    })
    const flowData = this.peopleAndWorkplace.filter(m => m.dataType?.key === OFFICE_OR_OFFICER_OBJECT.OFFICE.key).map(m => m.key);
    switch (flowTypeObject.key) {
      case FLOW_TYPE_OBJECT.INCOMING.key:
        const officeKeys = toUniq(toFlatten(this.incomingFlowOffice.concat(flowData)))
        batch.set(this.ds.headerDocumentRef().doc(this.documentDataDoc.key).ref, { incomingFlowOffice: officeKeys }, { merge: true })
        break;
      case FLOW_TYPE_OBJECT.INTERNAL.key:
        const officeInternalKeys = toUniq(toFlatten(this.internalFlowOffice.concat(flowData)))
        batch.set(this.ds.headerDocumentRef().doc(this.documentDataDoc.key).ref, { internalFlowOffice: officeInternalKeys }, { merge: true })
        break;
      case FLOW_TYPE_OBJECT.OUTGOING.key:
        const officeOutgoingKeys = toUniq(toFlatten(this.outgoingFlowOffice.concat(flowData)))
        batch.set(this.ds.headerDocumentRef().doc(this.documentDataDoc.key).ref, { outgoingFlowOffice: officeOutgoingKeys }, { merge: true })
        break;
      default:
        break;
    }
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  saveHeaderSendTo(administrationOffice: any, callback: (status: boolean, error: string) => void): void {
    this.process = true;
    const batch = this.ds.batch()
    const officers = this.documentFlow.filter(m => m.dataType?.key === OFFICE_OR_OFFICER_OBJECT.OFFICER.key);
    batch.set(this.ds.documentRef().doc(this.headerDocument.key).ref, { doc_status: docStatusObj.released, }, { merge: true })
    batch.set(this.ds.headerDocumentRef().doc(this.headerDocument.key).ref, {
      doc_status: docStatusObj.released,
      peopleKeys: groupBy(officers, "officerKey").map(m => m.officerKey),
    }, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  unSubscribe() {
    this.fetchDocumentsRef && this.fetchDocumentsRef.unsubscribe();
    this.fetchDocumentHeaderRef && this.fetchDocumentHeaderRef.unsubscribe();
    this.fetchDepartmentRef && this.fetchDepartmentRef.unsubscribe();
    this.fetchDocumentsRequestRef && this.fetchDocumentsRequestRef.unsubscribe()
    this.fetchChildDocRef && this.fetchChildDocRef.unsubscribe();
    this.fetchInstitutionRef && this.fetchInstitutionRef.unsubscribe();
  }

  @observable fetchDocumentsRef: Subscription = null;
  @action
  fetchDocuments() {
    this.loading = true
    this.fetchDocumentsRef = this.ds.documentRef(ref => ref.where("doc_parent", "==", null)).valueChanges().subscribe(data => {
      this.documentData = data as IDocument[];
      this.loading = false
    })
  }

  @action
  unSubscribeFetchHeaderDocumentRecent() {
    this.fetchHeaderDocumentRecentRef && this.fetchHeaderDocumentRecentRef.unsubscribe();
  }

  @observable fetchHeaderDocumentRecentRef: Subscription = null;
  @action
  fetchHeaderDocumentRecent(uid: string, statusKey: string, periodKey: string, callback?: (docs: IHeaderInformation[]) => void): void {
    this.selectedFilterStatusDocNoted = WORKPLACE_FEATURES_OBJ[statusKey] || WORKPLACE_FEATURES_OBJ.all;
    const period = REPORT_PERIOD_OBJECT[periodKey] || REPORT_PERIOD_OBJECT.this_month;
    // this.ds.departmentFireRef(ref => ref.where('subOfDepartment.key', '==', '2D9zxulVdjb4StVcQ0oH').where('adminOffice', '==', true)).valueChanges().subscribe(doc => {
    // })
    this.fetchHeaderDocumentRecentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false).where('created_by', '==', uid);
      if (period >= 1) {
        const date = getFromDateToDate(period)
        condition = condition.where('created_at', '>=', date?.fromDate).where('created_at', '<=', date?.toDate)
      }
      return condition.orderBy('created_at', 'desc').limit(6)
    }).valueChanges().subscribe(data => {
      this.documentNoted = data;
      callback && callback(this.documentNoted)
    })
  }

  @observable fetchHeaderDocumentRef: Subscription = null;
  @action
  fetchHeaderDocument(department: IDepartment, uid: string, statusKey: string, periodKey: string) {
    this.loading = true;
    // this.selectedFilterPeriodDocNoted = REPORT_PERIOD_OBJECT[periodKey] || REPORT_PERIOD_OBJECT.this_month;
    this.fetchHeaderDocumentRef && this.fetchHeaderDocumentRef.unsubscribe()
    this.fetchHeaderDocumentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
      if (uid) {
        condition = condition.where('peopleKeys', 'array-contains', uid)
      }
      if (department) {
        condition = condition.where('workplace.key', '==', department?.key)
      }
      if (statusKey === 'in_progress') {
        condition = condition.where('doc_status.key', '==', docStatusObj.released.key)
      } else if (statusKey === 'approved') {
        condition = condition.where('final', '==', true)
      } else if (statusKey === 'void') {
        condition = condition.where('doc_status.key', '==', docStatusObj.void.key)
      } else if (statusKey === 'done') {
        condition = condition.where('doc_status.key', '==', docStatusObj?.final?.key)
      }
      // if (this.selectedFilterPeriodDocNoted?.key >= 1) {
      //     const date = getFromDateToDate(this.selectedFilterPeriodDocNoted)
      //     condition = condition.where('created_at', '>=', date?.fromDate).where('created_at', '<=', date?.toDate)
      // }
      return condition.orderBy('created_at', 'desc').limit(APPS.size)
    }).valueChanges().subscribe(docs => {
      this.headerDocuments = docs.map(doc => {
        return { ...doc, coverFile: doc?.coverFile ? { ...doc?.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
      });;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.headerDocuments[this.headerDocuments.length - 1]
      } else {
        this.lastVisible = null
      };
      this.loading = false;
    })
  }

  @action
  async fetchMoreDocument(department: IDepartment, uid: string, statusKey: string, periodKey: string) {
    if (!this.lastVisible || this.fetching || this.done) return;
    this.fetching = true;
    const data = await this.ds
      .headerDocumentRef(ref => {
        let condition = ref.where('isDelete', '==', false)
        if (uid) {
          condition = condition.where('peopleKeys', 'array-contains', uid)
        }
        if (department) {
          condition = condition.where('workplace.key', '==', department?.key)
        }
        if (statusKey === 'in_progress') {
          condition = condition.where('doc_status.key', '==', docStatusObj.released.key)
        } else if (statusKey === 'approved') {
          condition = condition.where('final', '==', true)
        } else if (statusKey === 'void') {
          condition = condition.where('doc_status.key', '==', docStatusObj.void.key)
        } else if (statusKey === 'done') {
          condition = condition.where('doc_status.key', '==', docStatusObj?.final?.key)
        }
        // if (this.selectedFilterPeriodDocNoted?.key >= 1) {
        //     const date = getFromDateToDate(this.selectedFilterPeriodDocNoted)
        //     condition = condition.where('created_at', '>=', date?.fromDate).where('created_at', '<=', date?.toDate)
        // }
        if (this.lastVisible) {
          const { created_at } = this.lastVisible
          condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
        } else {
          condition = condition.orderBy('created_at', 'desc');
        }
        return condition.limit(APPS.size)
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
    this.headerDocuments = this.headerDocuments.concat(items?.map(doc => {
      return { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
    }));
    this.fetching = false;
  }


  @observable fetchHeaderAllDocumentRef: Subscription = null;
  @action
  fetchAllHeaderDocument(uid, periodKey) {
    this.loading = true;
    this.selectedFilterPeriodDocNoted = REPORT_PERIOD_OBJECT[periodKey];
    this.fetchHeaderAllDocumentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
        // .where('doc_status.key', '>', 1).orderBy('doc_status.key')
        .where("peopleKeys", "array-contains", uid)

      if (this.selectedFilterPeriodDocNoted?.key >= 1) {
        const date = getFromDateToDate(this.selectedFilterPeriodDocNoted)
        condition = condition.where('created_at', '>=', date?.fromDate).where('created_at', '<=', date?.toDate)
      }
      return condition.orderBy('created_at', 'desc')
    }).valueChanges().subscribe(data => {
      this.headerDocuments = data;
      this.loading = false;
    })
  }

  @observable fetchHeaderSignedDocumentsRef: Subscription = null;
  @action
  fetchHeaderSignedDocuments(user) {
    this.loading = true;
    this.fetchHeaderSignedDocumentsRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
        .where('doc_status.key', '>', 1).orderBy('doc_status.key')
        .where("peopleKeys", "array-contains", user.key)
      return condition.orderBy('created_at', 'desc')
    }).valueChanges().subscribe(data => {
      this.headerDocuments = data;
      this.loading = false;
    })
  }

  @observable fetchHeaderVoidDocumentsRef: Subscription = null;
  @action
  fetchHeaderVoidDocuments(uid, periodKey) {
    this.loading = true;
    this.selectedFilterPeriodDocNoted = REPORT_PERIOD_OBJECT[periodKey];
    this.fetchHeaderVoidDocumentsRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
        .where('doc_status.key', '==', docStatusObj.void.key)
        .where("peopleKeys", "array-contains", uid)
      if (this.selectedFilterPeriodDocNoted?.key >= 1) {
        const date = getFromDateToDate(this.selectedFilterPeriodDocNoted)
        condition = condition.where('created_at', '>=', date?.fromDate).where('created_at', '<=', date?.toDate)
      }
      return condition.orderBy('created_at', 'desc')
    }).valueChanges().subscribe(data => {
      this.headerVoidDocuments = data;
      this.loading = false;
    })
  }

  @observable fetchHeaderFinalDocumentsRef: Subscription = null;
  @action
  fetchHeaderFinalDocuments(uid, periodKey) {
    this.loading = true;
    this.selectedFilterPeriodDocNoted = REPORT_PERIOD_OBJECT[periodKey];
    this.fetchHeaderFinalDocumentsRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
        // .where('doc_status.key', '>', 1)
        .where('final', '==', true)
        .where("peopleKeys", "array-contains", uid)
      if (this.selectedFilterPeriodDocNoted?.key >= 1) {
        const date = getFromDateToDate(this.selectedFilterPeriodDocNoted)
        condition = condition.where('created_at', '>=', date?.fromDate).where('created_at', '<=', date?.toDate)
      }
      return condition.orderBy('created_at', 'desc')
    }).valueChanges().subscribe(data => {
      this.headerFinalDocuments = data;
      this.loading = false;
    })
  }

  @observable fetchHeaderApprovedDocumentsRef: Subscription = null;
  @action
  fetchHeaderApprovedDocuments(uid, periodKey) {
    this.loading = true;
    this.selectedFilterPeriodDocNoted = REPORT_PERIOD_OBJECT[periodKey];
    this.fetchHeaderApprovedDocumentsRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
        // .where('doc_status.key', '>', 1)
        .where("completedByKeys", "array-contains", uid)
      if (this.selectedFilterPeriodDocNoted?.key >= 1) {
        const date = getFromDateToDate(this.selectedFilterPeriodDocNoted)
        condition = condition.where('created_at', '>=', date?.fromDate).where('created_at', '<=', date?.toDate)
      }
      return condition.orderBy('created_at', 'desc')
    }).valueChanges().subscribe(data => {
      this.headerSignedDocuments = data;
      this.loading = false;
    })
  }




  @observable fetchHeaderInboxDocumentRef: Subscription = null;
  @action
  fetchInboxHeaderDocument(department: IDepartment, statusKey: string, periodKey: string) {
    this.selectedFilterPeriodDocNoted = REPORT_PERIOD_OBJECT[periodKey] || REPORT_PERIOD_OBJECT.this_month;
    this.selectedFilterStatusDocNoted = DOCUMENT_NOTED_OBJECT[statusKey] || DOCUMENT_NOTED_OBJECT.all;
    this.loading = true;
    this.fetchHeaderInboxDocumentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false).where("doc_parent", "==", null);
      if (department) {
        condition = condition.where('receivedWorkplaceKeys', 'array-contains', department?.key)
      }
      return condition.orderBy('created_at', 'desc')
    }).valueChanges().subscribe(data => {
      this.headerDocuments = data;
      this.loading = false;
    })
  }




  @action
  subscriptionFetchHeaderDocument() {
    this.fetchHeaderDocumentRef && this.fetchHeaderDocumentRef.unsubscribe()
  }

  @action
  subscriptionFetchUserDocument() {
    this.fetchApprovalDocumentRef && this.fetchApprovalDocumentRef.unsubscribe()
    this.fetchUrgentDocumentRef && this.fetchUrgentDocumentRef.unsubscribe()
    this.fetchPinedDocumentRef && this.fetchPinedDocumentRef.unsubscribe()
    this.fetchOfficerRef && this.fetchOfficerRef.unsubscribe();
  }

  @action
  subscriptionFetchAllDocument() {
    this.fetchDocumentsRequestRef && this.fetchDocumentsRequestRef.unsubscribe()
  }

  @action
  subscriptionFetchPinedUrgentAndFinal() {
    this.fetchUrgentDocumentRef && this.fetchUrgentDocumentRef.unsubscribe()
  }

  fetchApprovalDocumentRef: Subscription = null;
  @action
  async fetchApprovalDocument(uid: string, callback?: (approval: IHeaderInformation[]) => void) {
    this.loadingApproval = true;
    this.fetchApprovalDocumentRef && this.fetchApprovalDocumentRef.unsubscribe()
    this.fetchApprovalDocumentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
      condition = condition.where('approvedByKeys', 'array-contains', uid)
      return condition.orderBy('created_at', 'desc')
    }).valueChanges().subscribe(approvalDocuments => {
      this.documentApproval = approvalDocuments;
      this.emptyApproval = approvalDocuments.length === 0;
      this.loadingApproval = false;
      callback && callback(this.documentApproval)
    })
  }

  fetchOwnerDocumentRef: Subscription = null;
  @observable loadingOwner: boolean = true;
  @action
  fetchOwnerDocument(uid: string, workplaceKey: string) {
    this.fetchOwnerDocumentRef && this.fetchOwnerDocumentRef.unsubscribe()
    if (!workplaceKey) {
      this.ownerDocuments = [];
      this.loadingOwner = false;
    }
    this.fetchOwnerDocumentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
      condition = condition.where('peopleKeys', 'array-contains', uid).where('workplace.key', '==', workplaceKey)
      return condition.orderBy('created_at', 'desc').limit(APPS.limitSD5)
    }).valueChanges().subscribe(approvalDocuments => {
      this.ownerDocuments = approvalDocuments
      this.loadingOwner = false;
    })
  }

  fetchDocumentsRequestRef: Subscription = null;
  @action
  fetchDocumentListing(workplace: IDepartment) {
    this.loading = true
    this.fetchDocumentsRequestRef && this.fetchDocumentsRequestRef.unsubscribe()
    this.fetchDocumentsRequestRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false).where('doc_status.key', '>', 1).orderBy('doc_status.key')
      condition = condition.where('workplaceKeys', 'array-contains', toUserWorkplaceKey(workplace?.workplace))
      return condition.orderBy('created_at', 'desc').limit(APPS.size)
    }).valueChanges().subscribe(async data => {
      this.documentRequest = data;
      this.loading = false
    })
  }

  fetchUrgentDocumentRef: Subscription = null;
  @action
  fetchUrgentDocument(uid: string) {
    this.loadingUrgent = true
    this.fetchUrgentDocumentRef && this.fetchUrgentDocumentRef.unsubscribe()
    this.fetchUrgentDocumentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("peopleKeys", "array-contains", uid)
        .where("priority.key", "==", 2)
        .orderBy("doc_status.key")
        .orderBy("created_at", "desc")
        .limit(APPS.limitSD)
      return condition
    }).valueChanges().subscribe(data => {
      this.documentUrgent = data;
      this.loadingUrgent = false
    })
  }

  fetchFinalDocumentRef: Subscription = null;
  @action
  fetchFinalDocument(uid) {
    this.loadingFinal = true
    this.fetchFinalDocumentRef && this.fetchFinalDocumentRef.unsubscribe()
    this.fetchFinalDocumentRef = this.ds.headerDocumentRef(ref => {
      let condition = ref.where('isDelete', '==', false)
        .where("peopleKeys", "array-contains", uid)
        .where('final', '==', true)
        .orderBy('created_at', 'desc')
        .limit(APPS.limitSD)
      return condition
    }).valueChanges().subscribe(data => {
      this.documentFinal = data
      this.loadingFinal = false
    })
  }

  fetchDocumentInRef: Subscription = null;
  @action
  fetchDocumentIn(uid) {
    this.loadingDocumentIn = true
    this.fetchDocumentInRef && this.fetchDocumentInRef.unsubscribe()
    this.fetchDocumentInRef = this.ds.headerDocumentRef(ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where('receivedWorkplaceKeys', 'array-contains', uid)
        .orderBy('created_at', 'desc')
        .limit(APPS.limitSD5)
      return condition
    }).valueChanges().subscribe(data => {
      this.documentIn = data
      this.loadingDocumentIn = false
    })
  }

  @action
  async fetchDocumentInWorkPlace(uid: string, workPlaceKey: string, callback: (items: IHeaderInformation[]) => void) {
    this.loadingDocumentIn = true
    this.fetching = false;
    this.done = false;
    const items = await this.ds.headerDocumentRef(ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where('accountKeys', 'array-contains', uid)
        .orderBy('created_at', 'desc')

      return condition.limit(APPS.limitSD5)
    }).get().toPromise();
    const data = pushToArray(items);
    this.documentInWorkPlace = data?.map(doc => {
      return { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
    })
    if (data.length >= APPS.size) {
      this.lastVisible = this.documentInWorkPlace[this.documentInWorkPlace.length - 1]
    } else {
      this.lastVisible = null
    };
    this.loadingDocumentIn = false
  }

  @action
  async fetchDocumentInWorkPlaceMore(uid: string, workPlaceKey: string) {
    if (!this.lastVisible || this.fetching || this.done) return;
    this.fetching = true;
    const items = await this.ds.headerDocumentRef(ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where('accountKeys', 'array-contains', uid)
      if (this.lastVisible) {
        const { created_at } = this.lastVisible
        condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
      } else {
        condition = condition.orderBy('created_at', 'desc');
      }
      return condition.limit(APPS.limitSD5)
    }).get().toPromise();
    const data = pushToArray(items);
    this.documentInWorkPlace = this.documentInWorkPlace.concat(data?.map(doc => {
      return { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null }
    }))
    if (data.length >= APPS.size) {
      this.lastVisible = this.documentInWorkPlace[this.documentInWorkPlace.length - 1]
    } else {
      this.lastVisible = null
    };
    this.fetching = false
  }



  @action
  subscribeHome() {
    this.fetchApprovalDocumentRef && this.fetchApprovalDocumentRef.unsubscribe()
    this.fetchOwnerDocumentRef && this.fetchOwnerDocumentRef.unsubscribe()
    this.documentInWorkPlace = [];
    this.documentApproval = [];
    this.loadingDocumentIn = false;
    this.fetching = false;
    this.done = false;
  }

  fetchPinedDocumentRef: Subscription = null;
  @action
  fetchPinedDocument(uid: string) {
    this.loadingPined = true
    this.fetchPinedDocumentRef && this.fetchPinedDocumentRef.unsubscribe()
    this.fetchPinedDocumentRef = this.ds.userPinedRef(uid, ref => ref.orderBy('created_at', 'desc').limit(APPS.limitSD))
      .valueChanges().subscribe(async data => {
        if (Array.isArray(data) && data.length > 0) {
          this.headerPinedDocuments = await Promise.all(data.map(async (item: any) => {
            return await pushToObject(await this.ds.headerDocumentRef(ref => ref.where("isDelete", "==", false)).doc(item.key).get().toPromise())
          }))
          this.headerPinedDocuments = this.headerPinedDocuments
        } else {
          this.headerPinedDocuments = []
        }
        this.loadingPined = false
      })
  }

  @observable fetchDepartmentRef: Subscription = null;
  @action
  fetchDepartments(callback: (items: IDepartment[]) => void) {
    this.loading = true
    this.fetchDepartmentRef = this.ds.departmentFireRef().valueChanges().subscribe(data => {
      this.departmentData = data;
      callback(this.departmentData)
      this.loading = false
    })
  }

  @action
  documentSubscribe() {
    this.fetchDepartmentRef && this.fetchDepartmentRef.unsubscribe()
    this.departmentData = null;
  }

  @action
  async subscribeWorkplace() {
    this.fetchWorkplacesRef && this.fetchWorkplacesRef.unsubscribe()
    this.fetchInstitutionRef?.unsubscribe()
    this.institutionData = [];
    this.departmentData = [];
    this.departmentOfficerData = [];
    Promise.resolve()
  }

  @observable fetchOfficerWorkplacesRef: Subscription = null;
  @action
  async fetchOfficerWorkplaces(department: any, callback?: (item: IOfficer[]) => void): Promise<any[]> {
    const items = pushToArray(await this.ds.officerRef(ref => ref.where("currentDepartment.key", "==", department.key)).get().toPromise());
    this.departmentOfficerData = MappingService.orderBy(items, "officerId");
    callback?.(this.departmentOfficerData)
    return this.departmentOfficerData;
  }

  @observable fetchWorkplacesRef: Subscription = null;
  @action
  async fetchWorkplaces(callback?: (items: IDepartment[]) => void): Promise<any[]> {
    const { startFromLevel } = this.auth?.config || {}
    const items = pushToArray(await this.ds.departmentFireRef(ref => ref.orderBy('node').orderBy('order')).get().toPromise())?.filter(m => m?.ranking?.order < 10);
    this.departmentData = items?.filter(m => m?.ranking?.order >= startFromLevel?.order);

    this.dataMap = new Map<{ key: string, name: string }, any[]>([]);
    this.rootLevelNodes = items?.filter(m => m?.ranking?.order === startFromLevel?.order)

    this.departmentData?.map((m: any) => {
      const values = this.departmentData?.filter(r => r?.subOfDepartment?.key === m?.key);
      this.dataMap.set(m, values)
    })

    callback?.(this.departmentData)
    return this.departmentData;
  }



  @observable fetchInstitutionRef: Subscription = null;
  @action
  fetchInstitutions(callback: (items: IInstitution[]) => void) {
    this.loading = true
    this.fetchInstitutionRef?.unsubscribe()
    this.fetchInstitutionRef = this.ds.institutionFireRef().valueChanges().subscribe(data => {
      this.institutionData = data;
      callback(this.institutionData)
      this.loading = false
    })
  }

  @action
  workplaceDocument(workplaces: any[], uid: string, workplace: any, isSelected: boolean, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const batch = this.ds.batch()
    const accounts = this.userPermission?.filter(m => m?.key !== this.headerDocument?.created_by && m?.workplaceKey === workplace?.key)?.map(m => m?.key);
    if (isSelected) {
      if (accounts.length > 0) {
        accounts?.map(officerKey => {
          batch.set(this.ds.headerDocumentOfficerCheckedRef(this.headerDocument?.key).doc(officerKey).ref, {
            isDelete: false,
            isActive: true,
          }, { merge: true })
        })
        batch.set(this.ds.headerDocumentRef().doc(this.headerDocument.key).ref, {
          workplaces: workplaces,
          updated_by: uid,
          updated_at: this.ds.serverTimestamp(),
          accountKeys: this.ds.fireFieldValue().arrayUnion(...accounts),
          peopleKeys: this.ds.fireFieldValue().arrayUnion(...accounts),
          approvedByKeys: this.ds.fireFieldValue().arrayUnion(...accounts),
          readOnlyKeys: this.ds.fireFieldValue().arrayUnion(...accounts)
        }, { merge: true })
      } else {
        batch.set(this.ds.headerDocumentRef().doc(this.headerDocument.key).ref, {
          workplaces: workplaces,
          updated_by: uid,
          updated_at: this.ds.serverTimestamp(),
        }, { merge: true })
      }

    } else {
      if (accounts.length > 0) {
        accounts?.map(officerKey => {
          batch.set(this.ds.headerDocumentOfficerCheckedRef(this.headerDocument?.key).doc(officerKey).ref, {
            isDelete: true,
            isActive: false,
          }, { merge: true })
        })
        batch.set(this.ds.headerDocumentRef().doc(this.headerDocument.key).ref, {
          workplaces: workplaces,
          updated_by: uid,
          updated_at: this.ds.serverTimestamp(),
          accountKeys: this.ds.fireFieldValue().arrayRemove(...accounts),
          peopleKeys: this.ds.fireFieldValue().arrayRemove(...accounts),
          approvedByKeys: this.ds.fireFieldValue().arrayRemove(...accounts),
          readOnlyKeys: this.ds.fireFieldValue().arrayRemove(...accounts)
        }, { merge: true })
      } else {
        batch.set(this.ds.headerDocumentRef().doc(this.headerDocument.key).ref, {
          workplaces: workplaces,
          updated_by: uid,
          updated_at: this.ds.serverTimestamp(),
        }, { merge: true })
      }
    }
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  sectionRejectStatusChanged(uid: string, selected: boolean, section: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.documentRef().doc(this.headerDocument?.key).collection('sections').doc(section.key).set({ isRejected: !selected, updated_by: uid, updated_at: this.ds.serverTimestamp() }, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  streamDocument(item: IStreamDocument, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.headerDocumentOfficerCheckedRef(this.headerDocument.key).doc(item.key).set(item, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async releasedDocument(headerDocument: IHeaderInformation, uid: string, profile, employee: IOfficer, callback: (status: boolean, error: string) => void) {

    this.process = true;
    const batch = this.ds.batch();

    let detailData = []
    if (headerDocument.more_report_headerRef) {
      const detailDocs = await this.ds.dbRef().collection("documents_header", ref => ref.where("more_report_headerRef", "==", headerDocument.more_report_headerRef)).get().toPromise()
      detailData = pushToArray(detailDocs)
      detailData = detailData.filter(m => m.key !== headerDocument.more_report_headerRef)
    }
    
    if (detailData && detailData.length > 0) {
      detailData.map(m => {
        const movement: IHeaderMovement = {
          key: this.ds.createId(),
          created_at: this.ds.serverTimestamp(),
          created_by: employee.key,
          documentKey: m?.key,
          profile: toEmployee(employee, true),
          workplaceKey: m?.workplace?.key,
          workplace: toDepartmentNoWorkplace(employee?.currentDepartment),
        }
        batch.set(this.ds.headerDocumentMovementRef().doc(movement.key).ref, movement, { merge: true })
        batch.set(this.ds.headerDocumentRef().doc(m.key).ref.collection("user_permission").doc(uid), {
          approvedAt: new Date(),
          approvedBy: uid,
          completedTask: true,
          default_signatureFile: employee?.signatureFile || null,
          default_stampFile: employee?.stampFile || null,
        }, { merge: true })

        batch.set(this.ds.headerDocumentRef().doc(m.key).ref, {
          coverFile: m?.coverFile || null,
          updated_by: uid,
          doc_status: docStatusObj.released,
          updated_at: this.ds.serverTimestamp(),
          calendar_date: this.ds.serverTimestamp(),
          calendar_date_key: ConvertService.toDateKey(this.ds.serverTimestamp()),
        }, { merge: true })
      })
    }

    const movement: IHeaderMovement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: employee.key,
      documentKey: headerDocument?.key,
      profile: toEmployee(employee, true),
      workplaceKey: headerDocument?.workplace?.key,
      workplace: toDepartmentNoWorkplace(employee?.currentDepartment),
    }
    batch.set(this.ds.headerDocumentMovementRef().doc(movement.key).ref, movement, { merge: true })
    batch.set(this.ds.headerDocumentRef().doc(headerDocument.key).ref.collection("user_permission").doc(uid), {
      approvedAt: new Date(),
      approvedBy: uid,
      completedTask: true,
      default_signatureFile: employee?.signatureFile || null,
      default_stampFile: employee?.stampFile || null,
    }, { merge: true })

    batch.set(this.ds.headerDocumentRef().doc(headerDocument.key).ref, {
      coverFile: headerDocument?.coverFile || null,
      updated_by: uid,
      doc_status: docStatusObj.released,
      updated_at: this.ds.serverTimestamp(),
      calendar_date: this.ds.serverTimestamp(),
      calendar_date_key: ConvertService.toDateKey(this.ds.serverTimestamp()),
    }, { merge: true })

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  requestEditDoc(headerDocument: IHeaderInformation, employee: IOfficer, isRequestEdit: boolean, callback: (status: boolean, error: any) => void) {
    this.process = true;
    const batch = this.ds.batch();
    const movement: IHeaderMovement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: employee.key,
      documentKey: headerDocument?.key,
      profile: toEmployee(employee, true),
      workplaceKey: headerDocument?.workplace?.key,
      workplace: toDepartmentNoWorkplace(employee?.currentDepartment),
      is_request_edit: isRequestEdit,
    }
    batch.set(this.ds.headerDocumentMovementRef().doc(movement.key).ref, movement, { merge: true })

    const item: any = {
      is_request_edit: isRequestEdit,
      request_edit_status: isRequestEdit ? requestEditStatus.request : requestEditStatus.completed,
      request_edit_at: this.ds.serverTimestamp(),
      request_edit_by: employee.key,
    }

    batch.update(this.ds.headerDocumentRef().doc(headerDocument.key).ref, {
      ...item,
    })
    batch.commit().then(() => {
      callback(true, item)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
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

  @action
  async fetchWorkPlaceCheckDone(res: any, inbox) {
    let workPlaces = [];
    let pendingJobs = [];
    const docKey = this.headerDocument && this.headerDocument.key || null
    if (!docKey) {
      return {
        workPlaces,
        pendingJobs,
      }
    }
    const w1 = res.workplaces && res.workplaces.filter(m => m.order === 1 && m.requestApproved === true) || []
    const wd = res.workplaces && res.workplaces.filter(m => m.order >= 2) || []
    let wArray = []
    wArray = wArray.concat(w1)
    wArray = wArray.concat(wd)
    await Promise.all(
      wArray.map(async w => {
        const docs = await this.ds.headerDocumentRef().doc(docKey).collection("user_permission", ref => ref
          .where("ranking.key", "==", w.ranking.key)
          .where("isDelete", "==", false)
        ).get().toPromise()
        const data = docs.docs.map(m => ({
          key: m.data().key,
          head: m.data().head,
          completedTask: m.data().completedTask
        }));

        let completedTask = false
        if (w.order <= 2) {
          const headData = data.filter(m => m.head)
          completedTask = headData && headData.length > 0 ? headData[0].completedTask : false
        } else {
          completedTask = data && data.length > 0 ? data[0].completedTask : false
        }

        const wData = {
          ...w,
          completedTask: completedTask
        }

        workPlaces.push(wData)
      })
    )

    const pendingJobDoc = await this.ds.documentRef().doc(docKey).collection("sections", ref => ref
      .where("type.key", "==", 8)
    ).get().toPromise()
    pendingJobs = pendingJobDoc.docs.map(m => ({
      key: m.data().key,
    }));

    // if (pendingJobs && pendingJobs.length > 0) {
    //     const pendingJobData = {
    //         key: "0",
    //         order: 0,
    //         name: "កំណត់បង្ហាញបន្ថែម",
    //     }
    //     workPlaces = workPlaces.concat([pendingJobData])
    // }

    workPlaces = inbox ? MappingService.orderBy(workPlaces, "order") : MappingService.orderByDesc(workPlaces, "order")
    return {
      workPlaces,
      pendingJobs,
    }
  }

  @observable fetchDocumentHeaderRef: Subscription = null;
  @observable fetchDocumentRef: Subscription = null;
  @observable headerDocument: IHeaderInformation = null;
  @observable finalDocument: any = false;
  @observable documentStreamOfficers: IStreamDocument[] = [];
  @observable workPlaces: IStreamDocument[] = [];
  @observable pendingJobs: IStreamDocument[] = [];

  @observable selectedDocumentNoted: IHeaderInformation = null;

  @action
  async fetchSelectedDocumentNoted(parentDocKey: string, currentWorkplace: IDepartment) {
    const notedData = await this.ds.headerDocumentRef(ref => ref.where('doc_parent', '==', parentDocKey)
      .where('isDelete', '==', false)
      .where('workplace.key', '==', currentWorkplace.key)
      .orderBy('created_at', 'desc').limit(1))
      .get().toPromise();
    this.selectedDocumentNoted = null;
    if (!notedData.empty) {
      this.selectedDocumentNoted = pushToArray(notedData)[0]
    }
    return this.selectedDocumentNoted
  }

  @observable checkHaveBlockNoteRef: Subscription = null;
  @action
  async checkHaveBlockNote(headerDocument: any, department: any, uid, callback) {
    const { receivedBlockNoteWorkPlaceKeys, receivedBlockNoteWorkPlaceExistKeys } = headerDocument
    const { parent } = department
    const haveBlockNote = parent.filter(m => receivedBlockNoteWorkPlaceKeys && receivedBlockNoteWorkPlaceKeys.indexOf(m) !== -1).length > 0 ? true : false || false
    const isOwnDepartment = receivedBlockNoteWorkPlaceKeys && receivedBlockNoteWorkPlaceKeys.find(m => m === department?.key) ? true : false
    const haveBlockNoteExist = parent.filter(m => receivedBlockNoteWorkPlaceExistKeys && receivedBlockNoteWorkPlaceExistKeys.indexOf(m) !== -1).length > 0 ? true : false || false
    this.checkHaveBlockNoteRef?.unsubscribe()
    let blockNoteDoc = null
    if (haveBlockNote || isOwnDepartment) {
      this.checkHaveBlockNoteRef = this.ds.dbRef().collection("documents_header").doc(this.headerDocument?.key).collection("block_notes", ref => ref
        .where("receivedWorkplaceKeys", "array-contains", uid)
      ).valueChanges().subscribe(res => {
        blockNoteDoc = res.filter(m => m?.status?.key === 1).length > 0 ? res[0] : null
        callback({
          isShowBlockNote: haveBlockNote || isOwnDepartment,
          isOwnDepartment: isOwnDepartment,
          blockNoteDoc: blockNoteDoc,
          haveBlockNoteExist: haveBlockNoteExist,
        })
      })

    }
  }

  @action
  saveBlockNote(item: IBlockNote, headerDocument, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.dbRef().collection("documents_header").doc(headerDocument.key).collection("block_notes")
      .doc(item.key)
      .set(item, { merge: true })
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }

  @observable selectedDocument: IHeaderInformation = null;
  @action
  async fetchDocument(documentKey: string) {
    if (!documentKey) {
      this.selectedDocument = null;
      return this.selectedDocument;
    }
    const doc = await this.ds.headerDocumentRef().doc(documentKey).get().toPromise();
    this.selectedDocument = pushToObject(doc);
    return this.selectedDocument
  }

  subscribeDocumentStatisticRef: Subscription = null;
  @observable statistic: any = null;
  @observable countComment: any[] = [];
  @action
  fetchHeaderDocumentStatistic(headerKey: string) {
    this.subscribeDocumentStatisticRef && this.subscribeDocumentStatisticRef.unsubscribe()
    this.subscribeDocumentStatisticRef = this.ds.documentStatisticRef().doc(headerKey).valueChanges().subscribe(doc => {
      this.statistic = doc;
    })
  }

  @action
  async fetchHeader(headerKey: string, uid: string, callback: (doc: IHeaderInformation) => void) {
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
  async fetchTemplateHeader(headerKey: string, uid: string, callback: (doc: IHeaderInformation) => void) {
    this.fetchDocumentHeaderRef && this.fetchDocumentHeaderRef.unsubscribe()
    this.fetchDocumentHeaderRef = this.ds.documentTemplateRef().doc(headerKey).valueChanges().subscribe((doc: any) => {
      this.headerDocument = doc ? {
        ...doc,
        photoUrl: doc?.owner_profile?.file?.downloadUrl ? transformImageSameTokenNo(doc?.owner_profile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY,
        amTimeAgo: fromNow(doc?.created_at?.toDate(), true),
        isChecked: doc?.visitor_keys?.find(m => m === uid) ? true : false,
      } : null;
      callback && callback(this.headerDocument)
    })
  }


  @action
  async fetchRefHeader(ref, inbox) {
    const workPlaceCheck = await this.fetchWorkPlaceCheckDone(ref, inbox)
    this.workPlaces = workPlaceCheck.workPlaces;
    this.pendingJobs = workPlaceCheck.pendingJobs;

  }

  @observable fetchDocumentStreamOfficersRef: Subscription = null;
  @action
  fetchDocumentStreamOfficers(headerKey: string, callback: (doc: IStreamDocument[]) => void) {
    this.fetchDocumentStreamOfficersRef && this.fetchDocumentStreamOfficersRef.unsubscribe()
    this.fetchDocumentStreamOfficersRef = this.ds.headerDocumentOfficerCheckedRef(headerKey, ref => ref.orderBy('profile.position.order')).valueChanges().subscribe(data => {
      this.documentStreamOfficers = (data as IStreamDocument[]);
      callback && callback(this.documentStreamOfficers)
    })
  }

  @observable fetchWorkplaceReceivedJobRef: Subscription = null;
  @action
  fetchWorkplaceReceivedJob(key: string, callback: (doc: any[]) => void) {
    this.fetchWorkplaceReceivedJobRef && this.fetchWorkplaceReceivedJobRef.unsubscribe()
    this.fetchWorkplaceReceivedJobRef = this.ds.documentRef().doc(key).collection('sections', ref => ref.orderBy('page_key')).valueChanges().subscribe(data => {
      this.workplaceReceivedJob = data.filter(m => m?.type?.key === 8 && !m?.isHeader);
      callback && callback(this.workplaceReceivedJob)
    })
  }

  @observable fetchDocumentAccountPermissionRef: Subscription = null;

  @action
  onUnsubscribefetchDocumentAccountPermissionRef = () => {
    if (this.fetchDocumentAccountPermissionRef) this.fetchDocumentAccountPermissionRef.unsubscribe()
    return Promise.resolve()
  }

  @observable allUserPermission: any[] = [];
  @observable approvalUserPermission: any[] = [];
  @observable documentAccountPermissionRef: Subscription = null;
  @action
  fetchDocumentAccountPermission = async (header: IHeaderInformation, config: ISettings, callback: (doc: IUserPermission[]) => void) => {
    this.documentAccountPermissionRef?.unsubscribe()
    this.documentAccountPermissionRef = this.ds.documentAccountPermissionRef(header?.key, ref => ref.orderBy('created_at')).valueChanges().subscribe(data => {
      this.userPermission = MappingService.orderByDesc(data.filter(m => !m.isDelete), 'approval_order');
      this.approvalUserPermission = MappingService.orderByDesc(this.userPermission, "approval_order")
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

  @observable fetchDocumentCommentRef: Subscription = null;
  @observable loadingComment: boolean = true;
  @action
  fetchDocumentComment(key: string, callback: (doc: any[]) => void) {
    this.fetchDocumentCommentRef && this.fetchDocumentCommentRef.unsubscribe()
    this.fetchDocumentCommentRef = this.ds.headerDocumentRef().doc(key)
      .collection('documentComments', ref => ref.where('status.key', '==', 1))
      .valueChanges().subscribe(data => {
        this.documentCommentsData = orderBy(data, 'created_at');
        this.documentCommentsHeaderData = this.documentCommentsData.filter(f => f.isHeader === true);
        this.documentCommentsChildData = this.documentCommentsData.filter(f => f.isHeader === false);
        callback && callback(this.documentCommentsData)
        this.loadingComment = false;
      })
  }
  @action
  subscribeFetchDocumentComment() {
    this.fetchDocumentCommentRef && this.fetchDocumentCommentRef.unsubscribe()
  }

  @observable fetchDocumentSectionRef: Subscription = null;
  @action
  async fetchDocumentSections(key: string, param: any, callback: (doc: any[]) => void): Promise<void> {
    const header = pushToObject(await this.ds.headerDocumentRef().doc<IHeaderInformation>(key).get().toPromise());
    this.fetchDocumentSectionRef && this.fetchDocumentSectionRef.unsubscribe()
    this.fetchDocumentSectionRef = this.ds.documentRef().doc(key).collection('sections', ref => ref.orderBy('page_key')).valueChanges().subscribe(data => {
      this.documentSections = data.filter(m => !m?.isRejected);
      this.documentReceivedWorkplaces = data.filter(m => !m?.isRejected && !m?.isHeader && !m?.isInfo);

      this.tabsInbox = tabs.document_tabs_inbox.map(m => ({ key: m?.key, label: m?.label, path: `/edoc/preview/${header?.key}/${header?.workplace?.key}/${param?.isParent}/design/${m?.key}` }))
      this.tabsPreviewInbox = tabs.document_tabs_inbox.map(m => ({ key: m?.key, label: m?.label, path: `/edoc/document/preview/${header?.key}/${header?.workplace?.key}/${param?.isParent}/design/${m?.key}` }))

      const documentTabsPreview = tabs.document_tabs_preview.filter(m => m.key !== "workplaces")
      this.tabsPreview = documentTabsPreview.map(m => ({ key: m?.key, label: m?.label, path: `/edoc/document/${header?.key}/${m?.key}` }))

      this.tabs = tabs.document_tabs_no_task.map(m => ({ key: m?.key, label: m?.label, path: `/edoc/form/${header?.key}/${header?.workplace?.key}/design/${m?.key}` }))
      if (this.documentSections.find(m => m?.type?.key === 8 && !m?.isHeader && !m?.isInfo)) {
        this.tabs = tabs.document_tabs.map(m => ({ key: m?.key, label: m?.label, path: `/edoc/form/${header?.key}/${header?.workplace?.key}/design/${m?.key}` }))
        this.tabsPreview = tabs.document_tabs_preview.map(m => ({ key: m?.key, label: m?.label, path: `/edoc/document/${header?.key}/${m?.key}` }))
      }
      callback && callback(this.documentSections)
    })
  }


  @action
  async fetchDocumentTemplateSections(key: string, callback: (doc: any[]) => void): Promise<void> {
    this.fetchDocumentSectionRef && this.fetchDocumentSectionRef.unsubscribe()
    this.fetchDocumentSectionRef = this.ds.documentTemplateRef().doc(key).collection('sections', ref => ref.orderBy('page_key')).valueChanges().subscribe(data => {
      this.documentSections = data.filter(m => !m?.isRejected);
      callback && callback(this.documentSections)
    })
  }


  @observable fetchDocumentViewersRef: Subscription = null;
  @action
  fetchDocumentViewers(key: string, callback: (doc: any) => void) {
    this.fetchDocumentViewersRef && this.fetchDocumentViewersRef.unsubscribe()
    this.fetchDocumentViewersRef = this.ds.headerDocumentRef().doc(key).collection('viewers').valueChanges().subscribe(data => {
      this.documentViewersData = data;
      callback && callback(this.documentViewersData)
    })
  }

  @action
  fetchDocumentsDoc(key: string, callback: (doc: IDocument) => void) {
    this.loading = true
    this.fetchDocumentRef && this.fetchDocumentRef.unsubscribe()
    this.fetchDocumentRef = this.ds.documentRef().doc<IDocument>(key).valueChanges().subscribe(data => {
      this.documentDataDoc = data;
      this.loading = false
      callback && callback(this.documentDataDoc)
    })
  }

  @action
  async fetchDocTemplate(id: string) {
    this.loading = true;
    const dataTemplate = await this.ds.documentTemplateRef(ref => ref.where("key", "==", id)).get().toPromise();
    let docTemHeaderItem = pushToArray(dataTemplate);
    docTemHeaderItem = MappingService.orderBy(docTemHeaderItem, "created_at");
    let docItemArray = [];
    await Promise.all(
      docTemHeaderItem.map(async m => {

        const documentData = await this.ds.documentRef().doc(m.key).get().toPromise()
        const documentDataDoc = pushToObject(documentData)

        const sectionDocs = await this.ds.documentTemplateRef().doc(m.key).collection('sections', ref => ref.orderBy('page_key')).get().toPromise()
        let sectionData = pushToArray(sectionDocs)
        sectionData = sectionData.filter(m => !m?.isRejected);

        const groupSections = orderBy(groupBy(sectionData.filter(f => f.isRejected === false), 'sectionKey'), 'page_key');

        const data = {
          headerDocument: m,
          documentDataDoc: documentDataDoc,
          groupSections: groupSections
        }
        docItemArray.push(data)

      })
    )

    // this.userPermission = []
    // this.allUserPermission = []
    // this.userPermissionCompeted = []
    // await Promise.all(
    //   docItemArray.map(async d => {

    //     const items = await this.ds.documentAccountPermissionRef(d?.headerDocument?.key, ref => ref.orderBy('created_at')).get().toPromise();
    //     const data = pushToArray(items);
    //     const userP = orderBy(data.filter(m => !m.isDelete), 'profile.position.order');
    //     this.userPermission = this.userPermission.concat(userP)
    //     this.allUserPermission = this.allUserPermission.concat(data);
    //     const userPC = userP.filter(m => m?.completedTask === true)
    //     this.userPermissionCompeted = this.userPermissionCompeted.concat(userPC);
    //   })
    // )

    this.loading = false
    return docItemArray;
  }

  @action
  async fetchDocumentsFullSet(id: string) {
    this.loading = true

    // const docHeaderDoc = await this.ds.documentHeaderRef().doc(id).get().toPromise()
    // const docHeaderData = pushToObject(docHeaderDoc)

    // const { doc_parent, doc_parentData } = docHeaderData

    const docHeaderDoc = await this.ds.documentHeaderRef(ref => ref.where("doc_parentData", "array-contains", id)).get().toPromise()
    let docHeaderItem = pushToArray(docHeaderDoc)
    docHeaderItem = MappingService.orderBy(docHeaderItem, "created_at")

    // if (!doc_parent) {

    //     docHeaderItem = [docHeaderData]
    // }

    // if (doc_parentData && doc_parentData.length >= 2) {
    //     await Promise.all(
    //         doc_parentData.map(async (m) => {
    //             const docHeaderDoc = await this.ds.documentHeaderRef(ref => ref
    //                 .where("key", "==", m)
    //             ).get().toPromise()
    //             const docHeaderDataItem = pushToArray(docHeaderDoc)

    //             if (docHeaderDataItem && docHeaderDataItem.length > 0) {
    //                 docHeaderItem = docHeaderItem.concat(docHeaderDataItem)
    //             }
    //         })
    //     )
    // }

    let docItemArray = []
    await Promise.all(
      docHeaderItem.map(async m => {

        const documentData = await this.ds.documentRef().doc(m.key).get().toPromise()
        const documentDataDoc = pushToObject(documentData)

        const sectionDocs = await this.ds.documentRef().doc(m.key).collection('sections', ref => ref.orderBy('page_key')).get().toPromise()
        let sectionData = pushToArray(sectionDocs)
        sectionData = sectionData.filter(m => !m?.isRejected);

        const groupSections = orderBy(groupBy(sectionData.filter(f => f.isRejected === false), 'sectionKey'), 'page_key');

        const data = {
          headerDocument: m,
          documentDataDoc: documentDataDoc,
          groupSections: groupSections
        }

        docItemArray.push(data)
      })
    )

    this.userPermission = []
    this.allUserPermission = []
    this.userPermissionCompeted = []
    await Promise.all(
      docItemArray.map(async d => {

        const items = await this.ds.documentAccountPermissionRef(d?.headerDocument?.key, ref => ref.orderBy('created_at')).get().toPromise();
        const data = pushToArray(items);
        const userP = MappingService.orderByDesc(data.filter(m => !m.isDelete), 'approval_order');
        this.userPermission = this.userPermission.concat(userP)
        this.approvalUserPermission = MappingService.orderByDesc(this.userPermission, "approval_order")
        this.allUserPermission = this.allUserPermission.concat(data);
        const userPC = userP.filter(m => m?.completedTask === true)
        this.userPermissionCompeted = this.userPermissionCompeted.concat(userPC);
      })
    )

    this.loading = false
    return docItemArray;
  }

  @observable fetchChildDocRef: Subscription = null;
  @action
  async fetchChildDoc(key: string, callback: (doc: IDocument) => void) {
    this.loading = true
    this.childDataDoc = pushToObject(await this.ds.documentRef().doc<IDocument>(key).get().toPromise()) as IDocument
    callback(this.childDataDoc)
    this.loading = false
  }

  @action
  deleteFile(header: IHeaderInformation, file: any, uid: string, callback: (status: boolean, error: string) => void) {
    try {
      this.process = true;
      this.ds.documentHeaderRef().doc(header.key).set({
        files: header.files,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
      }, { merge: true }).then(() => {
        this.storageService.storageRef(file?.filename).delete()
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false
      })
    } catch (error) {
    }
  }

  @action
  deleteDocument(header: IHeaderInformation, uid: string, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.documentHeaderRef().doc(header.key).set({
      isDelete: true,
      deleted_by: uid,
      deleted_at: this.ds.serverTimestamp(),
    }, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false
    })
  }

  @action
  voidDocument(header: IHeaderInformation, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.documentHeaderRef().doc(header.key).update({ ...header }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false
    })
  }

  @action
  completedDocument(header: IHeaderInformation, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.documentHeaderRef().doc(header.key).update({ ...header }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false
    })
  }

  @action
  receiveReportDocument(header: IHeaderInformation, callback: (status: boolean, error: string) => void) {
    this.process = true;
    this.ds.documentHeaderRef().doc(header.key).set(header, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false
    })
  }


  @action
  async approvalDocument(form: any, selectedDocument: any, userPermissionKey: string, employee: any, currentDepartment: any, callback: (status: boolean, error: string) => void) {
    this.process = true
    const { remarkText } = form

    const remarkTextDoc = await this.ds.dbRef().collection("officers").doc(employee.key).collection("remarkTexts", ref => ref.where("remarkText", "==", remarkText)).get().toPromise()
    const remarkTextData = pushToArray(remarkTextDoc)

    const movement: IHeaderMovement = {
      key: this.ds.createId(),
      created_at: new Date(),
      created_by: form.approvedBy,
      documentKey: selectedDocument?.key || "",
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment)
    }

    const batch = this.ds.batch()
    const movementRef = this.ds.firestore().collection("documents_header_movement").doc(movement?.key)
    const ref = this.ds.firestore().collection("documents_header").doc(selectedDocument?.key).collection("user_permission").doc(employee?.key);
    batch.set(ref, form);
    batch.set(movementRef, movement, { merge: true });

    if (remarkTextData && remarkTextData.length === 0) {
      const remarkData = {
        key: this.ds.createId(),
        remarkText,
        created_at: new Date(),
      }
      batch.set(this.ds.firestore().collection("officers").doc(employee.key).collection("remarkTexts").doc(remarkData.key), remarkData);
    }

    batch.commit().then(() => {
      callback(true, null)
    }).catch((error) => {
      alert("Unexpected Issue")
    }).finally(() => this.process = false);
  }

  @action
  async addMemo(data: IDocument, header: IHeaderInformation, parentDoc: IHeaderInformation, userAccount: any[], sections: any[], currentDepartment: IDepartment, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const headerRef = this.ds.documentHeaderRef().doc(data.key).ref
    const parentData = await this.ds.documentHeaderRef().doc(parentDoc.key).get().toPromise();
    const parent = pushToObject(parentData)
    const ref = this.ds.documentRef().doc(data.key).ref;
    sections.map(m => {
      const sectionData = {
        ...m,
        sectionKey: m.sectionKey ?? m.key,
        isHeader: true,
      }
      if (m?.type?.key === 10 && m.office) {

        const key = m.sectionKey ?? m.key + '_' + m.office.key;
        // const key = m.key ?? this.ds.createId();

        batch.set(ref.collection('sections').doc(key), {
          ...m,
          key: key,
          sectionKey: sectionData.key,
          created_at: m?.created_at || this.ds.serverTimestamp(),
          created_by: m?.created_by || data.updated_by,
          page_key: m?.page_key || ConvertService.pageKey(),
          updated_at: this.ds.serverTimestamp(),
          updated_by: data.updated_by,
          isRejected: m?.isRejected || false,
          rejected_by: m?.rejected_by || null,
          rejected_at: m?.rejected_at || null,
          isHeader: false,

        }, { merge: true })
      } else {
        const { office } = m;
        Array.isArray(office) && office.map(item => {
          const key = m.sectionKey ?? m.key + '_' + item.key;
          // const key = m.key ?? this.ds.createId();
          const row = {
            type: m?.type,
            isInfo: m?.isInfo || false,
            contentTitle: m?.contentTitle || null,
            content: m?.content || null,
            office: item,
            key: key,
            created_at: m?.created_at || this.ds.serverTimestamp(),
            created_by: m?.created_by || data.updated_by,
            page_key: m?.page_key || ConvertService.pageKey(),
            updated_at: this.ds.serverTimestamp(),
            updated_by: data.updated_by,
            isRejected: m?.isRejected || false,
            rejected_by: m?.rejected_by || null,
            rejected_at: m?.rejected_at || null,
            sectionKey: sectionData.key,
            isHeader: false,
          }
          batch.set(ref.collection('sections').doc(key), row, { merge: true })
        })
      }
      batch.set(ref.collection('sections').doc(sectionData.key), sectionData, { merge: true })
    })
    if (userAccount && userAccount.length > 0) {
      userAccount.map(account => {
        // const userPermission = this.userPermission.find(m => m?.accountKey === account?.key);
        // const permission: IUserPermission = {
        //     key: userPermission?.key || account?.key,
        //     created_at: userPermission?.created_at || this.ds.serverTimestamp(),
        //     created_by: userPermission?.created_by || header?.updated_by,
        //     updated_by: header?.updated_by,
        //     isDelete: userPermission?.isDelete || false,
        //     accountKey: account?.key,
        //     permission: userPermission?.permission || account?.permission || ACCOUNT_PERMISSION_OBJECT.canApproved,
        //     documentKey: header?.key,
        //     workplaceKey: account?.workplaceKey,
        //     completedTask: account?.completedTask || false,
        //     approvedAt: account?.approvedAt || null,
        //     approvedBy: account?.approvedBy || null,
        //     head: account?.head || false,
        //     assistant: account?.assistant || false,
        //     ranking: account?.ranking || null,
        //     profile: toOfficer(account)
        // }
        // batch.set(this.ds.documentAccountPermissionRef(header?.key).doc(permission.key).ref, permission, { merge: true })
      })
    }

    if (header) {
      batch.set(headerRef, header, { merge: true })
    }
    const receivedWorkplaceCompletedByDocKeys = parent?.receivedWorkplaceCompletedByDocKeys || [];
    const { doc_status_level } = parent;
    let workplace: any = null;
    switch (doc_status_level?.order) {
      case 0.5://ministry
        workplace = currentDepartment?.workplace?.find(m => m?.order === 1)
        break;
      case 1:
        workplace = currentDepartment?.workplace?.find(m => m?.order === 2)
        break;
      case 2:
        workplace = currentDepartment?.workplace?.find(m => m?.order === 3)
        break;
      default:
        break;
    }
    const receivedMemo = {
      key: workplace?.key,
      workplaceKey: workplace?.key,
      documentKey: data?.key,
    }
    const receivedMemoItems = pushObjArray(receivedWorkplaceCompletedByDocKeys, receivedMemo)
    batch.set(this.ds.documentHeaderRef().doc(parentDoc?.key).ref, {
      receivedWorkplaceCompletedByDocKeys: receivedMemoItems
    }, { merge: true })
    batch.set(ref, data, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  addDocument(data: IDocument, header: IHeaderInformation, userAccount: any[], sections: any[], parentDocument: IHeaderInformation, addMoreItem: any, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const headerRef = this.ds.documentHeaderRef().doc(data.key).ref
    const ref = this.ds.documentRef().doc(data.key).ref;

    sections.map(m => {
      const sectionData = {
        ...m,
        sectionKey: m.sectionKey ?? m.key,
        isHeader: true,
        isRejected: m?.isRejected || false,
      }
      if (m?.type?.key === 10 && m.office) {
        const key = m.sectionKey ?? m.key + '_' + m.office.key;
        // const key = m.key ?? this.ds.createId();
        batch.set(ref.collection('sections').doc(key), {
          ...m,
          key: key,
          sectionKey: sectionData.key,
          created_at: m?.created_at || this.ds.serverTimestamp(),
          created_by: m?.created_by || data.updated_by,
          page_key: m?.page_key || ConvertService.pageKey(),
          updated_at: this.ds.serverTimestamp(),
          updated_by: data.updated_by,
          isRejected: m?.isRejected || false,
          rejected_by: m?.rejected_by || null,
          rejected_at: m?.rejected_at || null,
          isHeader: false,

        }, { merge: true })
      } else {
        const { office } = m;
        Array.isArray(office) && office?.map(item => {
          const key = m.sectionKey ?? m.key + '_' + item.key;
          const row = {
            type: m?.type,
            isInfo: m?.isInfo || false,
            contentTitle: m?.contentTitle || null,
            content: m?.content || null,
            office: item,
            key: key,
            created_at: m?.created_at || this.ds.serverTimestamp(),
            created_by: m?.created_by || data.updated_by,
            page_key: m?.page_key || ConvertService.pageKey(),
            updated_at: this.ds.serverTimestamp(),
            updated_by: data.updated_by,
            isRejected: m?.isRejected || false,
            rejected_by: m?.rejected_by || null,
            rejected_at: m?.rejected_at || null,
            sectionKey: sectionData.key,
            isHeader: false,
          }
          batch.set(ref.collection('sections').doc(key), row, { merge: true })
        })
      }
      batch.set(ref.collection('sections').doc(sectionData.key), sectionData, { merge: true })
    })

    userAccount = MappingService.orderByDesc(userAccount, "position.order")
    if (userAccount && userAccount.length > 0) {
      userAccount?.map((account, index) => {
        const userPermission = this.userPermission.find(m => m?.accountKey === account?.key && m?.documentKey === data?.key);
        const permission: IUserPermission = {
          key: userPermission?.key || account?.key,
          created_at: userPermission?.created_at || this.ds.serverTimestamp(),
          created_by: userPermission?.created_by || header?.updated_by,
          accountKey: userPermission?.accountKey || account?.key,
          workplaceKey: userPermission?.workplaceKey || account?.workplaceKey,
          completedTask: userPermission?.completedTask || account?.completedTask || false,
          approvedAt: userPermission?.approvedAt || account?.approvedAt || null,
          approvedBy: userPermission?.approvedBy || account?.approvedBy || null,
          profile: userPermission?.profile || toOfficer(account),
          isDelete: userPermission?.isDelete || false,
          ranking: userPermission?.ranking || account?.ranking || null,
          isActive: true,
          head: true,
          assistant: false,
          documentKey: header?.key,
          updated_by: header?.updated_by,
          permission: account?.permission || ACCOUNT_PERMISSION_OBJECT.canApproved,
          approval_order: index + 1,
        }
        batch.set(this.ds.documentAccountPermissionRef(header?.key).doc(permission.key).ref, permission, { merge: true })
      })
    }
    // if (this.documentAssistantAccounts && this.documentAssistantAccounts.length > 0) {
    //   this.documentAssistantAccounts?.filter(m => m?.isActive)?.map(account => {
    //     const userPermission = this.userPermission.find(m => m?.accountKey === account?.key && m?.documentKey === data?.key);
    //     const permission: IUserPermission = {
    //       key: userPermission?.key || account?.key,
    //       created_at: userPermission?.created_at || this.ds.serverTimestamp(),
    //       created_by: userPermission?.created_by || header?.updated_by,
    //       accountKey: userPermission?.accountKey || account?.key,
    //       workplaceKey: userPermission?.workplaceKey || account?.workplaceKey,
    //       completedTask: userPermission?.completedTask || account?.completedTask || false,
    //       approvedAt: userPermission?.approvedAt || account?.approvedAt || null,
    //       approvedBy: userPermission?.approvedBy || account?.approvedBy || null,
    //       profile: userPermission?.profile || toOfficer(account),
    //       isApproved_date: userPermission?.isApprove_date,
    //       isDelete: userPermission?.isDelete || false,
    //       ranking: userPermission?.ranking || account?.ranking || null,

    //       isActive: true,
    //       head: false,
    //       assistant: true,
    //       documentKey: header?.key,
    //       updated_by: header?.updated_by,
    //       permission: account?.permission || ACCOUNT_PERMISSION_OBJECT.canConfirm,
    //     }
    //     batch.set(this.ds.documentAccountPermissionRef(header?.key).doc(permission.key).ref, permission, { merge: true })
    //   })
    // }

    if (header) {
      batch.set(headerRef, header, { merge: true })
    }

    if (addMoreItem && addMoreItem?.more_report_isHeader) {
      batch.update(this.ds.documentHeaderRef().doc(addMoreItem.more_report_headerRef).ref, { ...addMoreItem }, { merge: true })
    }

    batch.set(ref, data, { merge: true })
    if (parentDocument) {
      const reportWorkplace = parentDocument?.receivedWorkplaceCompletedByDocKeys?.find(m => m?.workplaceKey === header?.workplace?.key);
      if (!reportWorkplace) {
        const reports: IReplyDocument = {
          key: this.ds.createId(),
          created_at: this.ds.serverTimestamp(),
          created_by: header?.updated_by,
          parentDocumentKey: parentDocument.key,
          workplace: header?.workplace,
          documentKey: header?.key,
          keyword: header?.keyword,
          documentNo: header?.documentNo,
        }
        batch.set(this.ds.replyDocumentRef().doc(reports?.key).ref, reports, { merge: true })
      }
    }

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  addPeopleDoc(data: IDocument, sections: any[], callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const ref = this.ds.documentRef().doc(data.key).ref;

    sections.map(m => {
      const sectionData = {
        ...m,
        sectionKey: m.sectionKey ?? m.key,
        isHeader: true,
        isRejected: m?.isRejected || false,
      }
      if (m?.type?.key === 10 && m.office) {
        const key = m.sectionKey ?? m.key + '_' + m.office.key;
        // const key = m.key ?? this.ds.createId();
        batch.set(ref.collection('sections').doc(key), {
          ...m,
          key: key,
          sectionKey: sectionData.key,
          created_at: m?.created_at || this.ds.serverTimestamp(),
          created_by: m?.created_by || data.updated_by,
          page_key: m?.page_key || ConvertService.pageKey(),
          updated_at: this.ds.serverTimestamp(),
          updated_by: data.updated_by,
          isRejected: m?.isRejected || false,
          rejected_by: m?.rejected_by || null,
          rejected_at: m?.rejected_at || null,
          isHeader: false,

        }, { merge: true })
      } else {
        const { office } = m;
        Array.isArray(office) && office?.map(item => {
          const key = m.sectionKey ?? m.key + '_' + item.key;
          const row = {
            type: m?.type,
            isInfo: m?.isInfo || false,
            contentTitle: m?.contentTitle || null,
            content: m?.content || null,
            office: item,
            key: key,
            created_at: m?.created_at || this.ds.serverTimestamp(),
            created_by: m?.created_by || data.updated_by,
            page_key: m?.page_key || ConvertService.pageKey(),
            updated_at: this.ds.serverTimestamp(),
            updated_by: data.updated_by,
            isRejected: m?.isRejected || false,
            rejected_by: m?.rejected_by || null,
            rejected_at: m?.rejected_at || null,
            sectionKey: sectionData.key,
            isHeader: false,
          }
          batch.set(ref.collection('sections').doc(key), row, { merge: true })
        })
      }
      batch.set(ref.collection('sections').doc(sectionData.key), sectionData, { merge: true })
    })

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  addDocumentTemplate(data: IDocument, sections: any[], callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const headerRef = this.ds.documentTemplateRef().doc(data.key).ref
    sections.map(m => {
      const sectionData = {
        ...m,
        sectionKey: m.sectionKey ?? m.key,
        isHeader: true,
        isRejected: m?.isRejected || false,
      }
      if (m?.type?.key === 10 && m.office) {
        const key = m.sectionKey ?? m.key + '_' + m.office.key;
        batch.set(headerRef.collection('sections').doc(key), {
          ...m,
          key: key,
          sectionKey: sectionData.key,
          created_at: m?.created_at || this.ds.serverTimestamp(),
          created_by: m?.created_by || data.updated_by,
          page_key: m?.page_key || ConvertService.pageKey(),
          updated_at: this.ds.serverTimestamp(),
          updated_by: data.updated_by,
          isRejected: m?.isRejected || false,
          rejected_by: m?.rejected_by || null,
          rejected_at: m?.rejected_at || null,
          isHeader: false,

        }, { merge: true })
      } else {
        const { office } = m;
        Array.isArray(office) && office?.map(item => {
          const key = m.sectionKey ?? m.key + '_' + item.key;
          const row = {
            type: m?.type,
            isInfo: m?.isInfo || false,
            contentTitle: m?.contentTitle || null,
            content: m?.content || null,
            office: item,
            key: key,
            created_at: m?.created_at || this.ds.serverTimestamp(),
            created_by: m?.created_by || data.updated_by,
            page_key: m?.page_key || ConvertService.pageKey(),
            updated_at: this.ds.serverTimestamp(),
            updated_by: data.updated_by,
            isRejected: m?.isRejected || false,
            rejected_by: m?.rejected_by || null,
            rejected_at: m?.rejected_at || null,
            sectionKey: sectionData.key,
            isHeader: false,
          }
          batch.set(headerRef.collection('sections').doc(key), row, { merge: true })
        })
      }
      batch.set(headerRef.collection('sections').doc(sectionData.key), sectionData, { merge: true })
    })
    batch.set(headerRef, data, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @action
  addTemplateDocument(data: any, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const ref = this.ds.documentTemplateRef().doc(data.key).ref;
    batch.set(ref, data, { merge: true });
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async deleteSubDocument(collection, docKey, item, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    this.ds.documentRef().doc(docKey).collection(collection).doc(item.key).delete().then(() => {
      if (item && item?.office?.length) {
        item.office.map(f => {
          const key = item.sectionKey || item.key + '_' + f.office.key;
          try {
            const ref = this.ds.documentRef().doc(docKey).collection(collection).doc(key);
            ref.delete().then(() => {
              callback(true, null)
            }).finally(() => {
              this.process = false;
            })
          } catch (error) { callback(false, error) }
        })
      } else {
        const key = item?.sectionKey || item?.key + '_' + item?.office?.key;
        try {
          const ref = this.ds.documentRef().doc(docKey).collection(collection).doc(key);
          ref.delete().then(() => {
            callback(true, null)
          }).finally(() => {
            this.process = false;
          })
        } catch (error) { callback(false, error) }
      }

    }).finally(() => {
      this.process = false;
    })

  }


  @action
  async deleteSubDocumentTemplate(collection, docKey, item, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    this.ds.documentTemplateRef().doc(docKey).collection(collection).doc(item.key).delete().then(() => {
      if (item && item?.office?.length) {
        item.office.map(f => {
          const key = item.sectionKey || item.key + '_' + f.office.key;
          try {
            const ref = this.ds.documentTemplateRef().doc(docKey).collection(collection).doc(key);
            ref.delete().then(() => {
              callback(true, null)
            }).finally(() => {
              this.process = false;
            })
          } catch (error) { callback(false, error) }
        })
      } else {
        const key = item?.sectionKey || item?.key + '_' + item?.office?.key;
        try {
          const ref = this.ds.documentTemplateRef().doc(docKey).collection(collection).doc(key);
          ref.delete().then(() => {
            callback(true, null)
          }).finally(() => {
            this.process = false;
          })
        } catch (error) { callback(false, error) }
      }

    }).finally(() => {
      this.process = false;
    })

  }


  @action
  async deleteSubArrayDocument(collection, docKey, sectionKey, items: Array<any>, accountKey, callback: (status: boolean, error: string) => void) {
    if (items && items?.length > 0) {

      items.map(f => {
        try {
          const key = f.key;
          const data = {
            key: key,
            isRejected: true,
            rejected_by: accountKey,
            rejected_at: new Date(),
          };

          const ref = this.ds.documentRef().doc(docKey).collection(collection).doc(key);
          ref.update(data).then(() => {
            callback(true, null)
          }).catch(error => {
          }).finally(() => {
            this.process = false;
          })
        } catch (error) { callback(false, error) }

      })
    }
  }

  @action
  async deleteSubArrayDocumentTemplate(collection, docKey, sectionKey, items: Array<any>, accountKey, callback: (status: boolean, error: string) => void) {

    if (items && items?.length > 0) {

      items.map(f => {
        try {
          const key = f.key;
          const data = {
            key: key,
            isRejected: true,
            rejected_by: accountKey,
            rejected_at: new Date(),
          };

          const ref = this.ds.documentTemplateRef().doc(docKey).collection(collection).doc(key);
          ref.update(data).then(() => {
            callback(true, null)
          }).catch(error => {
          }).finally(() => {
            this.process = false;
          })
        } catch (error) { callback(false, error) }

      })
    }
  }


  @action
  addDepartmentDocument(data: IDocument, parent: IDocument, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const ref = this.ds.documentRef()

    const childKey = pushStringArray(parent.childKey || [], data.key)
    const numberRefData = pushObjArray(parent.numberRefData || [], { key: data.key, number_ref: data.number_ref })

    batch.set(ref.doc(data.key).ref, data, { merge: true })
    batch.update(ref.doc(parent.key).ref, { childKey: childKey, numberRefData: numberRefData })

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }



  @action
  updateDocumentLetterHead(data: any, item: any, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const ref = this.ds.documentHeaderRef();
    batch.update(ref.doc(data.key).ref, { workplaces: item })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }



  @action
  departmentApproveDoc(item: IDocument, user: any, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const ref = this.ds.documentRef()

    const data = {
      doc_status: docStatusObj,
      approved_date: this.ds.serverTimestamp(),
      approved_by: user.key,
    }

    batch.update(ref.doc(item.key).ref, { ...data })

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  // comment
  @observable getDocCommentRef: Subscription = null;
  @observable dataComment: any;
  @action
  fetchDocComment(item?: any, callback?: (res: any[]) => void) {
    this.getDocCommentRef && this.getDocCommentRef.unsubscribe()
    this.getDocCommentRef = this.ds.documentCommentRef(item).valueChanges().subscribe(docs => {
      this.dataComment = docs;
      callback && callback(this.dataComment)
    })
  }

  @action
  saveComments(form: any, callback: (arg0: boolean, arg1: any) => void) {
    this.process = true;
    this.ds
      .documentCommentRef(form?.ownerKey)
      .doc(form.key)
      .set(form)
      .then(() => {
        this.process = false;
        callback(true, null);
      })
      .catch((error) => {
        this.process = false;
        callback(false, error);
      });
  }

  // end comment
  @action
  async onComment(selectedDocument: IHeaderInformation | null, commentData: IComment, selectedFile, callback) {
    this.process = true
    const batch = this.ds.batch();

    const fileData = await this.storageService.upload(selectedFile);
    if (fileData && fileData.length > 0) {
      commentData.files = fileData
    }
    const ref = this.ds.headerDocumentRef().doc(selectedDocument?.key).collection('documentComments').doc(commentData?.key).ref
    // const headerRef = commentData?.headerKey ? documentHeaderRef().doc(this.selectedDocument?.key).collection('documentComments').doc(commentData?.headerKey) : null
    //   const uploadedFiles = await uploadMultiFile(commentData.files)
    //   this.comments = this.comments.concat(commentData)
    //   commentData.files = uploadedFiles
    commentData.hasSent = true
    // if(headerRef){
    //   batch.update(headerRef,{
    //     page_key: commentData.page_key
    //   })
    // }
    batch.set(ref, commentData)
    batch.commit().then(() => {
      callback(true)
    }).catch(error => {
      callback(false)
    })
      .finally(() => {
        this.process = false
      })
  }

  @action
  async DeleteComment(selectedDocument: any, commentData, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const ref = this.ds.headerDocumentRef().doc(selectedDocument?.key).collection('documentComments').doc(commentData?.key).ref
    batch.update(ref, commentData)
    batch.commit().then(() => {
      callback(true)
    }).catch(error => {
      callback(false)
    })
      .finally(() => {
        this.process = false
      })
  }

  @action
  async updateComment(selectedDocument: IHeaderInformation | null, commentData: IUpdate, selectedFile, callback) {
    const batch = this.ds.batch();
    this.process_edit = true;
    const fileData = await this.storageService.upload(selectedFile);
    if (commentData && commentData.files.length > 0) {
      for (let index = 0; index < fileData.length; index++) {
        commentData.files = commentData && commentData?.files ? commentData?.files.concat(fileData) : fileData;
      }
    } else {
      if (fileData && fileData.length > 0) {
        commentData.files = fileData
      }
    }



    const ref = this.ds.headerDocumentRef().doc(selectedDocument?.key).collection('documentComments').doc(commentData?.key).ref
    // const headerRef = commentData?.headerKey ? documentHeaderRef().doc(this.selectedDocument?.key).collection('documentComments').doc(commentData?.headerKey) : null
    //   const uploadedFiles = await uploadMultiFile(commentData.files)
    // this.commentData = this.comments.concat(commentData)
    // commentData.files = uploadedFiles
    commentData.hasSent = true
    // if(headerRef){
    //   batch.update(headerRef,{
    //     page_key: commentData.page_key
    //   })
    // }
    batch.update(ref, commentData)
    batch.commit().then(() => {
      callback(true)
    }).catch(error => {
      callback(false)
    })
      .finally(() => {
        this.process_edit = false;
      })

  }

  @action
  delete(ref: any, item: any, callback) {
    this.process = true;
    ref.doc(item.key).delete().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  update(ref: any, item: any, callback) {
    this.process_edit = true;
    ref.doc(item?.key).update(item).then(() => {
      this.process_edit = false;
      callback(true, item)
    }).catch(error => {
      this.process_edit = false;
      callback(false, error)
    });
  }


  @action
  async getDocumentMoreReport(headerKey: string, callback?: (res: any[]) => void) {
    let ref = this.ds.headerDocumentRef(ref=>ref.where('more_report_headerRef','==',headerKey)).get().toPromise()
    return orderBy(pushToArray(await ref), 'created_at', 'asc')
  }
}



export class DynamicFlatNode {
  constructor(
    public item: any,
    public level = 1,
    public expandable = false,
    public isLoading = false,
  ) { }
}

@Injectable({ providedIn: 'root' })
export class ProjectDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: DocumentStore,
  ) { }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void { }
  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }
  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean) {
    const children = this._database.getChildren(node.item);
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      return;
    }
    node.isLoading = true;
    setTimeout(() => {
      if (expand) {
        const nodes = children.map(
          name => new DynamicFlatNode(name, node.level + 1, this._database.isExpandable(name)),
        );
        this.data.splice(index + 1, 0, ...nodes);
      } else {
        let count = 0;
        for (
          let i = index + 1;
          i < this.data.length && this.data[i].level > node.level;
          i++, count++
        ) { }
        this.data.splice(index + 1, count);
      }
      // notify the change
      this.dataChange.next(this.data);
      node.isLoading = false;
    }, 1);
  }
}
