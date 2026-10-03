import { APPS } from './../../dummy/config';
import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { REGISTER_ITEM_STATUS_OBJ } from 'src/app/dummy/status';
import { AuthService } from 'src/app/auth/auth.service';
import { pushToArray, pushToObject, removeStingArray, ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService } from 'src/app/shared/services/mapping.service';

@Injectable({providedIn:'root'})
export class SettingStore {
  @observable data: Array<any> = [];
  @observable items: Array<any> = [];

  @observable singleData: any;
  @observable process: boolean = false;
  @observable deleteProcess: boolean = false;
  @observable loading: boolean = true;
  @observable empty: boolean = false;
  @observable totalPage: number = 1;
  @observable totalSize: number = 0;
  @observable totalRow: number = 0;
  @observable pageIndex: number = 1;
  @observable coFomData = [];
  @observable departmentData = [];
  @observable countryData = [];
  @observable companyData = [];


  @observable orderBy: any = "code";
  @observable filterStatus: any = 0;
  @observable lastVisible: any = null;
  @observable firstVisible: any = null;
  @observable startIndex: number = 0;
  @observable startNo: number = 0;
  @observable appSize: number = 100;
  @observable fetching: boolean = false;
  @observable done: boolean = false;
  COLUMNS_ARRAY: any;

  @observable selectedUserGroup: any = null;
  @observable selectedCompany: any = null;
  @observable userPermission: any[] = [];
  @observable groupMember: any[] = [];

  @observable companyMember: any[] = [];

  constructor(private ds: DataService,
    public auth: AuthService,
  ) {
    // APPS.size = 10
  }

  @action
  fetchMyFileFolder(companyKey, user: any) {
    this.data = [];
    this.ds.myFileFolderByCompanyRef(companyKey, user.uid).valueChanges().subscribe(docs => {
      this.data = docs
      this.empty = docs.length === 0;
      this.loading = false;
    })
  }


  @action
  async fetchAlluser(companyKey, collectionName: string, orderBy: string, filterForm: any) {
    this.orderBy = orderBy;
    this.loading = true;
    this.lastVisible = null;
    this.filterStatus = 0;
    this.fetching = false;
    // const docsData = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
    const docsData = await this.ds.lazyManageUserCompanyRef(collectionName, this.lastVisible, companyKey, filterForm).get().toPromise();
    const docs = pushToArray(docsData)
    if (!docsData.empty) {
      this.lastVisible = docs[docs.length - 1];
    } else {
      this.lastVisible = null;
      this.done = true;
    }
    this.data = docs;
    this.empty = docsData.empty;
    this.loading = false;
    // this.clearDelete(collectionName)
    // this.resoleSetting(collectionName)
  }


  @action
  fetchsidebarFolder(companyKey, user: any) {
    this.data = [];
    this.ds.myFileFolderByCompanyRef(companyKey, user.uid).valueChanges().subscribe(docs => {
      this.data = docs
      this.empty = docs.length === 0;
      this.loading = false;
    })
  }

  @action
  fetchGroupMember(item) {
    this.selectedUserGroup = item;
    this.groupMember = null;
    this.ds.groupUserRef().doc(item.key).valueChanges().subscribe((member: any) => {
      this.groupMember = member
    })
  }

  @action
  fetchSelectedUser(item) {
    this.selectedUserGroup = item;
    this.userPermission = [];
    this.ds.groupUserRef().doc(item.key).collection('permissions').valueChanges().subscribe((docs: any) => {
      this.userPermission = docs;
    })
  }

  @action
  fetchCompanyMember(item) {
    this.selectedCompany = item;
    this.ds.userRef().doc(item.key).valueChanges().subscribe((member: any) => {
      this.companyMember = member
    })
  }


  @action
  fetchDetailCompany(key, callback) {
    this.ds.companyCollectRef().doc(key).get()
  }

  @action
  DeleteGroupUser(f: any, callback) {
    this.process = true;
    this.ds.firestore().collection('group_users').doc(f.key).delete().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @action
  async removeUser(item: any, group: any, callback) {
    this.process = true;
    const docsData = await this.ds.groupUserRef().doc(group.key).get().toPromise();
    const docs = pushToObject(docsData)
    const { users } = docs;
    const userData = removeStingArray(users || [], item.key);
    this.ds.groupUserRef().doc(group.key).update(
      {
        users: userData,
      usersRef: userData.map(m => (this.ds.userRef().doc(m)).ref)
    
    }).then(() => {
        callback(true, null);
      }).catch((error) => {
        alert(error);
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
  }



  // @action
  // async removeUser(item: any, group:any, callback) {
  //     this.process=true;
  //     const docsData = await this.ds.groupUserRef().doc(group.key).get().toPromise();
  //     const docs = pushToObject(docsData)
  //     const {users}=docs;

  //     const userData=removeStingArray(users||[],item.id);

  //     this.ds.groupUserRef().doc(group.key).update({
  //         users: userData,
  //         usersRef: userData.map(m => (this.ds.userRef().doc(m)).ref)
  //     }).then(() => {
  //         callback(true, null);
  //     }).catch((error) => {
  //         alert(error);
  //         callback(false, error)
  //     }).finally(() => {
  //         this.process = false;
  //     })
  // }


  // @action
  // fetchSelectedUser(item){
  //     this.selectedUserGroup=item;
  //     this.ds.groupUserRef().doc(item.key).collection('permissions').valueChanges().subscribe((docs: any) => {
  //       this.userPermission = docs;
  //     })
  // }


  settings_route = {
    last_updated: {
      filter: false,
      key: 3,
      name: "Last Updated",
      value: true,
    },
    modified_by: {
      key: 4,
      name: "Updated By",
      value: true,
      type: "modified_by"
    },
    name: {
      filter: true,
      key: 1,
      name: "Name (EN)",
      value: true,
    },
    name_kh: {
      filter: true,
      key: 2,
      name: "Name (KH)",
      value: true,
    },
  };

  @action
  addUserColumn(key: string, callback) {
    const batch = this.ds.batch();
    const userColumnRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_route");

    // this.userColumns.forEach(m => {
    batch.set(userColumnRef, this.settings_route)
    // })

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }


  @action
  async checkExist(collectionName: string, field: string, oldValue: string, companyKey: string) {
    let isExist = false;
    const data = await this.ds.registerCheckExistRef(collectionName, field, oldValue, companyKey).get().toPromise();
    const docs = pushToArray(data);
    if (docs && docs.length > 0) isExist = true;
    return isExist;
  }

  @action
  async fetchSettingDoc(collectionName: string, docKey: string) {
    const doc = await this.ds.settingRef(collectionName).doc(docKey).get().toPromise();
    return pushToObject(doc);
  }

  @action
  async fetchSetting(collectionName: string) {
    const data = await this.ds.settingRef(collectionName).get().toPromise();
    return pushToArray(data);
  }

  @action
  fetchSettingCallback(collectionName: string, callback: any) {
    this.ds.settingRef(collectionName).valueChanges().subscribe(docs => {
      callback(docs);
    })
  }

  @action
  async fetchRegisterItem(campanyKey: string) {
    const data = await this.ds.registerItemRef(campanyKey).get().toPromise();
    return pushToArray(data);
  }

  @action
  fetchCOForm(callback) {
    this.ds.coformRef().valueChanges().subscribe(data => {
      this.coFomData = data;
      callback(data)
    })
  }

  @action
  fetchCompany(callback) {
    this.ds.companyCollectRef().valueChanges().subscribe(data => {
      this.companyData = data;
      callback(data)
    })
  }

  @action
  fetchDepartment(callback) {
    this.ds.departmentRef().valueChanges().subscribe(data => {
      this.departmentData = data;
      callback(data)
    })
  }
  @action
  fetchCountry(callback) {
    this.ds.countryRef().valueChanges().subscribe(data => {
      this.countryData = data;
      callback(data)
    })
  }

  @action
  save(collectionName: string, f: any, callback) {
    this.ds.settingRef(collectionName).doc(f.key).set(f).then(() => {
      callback(true);
    }).catch(error => {
      alert(error);
      callback(false, null)
    })
  }
  @action
  async addRegisterCo(collectionName: string, statiticFeild: string, f: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const statisticRef = this.ds.statisticBatchRef();
    const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key);
    const registerItemRef = this.ds.settingBatchRef("register_item").doc(f.register_item.key);
    const { register_item_status } = f;

    if (register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key) {
      batch.update(registerItemRef, { pending_co_form: true });
    }

    batch.set(settingRef, f);
    batch.update(statisticRef, { [`${statiticFeild}`]: firebase.firestore.FieldValue.increment(1) });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  // @action
  // DeleteCompany(f: any, user: any, callback) {
  //     const batch = this.ds.batch();
  //     const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
  //     const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
  //     batch.update(publicRef, { isDelete: true, deleted_at: new Date(), deleted_by: user })
  //     batch.update(privateRef, { isDelete: true, deleted_at: new Date(), deleted_by: user });
  //     batch.commit().then(() => {
  //         callback(true, null);
  //     }).catch((error) => {
  //         alert(error);
  //         callback(false, error)
  //     }).finally(() => {
  //         this.process = false;
  //     })
  // }

  @action
  deleteBatchData(collectionName: string, statiticFeild: string, f: any, callback) {
    const batch = this.ds.batch();
    const statisticRef = this.ds.statisticBatchRef();
    const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key)
    batch.update(settingRef, { isDelete: true })
    batch.update(statisticRef, { [`${statiticFeild}`]: firebase.firestore.FieldValue.increment(-1) });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  deleteRegisterItemData(collectionName: string, statiticFeild: string, f: any, callback) {
    const batch = this.ds.batch();
    const statisticRef = this.ds.statisticBatchRef();
    const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key)

    batch.update(settingRef, { register_item_status: REGISTER_ITEM_STATUS_OBJ.deleted })
    batch.update(statisticRef, { [`${statiticFeild}`]: firebase.firestore.FieldValue.increment(-1) });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  update(collectionName: string, f: any, callback) {
    this.ds.settingRef(collectionName).doc(f.key).update(f).then(() => {
      callback(true);
    }).catch(error => {
      alert(error);
      callback(false, null)
    })
  }

  @action
  updateRegisterCO(collectionName: string, f: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key);
    const registerItemRef = this.ds.settingBatchRef("register_item").doc(f.register_item.key);
    const { register_item_status } = f;

    if (register_item_status.key === REGISTER_ITEM_STATUS_OBJ.submitted.key) {
      batch.update(registerItemRef, { pending_co_form: true });
    }

    batch.update(settingRef, f);
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  deleteData(collectionName: string, f: any, callback) {
    this.ds.settingRef(collectionName).doc(f.key).update({ isDelete: true }).then(() => {
      callback(true);
    }).catch(error => {
      alert(error);
      callback(false, null)
    })
  }

  @action
  deleteDoc(collectionName: string, f: any, callback) {
    this.ds.collectionRef(collectionName).doc(f.key).delete().then(() => {
      callback(true);
    }).catch(error => {
      alert(error);
      callback(false, null)
    })
  }

  @action
  delete(data: any, callback) {
    this.deleteProcess = true;
    this.ds.uomRef().doc(data.key).update({ isDelete: true }).then(success => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }

  @action
  detailUOM(id, callback) {
    this.process = true;
    this.ds.uomRef().doc(id).valueChanges().subscribe(data => {
      this.process = false
      this.singleData = data;
      callback(data);
    })
  }

  @action
  async detailCollection(collectionName: string, id, callback) {
    this.process = true;
    const data = await this.ds.settingFireRef(collectionName).doc(id).get()
    this.singleData = pushToObject(data)
    this.process = false;
    callback(this.singleData);
  }

  @action
  fetchRowIndex(index: number) {
    if (index === 0) {
      this.startNo = this.startIndex;
    }
    return this.startIndex + index;
  }

  @action
  resoleSetting(collectionName) {
    const batch = this.ds.batch()
    const ref = this.ds.settingFireRef(collectionName)
    this.data.forEach(m => {
      const { name, name_kh, key, departmentKey, updated_at,
        updated_by

      } = m;

      let updatedBy = null;
      if (!updatedBy) {

        updatedBy = {
          key: "bpVwK0mZgGsosSXfm8Fs",
          displayName: "Admin",
          uid: "bpVwK0mZgGsosSXfm8Fs",
          full_name: "Admin",
          email: "admin@gmail.com",
        }
      }
      const tag = [
        key,
        updatedBy.key,
        ConvertService.toDateKey(updated_at.toDate()),
        ConvertService.toCapitalize(`${name}`.trim()),
        ConvertService.toCapitalize(`${name_kh}`.trim()),
        departmentKey,
        `~N/A~`,
      ]

      batch.update(ref.doc(m.key), {
        date_key: ConvertService.toDateKey(updated_at.toDate()),
        name: ConvertService.toCapitalize(`${name}`.trim()),
        name_kh: ConvertService.toCapitalize(`${name_kh}`.trim()),
        tag: tag,
        updated_by: updatedBy,
        updated_at: updated_at.toDate(),
        // updated_by: {
        //   key: updatedBy.key,
        //   displayName: updatedBy.displayName || updatedBy.name,
        //   uid: updatedBy.key,
        //   full_name: updatedBy.displayName || updatedBy.name,
        //   email: updatedBy.email,
        // },
      })
    })
    batch.commit().then(() => {
    })
  }

  @action
  async fetchCompanyListing(companyKey, collectionName: string, orderBy: string, filterForm: any) {
    this.orderBy = orderBy;
    this.loading = true;
    this.lastVisible = null;
    this.filterStatus = 0;
    this.fetching = false;
    // const docsData = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
    const docsData = await this.ds.lazySettingsRef(collectionName, this.lastVisible, companyKey, filterForm).get().toPromise();
    const docs = pushToArray(docsData)
    if (!docsData.empty) {
      this.lastVisible = docs[docs.length - 1];
    } else {
      this.lastVisible = null;
      this.done = true;
    }
    this.data = docs;
    this.empty = docsData.empty;
    this.loading = false;
    // this.clearDelete(collectionName)
    // this.resoleSetting(collectionName)
  }


  @action
  async fetchListing(companyKey, collectionName: string, orderBy: string, filterForm: any) {
    this.orderBy = orderBy;
    this.loading = true;
    this.lastVisible = null;
    this.filterStatus = 0;
    this.fetching = false;
    // const docsData = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
    const docsData = await this.ds.lazySettingsRef(collectionName, this.lastVisible, companyKey, filterForm).get().toPromise();
    const docs = pushToArray(docsData)
    if (!docsData.empty) {
      this.lastVisible = docs[docs.length - 1];
    } else {
      this.lastVisible = null;
      this.done = true;
    }
    this.data = docs;
    this.empty = docsData.empty;
    this.loading = false;

    // this.clearDelete(collectionName)
    // this.resoleSetting(collectionName)
  }

  @action
  async fetchMore(companyKey, collectionName: any, filterForm: any) {
    if (this.fetching || this.lastVisible === null || this.loading) { return; }
    this.fetching = true;
    const docsData = await this.ds.lazySettingsRef(collectionName, this.lastVisible, companyKey, filterForm).get().toPromise();
    const docs = pushToArray(docsData);
    if (docs.length > 0 && docs.length === APPS.settingSize) {
      this.lastVisible = docs[docs.length - 1];
    } else {
      this.done = true;
      this.lastVisible = null;
    }
    this.data = this.data.slice().concat(docs);
    this.fetching = false;
  }

  @action
  clearDelete(collectionName) {
    const batch = this.ds.batch();
    const ref = this.ds.settingFireRef(collectionName)
    const rows = this.data.filter(m => m.isDelete);
    rows.forEach(m => {
      batch.delete(ref.doc(m.key))
    })
    batch.commit()
  }


  @action
  async fetchData(collectionName: string, routerName: string, url: any, icon: any, menuName: string, uid: string, statisticName: string, orderBy: string, callback) {
    this.orderBy = orderBy;
    this.loading = true;
    this.lastVisible = null;
    this.filterStatus = 0;
    const docs = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();

    const statisticDoc = await this.ds.environmentRef().get().toPromise();
    const statisticData = pushToObject(statisticDoc);
    this.data = pushToArray(docs);
    this.items = this.data;
    if (!docs.empty) {
      this.lastVisible = this.data[this.data.length - 1];
      this.firstVisible = this.data[0];
    }

    if (statisticData && statisticData.length > 0) {

    }

    const totalRow = statisticData[`${statisticName}`];
    this.totalRow = totalRow;
    this.totalSize = totalRow;
    const i = parseInt(`${this.totalSize / APPS.size}`);
    const j = this.totalSize % APPS.size > 0 ? 1 : 0;
    this.totalPage = i + j;
    this.pageIndex = 1;
    this.startIndex = 1;
    this.empty = this.data.length === 0;
    this.loading = false;
    this.ds.userprofileRef().doc(uid).collection("histories").doc(routerName).set({
      url: url,
      name: menuName,
      login_date: new Date(),
      page_key: ConvertService.pageKey(),
      key: routerName,
      icon: icon,
    })
    callback(this.data);

  }

  @action
  async fetchNext(collectionName: string) {
    if (this.pageIndex === this.totalPage) return;
    this.loading = true;
    const docs = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
    if (!docs.empty) {
      this.data = pushToArray(docs);
      this.lastVisible = this.data[this.data.length - 1];
      this.firstVisible = this.data[0];
      this.items = this.items.concat(this.data);
    }
    this.startIndex = (this.pageIndex * APPS.size) + 1;
    this.pageIndex = this.pageIndex + 1;
    this.loading = false;
  }


  @action
  async fetchRegisterItemData(collectionName: string, routerName: string, url: any, icon: any, menuName: string, uid: string, statisticName: string, orderBy: string, registerStatusKey: string, companyKey: string) {
    this.orderBy = orderBy;
    this.loading = true;
    this.lastVisible = null;
    this.filterStatus = 0;
    const docs = await this.ds.resisterItemListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus, registerStatusKey, companyKey).get().toPromise();
    const statisticDoc = await this.ds.environmentRef().get().toPromise();
    const statisticData = pushToObject(statisticDoc);
    // this.data = pushToArray(docs);
    const gdata = pushToArray(docs);
    this.data = MappingService.orderByDesc(gdata, 'page_key')
    this.items = this.data;

    if (!docs.empty) {
      this.lastVisible = this.data[this.data.length - 1];
      this.firstVisible = this.data[0];
    }

    if (statisticData && statisticData.length > 0) {

    }

    const totalRow = statisticData[`${statisticName}`];
    this.totalRow = totalRow;
    this.totalSize = totalRow;
    const i = parseInt(`${this.totalSize / APPS.size}`);
    const j = this.totalSize % APPS.size > 0 ? 1 : 0;
    this.totalPage = i + j;
    this.pageIndex = 1;
    this.startIndex = 1;
    this.empty = this.data.length === 0;
    this.loading = false;
    this.ds.userprofileRef().doc(uid).collection("histories").doc(routerName).set({
      url: url,
      name: menuName,
      login_date: new Date(),
      page_key: ConvertService.pageKey(),
      key: routerName,
      icon: icon,
    })
  }

  @action
  async fetchRegisterItemNext(collectionName: string, registerStatusKey: string, companyKey: string) {
    if (this.pageIndex === this.totalPage) return;
    this.loading = true;
    const docs = await this.ds.resisterItemListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus, registerStatusKey, companyKey).get().toPromise();
    if (!docs.empty) {
      const gdata = pushToArray(docs);
      // this.data = pushToArray(docs);
      this.data = MappingService.orderByDesc(gdata, 'page_key')

      this.lastVisible = this.data[this.data.length - 1];
      this.firstVisible = this.data[0];
      this.items = this.items.concat(this.data);
    }
    this.startIndex = (this.pageIndex * APPS.size) + 1;
    this.pageIndex = this.pageIndex + 1;
    this.loading = false;
  }

  @action
  async fetchBack() {
    this.loading = true;
    const dataSize = this.data.length;
    const list = this.items.slice(0, this.items.length - dataSize)
    this.items = list;
    const docs = list.slice(list.length - APPS.size, list.length);
    this.data = docs;
    if (this.data.length > 0) {
      this.lastVisible = this.data[this.data.length - 1];
      this.firstVisible = this.data[0];
    }
    this.pageIndex = this.pageIndex - 1;
    this.startIndex = this.startNo - APPS.size
    this.loading = false;
  }

  @action
  async fetchFilter(collectionName: string, statusKey: any, statisticName: string, orderBy: string) {
    this.loading = true;
    this.lastVisible = null;
    this.orderBy = orderBy;
    this.filterStatus = statusKey;
    const docs = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, statusKey).get().toPromise();
    const statisticDoc = await this.ds.environmentRef().get().toPromise();
    const statisticData = pushToObject(statisticDoc);
    this.data = pushToArray(docs);
    this.items = this.data;
    if (!docs.empty) {
      this.lastVisible = this.data[this.data.length - 1];
      this.firstVisible = this.data[0];
    }
    const totalRow = statisticData[`${statisticName}`];
    this.totalRow = totalRow;
    this.totalSize = totalRow;
    const i = parseInt(`${this.totalSize / APPS.size}`);
    const j = this.totalSize % APPS.size > 0 ? 1 : 0;
    this.totalPage = i + j;
    this.pageIndex = 1;
    this.startIndex = 1;
    this.empty = this.data.length === 0;
    this.loading = false;
  }

  @action
  async fetchRegisterItemFilter(collectionName: string, statusKey: any, statisticName: string, orderBy: string, registerStatusKey: string, companyKey: string) {
    this.loading = true;
    this.lastVisible = null;
    this.orderBy = orderBy;
    this.filterStatus = statusKey;
    const docs = await this.ds.resisterItemListingRef(collectionName, this.lastVisible, this.orderBy, statusKey, registerStatusKey, companyKey).get().toPromise();
    const statisticDoc = await this.ds.environmentRef().get().toPromise();
    const statisticData = pushToObject(statisticDoc);
    this.data = pushToArray(docs);
    this.items = this.data;
    if (!docs.empty) {
      this.lastVisible = this.data[this.data.length - 1];
      this.firstVisible = this.data[0];
    }
    const totalRow = statisticData[`${statisticName}`];
    this.totalRow = totalRow;
    this.totalSize = totalRow;
    const i = parseInt(`${this.totalSize / APPS.size}`);
    const j = this.totalSize % APPS.size > 0 ? 1 : 0;
    this.totalPage = i + j;
    this.pageIndex = 1;
    this.startIndex = 1;
    this.empty = this.data.length === 0;
    this.loading = false;
  }

  @action
  async fetchSearch(collectionName: string, field: string, search: any, callback) {
    if (search) {
      return this.ds.searchListingRef(collectionName, field, search).valueChanges().subscribe(docs => {
        this.data = docs;
        callback(true, null)
      });
    } else {
      callback(false, null)
    }
  }



  @action
  async addItem(collectionName: string, statiticFeild: string, f: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const statisticRef = this.ds.statisticBatchRef();
    const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key);
    // const codata = f.co_form.map(f => { 'users/' + f.key })
    batch.set(settingRef, f);
    batch.update(statisticRef, { [`${statiticFeild}`]: firebase.firestore.FieldValue.increment(1) });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }



  @action
  async addFileTag(collectionName: string, f: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key);
    batch.set(settingRef, f);
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }
  // @action
  // async fetchRegisterItemSearch(collectionName: string, field: string, search: any, registerStatusKey: string, companyKey: string) {
  //   return this.ds.searchResisterItemListingRef(collectionName, field, search, registerStatusKey, companyKey).valueChanges().subscribe(docs => {
  //     this.data = docs;
  //   });
  // }

}
