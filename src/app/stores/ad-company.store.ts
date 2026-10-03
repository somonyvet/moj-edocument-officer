import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';

import { APPS } from '../dummy/config';
import { IHSCODE } from 'src/app/interfaces/settings';
import { REGISTER_ITEM_STATUS_OBJ } from 'src/app/dummy/status';

import { pushToArray, pushToObject, ConvertService } from '../shared/services/convert.service';
import { DataService } from '../shared/services/data.service';

@Injectable({ providedIn: 'root' })
export class SettingCompanyStore {

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

  @observable selectedCompany: any = null;
  @observable selectedUserGroup: any = null;
  @observable userPermission: any[] = [];

  constructor(private ds: DataService) {
    // APPS.size = 10
  }

  @action
  fetchSelectedUser(item) {
    this.selectedUserGroup = item;
    this.ds.userRef().doc(item.key).collection('permissions').valueChanges().subscribe((docs: any) => {
      this.userPermission = docs;
    })
  }


  @action
  fetchSelectedCompany(item) {
    this.selectedUserGroup = item;
    // this.ds.userRef().doc(item.key).collection('permissions').valueChanges().subscribe((docs: any) => {
    //   this.userPermission = docs;
    // })
  }

  settings_department = {
    name_en: { filter: true, key: 1, name: "Name (EN)", value: true },
    name_kh: { filter: true, key: 2, name: "Name (KH)", value: true },
    status: { filter: false, key: 3, name: "Status", value: true },
    last_updated: { filter: false, key: 4, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 5, name: "Updated By", value: true },
  }

  settings_coform = {
    code: { filter: true, key: 1, name: "CO Code", value: true },
    name: { filter: true, key: 2, name: "CO Name", value: true },
    status: { filter: false, key: 3, name: "Status", value: true },
    last_updated: { filter: false, key: 4, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 5, name: "Updated By", value: true },
  }

  settings_uom = {
    code: { filter: true, key: 1, name: "Code", value: true },
    description_en: { filter: true, key: 2, name: "Description (EN)", value: true },
    description_kh: { filter: true, key: 3, name: "Description (KH)", value: true },
    status: { filter: false, key: 4, name: "Status", value: true },
    last_updated: { filter: false, key: 5, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 6, name: "Updated By", value: true },
  }

  settings_country = {
    code: { filter: true, key: 1, name: "Code", value: true },
    name: { filter: true, key: 2, name: "Name", value: true },
    department: { filter: true, key: 3, name: "Department", value: true },
    status: { filter: false, key: 4, name: "Status", value: true },
    last_updated: { filter: false, key: 5, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 6, name: "Updated By", value: true },
  };

  settings_country_port = {
    code: { filter: true, key: 1, name: "Port Code", value: true },
    name: { filter: true, key: 2, name: "Country Port", value: true },
    country: { filter: true, key: 3, name: "Country", value: true },
    status: { filter: false, key: 4, name: "Status", value: true },
    last_updated: { filter: false, key: 5, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 6, name: "Updated By", value: true },
  };

  settings_forwarder = {
    name_en: { filter: true, key: 1, name: "Name (EN)", value: true },
    name_kh: { filter: true, key: 2, name: "Name (KH)", value: true },
    short_name_en: { filter: false, key: 3, name: "Short Name (EN)", value: true },
    short_name_kh: { filter: false, key: 4, name: "Short Name (KH)", value: true },
    email: { filter: false, key: 5, name: "Email", value: true },
    tin_no: { filter: false, key: 6, name: "Tin no", value: true },
    address: { filter: false, key: 7, name: "Address", value: true },
    country: { filter: false, key: 8, name: "Country", value: true },
    postal_code: { filter: false, key: 9, name: "Postal Code", value: true },
    link_address: { filter: false, key: 10, name: "Link Address", value: true },
    telephone_number: { filter: false, key: 11, name: "Phone", value: true },
    fax_number: { filter: false, key: 12, name: "Fax Number", value: true },
    status: { filter: false, key: 13, name: "Status", value: true },
    last_updated: { filter: false, key: 14, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 15, name: "Updated By", value: true },
  };

  settings_route = {
    name: { filter: true, key: 1, name: "Name (EN)", value: true },
    name_kh: { filter: true, key: 2, name: "Name (KH)", value: true },
    status: { filter: false, key: 3, name: "Status", value: true },
    last_updated: { filter: false, key: 4, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 5, name: "Updated By", value: true },
  };

  settings_product_type = {
    name: { filter: true, key: 1, name: "Name (EN)", value: true },
    name_kh: { filter: true, key: 2, name: "Name (KH)", value: true },
    status: { filter: false, key: 3, name: "Status", value: true },
    last_updated: { filter: false, key: 4, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 5, name: "Updated By", value: true },
  };

  settings_title = {
    name: { filter: true, key: 1, name: "Name (EN)", value: true },
    name_kh: { filter: true, key: 2, name: "Name (KH)", value: true },
    status: { filter: false, key: 3, name: "Status", value: true },
    last_updated: { filter: false, key: 4, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 5, name: "Updated By", value: true },
  };

  settings_currency = {
    code: { filter: true, key: 1, name: "Code", value: true },
    name: { filter: true, key: 2, name: "Name", value: true },
    symbol: { filter: true, key: 3, name: "Symbol", value: true },
    status: { filter: false, key: 4, name: "Status", value: true },
    last_updated: { filter: false, key: 5, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 6, name: "Updated By", value: true },
  };

  users = {
    full_name: { filter: true, key: 1, name: "Name", value: true },
    email: { filter: true, key: 2, name: "Email", value: true },
    phone: { filter: true, key: 3, name: "Phone", value: true },
    position: { filter: true, key: 4, name: "Position", value: true },
    status: { filter: false, key: 5, name: "Status", value: true },
    last_updated: { filter: false, key: 6, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 7, name: "Updated By", value: true },
  };

  company = {
    name_en: { filter: true, key: 1, name: "Name (EN)", value: true },
    name_kh: { filter: true, key: 2, name: "Name (KH)", value: true },
    phone: { filter: true, key: 3, name: "Phone", value: true },
    email: { filter: true, key: 4, name: "Email", value: true },
    address: { filter: true, key: 5, name: "Address", value: true },
    tinNo: { filter: true, key: 6, name: "Tin No", value: true },
    country: { filter: true, key: 7, name: "Country", value: true },
    postalCode: { filter: true, key: 8, name: "Postal Code", value: true },
    fax: { filter: true, key: 9, name: "Fax Number", value: true },
    status: { filter: false, key: 10, name: "Status", value: true },
    last_updated: { filter: false, key: 11, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 12, name: "Updated By", value: true },
  };

  hs_codes = {
    code: { filter: true, key: 1, name: "Code", value: true },
    description_en: { filter: true, key: 2, name: "Description (EN)", value: true },
    description_kh: { filter: true, key: 3, name: "Description (KH)", value: true },
    unit: { filter: false, key: 3, name: "Unit", value: true },
    cd: { filter: false, key: 4, name: "CD", value: true },
    st: { filter: false, key: 5, name: "ST", value: true },
    vat: { filter: false, key: 6, name: "VAT", value: true },
    et: { filter: false, key: 7, name: "ET", value: true },
    status: { filter: false, key: 8, name: "Status", value: true },
    last_updated: { filter: false, key: 9, name: "Last Updated", value: true },
    modified_by: { filter: false, key: 10, name: "Updated By", value: true },
  }

  @action
  addUserColumn(key: string, callback) {
    const batch = this.ds.batch();
    const settings_departmentRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_department");
    const settings_coformRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_coform");
    const settings_uomRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_uom");
    const settings_countryRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_country");
    const settings_country_portRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_country_port");
    const settings_forwarderRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_forwarder");
    const settings_routeRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_route");
    const settings_product_typeRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_product_type");
    const settings_titleRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_title");
    const settings_currencyRef = this.ds.userFireRef().doc(key).collection("columns").doc("settings_currency");
    const usersRef = this.ds.userFireRef().doc(key).collection("columns").doc("users");
    const companyRef = this.ds.userFireRef().doc(key).collection("columns").doc("company");
    const hscodeRef = this.ds.userFireRef().doc(key).collection("columns").doc("hs_codes");

    batch.set(settings_departmentRef, this.settings_department);
    batch.set(settings_coformRef, this.settings_coform);
    batch.set(settings_uomRef, this.settings_uom);
    batch.set(settings_countryRef, this.settings_country);
    batch.set(settings_country_portRef, this.settings_country_port);
    batch.set(settings_forwarderRef, this.settings_forwarder);
    batch.set(settings_routeRef, this.settings_route);
    batch.set(settings_product_typeRef, this.settings_product_type);
    batch.set(settings_titleRef, this.settings_title);
    batch.set(settings_currencyRef, this.settings_currency);
    batch.set(usersRef, this.users);
    batch.set(companyRef, this.company);
    batch.set(hscodeRef, this.hs_codes);

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
  fetchHsCode(callback) {
    this.ds.hscodeRef().valueChanges().subscribe(data => {
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

  @action
  async saveData(f: any, statiticFeild: string, callback) {
    const docsData = await this.ds.hscodeIndexRef().get().toPromise();
    var batch = this.ds.batch();
    const hscodeRef = this.ds.itemHsCodeRef();
    const configRef = this.ds.sysConfigSettingRef();
    const statisticRef = this.ds.statisticBatchRef();
    const node = docsData.empty ? 0 : pushToArray(docsData)[0].index;
    const item: IHSCODE = f
    const id = this.ds.createId();
    item.key = id;
    item.index = node + 1;
    item.node = (node + 1).toString() + ".";
    item.parent = (node + 1).toString();
    const { subItem } = f;
    if (subItem === null) {
      batch.update(configRef, { index: node + 1 });
    } else {
      item.node = f.subItem.node + (f.subItem.total + 1).toString() + ".";
      item.level = f.subItem.level + 1;
      item.parent = f.subItem.parent;
      batch.update(hscodeRef.doc(f.subItem.key), {
        total: f.subItem.total + 1
      });
    }
    batch.set(hscodeRef.doc(id), item);
    batch.update(statisticRef, { [`${statiticFeild}`]: firebase.firestore.FieldValue.increment(1) });
    batch.commit().then(() => {
      this.process = false;
      callback(true, null)
    }).catch(error => {
      this.process = false;
      callback(false, error)
    });

  }

  @action
  async deleteBatchData(collectionName: string, statiticFeild: string, f: any, callback) {
    const batch = this.ds.batch();
    const statisticRef = this.ds.statisticBatchRef();
    const settingRef = this.ds.settingBatchRef(collectionName).doc(f.key)
    // const docs =  await this.ds.settingFireRef(collectionName).get()
    // const data = pushToArray(docs)
    // data.forEach(m => {
    //   const { code, name,name_en, name_kh, key, updated_at,
    //     updated_by, country
    //   } = m;
    const user = await this.ds.userFireRef().where('companyRef', 'array-contains', f.key).get()
    const listUser = pushToArray(user)
    if(listUser.length > 0){
      listUser.forEach(m => {
        const index = m.companyRef.findIndex(x=>x===f.key)
        m.company.splice(index, 1);
        m.companyRef.splice(index, 1);
        this.ds.firestore().collection('users').doc(m.key)
                .set(
                    { companyRef: m.companyRef },
                    { merge: true }
                );
                this.ds.firestore().collection('users').doc(m.key)
                .set(
                    { company: m.company },
                    { merge: true }
                );
      })
    }
    batch.update(settingRef, { isDelete: true,})
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
  deleteDoc(collectionName: string, f: any, callback) {
    this.ds.collectionRef(collectionName).doc(f.key).delete().then(() => {
      callback(true);
    }).catch(error => {
      alert(error);
      callback(false, null)
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
  async resoleSetting(collectionName, user) {
    const batch = this.ds.batch()
    const ref = this.ds.settingFireRef(collectionName)

    const docs = await this.ds.settingFireRef(collectionName).get()
    const data = pushToArray(docs)
    data.forEach(m => {
      const { code, name, name_en, name_kh, key, updated_at,
        updated_by, country
      } = m;

      let updatedBy = null;
      //   if (!updatedBy) {

      //     updatedBy = {
      //       key: "bpVwK0mZgGsosSXfm8Fs",
      //       displayName: "Admin",
      //       uid: "bpVwK0mZgGsosSXfm8Fs",
      //       full_name: "Admin",
      //       email: "admin@gmail.com",
      //     }
      //   }
      const tag = [
        key,
        user.key,
        ConvertService.toDateKey(new Date()),
        ConvertService.toCapitalize(`${code}`.trim()),
        ConvertService.toCapitalize(`${name_en}`.trim()),
        ConvertService.toCapitalize(`${name_kh}`.trim()),
        // country ? country.id : null,
        `STATUS_ACTIVE`,
        `~N/A~`,
      ]

      batch.update(ref.doc(m.key), {
        // date_key: ConvertService.toDateKey(new Date()),
        // code: ConvertService.toCapitalize(`${code}`.trim()),
        // name_en: ConvertService.toCapitalize(`${name_en}`.trim()),
        // name_kh: ConvertService.toCapitalize(`${name_kh}`.trim()),
        // country: country ? country : null,
        // countryRef: country ? country : null,
        // countryKey: country ? country.id : null,
        tag: tag,
        // updated_by: user,
        // updated_at: new Date(),
        // updated_by: {
        //   key: updatedBy.key,
        //   displayName: updatedBy.displayName || updatedBy.name,
        //   uid: updatedBy.key,
        //   full_name: updatedBy.displayName || updatedBy.name,
        //   email: updatedBy.email,
        // },

        status: {
          key: 1,
          text: "Active"
        }
      })
    })

    batch.commit().then(() => {
    })
  }




  @action
  async fetchListingByCompany(companyKey, collectionName: string, orderBy: string, filterForm: any) {
    this.orderBy = orderBy;
    this.loading = true;
    this.lastVisible = null;
    this.filterStatus = 0;
    this.fetching = false;
    // const docsData = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
    const docsData = await this.ds.lazySettingMultityCompanyRef(collectionName, this.lastVisible, companyKey, filterForm).get().toPromise();
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
  }

  @action
  async fetchListing(collectionName: string, routerName: string, url: any, icon: any, menuName: string, uid: string, statisticName: string, orderBy: string, filterForm: any, callback) {
    this.orderBy = orderBy;
    this.loading = true;
    this.lastVisible = null;
    this.filterStatus = 0;
    this.fetching = false;
    // const docsData = await this.ds.settingListingRef(collectionName, this.lastVisible, this.orderBy, this.filterStatus).get().toPromise();
    const docsData = await this.ds.lazySettingCompanyRef(collectionName, this.lastVisible, filterForm).get().toPromise();
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
    callback(this.data);

    // this.clearDelete(collectionName)
    // this.resoleSetting(collectionName)
    callback(this.data);
  }




  @action
  async fetchMore(collectionName: any, filterForm: any) {
    if (this.fetching || this.lastVisible === null || this.loading) { return; }
    this.fetching = true;
    const docsData = await this.ds.lazySettingCompanyRef(collectionName, this.lastVisible, filterForm).get().toPromise();
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



}
