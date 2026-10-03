import { Injectable } from '@angular/core';
import { ConvertService } from './convert.service';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { DATA_TYPE } from 'src/app/dummy/columns';
import { APPS } from 'src/app/dummy/config';
import { MOVEMENT_STATUS_DATA, Pages, REGISTER_ITEM_STATUS_OBJ, statusObj } from 'src/app/dummy/status';
import { IDistrict, ICommunes, IVillage, IGeo } from 'src/app/interfaces/geo';
import { IManagementLevel } from 'src/app/interfaces/document/document.interface';
import { MappingService } from './mapping.service';
@Injectable({
  providedIn: 'root'
})

export class DataService {

  private messageSource = new BehaviorSubject<number>(0)
  currentMessage = this.messageSource.asObservable();

  private routeSource = new BehaviorSubject('')
  currentIDMessage = this.routeSource.asObservable();

  constructor(
    private db: AngularFirestore
  ) { }

  compareWith(o1: any, o2: any): boolean {
    if (o2) return o1?.key === o2?.key;
  }
  countriesRef(ref?: QueryFn) {
    return this.db.collection('countries', ref)
  }

  managementLevelFireRef(ref?: QueryFn) {
    return this.db.collection<IManagementLevel>('management_level', ref);
  }

  contactListRef(ref?: QueryFn) {
    return this.db.collection('contact_list', ref)
  }

  contactRoomsRef(ref?: QueryFn) {
    return this.db.collection('contact_room', ref)
  }

  contactRoomChatRef(ref?: QueryFn) {
    return this.db.collection('contact_room_chat', ref)
  }

  contactRoomChatMessagesRef(roomKey: string, ref?: QueryFn) {
    return this.db.collection('contact_room_chat').doc(roomKey).collection('conversations', ref)
  }

  compareWithObj(a: any, b: any): boolean {
    if (b) return a?.key === b?.key;
  }

  displayFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  displayVisaType(item: any): string {
    return item && item.name ? `${item.name} ${item.short_name ? (item.short_name) : ''} ` : '';
  }

  displayNameFn(user: any): string {
    return user && user.displayName ? user.displayName : '';
  }

  checkExistFileRef(name) {
    return this.db.collection('file_folder', ref => ref.where('type.key', '==', 'file').where('filename', '==', name).orderBy('created_at', 'desc').limit(1))
  }

  fileSearchRef(keyword: string, path, isRoot, companyKey) {
    if (!keyword) {
      const { key } = path;
      return this.db.collection('file_folder', ref => {
        let condition = ref.where('currentPath.key', "==", key)
          .where('isDelete', '==', false);
        if (!isRoot) {
          condition = condition.where('rootLevel', "==", false)
            .where('companyKey', '==', companyKey)
        }
        return condition.orderBy('page_key', 'desc');
      })
    }
    return this.db.collection("file_folder", ref => {
      let condition = ref.where("name", ">=", keyword)
        .where('isDelete', '==', false);
      if (!isRoot) {
        condition = condition.where('rootLevel', "==", false)
          .where('companyKey', '==', companyKey)
      }
      return condition.orderBy('name');
    })
  }


  systemConfigRef() {
    return this.db.collection('sys_environment').doc('app_police')
  }

  districtRef(provinceKey?) {
    if (provinceKey)
      return this.db.collection<IDistrict>("geo_districts", ref =>
        ref.where("province.key", "==", provinceKey).where("status.key", "==", 1).orderBy("id")
      );
    else return this.db.collection<IDistrict>("geo_districts");
  }

  communeRef(districtKey?) {
    if (districtKey)
      return this.db.collection<ICommunes>("geo_communes", ref =>
        ref.where("district.key", "==", districtKey).where("status.key", "==", 1).orderBy("id")
      );
    else return this.db.collection<IDistrict>("geo_communes");
  }

  villageRef(communeKey?) {
    if (communeKey)
      return this.db.collection<IVillage>("geo_villages", ref =>
        ref.where("commune.key", "==", communeKey).where("status.key", "==", 1).orderBy("id")
      );
    else return this.db.collection<IVillage>("geo_villages");
  }

  provincesRef() {
    return this.db.collection<IGeo>("geo_provinces", ref => ref.where("status.key", "==", 1).orderBy("id"));
  }

  provinceByIdRef(id) {
    return this.db.collection<IGeo>("geo_provinces", ref => ref.where("id", "==", id));
  }

  positionsRef() {
    return this.db.collection("positions");
  }

  titlesRef() {
    return this.db.collection("titles");
  }

  visa_typesRef(ref?: QueryFn) {
    return this.db.collection("visa_types", ref);
  }

  supplierRef(ref?: QueryFn) {
    return this.db.collection("suppliers", ref);
  }

  postRef(ref?: QueryFn) {
    return this.db.collection("posts", ref);
  }

  stockVisaRef(ref?: QueryFn) {
    return this.db.collection("stock_visa", ref);
  }

  stockAdjustmentFireRef() {
    return this.firestore().collection('stock_adjustments');
  }

  stockAdjustmentRef(branchKey?, displayStatus?: any, lastVisible?: any) {
    return this.db.collection('stock_adjustments', ref => {
      let condition = ref.orderBy('created_at', 'desc').limit(Pages.size);
      if (lastVisible) {
        condition = condition.startAfter(lastVisible['created_at'])
      }
      if (branchKey) {
        condition = condition.where('branch.key', '==', branchKey)
      }
      if (displayStatus && displayStatus !== 'all') {
        const movementStatus = MOVEMENT_STATUS_DATA[displayStatus];
        if (movementStatus) {
          condition = condition.where('movementStatus.key', '==', movementStatus.key)
        }
        else {
          condition = condition.where('movementStatus.key', '==', displayStatus)
        }
      }
      return condition;
    })
  }

  userByProvinceRef(provinceKey: string) {
    return this.db.collection<any>("users", ref => ref.where("province.key", "==", provinceKey));
  }

  districtFireRef() {
    return this.firestore().collection("geo_districts");
  }

  communeFireRef() {
    return this.firestore().collection("geo_communes");
  }

  villageFireRef() {
    return this.firestore().collection("geo_villages");
  }

  serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  fireFieldValue() {
    return firebase.firestore.FieldValue;
  }

  timestampFromDate(second: number, nanosecond: number){
    if(!second || !nanosecond || typeof second !== "number" ||
      typeof nanosecond !== "number")
      return null;
    return new firebase.firestore.Timestamp(second, nanosecond);
  }

  lazySettingCompanyRef(collectionName: string, lastVisible: any, formFilter: any) {
    return this.db.collection(`${collectionName}`, ref => {
      let keyword: any = "~N/A~"
      let fromDateKey = 0;
      let toDateKey = 1000000000;
      if (formFilter) {
        const { search, filterOption, fromDate, toDate } = formFilter;
        const { type } = filterOption
        if (fromDate && toDate) {
          fromDateKey = ConvertService.toDateKey(fromDate)
          toDateKey = ConvertService.toDateKey(toDate)
        }
        switch (type) {
          case DATA_TYPE.date:
            keyword = ConvertService.toDateKey(search);
            break;
          case DATA_TYPE.number:
            keyword = ConvertService.toNumber(search);
            break;
          default:
            keyword = search ? search.key : keyword;
            break;
        }
      }
      let condition = ref
        .where("tag", "array-contains", keyword)
        // .where("status.key", "==", statusObj.active.key)
        .where("isDelete", "==", false)
      // .orderBy('page_key', "desc")
      // .orderBy('name_en','asc')

      if (lastVisible) {
        const startAfter = lastVisible['page_key'];
        condition = condition.startAfter(startAfter)
          .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
          .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}235959`))
      }
      else {
        condition = condition.orderBy("status.key").orderBy('name_en')
        // .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
        // .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}235959`))
      }

      return condition.limit(APPS.settingSize)
    })
  }

  changeMessage(message: number) {
    this.messageSource.next(message)
  }
  getRouteID(routeID: string) {
    this.routeSource.next(routeID)
  }

  publicFireRef() {
    return this.firestore().collection('public_shared')
  }

  publicRef() {
    return this.db.collection('public_shared')
  }

  pinFileFireRef() {
    return this.firestore().collection('pined_files')
  }

  folderRef() {
    return this.db.collection('file_folder')
  }

  folderFireRef() {
    return this.firestore().collection('file_folder')
  }

  currentPinnRef(key) {
    return this.db.collection('pined_files', ref => ref.where('key', '==', key))
  }

  currentFolderRef(key) {
    return this.db.collection('file_folder', ref => ref.where('key', '==', key))
  }

  folderByPathRef(key) {
    return this.db.collection('file_folder', ref => ref.where('pathString', 'array-contains', key))
  }

  filebyPathRef(key) {
    return this.db.collection('file_folder', ref => ref
      .where('type.key', '==', 'file')
      .where('pathString', 'array-contains', key))
  }

  folderKeyByPathRef(key) {
    return this.db.collection('file_folder', ref => ref
      .where('key', '==', key)
      .where('pathString', 'array-contains', key)
    )
  }

  getPinnbyfileRef(key) {
    return this.db.collection('pined_files', ref => ref.where('key', '==', key))
  }

  myFileFolderByCompanyRef(companyKey, uid) {
    return this.db.collection('users').doc(uid).collection('file_folder', ref => ref
      .where('type.key', '==', 'folder')
      .where('currentPath.key', "==", "my_files")
      .where('isDelete', '==', false)
      .where('companyKey', '==', companyKey)
      .orderBy('name', 'asc')
    )
  }


  sidebarFolderByCompanyRef(companyKey, uid) {
    return this.db.collection('users').doc(uid).collection('file_folder', ref => ref
      .where('type.key', '==', 'folder')
      .where('currentPath.key', "==", "my_files")
      .where('isDelete', '==', false)
      .where('companyKey', '==', companyKey)
      .orderBy('name', 'asc')
    )
  }

  folderDriveFilterRef(isRoot: boolean, form: any) {
    const { keyword, organization, category, signer, sector, issueDate } = form;
    return this.db.collection('file_folder', ref => {
      let condition = ref.where('isDelete', '==', false);
      let keywordSearch: string[] = [];
      if (organization) {
        keywordSearch = keywordSearch.concat([organization])
      }
      if (category) {
        keywordSearch = keywordSearch.concat([category])
      }
      if (signer) {
        keywordSearch = keywordSearch.concat([signer])
      }
      if (sector) {
        keywordSearch = keywordSearch.concat([sector])
      }
      if (issueDate) {
        keywordSearch = keywordSearch.concat([`${issueDate}`])
      }
      if (keyword) {
        keywordSearch = keywordSearch.concat([keyword])
      }
      return condition.where('keywords', 'array-contains-any', keywordSearch).orderBy('updated_at', 'desc').limit(APPS.size);
    })
  }

  folderDriveRef(isRoot, path, provinceKey) {
    const { key } = path;
    return this.db.collection('file_folder', ref => {
      let condition = ref.where('currentPath.key', "==", key)
        .where('isDelete', '==', false)
      // .where('isParentDelete', '==', false)
      if (provinceKey) condition = condition.where('companyKey', '==', provinceKey)
      if (!isRoot) condition = condition.where('rootLevel', "==", false)
      return condition.orderBy('page_key', 'desc');
    })
  }

  fileDriveRef(companyKey, path, isRoot, provinceKey) {
    const { key } = path;
    return this.db.collection('file_folder', ref => {
      let condition = ref.where('currentPath.key', "==", key)
        .where('isDelete', '==', false)
        .where('type.key', '==', 'file')
      if (provinceKey) {
        condition = condition.where('companyKey', '==', provinceKey)
      }
      if (!isRoot) {
        condition = condition.where('companyKey', '==', companyKey)
      }
      return condition.orderBy('page_key', 'desc')
        .limit(APPS.size)
    })
  }

  folderByCompanyRef(companyKey, uid, isRoot, path, selectedOpenItem) {
    const { key } = path;
    if (selectedOpenItem) {
      const { created_by } = selectedOpenItem;
      return this.db.collection('users').doc(created_by.key).collection('file_folder', ref => ref
        .where('currentPath.key', "==", key)
        .where('isDelete', '==', false)
        .where('companyKey', '==', companyKey)
        .orderBy('page_key', 'desc')
        .limit(APPS.size))
    }

    return this.db.collection('users').doc(uid).collection('file_folder', ref => ref
      .where('currentPath.key', "==", key)
      .where('isDelete', '==', false)
      .where('companyKey', '==', companyKey)
      .orderBy('page_key', 'desc')
      .limit(APPS.size))
  }



  folderFileTrashByCompanyRef(companyKey) {
    return this.db.collection('file_folder', ref => ref
      .where('isDelete', '==', true)
      .where('companyKey', '==', companyKey)
      .orderBy('page_key', 'desc'))
  }


  emptyTrash(companyKey, uid) {
    return this.db.collection('file_folder', ref => ref
      .where('isDelete', '==', true)
      .where('companyKey', '==', companyKey)
      .where('created_by.key', '==', uid))
  }


  folderFileFavoriteByCompanyRef(companyKey, uid) {
    return this.db.collection('file_folder', ref => ref
      .where('isFavorite', '==', true)
      .where('isDelete', '==', false)
      .where('companyKey', '==', companyKey)
      .orderBy('page_key', 'desc'))
  }

  pinnedBoardRef() {
    return this.db.collection('pined_files', ref => ref
      .where('pin', '==', true)
      .where('isDelete', '==', false)
      .orderBy('page_key', 'desc')
      .limit(APPS.size))
  }

  publicSharedRef(companyKey, uid) {
    return this.db.collection('public_shared', ref => ref
      .where('publicShare', '==', true)
      .where('isDelete', '==', false)
      .where('companyKey', '==', companyKey)
      // .where('created_by.key', '==', uid)
      .orderBy('page_key', 'desc')
      .limit(APPS.size))
  }

  publicSharedWithOtherRef(companyKey, uid) {
    return this.db.collection('public_shared', ref => ref
      .where('publicShare', '==', false)
      .where('isDelete', '==', false)
      .where('viewer', 'array-contains', companyKey)
      .orderBy('page_key', 'desc'))
  }

  publicSharedWithMeRef(companyKey, uid, selectedShared, path) {
    if (selectedShared) {
      const { key } = path;
      return this.db.collection('users').doc(uid).collection('file_folder', ref => ref
        .where('currentPath.key', "==", key)
        .where('isDelete', '==', false)
        .where('publicShare', '==', true)
        .orderBy('page_key', 'desc')
        .limit(APPS.size))
    }
    return this.db.collection('public_shared', ref => {
      let condition = ref.where('isDelete', '==', false)
        .where('publicShare', '==', true)
      return condition.orderBy('page_key', 'desc')
        .limit(APPS.size)
    })
  }

  dataRef() {
    return this.db;
  }

  materialFireRef() {
    return this.firestore().collection("register_material");
  }


  resisterCoRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {

    return this.db.collection("register_co", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  registerSOORef() {
    return this.db.collection("register_soo")
  }

  checkExistRegisterRef(companyKey, refNo, collection, feild) {
    return this.db.collection(collection, ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where(feild, "==", refNo.toString().trim())
      .where('register_status.order', '<', REGISTER_ITEM_STATUS_OBJ.deleted.order)
      .orderBy('register_status.order')
      .limit(1)
    )
  }

  checkExistRegisterItemRef(companyKey, refNo, collection, feild) {
    return this.db.collection(collection, ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where(feild, "==", refNo.toString().trim())
      .where('item_status.order', '<', REGISTER_ITEM_STATUS_OBJ.deleted.order)
      .limit(1)
    )
  }



  registerPickupRef() {
    return this.db.collection("pickup_bill")
  }

  registerPickupInspectRef() {
    return this.db.collection("pickup_inspect")
  }

  registerSooStatementRef() {
    return this.db.collection("register_soo_statement")
  }

  resisterPickUpBillRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("pickup_bill", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterSOORef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_soo", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterOBRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_ob_stock", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterImportStockRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_import_stock", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterAdjustmentRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_adjustment_stock", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterReApplyFormRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_re_apply", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterDuplicateFormRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_duplicate", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterSubmitFormRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string, typeKey: any) {
    return this.db.collection("register_submit_form", ref => {
      let condition = ref.where("companyKey", "==", companyKey).where('submitType.key', '==', typeKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterDeliverReturnApplicationRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("delivery_return_application", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterReturnApplicationRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_return_application", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterDeliveryCOApplicationRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_delivery_co_application", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterDeliveryExportDocumentRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_delivery_export_document", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterDeliveryImportStockDocumentRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_delivery_import_stock", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterDeliveryCutStockDocumentRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_delivery_cut_stock", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterPickUpInspectRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("pickup_inspect", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }
  resisterSooStatementRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_soo_statement", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }


  getitemRef() {
    return this.db.collection("register_item", ref => ref.where('companyKey', '==', 'cB5jIbcMxjRJIzBiNjgo'))
  }

  resisterItemCompanyRef(lastVisible: any, companyKey: string, itemStatusKey, formFilter?: any) {
    let fromDateKey = 0;
    let toDateKey = 1000000000;
    return this.db.collection("register_item", ref => {
      let keyword: any = "~N/A~"
      if (formFilter) {
        const { search, filterOption, fromDate, toDate } = formFilter;
        const { type } = filterOption
        if (fromDate && toDate) {
          fromDateKey = ConvertService.toDateKey(fromDate)
          toDateKey = ConvertService.toDateKey(toDate)
        }
        switch (type) {
          case DATA_TYPE.date:
            keyword = ConvertService.toDateKey(search);
            break;
          case DATA_TYPE.number:
            keyword = ConvertService.toNumber(search);
            break;
          default:
            keyword = search ? search.key : keyword;
            break;
        }
      }
      let condition = ref
        .where('register_status.key', "==", itemStatusKey)
        .where('companyKey', "==", companyKey)
        .where("tag", "array-contains", keyword)
        .orderBy('date_key')
        .where('date_key', ">=", fromDateKey)
        .where('date_key', "<=", toDateKey)
      //lazy load condition or pagination
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      return condition.limit(APPS.size)
    })
  }

  resisterItemRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_item", ref => {

      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false)
          .where("item_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  // resisterItemRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string, formFilter?: any) {
  //   return this.db.collection("register_item", ref => {
  //     let condition = ref.where("companyKey", "==", companyKey)
  //       .where("isDelete", "==", registerStatusKey === 'deleted' ? true : false)
  //     if (formFilter) {
  //       const { option, search, includeDate, fromDate, toDate } = formFilter;
  //       const keyword = search.toUpperCase();
  //       const end = keyword.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
  //     }
  //     else {
  //       // condition = condition.where('co_form', "==",null)
  //       // condition = condition.where('invoice_number', ">",null)
  //       // condition = condition.where('date_key', ">=",null)
  //       // condition = condition.where('date_key', "<=",null)

  //       // condition = condition.where('amount_FOB', ">",null)
  //       // condition = condition.where('country', ">","")

  //     }
  //     //lazy load condition
  //     if (lastVisible) {
  //       const startAfter = lastVisible["updated_at"];
  //       condition = condition.orderBy("updated_at", "desc")
  //         .startAfter(startAfter)
  //     }
  //     else {
  //       condition = condition.orderBy("updated_at", "desc")
  //     }
  //     //====
  //     return condition.limit(APPS.size)
  //   })
  // }

  resisterInvoiceRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {

    return this.db.collection("register_invoice", ref => {

      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false)
          .where("item_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterReApplyItemRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {

    return this.db.collection("register_reapply_item", ref => {

      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false)
          .where("item_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterDuplicateItemRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {

    return this.db.collection("register_duplicate_item", ref => {

      let condition = ref.where("companyKey", "==", companyKey)
      //status load condition
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false)
          .where("item_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  searchResisterItemListingRef(collectionName: string, field: string, text: any, filterStatusKey, registerStatusKey: string, companyKey: string, typeKey?: string) {
    const search = text.toUpperCase();
    const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    return this.db.collection(collectionName, ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("item_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //Submit Type
      if (typeKey) {
        condition = condition.where("submitType.key", "==", typeKey)
      }

      if (text) {
        condition = condition
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .orderBy("updated_at", "desc")
          .limit(APPS.size / 2)
      }
      else {
        condition = condition.orderBy("updated_at", "desc").limit(APPS.size)
      }
      return condition;
    })
  }


  searchResisterSubmitListingRef(collectionName: string, field: string, text: any, filterStatusKey, registerStatusKey: string, companyKey: string, typeKey?: string) {
    const search = text.toUpperCase();
    const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    return this.db.collection(collectionName, ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //Submit Type
      if (typeKey) {
        condition = condition.where("submitType.key", "==", typeKey)
      }

      if (text) {
        condition = condition
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .orderBy("updated_at", "desc")
          .limit(APPS.size / 2)
      }
      else {
        condition = condition.orderBy("updated_at", "desc").limit(APPS.size)
      }
      return condition;
    })
  }

  searchResisterListingRef(collectionName: string, field: string, text: any, filterStatusKey: any, registerStatusKey: string, companyKey: string, typeKey?: string) {
    const search = text.toUpperCase();
    const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where("companyKey", "==", companyKey)
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //Submit Type
      if (typeKey) {
        condition = condition.where("submitType.key", "==", typeKey)
      }

      if (text) {
        condition = condition
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .orderBy("updated_at", "desc")
          .limit(APPS.size / 2)
      }
      else {
        condition = condition.orderBy("updated_at", "desc").limit(APPS.size)
      }
      return condition;
    })
  }

  searchResisterMaterialListingRef(collectionName: string, field: string, text: any, filterStatusKey, registerStatusKey: string, companyKey: string, typeKey?: string) {
    const search = text.toUpperCase();
    const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    return this.db.collection(collectionName, ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_material_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //Submit Type
      if (typeKey) {
        condition = condition.where("submitType.key", "==", typeKey)
      }

      if (text) {
        condition = condition
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .orderBy("updated_at", "desc")
          .limit(APPS.size / 2)
      }
      else {
        condition = condition.orderBy("updated_at", "desc").limit(APPS.size)
      }
      return condition;
    })
  }

  autosearchListingRef(collectionName: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where("status.key", "==", statusObj.active.key)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(APPS.smallsize)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );

  }

  autoSearchRegisterCoRef(companyKey: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection("register_co", ref => ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("registerCutStock", "==", false)
        .where("registerCutStockKey", "==", null)
        .where("outstandingStock", "==", true)
        .where(field, ">=", search)
        .where(field, '<', end)
        .orderBy(field)
        .orderBy("updated_at", "desc"))
    }
    return this.db.collection("register_co", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("registerCutStock", "==", false)
      .where("registerCutStockKey", "==", null)
      .where("outstandingStock", "==", true)
      .orderBy("updated_at", "desc"))
  }


  autoSearchListingItemRef(companyKey: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection("register_item", ref =>
        ref
          .where("isDelete", "==", false)
          .where("status.key", "==", statusObj.active.key)
          .where("companyKey", "==", companyKey)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(APPS.smallsize)
      );
    }
    return this.db.collection("register_item", ref =>
      ref
        .where("isDelete", "==", false)
        .where("status.key", "==", statusObj.active.key)
        .where("companyKey", "==", companyKey)
        .orderBy(field)
        .limit(APPS.smallsize)
    );
  }


  autosearchListingMaterialRef(collectionName: string, companyKey: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where("status.key", "==", statusObj.active.key)
          .where("companyKey", "==", companyKey)
          .where("register_material_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(APPS.smallsize)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where("status.key", "==", statusObj.active.key)
        .where("companyKey", "==", companyKey)
        .where("register_material_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );
  }

  masterListItemRef(companyKey: string) {
    return this.db.collection("items", ref =>
      ref
        .where('status.key', '==', 1)
        .where('isDelete', '==', false)
        .where("company.key", "==", companyKey)
        .orderBy("code", "desc").limit(15)
    );
  }

  masterListItemTypeRef(companyKey: string, typeKey: any) {
    return this.db.collection("master_list", ref =>
      ref
        .where('status.key', '==', typeKey)
        .where('isDelete', '==', false)
        .where("company.key", "==", companyKey)
        .orderBy("code", "desc")
    );
  }

  countryAutoRef(lastVisible) {
    if (lastVisible) {
      return this.db.collection("settings_country", ref =>
        ref
          .where('status.key', '==', 1).where('isDelete', '==', false)
          .orderBy("code", "desc")
          .startAfter(lastVisible.code)
      );
    }
    return this.db.collection("settings_country", ref =>
      ref
        .where('status.key', '==', 1).where('isDelete', '==', false)
        .orderBy("code", "desc")
    );
  }
  masterListRef() {
    return this.db.collection("master_list")
  }

  deleveryExportRef() {
    return this.db.collection("delivery_export_document")
  }

  deleveryExportTypeRef(companyKey: string, typeKey: any) {
    return this.db.collection("delivery_export_document", ref =>
      ref
        .where('status.key', '==', typeKey)
        .where('isDelete', '==', false)
        .where("company.key", "==", companyKey)
      // .orderBy("code", "desc")
    );
  }


  submitFormRef(ref?: any) {
    return this.db.collection("register_submit_form", ref)
  }
  sooFormRef(ref?: any) {
    return this.db.collection("register_soo_statement", ref)
  }

  returnApplicationRef(ref?: any) {
    return this.db.collection("register_return_application", ref)
  }

  deliveryReturnApplicationRef(ref?: any) {
    return this.db.collection("delivery_return_application", ref)
  }

  returnApplicationDocRef(key: string) {
    return this.db.collection("register_return_application").doc(key)
  }

  deliveryCoApplicationRef(ref?: any) {
    return this.db.collection("register_delivery_co_application", ref)
  }

  deliveryCoApplicationDocRef(key: string) {
    return this.db.collection("register_delivery_co_application").doc(key)
  }

  deliveryExportDocumentRef(ref?: any) {
    return this.db.collection("register_delivery_export_document", ref)
  }

  deliveryExportDocumentDocRef(key: string) {
    return this.db.collection("register_delivery_export_document").doc(key)
  }

  deliveryImportStockDocumentRef(ref?: any) {
    return this.db.collection("register_delivery_import_stock", ref)
  }

  deliveryImportStockDocumentDocRef(key: string) {
    return this.db.collection("register_delivery_import_stock").doc(key)
  }

  deliveryCutStockDocumentRef(ref?: any) {
    return this.db.collection("register_delivery_cut_stock", ref)
  }

  deliveryCutStockDocumentDocRef(key: string) {
    return this.db.collection("register_delivery_cut_stock").doc(key)
  }

  uomAutoRef(lastVisible) {
    if (lastVisible) {
      return this.db.collection("settings_uom", ref =>
        ref
          .where('status.key', '==', 1).where('isDelete', '==', false)
          .orderBy("code", "desc")
          .startAfter(lastVisible.code)
      );
    }
    return this.db.collection("settings_uom", ref =>
      ref
        .where('status.key', '==', 1).where('isDelete', '==', false)
        .orderBy("code", "desc")
    );
  }
  fecthitems(collectionName: string, companyKey: string, typeKey: string, field: string) {
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where('type.key', '==', typeKey)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );
  }
  fecthitemsMaterial(collectionName: string, companyKey: string) {
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('companyKey', '==', companyKey)
        .where("status.key", "==", statusObj.active.key)
        .where("register_material_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .limit(APPS.smallsize)
    );
  }


  fecthitemsf(collectionName: string, companyKey: string, field: string) {
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where("status.key", "==", statusObj.active.key)
        .where("register_item_inspect_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );
  }
  searchfilterListingByCompanyTypeReff(collectionName: string, companyKey: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where('company.key', '==', companyKey)
          .where("status.key", "==", statusObj.active.key)
          .where("register_item_inspect_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(APPS.smallsize)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where("status.key", "==", statusObj.active.key)
        .where("register_item_inspect_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );

  }

  fecthRegisterItems(collectionName: string, companyKey: string, field: string) {
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );
  }

  fecthRegisterCO(collectionName: string, companyKey: string, field: string) {
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );
  }

  searchfilterRegisterItemByCompanyTypeRef(collectionName: string, companyKey: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where('company.key', '==', companyKey)
          .where("status.key", "==", statusObj.active.key)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(APPS.smallsize)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );

  }

  searchfilterListingByCompanyTypeRef(collectionName: string, companyKey: string, typeKey: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where('company.key', '==', companyKey)
          .where('type.key', '==', typeKey)
          .where("status.key", "==", statusObj.active.key)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(APPS.smallsize)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where('type.key', '==', typeKey)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );

  }

  hsCodeSubItemRef(parentKey: string) {
    return this.db.collection("hs_codes", ref => ref.where("subItem.key", "==", parentKey).where('status.key', '==', 1).where('isDelete', '==', false));
  }


  hsCodeFireRef() {
    return this.firestore().collection("hs_codes")
  }
  hscodeSearchRef() {
    return this.db.collection("hs_codes", ref => ref.where('status.key', '==', 1).where('isDelete', '==', false).orderBy('node').limit(APPS.smallsize));
  }
  autoListingRef(collectionName: string, field: string, text: any) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where("status.key", "==", statusObj.active.key)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(APPS.smallsize)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.smallsize)
    );

  }
  hsCodeSearchRef(field: string, search: string) {
    if (!search) {
      return this.db.collection("hs_codes", ref =>
        ref.orderBy(field)
          .limit(24)
      );
    }
    return this.db.collection("hs_codes", ref =>
      ref
        .where(field, ">=", search)
        .orderBy(field)
        .limit(24)
    );
  }
  autoColelctionRef(collection) {
    return this.db.collection(collection, ref => ref.where('status.key', '==', 1).where('isDelete', '==', false).limit(APPS.smallsize));
  }

  autoCollectionByCompanyRef(collection, companyKey, fieldOrder) {
    return this.db.collection(collection, ref => ref
      .where("companyKey", "==", companyKey)
      .where('status.key', '==', 1)
      .where('isDelete', '==', false)
      .orderBy(fieldOrder)
      .limit(APPS.smallsize));
  }

  registerAutoCompleteRef(collectionName, companyKey, fieldOrder, itemStatusField, itemStatusFieldOther, outstandingField?: string) {
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  registerAutoCompleteSearchRef(collectionName, companyKey, fieldOrder: string, text: any, itemStatusField, itemStatusFieldOther, outstandingField) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref => {
        let condition = ref
          .where('status.key', '==', 1)
          .where("isDelete", "==", false)
          .where("item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
          .where("companyKey", "==", companyKey)
          .where(itemStatusField, '==', false)
          .where(itemStatusFieldOther, '==', null)
          .where(fieldOrder, ">=", search)
          .where(fieldOrder, '<', end)

        if (outstandingField) {
          condition = condition.where(outstandingField, "==", true)
        }
        return condition.orderBy(fieldOrder)
          .limit(APPS.smallsize)
      })

    }
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  registerCOAutoCompleteRef(collectionName, companyKey, fieldOrder, itemStatusField, itemStatusFieldOther, outstandingField?: string) {
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  registerCOAutoCompleteSearchRef(collectionName, companyKey, fieldOrder: string, text: any, itemStatusField, itemStatusFieldOther, outstandingField?: string) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref => {
        let condition = ref
          .where('status.key', '==', 1)
          .where("isDelete", "==", false)
          .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
          .where("companyKey", "==", companyKey)
          .where(itemStatusField, '==', false)
          .where(itemStatusFieldOther, '==', null)
          .where(fieldOrder, ">=", search)
          .where(fieldOrder, '<', end)

        if (outstandingField) {
          condition = condition.where(outstandingField, "==", true)
        }
        return condition.orderBy(fieldOrder)
          .limit(APPS.smallsize)
      })

    }
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  registerItemAutoCompleteRef(collectionName, companyKey, fieldOrder, itemStatusField, itemStatusFieldOther, outstandingField?: string) {
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  registerItemAutoCompleteSearchRef(collectionName, companyKey, fieldOrder: string, text: any, itemStatusField, itemStatusFieldOther, outstandingField?: string) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref => {
        let condition = ref
          .where('status.key', '==', 1)
          .where("isDelete", "==", false)
          .where("item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
          .where("companyKey", "==", companyKey)
          .where(itemStatusField, '==', false)
          .where(itemStatusFieldOther, '==', null)
          .where(fieldOrder, ">=", search)
          .where(fieldOrder, '<', end)

        if (outstandingField) {
          condition = condition.where(outstandingField, "==", true)
        }
        return condition.orderBy(fieldOrder)
          .limit(APPS.smallsize)
      })

    }
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  registerSubmitAutoCompleteRef(collectionName, companyKey, fieldOrder, itemStatusField, itemStatusFieldOther, outstandingField?: string) {
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  registerSubmitAutoCompleteSearchRef(collectionName, companyKey, fieldOrder: string, text: any, itemStatusField, itemStatusFieldOther, outstandingField?: string) {
    if (text && !text.key) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref => {
        let condition = ref
          .where('status.key', '==', 1)
          .where("isDelete", "==", false)
          .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
          .where("companyKey", "==", companyKey)
          .where(itemStatusField, '==', false)
          .where(itemStatusFieldOther, '==', null)
          .where(fieldOrder, ">=", search)
          .where(fieldOrder, '<', end)

        if (outstandingField) {
          condition = condition.where(outstandingField, "==", true)
        }
        return condition.orderBy(fieldOrder)
          .limit(APPS.smallsize)
      })

    }
    return this.db.collection(collectionName, ref => {
      let condition = ref
        .where('status.key', '==', 1)
        .where("isDelete", "==", false)
        .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, '==', false)
        .where(itemStatusFieldOther, '==', null)

      if (outstandingField) {
        condition = condition.where(outstandingField, "==", true)
      }
      return condition.orderBy(fieldOrder)
        .limit(APPS.smallsize)
    })
  }

  dbRef() {
    return this.db;
  }

  fireRef() {
    return this.db.firestore;
  }

  firestore() {
    return this.db.firestore;
  }

  batch() {
    return this.db.firestore.batch()
  }

  createId() {
    return this.db.createId();
  }

  listOfItemsRef(typekey, companyKey) {
    return this.db.collection("items", ref => ref
      .where('type.key', '==', typekey)
      .where('company.key', '==', companyKey)
      .where('isDelete', '==', false)
      .orderBy("node"));
  }

  listofUserinCompany(companyKey) {
    return this.db.collection(`users`, ref => {
      let condition = ref
        .where('isDelete', '==', false)
        .where("companyRef", "array-contains", companyKey)
        .orderBy('full_name')
      return condition
    })
  }


  userRef(ref?: QueryFn) {
    return this.db.collection("users", ref);
  }

  usersRef() {
    return this.db.collection("users", ref => ref.orderBy('id_number'));
  }

  userGroupMemberRef(uid) {
    return this.db.collection("group_users", ref => ref.where("users", "array-contains", uid));
  }

  userMemberGroupRef(users: any[]) {
    return this.db.collection("users", ref => ref.where("key", "in", users));
  }


  groupUserRef() {
    return this.db.collection("group_users");
  }


  routerRef() {
    return this.db.collection("settings_route");
  }

  productTypeRef() {
    return this.db.collection("settings_product_type");
  }

  userFireRef() {
    return this.firestore().collection("users");
  }

  itemRef() {
    return this.firestore().collection("items");
  }

  fileFolderFireRef() {
    return this.firestore().collection("file_folder");
  }

  FolderSizeRef() {
    return this.db.collection("file_folder", ref => ref
      .where("type.key", "==", "file"));
  }

  // fileFolderFireRef() {
  //   return this.firestore().collection("file_folder");
  // }

  // FolderSizeRef() {
  //   return this.db.collection("file_folder", ref => ref
  //     .where("type.key", "==", "file"));
  // }

  itemIndexRef() {
    return this.db.collection("items", ref => ref.orderBy("index", "desc").limit(1));
  }

  hscodeIndexRef() {
    return this.db.collection("hs_codes", ref => ref.orderBy("index", "desc").limit(1));
  }
  itemHsCodeRef() {
    return this.firestore().collection("hs_codes");
  }


  sysConfigSettingRef() {
    return this.firestore().collection("sys_configs").doc("settings");
  }


  itemsRef(collectionName: string, companyKey: string, itemTypeKey) {
    return this.db.collection("items", ref => ref
      .where('isDelete', '==', false)
      .where('type.key', '==', itemTypeKey)
      .where("company.key", "==", companyKey)
      .orderBy("code")
    )
  }

  collectionRef(collectionName: string) {
    return this.db.collection(collectionName);
  }

  collectionQueryRef(collectionName: string,ref?:QueryFn) {
    return this.db.collection(collectionName,ref);
  }

  settingRef(collectionName: string) {
    return this.db.collection(collectionName, ref => ref.where("isDelete", "==", false).where("status.key", "==", statusObj.active.key));
  }

  commentRef(collectionName: string) {
    return this.db.collection(collectionName);
  }

  registerCheckExistRef(collectionName: string, field: string, oldValue: string, companyKey: string) {
    return this.db.collection(collectionName, ref => ref
      .where(field, "==", oldValue)
      .where("register_item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("company.key", "==", companyKey)
      .where("isDelete", "==", false)
      .where("status.key", "==", statusObj.active.key)
    );
  }

  settingFireRef(collectionName: string) {
    return this.firestore().collection(collectionName)
  }

  registerItemRef(companyKey: string) {
    return this.db.collection('register_item', ref => ref.where("company.key", "==", companyKey));
  }

  registerCORef(companyKey: string) {
    return this.db.collection('register_co', ref => ref.where("company.key", "==", companyKey));
  }

  registerOpeningBalanceRef(key: string) {
    return this.db.collection('register_ob_stock').doc(key);
  }

  registerImportStockRef(key: string) {
    return this.db.collection('register_import_stock').doc(key);
  }

  registerCutStockRef(key: string) {
    return this.db.collection('register_cut_stock').doc(key);
  }

  registerVoidStockRef(key: string) {
    return this.db.collection('register_void_stock').doc(key);
  }

  registerAdjustmentStockRef(key: string) {
    return this.db.collection('register_adjustment_stock').doc(key);
  }

  registerItemDocRef(key: string) {
    return this.db.collection('register_item').doc(key);
  }
  registerISooRef(key: string) {
    return this.db.collection('register_soo').doc(key);
  }

  registerInvoiceDocRef(key: string) {
    return this.db.collection('register_invoice').doc(key);
  }

  registerReapplyItemDocRef(key: string) {
    return this.db.collection('register_reapply_item').doc(key);
  }

  registerDuplicateItemDocRef(key: string) {
    return this.db.collection('register_duplicate_item').doc(key);
  }

  registerReapplyDocRef(key: string) {
    return this.db.collection('register_re_apply').doc(key);
  }

  registerDuplicateDocRef(key: string) {
    return this.db.collection('register_duplicate').doc(key);
  }

  registerSubmitDocRef(key: string) {
    return this.db.collection('register_submit_form').doc(key);
  }

  registerCoDocRef(key: string) {
    return this.db.collection('register_co').doc(key);
  }
  registerSooDocRef(key: string) {
    return this.db.collection('register_soo').doc(key);
  }

  registerCODocRef(key: string) {
    return this.db.collection('register_co').doc(key);
  }

  pickupInspectDocRef(key: string) {
    return this.db.collection('pickup_inspect').doc(key);
  }

  registerSubmitFormDocRef(key: string) {
    return this.db.collection('register_submit_form').doc(key);
  }

  registerItemDBRef() {
    return this.db.collection('register_item');
  }

  settingsCountryDBRef() {
    return this.db.collection('settings_country');
  }

  settingsCountryFireRef() {
    return this.firestore().collection('settings_country');
  }

  registerMaterialDocRef(key: string) {
    return this.db.collection('register_material').doc(key);
  }

  registerItemFireRef() {
    return this.firestore().collection('register_item');
  }
  registerSOOFireRef() {
    return this.firestore().collection('register_soo');
  }

  registerInvoiceFireRef() {
    return this.firestore().collection('register_invoice');
  }

  registerReapplyItemFireRef() {
    return this.firestore().collection('register_reapply_item');
  }

  registerDuplicateItemFireRef() {
    return this.firestore().collection('register_duplicate_item');
  }

  registerCOFireRef() {
    return this.firestore().collection('register_co');
  }

  registerMaterialRef() {
    return this.db.collection('register_material');
  }

  statisticRef() {
    return this.db.collection('sys_environment').doc('general');
  }

  settingBatchRef(collectionName: string) {
    return this.firestore().collection(collectionName);
  }

  statisticBatchRef() {
    return this.firestore().collection('sys_environment').doc('general');
  }


  ListingByCompanyRef(collectionName: string, companyKey: string, lastVisible: any, orderBy: string, statusKey) {
    if (lastVisible) {
      const startAfter = lastVisible[orderBy];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition
          .where('company.key', '==', companyKey)
          .orderBy(orderBy)
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition
          .where('company.key', '==', companyKey)
          .orderBy(orderBy).limit(APPS.size);
      })
    }

  }
  resisterMaterialRef(collectionName: string, lastVisible: any, orderBy: string, statusKey: any, registerStatusKey: string, companyKey: string) {
    if (lastVisible) {
      const startAfter = lastVisible[orderBy];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
          .where("companyKey", "==", companyKey)
          .where("register_material_status.key", "==", registerStatusKey)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
          .where("companyKey", "==", companyKey)
          .where("register_material_status.key", "==", registerStatusKey)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.orderBy(orderBy, "desc").limit(APPS.size);
      })
    }
  }

  submitOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, outstandingOtherField: string, search?: string) {
    return this.db.collection("register_co", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where(outstandingField, "==", true)
        .where(outstandingOtherField, "==", false)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("co_number", ">=", search)
          .where("co_number", '<', end)
          .orderBy("co_number")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  returnNDeliveryCoOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_return_application", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where(outstandingField, "==", false)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("refNo", ">=", search)
          .where("refNo", '<', end)
          .orderBy("refNo")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  reApplyItemOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_reapply_item", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("item_status.order", "==", 2)
        .where(outstandingField, "==", false)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("co_number", ">=", search)
          .where("co_number", '<', end)
          .orderBy("co_number")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  duplicateItemOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_duplicate_item", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("item_status.order", "==", 2)
        .where(outstandingField, "==", false)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("co_number", ">=", search)
          .where("co_number", '<', end)
          .orderBy("co_number")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  deliveryImportStockCoOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_import_stock", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where("deliveryImportStock", "==", false)
        .where("outstandingImportStock", "==", true)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("transactionNo", ">=", search)
          .where("transactionNo", '<', end)
          .orderBy("transactionNo")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  deliveryImportStockOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_import_stock", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where("deliveryImportStock", "==", false)
        .where("outstandingImportStock", "==", true)
        .orderBy(orderBy, "desc")
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("transactionNo", ">=", search)
          .where("transactionNo", '<', end)
          .orderBy("transactionNo")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .limit(APPS.size)
      }
      return condition
    })
  }

  deliveryImportStocksOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, outstandingField: string, companyKey: string, search?: string) {

    return this.db.collection("register_invoice", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("item_status.order", "==", 2)
        .where("registerImportStock", "==", false)
        .where("registerImportStockOutstanding", "==", true)
        .orderBy(orderBy, "desc")
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("invoice_number", ">=", search)
          .where("invoice_number", '<', end)
          .orderBy("invoice_number")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .limit(APPS.size)
      }

      return condition
    })
  }

  deliveryCutStockOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_cut_stock", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where("deliveryCutStock", "==", false)
        .where("outstandingCutStock", "==", true)
        .orderBy(orderBy, "desc")
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("transactionNo", ">=", search)
          .where("transactionNo", '<', end)
          .orderBy("transactionNo")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .limit(APPS.size)
      }
      return condition
    })
  }

  registerInvoiceOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_invoice", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("item_status.order", "==", 2)
        .where("registerImportStock", "==", false)
        .where("registerImportStockOutstanding", "==", true)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("invoice_number", ">=", search)
          .where("invoice_number", '<', end)
          .orderBy("invoice_number")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  returnDeliveryCoOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_co", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where(outstandingField, "==", false)
        .orderBy(orderBy, "desc")
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("refNo", ">=", search)
          .where("refNo", '<', end)
          .orderBy("refNo")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition
          .startAfter(startAfter)
          .limit(APPS.size)
      } else {
        condition = condition
          .limit(APPS.size)
      }

      return condition
    })
  }

  deliveryExportOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("pickup_inspect", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where(outstandingField, "==", false)
        .orderBy(orderBy, "desc")
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("bill_number", ">=", search)
          .where("bill_number", '<', end)
          .orderBy("bill_number")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          // .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  afterSubmitOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, companyKey: string, outstandingField: string, search?: string) {
    return this.db.collection("register_submit_form", ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("register_status.order", "==", 2)
        .where(outstandingField, "==", false)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (search) {
        const end = search.toUpperCase().replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
        condition = condition.where("refNo", ">=", search)
          .where("refNo", '<', end)
          .orderBy("refNo")
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition
          .orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  outstandingRef(lastVisible: any, orderBy: string, statusKey: any, itemStatusField: string, companyKey: string,) {
    return this.db.collection("register_item", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", false)
        .where("item_status.order", "==", 2)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition.orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  outstandingSooRef(lastVisible: any, orderBy: string, statusKey: any, itemStatusField: string, companyKey: string,) {
    return this.db.collection("register_soo", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", false)
        .where("register_status.order", "==", 2)
      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition.orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }



  searchOutstandingRef(text: any, itemStatusField: string, companyKey: string) {
    const search = text.toUpperCase();
    const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    return this.db.collection("register_item", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", false)
        .where("item_status.order", "==", 2)
      if (text) {
        condition = condition.where("keyword", ">=", search)
          .where("keyword", '<', end)
          .orderBy("keyword")
          .orderBy("page_key", "desc")
          .limit(APPS.size / 2)
      }
      else {
        condition = condition.orderBy("page_key", "desc")
          .limit(APPS.size)
      }
      return condition;
    })
  }

  outstandingListRef(itemStatusField: string, itemStatusFieldKey: string, companyKey: string) {
    return this.db.collection("register_item", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusFieldKey, "==", null)
        .where(itemStatusField, "==", false)
        .where("item_status.order", "==", 2)
      return condition
    })
  }

  outstandingSooListRef(itemStatusField: string, companyKey: string) {
    return this.db.collection("register_soo", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", false)
        .where("register_status.order", "==", 2)
      return condition
    })
  }

  outstandingSubmitListRef(itemStatusField: string, outstandingOtherField: string, outstandingOtherKey: string, companyKey: string) {
    return this.db.collection("register_co", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", true)
        .where(outstandingOtherField, "==", false)
        .where(outstandingOtherKey, "==", null)
        .where("register_status.order", "==", 2)
      return condition
    })
  }

  outstandingReturnNDeliveryCoListRef(itemStatusField: string, itemStatusFieldKey: string, companyKey: string) {
    return this.db.collection("register_co", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", false)
        .where(itemStatusFieldKey, "==", null)
        .where("register_status.order", "==", 2)
      return condition
    })
  }

  outstandingReApplyItemListRef(itemStatusField: string, itemStatusFieldKey: string, companyKey: string) {
    return this.db.collection("register_reapply_item", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", false)
        .where(itemStatusFieldKey, "==", null)
        .where("item_status.order", "==", 2)
      return condition
    })
  }

  outstandingRegisterInvoiceRef(itemStatusField: string, itemStatusFieldKey: string, companyKey: string) {
    return this.db.collection("register_invoice", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("deliveryImportStockKey", "==", null)
        .where("deliveryImportStock", "==", false)
        .where("outstandingImportStock", "==", true)
        .where("item_status.order", "==", 2)
      return condition
    })
  }

  outstandingDeliveryImportStockListRef(itemStatusField: string, itemStatusFieldKey: string, companyKey: string) {
    return this.db.collection("register_import_stock", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("outstandingImportStock", "==", true)
        .where(itemStatusField, "==", false)
        .where(itemStatusFieldKey, "==", null)
        .where("register_status.order", "==", 2)
      return condition
    })
  }

  outstandingDeliveryExportListRef(itemStatusField: string, companyKey: string) {
    return this.db.collection("register_co", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", false)
        .where("register_status.order", "==", 2)
      return condition
    })
  }

  outstandingAfterSubmitListRef(itemStatusField: string, companyKey: string) {
    return this.db.collection("register_submit_form", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where(itemStatusField, "==", true)
        .where("register_status.order", "==", 2)
      return condition
    })
  }

  registerCoRef() {
    return this.db.collection("register_co")
  }
  registerSooRef() {
    return this.db.collection("register_soo")
  }
  registerCoFireRef() {
    return this.firestore().collection("register_co")
  }

  resisterItemListingRef(collectionName: string, lastVisible: any, orderBy: string, statusKey: any, registerStatusKey: string, companyKey: string, typeKey?: any) {
    if (lastVisible) {
      const startAfter = lastVisible[orderBy];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
          .where("companyKey", "==", companyKey)
          .where("item_status.key", "==", registerStatusKey)

        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }

        if (typeKey) {
          condition = condition.where("submitType.key", "==", typeKey)
        }

        return condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
          .where("companyKey", "==", companyKey)
          .where("item_status.key", "==", registerStatusKey)

        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }

        if (typeKey) {
          condition = condition.where("submitType.key", "==", typeKey)
        }

        return condition.orderBy(orderBy, "desc").limit(APPS.size);
      })
    }
  }

  resisterSubmitListingRef(collectionName: string, lastVisible: any, orderBy: string, statusKey: any, registerStatusKey: string, companyKey: string, typeKey?: any) {
    if (lastVisible) {
      const startAfter = lastVisible[orderBy];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
          .where("companyKey", "==", companyKey)
          .where("register_status.key", "==", registerStatusKey)

        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }

        if (typeKey) {
          condition = condition.where("submitType.key", "==", typeKey)
        }

        return condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
          .where("companyKey", "==", companyKey)
          .where("item_status.key", "==", registerStatusKey)

        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }

        if (typeKey) {
          condition = condition.where("submitType.key", "==", typeKey)
        }

        return condition.orderBy(orderBy, "desc").limit(APPS.size);
      })
    }
  }

  submitFormCODraft(companyKey: string) {
    return this.db.collection("register_co", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("submit_from", "==", false)
      .where("outstandingForm", "==", true)
      .where("submit_fromKey", "==", null)
      .orderBy("updated_at", "desc")
    );
  }

  submitFormCO(companyKey: string) {
    return this.db.collection("register_co", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("submit_crf", "==", false)
      .where("outstandingCRF", "==", true)
      .where("submit_crfKey", "==", null)
      .orderBy("updated_at", "desc")
    );
  }

  returnAppCO(companyKey: string) {
    return this.db.collection("register_co", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("returnApp", "==", false)
      .where("returnAppKey", "==", null)
      .orderBy("updated_at", "desc")
    );
  }

  cutStockRegisterCO(companyKey: string) {
    return this.db.collection("register_co", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("registerCutStock", "==", false)
      .where("registerCutStockKey", "==", null)
      .where("outstandingStock", "==", true)
      .orderBy("updated_at", "desc")
    );
  }

  cutStockRef(companyKey: string) {
    return this.db.collection("register_cut_stock", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .orderBy("updated_at", "desc")
      .limit(APPS.size)
    );
  }



  returnApplicationADD(companyKey: string) {
    return this.db.collection("register_return_application", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("deliveryReturnDoc", "==", false)
      .where("deliveryReturnDocKey", "==", null)
      .orderBy("updated_at", "desc")
    );
  }

  deliveryAppCO(companyKey: string) {
    return this.db.collection("register_co", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("deliveryCo", "==", false)
      .where("deliveryCoKey", "==", null)
      .orderBy("updated_at", "desc")
    );
  }

  deliveryExport(companyKey: string) {
    return this.db.collection("pickup_inspect", ref => ref
      .where("isDelete", "==", false)
      .where("companyKey", "==", companyKey)
      .where("register_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
      .where("delivery_export", "==", false)
      .where("delivery_exportKey", "==", null)
      .orderBy("updated_at", "desc")
    );
  }

  resisterSubmitRef(collectionName: string, lastVisible: any, orderBy: string, statusKey: any, registerStatusKey: string, companyKey: string) {
    if (lastVisible) {
      const startAfter = lastVisible[orderBy];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
          .where("company.key", "==", companyKey)
          .where("register_item_status.key", "==", registerStatusKey)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      if (registerStatusKey === "pending") {
        switch (collectionName) {
          case "register_submit_form":
            return this.db.collection("register_co", ref => {
              let condition = ref.where("isDelete", "==", false)
                .where("company.key", "==", companyKey)
                .where("register_item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
                .where("pending_submit_from", "==", false)
              if (statusKey !== 0) {
                condition = condition.where("status.key", "==", statusKey)
              }
              return condition.orderBy(orderBy, "desc").limit(APPS.size);
            });

          case "register_submit_crf":

            return this.db.collection("register_co", ref => {
              let condition = ref.where("isDelete", "==", false)
                .where("company.key", "==", companyKey)
                .where("register_item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
                .where("pending_submit_crf", "==", false)
              if (statusKey !== 0) {
                condition = condition.where("status.key", "==", statusKey)
              }
              return condition.orderBy(orderBy, "desc").limit(APPS.size);
            });

          case "register_soo":
            return this.db.collection("register_co", ref => {
              let condition = ref.where("isDelete", "==", false)
                .where("company.key", "==", companyKey)
                .where("register_item_status.key", "==", REGISTER_ITEM_STATUS_OBJ.submitted.key)
                .where("pending_submit_soo", "==", false)
              if (statusKey !== 0) {
                condition = condition.where("status.key", "==", statusKey)
              }
              return condition.orderBy(orderBy, "desc").limit(APPS.size);
            });

          default:
            break;
        }


      } else {
        return this.db.collection(collectionName, ref => {
          let condition = ref.where("isDelete", "==", false)
            .where("company.key", "==", companyKey)
            .where("register_item_status.key", "==", registerStatusKey)
          if (statusKey !== 0) {
            condition = condition.where("status.key", "==", statusKey)
          }
          return condition.orderBy(orderBy, "desc").limit(APPS.size);
        })
      }

    }
  }
  allUserListRef() {
    return this.db.collection(`users`, ref => {
      let condition = ref
        .where('isDelete', '==', false)
        .orderBy('full_name')
      return condition
    })
  }



  userListRef(companyKey) {
    return this.db.collection(`users`, ref => {
      let condition = ref
        .where('isDelete', '==', false)
        .where("companyRef", "array-contains", companyKey)
        .orderBy('full_name')
      return condition
    })
  }


  lazySettingMultityCompanyRef(collectionName: string, lastVisible: any, companyKey: any, formFilter: any) {
    return this.db.collection(`${collectionName}`, ref => {
      let fromDateKey = 0;
      let toDateKey = 1000000000;
      let condition = ref
        // .where('companyRef',"array-contains",companyKey)
        // .where('companyKey',"==",companyKey)
        .where("isDelete", "==", false)
      // .orderBy('page_key', "desc")
      if (lastVisible) {
        const startAfter = lastVisible['page_key'];
        condition = condition.startAfter(startAfter)
          .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
          .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}000000`))
      }
      else {
        condition = condition.orderBy("status.key").orderBy('displayName')

        // .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
        // .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}000000`))
      }
      return condition.limit(APPS.settingSize)
    })
  }

  lazySettingsRef(collectionName: string, lastVisible: any, companyKey: any, formFilter: any) {
    return this.db.collection(`${collectionName}`, ref => {
      let keyword: any = "~N/A~"
      let fromDateKey = 0;
      let toDateKey = 1000000000;
      if (formFilter) {
        const { search, filterOption, fromDate, toDate } = formFilter;
        const { type } = filterOption
        if (fromDate && toDate) {
          fromDateKey = ConvertService.toDateKey(fromDate)
          toDateKey = ConvertService.toDateKey(toDate)
        }
        switch (type) {
          case DATA_TYPE.date:
            keyword = ConvertService.toDateKey(search);
            break;
          case DATA_TYPE.number:
            keyword = ConvertService.toNumber(search);
            break;
          default:
            keyword = search ? search.key : keyword;
            break;
        }
      }
      let condition = ref
        .where('companyKey', "==", companyKey)
        .where("tag", "array-contains", keyword)
        .where("isDelete", "==", false)
      // .orderBy('name')
      // .orderBy('page_key', "desc")
      if (lastVisible) {
        const startAfter = lastVisible['page_key'];
        condition = condition.startAfter(startAfter)
          .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
          .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}000000`))
      }
      else {
        condition = condition.orderBy("status.key").orderBy('name')
        // .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
        // .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}000000`))
      }
      return condition.limit(APPS.settingSize)
    })
  }

  lazyManageUserCompanyRef(collectionName: string, lastVisible: any, companyKey: any, formFilter: any) {
    return this.db.collection(`${collectionName}`, ref => {
      let fromDateKey = 0;
      let toDateKey = 1000000000;
      let condition = ref
        // .where('companyRef',"array-contains",companyKey)
        // .where('companyKey',"==",companyKey)
        .where("isDelete", "==", false)
      // .orderBy('page_key', "desc")
      if (lastVisible) {
        const startAfter = lastVisible['page_key'];
        condition = condition.startAfter(startAfter)
          .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
          .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}000000`))
      }
      else {
        condition = condition.orderBy("status.key").orderBy('displayName')

        // .where('page_key', ">=", ConvertService.toNumber(`${fromDateKey}000000`))
        // .where('page_key', "<=", ConvertService.toNumber(`${toDateKey}000000`))
      }
      return condition.limit(APPS.settingSize)
    })
  }

  settingListingRef(collectionName: string, lastVisible: any, orderBy: string, statusKey) {
    return this.db.collection(collectionName, ref => {
      let condition = ref
      return condition
    })
    // if (lastVisible) {
    //   const startAfter = lastVisible[orderBy];
    //   return this.db.collection(collectionName, ref => {
    //     let condition = ref.where("isDelete", "==", false)
    //     if (statusKey !== 0) {
    //       condition = condition.where("status.key", "==", statusKey)
    //     }
    //     return condition.orderBy(orderBy)
    //       .startAfter(startAfter)
    //       .limit(APPS.size)
    //   })
    // }
    // else {
    //   return this.db.collection(collectionName, ref => {
    //     let condition = ref.where("isDelete", "==", false)
    //     if (statusKey !== 0) {
    //       condition = condition.where("status.key", "==", statusKey)
    //     }
    //     return condition.orderBy(orderBy).limit(APPS.size);
    //   })
    // }
  }

  searchListingRef(collectionName: string, field: string, text: any) {
    if (text) {
      const search = text.toUpperCase();
      const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where("status.key", "==", statusObj.active.key)
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .limit(5)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.size)
    );

  }



  searchListingByCompanyRef(collectionName: string, companyKey, field: string, text: any) {
    if (text) {
      const search = text.toUpperCase();
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where('company.key', '==', companyKey)
          .where("status.key", "==", statusObj.active.key)
          .where(field, ">=", search)
          .orderBy(field)
          .limit(5)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.size)
    );

  }
  searchListingByCompanyTypeRef(collectionName: string, companyKey: string, typeKey: string, field: string, text: any) {
    if (text) {
      const search = text.toUpperCase();
      return this.db.collection(collectionName, ref =>
        ref
          .where("isDelete", "==", false)
          .where('company.key', '==', companyKey)
          .where('type.key', '==', typeKey)
          .where("status.key", "==", statusObj.active.key)
          .where(field, ">=", search)
          .orderBy(field)
          .limit(5)
      );
    }
    return this.db.collection(collectionName, ref =>
      ref
        .where("isDelete", "==", false)
        .where('company.key', '==', companyKey)
        .where('type.key', '==', typeKey)
        .where("status.key", "==", statusObj.active.key)
        .orderBy(field)
        .limit(APPS.size)
    );

  }

  itemProductCompanyRef(collectionName: any, typekey: any, companyKey: any, lastVisible: any, orderBy: string, statusKey) {
    if (lastVisible) {
      const startAfter = lastVisible['node'];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.where('company.key', '==', companyKey)
          .where('type.key', '==', typekey)
          .orderBy('node')
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false);

        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition
          .where('company.key', '==', companyKey)
          .where('type.key', '==', typekey)
          .orderBy('node').limit(APPS.size);
      })
    }
  }

  templateRef(collectionName: any, companyKey: any, templateKey: string) {
    return this.db.collection(collectionName, ref => {
      let condition = ref.where("isDelete", "==", false)
      return condition.where('company.key', '==', companyKey)
        .where("type.key", "==", templateKey);
    })
  }

  templateCollectionRef() {
    return this.db.collection('report_templates')
  }

  reportTemplatesFireRef() {
    return this.db.firestore.collection('report_templates')
  }

  reportTemplatesActiveRef(typeKey: string, companyKey: string) {
    return this.db.collection('report_templates', ref => ref.where('default', '==', true)
      .where('isDelete', '==', false).where('company.key', '==', companyKey).where('type.key', '==', typeKey))
  }

  itemCompanyRef(collectionName: any, companyKey: any, lastVisible: any, orderBy: string, statusKey: any = 0) {
    if (lastVisible) {
      const startAfter = lastVisible['node'];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.orderBy('node')
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.orderBy('node').limit(APPS.size);
      })
    }
  }

  itemsettingListingRef(collectionName: string, company: any, type: any, itemType: any, lastVisible: any, orderBy: string, statusKey: any = 0) {
    if (lastVisible) {
      const startAfter = lastVisible[orderBy];
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false).where('company.key', '==', company.key).where('type.key', '==', itemType.key)
        if (type !== null) {
          condition = condition.where("itemType.key", "==", type.key)
        }
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.orderBy(orderBy)
          .startAfter(startAfter)
          .limit(APPS.size)
      })
    }
    else {
      return this.db.collection(collectionName, ref => {
        let condition = ref.where("isDelete", "==", false)
        if (statusKey !== 0) {
          condition = condition.where("status.key", "==", statusKey)
        }
        return condition.orderBy(orderBy).limit(APPS.size);
      })
    }

  }

  companyRef() {
    return this.db.collection("company");
  }

  titleDocRef() {
    return this.db.collection("settings_title");
  }

  coformRef() {
    return this.db.collection("settings_coform", ref => ref.where('status.key', '==', 1).where('isDelete', '==', false));
  }
  titleRef() {
    return this.db.collection("settings_title", ref => ref.where('status.key', '==', 1).where('isDelete', '==', false));
  }

  hscodeRef() {
    return this.db.collection("hs_codes", ref => ref.where('status.key', '==', 1).where('isDelete', '==', false));
  }
  companyCollectRef() {
    return this.db.collection("company", ref => ref.where('status.key', '==', 1).where('isDelete', '==', false));
  }
  departmentRef() {
    return this.db.collection("settings_department", ref => ref.where('status.key', '==', 1).where('isDelete', '==', false));
  }
  countryRef() {
    return this.db.collection("settings_country", ref => ref.where('status.key', '==', 1).where('isDelete', '==', false));
  }

  hscodeAutoRef(lastVisible) {
    if (lastVisible) {
      return this.db.collection("hs_codes", ref =>
        ref
          .where('status.key', '==', 1).where('isDelete', '==', false)
          .orderBy("page_key", "desc")
          .startAfter(lastVisible.page_key)
      );
    }
    return this.db.collection("hs_codes", ref =>
      ref
        .where('status.key', '==', 1).where('isDelete', '==', false)
        .orderBy("page_key", "desc")
    );
  }


  environmentRef() {
    return this.db.collection("sys_environment").doc('general')
  }

  uomRef() {
    return this.db.collection("settings_uom", ref => ref.where('status.key', "==", 1).where('isDelete', '==', false));
  }

  userprofileRef() {
    return this.db.collection("users");
  }

  accountRef() {
    return this.db.collection("users");
  }

  private handleSuccess(res) {
    return res.json();
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  companyInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        name_en: ConvertService.toNull(item.name_en),
        name_kh: ConvertService.toNull(item.name_kh),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }
  departmentInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        name_en: ConvertService.toNull(item.name_en),
        name_kh: ConvertService.toNull(item.name_kh),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }

  forwarderInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        name_en: ConvertService.toNull(item.name_en),
        name_kh: ConvertService.toNull(item.name_kh),
        email: ConvertService.toNull(item.email),
        telephone_number: ConvertService.toNull(item.telephone_number),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }

  uomInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        code: ConvertService.toNull(item.code),
        description_kh: ConvertService.toNull(item.description_kh),
        description_en: ConvertService.toNull(item.description_en),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }

  hscodeInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        code: ConvertService.toNull(item.code),
        description_kh: ConvertService.toNull(item.description_kh),
        description_en: ConvertService.toNull(item.description_en),
        index: ConvertService.toNull(item.index),
        node: ConvertService.toNull(item.node),
        level: ConvertService.toNull(item.level),
        parent: ConvertService.toNull(item.parent),
        total: ConvertService.toNull(item.total),
        st: ConvertService.toNull(item.st),
        et: ConvertService.toNull(item.et),
        vat: ConvertService.toNull(item.vat),
        cd: ConvertService.toNull(item.cd),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }

  itemInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        code: ConvertService.toNull(item.code),
        name_en: ConvertService.toNull(item.name_en),
        name_kh: ConvertService.toNull(item.name_kh),
        index: ConvertService.toNull(item.index),
        node: ConvertService.toNull(item.node),
        level: ConvertService.toNull(item.level),
        parent: ConvertService.toNull(item.parent),
        total: ConvertService.toNull(item.total),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }

  countryInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        code: ConvertService.toNull(item.code),
        name: ConvertService.toNull(item.name),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }
  coformInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        code: ConvertService.toNull(item.code),
        name: ConvertService.toNull(item.name),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }

  countryPortInfo(item: any) {
    const obj = ConvertService.toNull(item)
    if (obj) {
      return {
        code: ConvertService.toNull(item.code),
        name: ConvertService.toNull(item.name),
        key: ConvertService.toNull(item.key)
      }
    } else return null;
  }

  cutStockOutstandingRef(lastVisible: any, orderBy: string, statusKey: any, itemStatusField: string, companyKey: string,) {
    return this.db.collection("register_co", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("registerCutStock", "==", false)
        .where("outstandingStock", "==", true)
        .where("register_status.order", "==", 2)

      if (statusKey !== 0) {
        condition = condition.where("status.key", "==", statusKey)
      }
      if (lastVisible) {
        const startAfter = lastVisible[orderBy];
        condition = condition.orderBy(orderBy, "desc")
          .startAfter(startAfter)
          .limit(APPS.size)
      }
      else {
        condition = condition.orderBy(orderBy, "desc")
          .limit(APPS.size)
      }
      return condition
    })
  }

  searchCutStockOutstandRef(text: any, itemStatusField: string, companyKey: string) {
    const search = text.toUpperCase();
    const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    return this.db.collection("register_co", ref => {
      let condition = ref.where("isDelete", "==", false)
        .where("companyKey", "==", companyKey)
        .where("registerCutStockKey", "==", null)
        .where("outstandingStock", "==", true)
        .where("register_status.order", "==", 2)

      if (text) {
        condition = condition.where("keyword", ">=", search)
          .where("keyword", '<', end)
          .orderBy("keyword")
          .orderBy("updated_at", "desc")
          .limit(APPS.size / 2)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
          .limit(APPS.size)
      }
      return condition;
    })
  }

  resisterCutStockRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_cut_stock", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  resisterVoidStockRef(lastVisible: any, filterStatusKey: any, registerStatusKey: any, companyKey: string) {
    return this.db.collection("register_void_stock", ref => {
      let condition = ref.where("companyKey", "==", companyKey)
      if (registerStatusKey === 'deleted') {
        condition = condition.where("isDelete", "==", true)
      }
      else {
        condition = condition.where("isDelete", "==", false).where("register_status.key", "==", registerStatusKey);
      }
      //register status
      if (filterStatusKey !== 0) {
        condition = condition.where("status.key", "==", filterStatusKey)
      }
      //lazy load condition
      if (lastVisible) {
        const startAfter = lastVisible["updated_at"];
        condition = condition.orderBy("updated_at", "desc").startAfter(startAfter)
      }
      else {
        condition = condition.orderBy("updated_at", "desc")
      }
      //====
      return condition.limit(APPS.size)
    })
  }

  searchResisterCutStockRef(collectionName: string, field: string, text: any, order: any, registerStatusKey: string, companyKey: string) {
    const search = text.toUpperCase();
    const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    return this.db.collection(collectionName, ref => {
      let condition = ref.where("companyKey", "==", companyKey).where("status.key", "==", statusObj.active.key)
      condition = condition.where("isDelete", "==", registerStatusKey === 'deleted' ? true : false)
      if (registerStatusKey !== 'deleted') {
        condition = condition.where("register_status.key", "==", registerStatusKey)
      }
      if (text) {
        condition = condition
          .where(field, ">=", search)
          .where(field, '<', end)
          .orderBy(field)
          .orderBy("page_key", "desc")
          .limit(APPS.size / 2)
      }
      else {
        condition = condition.orderBy("page_key", "desc").limit(APPS.size)
      }
      return condition;
    })
  }


  fileTagsRef() {
    return this.db.collection("file_tags", ref => ref.orderBy("order"));
  }

  fileTagsRefMenu() {
    return this.db.collection("file_tags");
  }

  posterRef() {
    return this.db.collection("poster", ref => ref.orderBy("order"));
  }

  bookDocumentRef() {
    return this.db.collection("book-documents", ref => ref.orderBy("order"));
  }

  videoDocumentRef() {
    return this.db.collection("video-documents", ref => ref.orderBy("order"));
  }

  conversationRef() {
    return this.db.collection("conversations", ref => ref.orderBy("order"));
  }

  getConversationRef(keyList: Array<string>) {
    return this.db.collection("conversations", ref => ref.where('involvedPeopleCombinedKey', 'array-contains-any', keyList));
  }

  getConversationsRef(key: string) {
    return this.db.collection("conversations", ref => ref.where('involvedPeopleKey', 'array-contains', key));
  }

  chatRef(conversationKey: any) {
    return this.db.collection("conversations").doc(conversationKey).collection('chats');
  }

  getChats(conversationKey: string) {
    return this.db.collection("conversations").doc(conversationKey).collection('chats', ref => ref.where('isDeleted', '==', false).orderBy('pageKey', 'asc'));
  }

  provinceFireRef() {
    return this.db.firestore.collection('geo_provinces').orderBy("id")
  }

  displayTextOnly(item: any): string {
    return item ? item?.text : item;
  }

  displayName(item: any): string {
    if (item && item.code) {
      return item ? item?.code + ' - ' + item?.name : item;
    } else {
      return item ? item?.name : item;
    }
  }

  displayNationalityKH(item: any): string {
      return item ? item?.kh_nationality : item;
  }

  displayCountriesKH(item: any): string {
    return item ? (item?.isKhmer ? item?.kh_short_name : item?.en_short_name) : item;
  }

  collectionFireRef(collectionName) {
    return this.firestore().collection(collectionName);
  }

  criminalRecordRef(ref?:QueryFn){
    return this.db.collection('criminal_record',ref)
  }
  documentVerifyRef(ref?:QueryFn){
    return this.db.collection('document_verify',ref)
  }
  citizensRef(ref?:QueryFn){
    return this.db.collection('citizens',ref)
  }


  displayText(item: any): string {
    return item ? item.text : item;
  }

  displayTranRefNo(item: any): string {
    return item ? item.tranRefNo : item;
  }

  displayProductName(item: any): string {
    return item ? item?.product?.name : item;
  }

  displayFullName(item: any): string {
    return item ? item.full_name : item;
  }

  compareObject(o1: any, o2: any): boolean {
    if (o2 && o1) {
      return o1.key === o2.key;
    }
    return false;
  }

  tutorialRef(ref?: QueryFn) {
    return this.db.collection("tutorials", ref);
  }

  groupModulesRef(ref?: QueryFn) {
    return this.db.collection("group_users_account", ref);
  }

  groupUserAccountMemberRef(groupKey) {
    return this.groupModulesRef().doc(groupKey).collection('group_members', ref => ref.orderBy('officerId'));
  }

  userDataRef(field: string) {
    return this.db.collection("officers", ref => {
      let condition = ref.orderBy(field)
      return condition.limit(Pages.size)
    });
  }

  userSearchRef(field: string, search: string) {
    if (!search) {
      return this.db.collection("officers", ref => {
        let condition = ref.orderBy(field);
        return condition.limit(Pages.size)
      });
    } else {
      const text = search.toUpperCase();
      return this.db.collection("officers", ref => {
        let condition = ref.where(field, "array-contains", text)
        return condition.limit(Pages.size)
      });
    }
  }

  userValidEmailRef(email) {
    return this.db.collection('officers', ref => ref.where('email', '==', `${email}`.toLowerCase().trim()));
  }

  officerCollectionRef(ref?: QueryFn){
    return this.db.collection('officers',ref)
  }

  groupModulesMovementRef(ref?) {
    return this.db.collection('group_users_account_modules', ref)
  }

  groupMemberRef(ref?:QueryFn){
    return this.db.collection('group_members',ref)
  }

  publicHolidayRef(ref?:QueryFn) {
    return this.db.collection("public_holiday", ref);
  }

  paymentOptionsRef(ref?:QueryFn) {
    return this.db.collection("payment_options", ref);
  }
  embassyRef(ref?:QueryFn) {
    return this.db.collection("embassy", ref);
  }


  offline_register(ref?:QueryFn){
    return this.db.collection("offline_register",ref)
  }

  groupRequestFormRef(ref?: QueryFn) {
    return this.db.collection('criminal_record_folder', ref)
  }

  rankingCollectionRef(ref?: QueryFn){
    return this.db.collection('ranking', ref)
  }

  embassyCollectionRef(ref?: QueryFn){
    return this.db.collection('embassy', ref)
  }

}

export function fieldValue() {
  return firebase.firestore.FieldValue
}
