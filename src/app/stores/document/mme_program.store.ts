import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IPosition, IProgram, IRanking, ISettings } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { orderBy, orderByData, pushObjArray, pushToArray, removeObjArray, toUniq } from 'src/app/shared/services/convert.service';
import { AngularFirestore, DocumentData, QuerySnapshot } from '@angular/fire/compat/firestore';
import { groupBy, MappingService, toDepartment, toDepartmentMME, toFlatten, toRanking } from 'src/app/shared/services/mapping.service';
import { IMmeMainProgram, IMmeProgram } from 'src/app/interfaces/mme';

@Injectable({ providedIn: 'root' })
export class MmeBaseProgramStore {
  @observable data: IProgram[] = [];
  @observable process: boolean = false;
  @observable loading: boolean = true;
  @observable empty: boolean = false;
  @observable lastVisible: IProgram = null;
  @observable done: boolean = false;
  @observable fetching: boolean = false;

  @observable departments: IProgram[] = [];
  @observable departmentOfficers = [];
  //form
  @observable position: IPosition[] = []
  constructor(
    private ds: DatabaseService,
    private db: AngularFirestore
  ) { }

  @action
  async fetchOfficerByPosition(positionKey: string) {
    const docs = await this.ds.officerRef(ref => ref.where('positionKeys', 'array-contains', positionKey)).get().toPromise();
    const list = pushToArray(docs);
    return orderBy(list, "officerIdNo")
  }

  @action
  async fetchManagementLevel() {
    const docs = await this.ds.rankingFireRef(ref => {
      return ref.orderBy('order')
    }).get().toPromise()
    return orderByData(pushToArray(docs), "order")
  }

  @action
  async fetchRanking() {
    const docs = await this.ds.managementLevelFireRef(ref => ref.orderBy('order')).get().toPromise();
    return pushToArray(docs)
  }

  @action
  async fetchDepartments(): Promise<IProgram[]> {
    const docs = await this.ds.departmentFireRef(ref => {
      return ref.orderBy('node').orderBy('order')
    }).get().toPromise();
    this.departments = pushToArray(docs);
    return this.departments;
  }

  @action
  subscribeFetchWorkplaces() {
    this.fetchWorkplacesRef && this.fetchWorkplacesRef.unsubscribe()
    this.departments = []
    this.position = [];
  }
  @observable fetchWorkplacesRef: Subscription = null;
  @action
  fetchWorkplaces(callback: (items: IProgram[]) => void): void {
    this.fetchWorkplacesRef = this.ds.programFireRef(ref => ref.orderBy('node').orderBy('order')).valueChanges().subscribe(docs => {
      this.departments = docs;
      callback(docs)
    })
  }

  @action
  async fetchDepartmentByLevel(gdKey: string, levelKey: string): Promise<IProgram[]> {
    const docs = await this.ds.departmentFireRef(ref => ref.where('ranking.key', '==', levelKey).where('generalDepartment.key', '==', gdKey).orderBy('node').orderBy('order')).get().toPromise();
    return pushToArray(docs);
  }

  // @action
  // async fetchDepartmentMember(dKey: string) {
  //   this.ds.departmentFireRef().doc(dKey).collection("department_members", ref => ref.orderBy("displayName")).valueChanges().subscribe(docs => {
  //     this.departmentOfficers = docs
  //   })
  // }
  @action
  async fetchDepartmentProgram(dKey: string) {
    this.ds.departmentFireRef().doc(dKey).collection("department_program", ref => ref.orderBy("displayName")).valueChanges().subscribe(docs => {
      this.departmentOfficers = docs
    })
  }

  @action
  unsubscribe(): void {
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    this.data = [];
    this.loading = true;
    this.empty = false;
    this.done = false;
    this.lastVisible = null;
    this.position = []
    this.departments = [];
  }

  @observable fetchDataRef: Subscription = null;
  @action
  fetchData(callback?: (businessOwners: Array<IProgram>) => void): void {
    this.loading = true;
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
    this.fetchDataRef = this.ds.programRef(null).valueChanges().subscribe((docs) => {
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
      callback && callback(this.data);
    });
  }

  @action
  async fetchMore(): Promise<void> {
    if (!this.lastVisible || this.fetching || this.done) return;
    this.fetching = true;
    const data = await this.ds
      .departmentRef(this.lastVisible)
      .get()
      .toPromise();
    const items = pushToArray(data) as IProgram[];
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
  save(item: IMmeMainProgram, oldDoc: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const batch = this.ds.batch();
    if (item?.adminOffice && item?.subOfProgram) {
      batch.set(this.ds.settingsMMERef().ref, { [`${item?.subOfProgram?.key}`]: item.key }, { merge: true })
    } else if (oldDoc) {
      if (!item?.adminOffice && oldDoc?.adminOffice) {
        batch.set(this.ds.settingsMMERef().ref, { [`${item?.subOfProgram?.key}`]: null }, { merge: true })
      }
    }
    batch.set(this.ds.mmeProgramSaveRef().doc(item.key).ref, item)

    const newMember = this.departmentOfficers.find(m => m.isNew)

    if (newMember) {
      const officerFireRef = this.ds.officerMMERef().ref.doc(newMember.key)
      const departmentFireRef = this.ds.programFireRef().ref.doc(item.key).collection('program').doc(newMember.key)
      const officerPositionMovementFireRef = this.ds.officerMMEPositionMovementRef().ref
      //Movement
      const positionNew = newMember?.position_new || newMember?.position

      const departmentMemberData = {
        ...newMember,
        position: positionNew,
        ref: newMember.key,
        key: this.ds.createId(),
        created_by: item.updated_by,
        created_at: item.updated_at,
        updated_by: item.updated_by,
        updated_at: item.updated_at,
      }

      const workingOfficeItem = {
        key: `${item.key}_${positionNew?.key}`,
        office: toDepartmentMME(item),
        position: toRanking(positionNew),
        updated_by: item.updated_by,
        updated_at: new Date()
      }
      let workingOffices = pushObjArray(newMember.workingOffices, workingOfficeItem)
      workingOffices = orderBy(workingOffices, "office.ranking.order")

      const positions = groupBy(toFlatten(workingOffices.map(m => m.position)), "key")
      // const offices = groupBy(toFlatten(workingOffices.map(m => m.office?.workplace)), "key");
      const offices = toUniq(toFlatten(workingOffices.map(m => m.office?.workplace?.map(d => d?.key))));

      const workplaceOfOfficer = groupBy(toFlatten(workingOffices.map(m => m.office)), "key");

      let officeItems: any[] = []
      workingOffices.map(m => {
        const items = m?.office?.workplace;
        if (Array.isArray(items)) officeItems.push(items[items.length - 1])
      })

      const workplaces = orderBy(groupBy(officeItems, "key"), "order") as any[];
      const currentWorkplace = workplaceOfOfficer?.length > 0 ? workplaceOfOfficer[0] : null;

      const officeData = {
        ...newMember,
        position_new: null,
        updated_by: item.updated_by,
        updated_at: item.updated_at,

        workingOffices,

        position: departmentMemberData.position,
        positions: positions,
        positionKeys: positions?.length > 0 ? positions.map(m => m?.key) : [],
        positionWorkplaceKeys: workingOffices.map(m => (`${m?.office?.key}_${m?.position?.key}`)),

        officeKeys: offices?.length > 0 ? offices.map(m => m.key) : [],
        workplace: workplaces || [],
        workplaceKeys: workplaces.map(m => m?.key) || [],
        currentDepartment: currentWorkplace,
        workplaceKey: currentWorkplace?.key || null,
      }
      batch.set(officerFireRef, { ...officeData }, { merge: true })
      batch.set(departmentFireRef, officeData, { merge: true })
      batch.set(officerPositionMovementFireRef.doc(departmentMemberData.key), departmentMemberData, { merge: true })
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
  deleteDepartment(item: IProgram, callback: (status: boolean, error: string) => void) {
    this.ds.departmentFireRef().doc(item.key).delete().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async deletePosition(department: IProgram, item: any, uid: string, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const batch = this.ds.batch();

    const oldPositionDoc = await this.ds.dbRef().collection("officers_position_movement", ref => ref
      .where("ref", "==", item.key)
    ).get().toPromise()

    let oldPositionData = pushToArray(oldPositionDoc)
    oldPositionData = MappingService.orderByDesc(oldPositionData, "created_at")

    let oldPositionItem = null
    if (oldPositionData && oldPositionData.length > 0) {
      oldPositionItem = oldPositionData[0]

      const officerFireRef = this.ds.officerRef().ref.doc(item.key)
      const departmentFireRef = this.ds.departmentFireRef().ref.doc(department.key).collection("department_members").doc(item.key)

      const workingOfficeItem = {
        key: `${department.key}_${oldPositionItem?.position?.key}`,
        office: toDepartment(department),
        position: toRanking(oldPositionItem?.position),
        updated_by: uid,
        updated_at: new Date()
      }

      let workingOffices = removeObjArray(item.workingOffices, workingOfficeItem.key)
      workingOffices = orderBy(workingOffices, "office.ranking.order")

      const positions = groupBy(toFlatten(workingOffices.map(m => m.position)), "key")
      const offices = groupBy(toFlatten(workingOffices.map(m => m.office?.workplace)), "key");
      const workplaceOfOfficer = groupBy(toFlatten(workingOffices.map(m => m.office)), "key");

      let officeItems: any[] = []
      workingOffices.map(m => {
        const items = m?.office?.workplace;
        if (Array.isArray(items)) officeItems.push(items[items.length - 1])
      })

      const workplaces = orderBy(groupBy(officeItems, "key"), "order") as any[];
      const currentWorkplace = workplaceOfOfficer?.length > 0 ? workplaceOfOfficer[0] : null;

      const officeData = {
        position_new: null,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),

        workingOffices,

        position: oldPositionItem.position,
        positions: positions,
        positionKeys: positions?.length > 0 ? positions.map(m => m?.key) : [],
        positionWorkplaceKeys: workingOffices.map(m => (`${m?.office?.key}_${m?.position?.key}`)),

        officeKeys: offices?.length > 0 ? offices.map(m => m.key) : [],
        workplace: workplaces || [],
        workplaceKeys: workplaces.map(m => m?.key) || [],
        currentDepartment: currentWorkplace,
        workplaceKey: currentWorkplace?.key || null,
      }

      batch.update(officerFireRef, { ...officeData })
      batch.delete(departmentFireRef)
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
  async fetchAll() {
    this.fetching = true;
    const ref = await this.db.collection<IProgram>('department', ref => {
      let condition = ref.where('isDelete', '==', false)
      return condition;
    }).get().toPromise() as QuerySnapshot<DocumentData>;
    const arrData = MappingService.orderBy(pushToArray(ref), "node")
    this.fetching = false;
    return arrData;
  }
}
