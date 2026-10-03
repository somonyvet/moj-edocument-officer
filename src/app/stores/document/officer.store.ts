import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { action, observable, } from 'mobx';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { APPS } from 'src/app/dummy/config';
import { IDepartment, IOfficer, ISettings, IUserPermission } from 'src/app/interfaces/document/document.interface';
import { ConvertService, orderBy, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';

@Injectable({ providedIn: 'root' })
export class OfficerStore {

  @observable data: IOfficer[] = [];
  @observable currentData: IOfficer = null;
  @observable process: boolean = false;
  @observable loading: boolean = true;
  @observable empty: boolean = false;
  @observable lastVisible: IOfficer = null;
  @observable done: boolean = false;
  @observable fetching: boolean = false;

  @observable fetchDataRef: Subscription = null;
  //for create form selected info
  @observable workingOffices: any[] = [];
  @observable position: any[] = [];

  @observable officers: IOfficer[] = [];

  subscribeOfficerStatus: BehaviorSubject<any>

  constructor(
    private ds: DatabaseService,
    private db: DataService
  ) {
    this.subscribeOfficerStatus = new BehaviorSubject(null)
  }
  @action
  async fetchList(ref: AngularFirestoreCollection) {
    const docs = await ref.get().toPromise();
    return pushToArray(docs);
  }
  @observable fetchUserPermissionWorkplaceRef: Subscription = null;
  @observable userPermissions: IUserPermission[] = [];
  @action
  fetchUserPermissionWorkplace(docKey: string, workplaceKey: string) {
    this.fetchUserPermissionWorkplaceRef && this.fetchUserPermissionWorkplaceRef.unsubscribe()
    this.fetchUserPermissionWorkplaceRef = this.ds.documentAccountPermissionWorkplaceRef(docKey, ref => ref
      .where('officerWorkplaces', 'array-contains', workplaceKey)
      .where('isDelete', '==', false)
      .orderBy('profile.position.order')
    ).valueChanges().subscribe(docs => {
      this.userPermissions = (docs as IUserPermission[]);
    })
  }

  @action
  resetUserPassword(item, profile, callback) {
    this.loading = true
    this.ds.userRef().doc(item.key).update({
      resetPassword: true,
      resetPassword_at: new Date(),
      resetPassword_at_key: ConvertService.dateKey(),
      resetPassword_by: profile.key,
    }).then(() => {
      this.loading = false
      callback(true, null)
    }).catch(error => {
      this.loading = false
      callback(false, error)
    })
  }

  @action
  async fetchOfficers(workplaceKey?: string, hideAccountKeys?: string[]) {
    const docs = await this.ds.officerRef(ref => {
      let condition = ref.where('isDelete', '==', false)
      if (workplaceKey) {
        condition = condition.where('officeKeys', 'array-contains', workplaceKey)
      }
      return condition.orderBy('officerIdNo').limit(APPS.size)
    }).get().toPromise();
    this.officers = pushToArray(docs)?.filter(m => !hideAccountKeys?.includes(m?.key));
    return this.officers
  }

  @action
  async fetchSearchOfficers(keyword: any, workplaceKey: string, hideAccountKeys: string[], callback: (officers: IOfficer[]) => void): Promise<void> {
    if (!keyword || keyword && keyword.key) {
      const docs = await this.ds.officerRef(ref => {
        let condition = ref.where('isDelete', '==', false)
        if (workplaceKey) {
          condition = condition.where('officeKeys', 'array-contains', workplaceKey)
        }
        return condition.orderBy('officerIdNo').limit(APPS.size)
      }).get().toPromise();
      this.officers = workplaceKey && hideAccountKeys ? pushToArray(docs)?.filter(m => !hideAccountKeys?.includes(m?.key)) : pushToArray(docs);
      callback(this.officers)
      return;
    } else {
      const docs = await this.ds.officerRef(ref => ref.where('keyword', 'array-contains', keyword).orderBy('officerIdNo').limit(APPS.size)).get().toPromise();
      this.officers = workplaceKey && hideAccountKeys ? pushToArray(docs)?.filter(m => !hideAccountKeys?.includes(m?.key) && m?.officeKeys?.includes(workplaceKey)) : pushToArray(docs);
      callback(this.officers)
    }
  }

  @action
  async fetchDepartments(config: ISettings): Promise<IDepartment[]> {
    const { startFromLevel } = config;
    const docs = await this.ds.departmentFireRef(ref => {
      return ref.where('isDelete', '==', false).orderBy('node').orderBy('order')
    }).get().toPromise();
    const departments = pushToArray(docs).filter(m => m?.ranking?.order >= startFromLevel?.order);
    return departments;
  }

  @action
  async fetchManagementLevel() {
    const docs = await this.ds.rankingFireRef(ref => ref.orderBy('order')).get().toPromise()
    return pushToArray(docs)
  }

  @action
  async fetchPosition() {
    const docs = await this.ds.positionFireRef(ref => ref.orderBy('order')).get().toPromise()
    return pushToArray(docs)
  }

  @action
  async fetchLevel(startFromLevel?: any) {
    const docs = await this.ds.managementLevelFireRef(ref => {
      if (startFromLevel) return ref.where('order', '>', startFromLevel?.order).orderBy('order')
      return ref.orderBy('order')
    }).get().toPromise()
    return pushToArray(docs)
  }


  @action
  checkExist(nameKey: any, field: string) {
    return this.ds.rankingFireRef(ref => ref.where(field, '==', nameKey));
  }

  @action
  checkUserExist(nameKey: any, field: string) {
    return this.ds.userRef(ref => ref.where(field, '==', nameKey));
  }

  @action
  checkOfficeExist(nameKey: any, field: string) {
    return this.ds.officerRef(ref => ref.where(field, '==', nameKey));
  }

  @action
  saveUpdatePhoto(uid: string, item: any, callback: (status: boolean, error: string) => void) {
    this.ds.userRef().doc(uid).set(item, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async save(item: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const batch = this.ds.batch();
    const workplaceMemberRef = this.ds.departmentFireRef()
    item?.workplace?.map(m => {
      batch.set(workplaceMemberRef.doc(m?.key).collection('department_members').doc(item?.key).ref, item, { merge: true })
    })
    batch.set(this.ds.userAccountRef().doc(item.key).ref, item, { merge: true })
    batch.set(this.ds.officerRef().doc(item?.key).ref, item, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  saveOverseaOfficer(item: any, callback?){
    this.process = true;
    const batch = this.ds.batch();
    batch.set(this.ds.userAccountRef().doc(item.key).ref, item, { merge: true })
    batch.set(this.ds.officerRef().doc(item?.key).ref, item, { merge: true })
    batch.set(this.db.groupUserAccountMemberRef(item.groupData.key).doc(item.key).ref, item, { merge: true })
    batch.set(this.db.groupMemberRef().doc(item.key).ref, item, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @observable registrationFormDoc: any = null;
  @observable fetchUserRegistrationFormRef: Subscription = null;
  @action
  fetchUserRegistrationForm(key: string, callback?: (item: any) => void) {
    this.loading = true;
    this.fetchUserRegistrationFormRef && this.fetchUserRegistrationFormRef.unsubscribe()
    this.fetchUserRegistrationFormRef = this.ds.registrationFormRef().doc(key).valueChanges().subscribe(doc => {
      this.registrationFormDoc = (doc as any);
      this.subscribeOfficerStatus.next(doc?.status)
      this.loading = false;
      callback?.(this.registrationFormDoc)
    })
  }


  @action
  async saveRegistrationForm(item: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const batch = this.ds.batch();
    const registrationFormRef = this.ds.registrationFormRef().doc(item.key).ref
    batch.set(registrationFormRef, item, { merge: true });
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }



  @action
  saveRemark(ref: any, item: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    ref
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
  @action
  deleteRemark(ref: any, item: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    ref
      .doc(item.key)
      .delete()
      .then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }

  @action
  async unsubscribe(): Promise<void> {
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    this.data = [];
    Promise.resolve()
  }

  @action
  fetchSearchData(text: string, callback: any) {
    this.loading = true;
    this.fetchDataRef = this.ds.userAccountRef(text, null).valueChanges().subscribe((docs) => {
      this.data = docs.map((m, index) => ({ ...m, index: index + 1 }));
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
      callback(this.data);
    })
  }

  @action
  fetchData() {
    this.loading = true;
    this.fetchDataRef?.unsubscribe()
    this.fetchDataRef = this.ds.userAccountRef(null, null).valueChanges().subscribe((docs) => {
      this.data = docs.map((m, index) => ({ ...m, index: index + 1 }));
      this.loading = false;
      this.empty = docs.length === 0;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
        this.done = false;
      } else {
        this.done = true;
        this.lastVisible = null;
      }
      this.empty = docs.length === 0;
      this.fetching = false;
    })
  }

  @action
  async fetchMore(): Promise<void> {
    if (!this.lastVisible || this.fetching || this.done) return;
    this.fetching = true;
    const data = await this.ds
      .userAccountRef(null, this.lastVisible)
      .get()
      .toPromise();
    const items = pushToArray(data) as IOfficer[];
    const lastIndex = this.lastVisible?.rowIndex;

    this.data = this.data.concat(
      items.map((m, index) => ({ ...m, rowIndex: lastIndex + index + 1, photoUrl: m?.file?.downloadUrl ? transformImageSameTokenNo(m?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY_AVATAR }))
    );
    if (items?.length >= APPS.size) {
      this.lastVisible = this.data[this.data.length - 1];
      this.done = false;
    } else {
      this.done = true;
      this.lastVisible = null;
    }
    this.fetching = false;
  }





  @action
  fetchTemplateData() {
    this.loading = true;
    this.fetchDataRef = this.ds.documentsTemplateRef(null).valueChanges().subscribe((docs: any) => {
      this.data = docs.map((m, index) => ({ ...m, index: index + 1 }));
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
    })
  }

  @action
  async fetchTemplateMore(): Promise<void> {
    if (!this.lastVisible || this.fetching || this.done) return;
    this.fetching = true;
    const data = await this.ds
      .documentsTemplateRef(this.lastVisible)
      .get()
      .toPromise();
    const items = pushToArray(data) as IOfficer[];
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
  getCurrentData(key) {
    this.loading = true;
    this.ds.userAccountRef()
      .doc(key)
      .get()
      .toPromise()
      .then((doc) => {
        this.currentData = pushToObject(doc)
        this.loading = false;
      })
  }
}
