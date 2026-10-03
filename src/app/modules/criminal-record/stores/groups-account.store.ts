import { Injectable } from '@angular/core';
import { action, observable, toJS } from 'mobx';
import { Subscription } from 'rxjs';
import { IGroupUser, IGroupUserMember, IUserAccount } from 'src/app/interfaces/user';
import { orderBy, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Injectable({
  providedIn: 'root'
})

export class GroupsAccountStore {
  @observable data: any = [];
  @observable searchData: any = [];
  @observable selectedGroup: any = null;
  @observable groupMembers: any = [];
  @observable permissions: any = [];
  @observable public groupPermissions: any[] = [];
  @observable public permissions_tree: any[] = [];
  @observable public permissions_tree_data: any[] = [];

  @observable process: boolean = false;
  @observable loading: boolean = false;
  @observable searching: boolean = false;
  @observable fetchCompanyRef: Subscription = null;
  @observable fetchGroupPermissionRef: Subscription = null
  @observable fetchGroupMemberRef: Subscription = null
  @observable fetchDataRef: Subscription = null

  @observable selectedUser: IUserAccount = null;


  public lastVisible: any = null;
  @observable empty: boolean = false;

  constructor(
    private ds: DataService,
    private db: DatabaseService,
  ) { }

  @action
  subscribeGroups() {
    this.fetchCompanyRef?.unsubscribe()
    this.data = []
  }

  @action
  unsubscribe() {
    this.fetchCompanyRef && this.fetchCompanyRef.unsubscribe();
    this.fetchGroupPermissionRef && this.fetchGroupPermissionRef.unsubscribe();
    this.fetchGroupMemberRef && this.fetchGroupMemberRef.unsubscribe();
    this.data = [];
    this.permissions = [];
  }

  @action
  async deleteGroup(item, callback) {
    this.process = true;
    const batch = this.ds.batch()
    const members = pushToArray(await this.ds.groupUserAccountMemberRef(item?.key).get().toPromise());
    members?.map(m => {
      batch.delete(this.ds.groupUserAccountMemberRef(item?.key).doc(m?.key).ref)
      batch.delete(this.ds.groupMemberRef().doc(m?.key).ref)
    })
    batch.delete(this.ds.groupModulesRef().doc(item.key).ref)
    batch.commit().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  removeGroupMember(member: IGroupUserMember, callback) {
    this.process = true;
    const batch = this.ds.batch();
    batch.delete(this.ds.groupUserAccountMemberRef(member.groupData.key).doc(member.key).ref)
    batch.delete(this.ds.groupMemberRef().doc(member.key).ref)
    batch.commit().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      alert(error)
      callback(false, null);
    })


  }

  @action
  saveGroup(item: IGroupUser, callback) {
    this.process = true;
    this.ds.groupModulesRef().doc(item.key).set(item, { merge: true }).then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  saveGroupProgram(programs, item, uid, callback) {
    this.process = true;
    const batch = this.ds.batch();
    batch.update(this.ds.groupModulesRef().doc(item.key).ref, {
      programKeys: programs.map(m => m.key),
      programs: programs.map(m => ({ key: m.key, name: m.name })),
      updated_by: uid,
      updated_at: this.ds.serverTimestamp(),
    })
    batch.commit().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      callback(false, error);
    })
  }

  @action
  async subscribeUser() {
    this.fetchDataRef?.unsubscribe()
    this.searchData = [];
    Promise.resolve()
  }

  @action
  fetchUserData(field) {
    this.loading = true;
    this.fetchDataRef?.unsubscribe()
    this.fetchDataRef = this.ds
      .userDataRef(field)
      .valueChanges()
      .subscribe(docs => {
        if (docs.length) {
          this.lastVisible = docs[docs.length - 1];
        } else {
          this.lastVisible = null;
        }
        this.empty = docs.length === 0;
        this.searchData = docs;
        this.loading = false;
      });
  }


  @action
  userSearch(field, search) {
    if (search && search.key) {
      return this.ds.userSearchRef(field, search.code).valueChanges();
    }
    return this.ds.userSearchRef(field, search).valueChanges();
  }

  @action
  async addGroupMember(member: IGroupUserMember, callback) {
    this.process = true;
    const batch = this.ds.batch();
    batch.set(this.ds.groupUserAccountMemberRef(member.groupData.key).doc(member.key).ref, member, { merge: true })
    batch.set(this.ds.groupMemberRef().doc(member.key).ref, member, { merge: true })
    batch.commit().then(() => {
      this.process = false;
      callback(true, null);
    }).catch(error => {
      this.process = false;
      alert(error)
      callback(false, null);
    })
  }

  @action
  async checkValidEmail(email, employee) {
    if (!employee.email) {
      const doc = await this.ds.userValidEmailRef(email).get().toPromise();
      this.selectedUser = doc.empty ? null : pushToArray(doc)[0]
      return doc.empty ? false : true;
    }
    return false;
  }

  @action
  fetchGroups(callback) {
    this.fetchCompanyRef?.unsubscribe()
    this.fetchCompanyRef = this.ds.groupModulesRef().valueChanges().subscribe(doc => {
      this.data = orderBy(doc, 'name');
      this.loading = false;
      callback && callback(doc);
    })
  }

  @action
  async fetchSelectedGroup(groupKey) {
    const doc: any = pushToObject(await this.ds.groupModulesRef().doc<IGroupUser>(groupKey).get().toPromise());
    this.selectedGroup = doc || null;
    return this.selectedGroup;
  }

  @action
  async subscribeGroup() {
    this.fetchGroupPermissionRef?.unsubscribe()
    this.fetchGroupMemberRef?.unsubscribe()
    this.groupMembers = [];
    this.permissions = [];
    this.groupPermissions = [];
    Promise.resolve()
  }

  @action
  fetchGroupMembers(groupKey, callback) {
    this.fetchGroupPermissionRef?.unsubscribe()
    this.fetchGroupPermissionRef = this.ds.groupUserAccountMemberRef(groupKey)
      .valueChanges().subscribe(docs => {
        this.groupMembers = docs;
        callback && callback(docs);
      })
  }

  @action
  fetchGroupPermissions(groupKey, callback?) {
    this.loading = true;
    this.fetchGroupMemberRef?.unsubscribe()
    this.fetchGroupMemberRef = this.ds.groupModulesMovementRef(ref => ref.where("groupData.key", "==", groupKey))
      .valueChanges().subscribe(doc => {
        this.permissions = doc;
        this.groupPermissions = doc;
        this.permissions_tree_data = this.groupPermissions.map((m: any) => {
          const { app } = m;
          const moduleData = doc.filter((r: any) => r.app.key === app.key);
          return {
            name: app.text,
            key: app.key,
            children: moduleData.map((r: any) => ({ name: r.moduleData.name, key: r.key, children: r.options || [] }))
          }
        })
        this.empty = doc.length === 0;
        this.loading = false;
        callback && callback(doc);
      })
  }

  async getUserGroup(userKey) {
    const ref = await this.ds.groupMemberRef().doc(userKey).get().toPromise();
    return pushToObject(ref)
  }

  async getEmbassyByCountryKey(ckey: string){
    const ref = this.ds.embassyCollectionRef(ref=>ref.where('country.key','==',ckey))
    return  pushToArray(await ref.get().toPromise())
  }

  async fetchFilterDropdownData(
    collectionName: string,
    text: any,
    orderField: string,
  ) {
    const query = this.ds.collectionQueryRef(collectionName,ref=>{
      let condition = null;
      if (text && !text.key && (typeof text === 'string')) {
        const search = text?.toUpperCase();
        condition = ref.where('keywords', 'array-contains', search)
      } else {
        condition = ref.where('keywords', 'array-contains', '~N/A~')
      }
      condition = condition.orderBy(orderField).limit(20)
      return condition;
    })
    return pushToArray(await query.get().toPromise());
  }

  @action
  updateOfficersPrintPaidOnline(newKeys: string[], deleteKeys: string[]){
    const settingRef = this.db.settingsRef();
    if(deleteKeys?.length){
      settingRef.update({officers_print_paid_online: this.ds.fireFieldValue().arrayRemove(...deleteKeys)})
    }else{
      settingRef.update({officers_print_paid_online: this.ds.fireFieldValue().arrayUnion(...newKeys)})
    }
  }

}
