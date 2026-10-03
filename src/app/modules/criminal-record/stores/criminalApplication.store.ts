import { observable, action, flow, } from "mobx";
import { Injectable } from "@angular/core";
import { CriminalService } from "../services/criminal.service";
import { Subscription, BehaviorSubject, Observable } from "rxjs";
import { transformImageSameTokenNo } from "src/app/shared/services/fire-storage.service";
import { CRIMINAL_APPLICATION_LANGUAGE, GENDER_DATA, PHOTO_LIB, STATUS_LIVES, STATUS_OBJ } from "src/app/dummy/appinfo";
import { APPS } from "src/app/dummy/config";
import { addDays, criminalDobEn, criminalEnStringUpperCase, criminalFatherDobEn, criminalMotherDobEn, criminalSpouseDobDobEn, formatCriminalDateEn, formatCriminalDateFr, fromNow, getCriminalNo, getYearsList, hasWhiteSpace, htmlToText, mapBirthAddressCriminalRecord, mapCurrentAddressCriminalRecord, mapDobCriminalRecord, mapFatherBirthAddressCriminalRecord, mapFatherDobCriminalRecord, mapMotherBirthAddressCriminalRecord, mapMotherDobCriminalRecord, mapSpouseDobCriminalRecord, nameEnTransformer, pageKey, toDateKey, toDateTextKhmer, todayDate, toDepartmentNoWorkplace, toEmployee, toKhDate, toMonthKey, toMonthReceiptKey, toNumber, workingDay } from "src/app/shared/services/mapping.service";
import { ConvertService, orderBy, pushToArray, pushToObject, toLocaleNumber } from "src/app/shared/services/convert.service";
import { AuthStore } from "src/app/stores/auth.store";
import { FireStorageService } from "src/app/shared/services/fireStorage.service";
import { DatabaseService } from "src/app/shared/services/database.service";
import { days, monthOfYear } from "src/app/dummy/report";
import { IHeaderMovement } from "../../mme/interfaces/document.interface";
import { DOCUMENT_FLOW_CATEGORY } from "../dummy/criminal.dummy";
import { ICriminalRecord } from "src/app/interfaces/criminal.interface";

@Injectable({ providedIn: 'root' })
export class CriminalApplicationStore {
  @observable lastVisible: any = null;
  @observable empty: boolean = false;
  @observable selectedCriminalRecord: any = null;
  @observable selectedGroupDoc: any = null;
  @observable selectedCitizenProfile: any = null;
  @observable selectedApplicationType: any = null;
  @observable selectedApplicationNationality: any = null;
  @observable isKhmerForm: boolean = true;
  @observable attachment_files: any[] = [];
  @observable citizens: any[] = [];
  @observable disableForm: boolean = false;
  @observable subscribeStatus: BehaviorSubject<any>;
  @observable data: any[] = [];
  @observable unClassify12: any[] = [];
  @observable unClassify20: any[] = [];
  @observable searchData: any[] = [];
  @observable searchResult: any[] = [];
  @observable searching: boolean = false;
  @observable emptySearch: boolean = false;
  @observable documentCommentsPublicData: any[] = [];
  @observable documentCommentsHeaderPublicData: any[] = [];
  @observable documentCommentsChildPublicData: any[] = [];
  @observable documentCommentsInternalData: any[] = [];
  @observable documentCommentsHeaderInternalData: any[] = [];
  @observable documentCommentsChildInternalData: any[] = [];
  @observable headerDocument: any = null;
  @observable loadingCriminalRecord = false;
  @observable applicationConfig = null;
  @observable applicationConfigChange: boolean = false

  @observable dataByFolder: any[] = [];
  @observable emptyByFolder: boolean = false;
  @observable SELECTED_FILES: any[] = [];
  @observable START_UPLOAD: boolean = false;
  @observable uploadPercent: any = null;

  @observable fetchEntryType: any = null;

  constructor(
    private ds: CriminalService,
    private auth: AuthStore,
    private storageService: FireStorageService,
    private db: DatabaseService,
    private storage: FireStorageService

  ) {
    this.subscribeStatus = new BehaviorSubject(null)
  }

  @action
  async fetchHoliday(year: number) {
    const docs = await this.ds.publicHolidayRef(ref => ref.where('year.key', '==', year)).get().toPromise();
    return orderBy(pushToArray(docs), 'from_date', 'asc')
  }

  async fetchDoc(ref: any) {
    this.process = true;
    const doc = await ref.get().toPromise();
    const data = pushToObject(doc)
    this.process = false;
    return data;
  }

  @observable fetchCriminalUnClassifyRef: Subscription = null;
  @action
  async fetchCriminalUnClassify(callback?: (items: any[]) => void) {
    this.fetchCriminalUnClassifyRef?.unsubscribe();
    let ref = this.ds.criminalRecordsRef(ref => {
      let whereRef = ref.where('folder_key_ref', '==', null)
        .where('status.key', '==', STATUS_OBJ.DECREE.key)
        .where('application_type.key','==',3)
        .orderBy('tran_at')
        .limit(APPS.size)
      return whereRef;
    })

    this.fetchCriminalUnClassifyRef = ref.valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({
        ...m,
        withdraw_date_kh: toKhDate(m?.withdraw_date?.toDate())
        , amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR
      }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalUnClassify(callback?: (items: any[]) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalUnClassifyRef?.unsubscribe();
        let ref = this.ds.criminalRecordsRef(ref => {
          let whereRef = ref
            .where('folder_key_ref', '==', null)
            .where('status.key', '==', STATUS_OBJ.DECREE.key)
            .where('application_type.key','==',3)
          if (this.lastVisible) {
            whereRef = whereRef.orderBy('tran_at').startAfter(this.lastVisible?.tran_at)
          }
          return whereRef.limit(APPS.size)
        })
        this.fetchCriminalUnClassifyRef = ref.valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({
            ...m,
            withdraw_date_kh: toKhDate(m?.withdraw_date?.toDate())
            , amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR
          }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }


  @observable fetchCriminalUnClassifyLetter1Ref: Subscription = null;
  @action
  async fetchCriminalUnClassifyLetter1(callback?: (items: any[]) => void) {
    this.fetchCriminalUnClassifyLetter1Ref?.unsubscribe();
    let ref = this.ds.criminalRecordsRef(ref => {
      let whereRef = ref.where('folder_key_ref', '==', null)
        .where('status.key', '==', STATUS_OBJ.DECREE.key)
        .where('application_type.key','==',1)
        .orderBy('tran_at')
        .limit(APPS.size)
      return whereRef;
    })

    this.fetchCriminalUnClassifyLetter1Ref = ref.valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({
        ...m,
        withdraw_date_kh: toKhDate(m?.withdraw_date?.toDate())
        , amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR
      }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalUnClassifyLetter1(callback?: (items: any[]) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalUnClassifyLetter1Ref?.unsubscribe();
        let ref = this.ds.criminalRecordsRef(ref => {
          let whereRef = ref
            .where('folder_key_ref', '==', null)
            .where('status.key', '==', STATUS_OBJ.DECREE.key)
            .where('application_type.key','==',1)
          if (this.lastVisible) {
            whereRef = whereRef.orderBy('tran_at').startAfter(this.lastVisible?.tran_at)
          }
          return whereRef.limit(APPS.size)
        })
        this.fetchCriminalUnClassifyLetter1Ref = ref.valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({
            ...m,
            withdraw_date_kh: toKhDate(m?.withdraw_date?.toDate())
            , amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR
          }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @observable fetchCriminalUnClassifyLetter2Ref: Subscription = null;
  @action
  async fetchCriminalUnClassifyLetter2(callback?: (items: any[]) => void) {
    this.fetchCriminalUnClassifyLetter2Ref?.unsubscribe();
    let ref = this.ds.criminalRecordsRef(ref => {
      let whereRef = ref.where('folder_key_ref', '==', null)
        .where('status.key', '==', STATUS_OBJ.DECREE.key)
        .where('application_type.key','==',2)
        .orderBy('tran_at')
        .limit(APPS.size)
      return whereRef;
    })

    this.fetchCriminalUnClassifyLetter2Ref = ref.valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({
        ...m,
        withdraw_date_kh: toKhDate(m?.withdraw_date?.toDate())
        , amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR
      }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalUnClassifyLetter2(callback?: (items: any[]) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalUnClassifyLetter2Ref?.unsubscribe();
        let ref = this.ds.criminalRecordsRef(ref => {
          let whereRef = ref
            .where('folder_key_ref', '==', null)
            .where('status.key', '==', STATUS_OBJ.DECREE.key)
            .where('application_type.key','==',2)
          if (this.lastVisible) {
            whereRef = whereRef.orderBy('tran_at').startAfter(this.lastVisible?.tran_at)
          }
          return whereRef.limit(APPS.size)
        })
        this.fetchCriminalUnClassifyLetter2Ref = ref.valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({
            ...m,
            withdraw_date_kh: toKhDate(m?.withdraw_date?.toDate())
            , amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR
          }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async getCriminalUnClassify() {
    let ref = this.ds.criminalRecordsRef(ref => {
      let whereRef = ref.where('folder_key_ref', '==', null)
        .where('status.key', '==', STATUS_OBJ.DECREE.key)
        .where('application_type.key','==',3)
        .orderBy('tran_at')
      return whereRef;
    })
    let docs = pushToArray(await ref.get().toPromise())
    docs = docs?.map((m: any) => ({
      ...m,
      withdraw_date_kh: toKhDate(m?.withdraw_date?.toDate())
      , amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR
    }));
    console.log(docs);
    this.unClassify12 = docs.filter(f=>f?.urgent_obj?.key == 12)
    this.unClassify20 = docs.filter(f=>f?.urgent_obj?.key == 20)
    return docs
  }


  @observable fetchCriminalFolderRef: Subscription = null;
  @observable criminalFolderItems: any[] = []
  @action
  fetchCriminalFolder(folderKey: string, callback?: (items: any[]) => void) {
    this.fetchCriminalFolderRef?.unsubscribe()
    this.fetchCriminalFolderRef = this.ds.criminalRecordRef(ref => ref.where('folder_key_ref', '==', folderKey).orderBy('folder_at')).valueChanges().subscribe(docs => {
      this.criminalFolderItems = docs;
      callback?.(this.criminalFolderItems)
    })
  }

  @observable fetchCriminalPrintRef: Subscription = null;
  @observable selectedCriminalPrint:any = null;
  @action
  fetchCriminalPrint(key: string){
    this.selectedCriminalPrint = null;
    this.fetchCriminalPrintRef?.unsubscribe();
    this.fetchCriminalPrintRef = this.ds.criminalRecordRef().doc(key)?.valueChanges().subscribe(res=>{
      this.selectedCriminalPrint = res;
    })
  }

  @action
  async fetchProcessApproval(category: any = DOCUMENT_FLOW_CATEGORY.normal) {
    const items = await this.ds.criminalFlowRef(ref => ref
      .where('category.key', '==', category?.key)
      .orderBy('flowNo')).get().toPromise()
    return pushToArray(items)
  }

  @action
  replyCriminal(criminal: any, citizen: any, callback?: (success: boolean, res: any) => void) {
    const { currentDepartment, employee, config, serverDateTime } = this.auth;
    this.getFolderKeyRef(serverDateTime, config, criminal?.urgent_obj, criminal_folder_no => {
      const batch = this.ds.batch()
      const adjustmentRef = this.ds.criminalAdjustmentsRef()
      const criminalRef = this.ds.criminalRecordRef()
      const citizensRef = this.ds.citizensRef()
      const userRef = this.ds.usersRef()

      const updateBy = toEmployee(employee, true);

      const isKhmerForm = criminal?.national_application?.key === 'khmer';
      const DAYS = days?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: isKhmerForm, name_en: `${m}` } })
      const date = todayDate(this.auth.serverDateTime, DAYS, MONTHS, years);
      const withdraw_date = addDays(serverDateTime, criminal?.urgent_obj?.key || 20);

      const item = {
        ...criminal,
        key: this.ds.createId(),
        status: STATUS_OBJ.REVIEW,

        day_header: date?.day,
        month_header: date?.month,
        year_header: date.year,
        updated_by: updateBy,
        updated_at: this.ds.serverTimestamp(),
        review_at: this.ds.serverTimestamp(),
        review_by: updateBy,
        internal_status: null,

        withdraw_date: withdraw_date,
        withdraw_date_key: ConvertService.toDateKey(withdraw_date),
        criminal_folder_no: criminal_folder_no,
        folder_key_ref: null,
        tran_at: this.ds.serverTimestamp(),
        tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),

        decree_by: null,
        decree_at: null,
        decree_status: null,
        decree_result: null,
      }

      const movement = {
        key: this.ds.createId(),
        created_at: this.ds.serverTimestamp(),
        created_by: item?.updated_by,
        profile: toEmployee(employee, true),
        workplaceKey: currentDepartment?.key,
        workplace: toDepartmentNoWorkplace(currentDepartment),
        criminalRecordKeyRef: item?.key,
        citizenKeyRef: citizen?.key,
        criminalStatus: item?.status,
        criminalCategory: item?.criminal_record_category,
        criminalSkipWorkplace: config?.criminal_record_category?.key === item?.criminal_record_category?.key,
        default_stampFile: employee?.stampFile || null,
        default_remarkFile: employee?.signatureFile || null,
        default_signatureFile: employee?.signatureFile || null,
        tran_at: this.ds.serverTimestamp(),
        tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),

        criminal_old_key: criminal?.key,
        criminal_old_status: criminal?.status,
        gender: item?.gender,
      }
      const movementOld = {
        key: this.ds.createId(),
        created_at: this.ds.serverTimestamp(),
        created_by: criminal?.updated_by,
        profile: toEmployee(employee, true),
        workplaceKey: currentDepartment?.key,
        workplace: toDepartmentNoWorkplace(currentDepartment),
        criminalRecordKeyRef: criminal?.key,
        citizenKeyRef: citizen?.key,
        criminalStatus: STATUS_OBJ.VOID,
        criminalCategory: criminal?.criminal_record_category,
        criminalSkipWorkplace: config?.criminal_record_category?.key === criminal?.criminal_record_category?.key,
        internal_status: criminal?.internal_status || null,
        default_stampFile: employee?.stampFile || null,
        default_remarkFile: employee?.signatureFile || null,
        default_signatureFile: employee?.signatureFile || null,
        tran_at: this.ds.serverTimestamp(),
        tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
      }

      batch.set(this.ds.criminalRecordsMovementRef().doc(movementOld?.key).ref, movementOld)
      batch.set(this.ds.criminalRecordsRef().doc(item?.key).collection('citizen').doc(item?.citizen_ref).ref, {
        ...citizen,
        criminal_record_ref: item?.key,
        national_application: item?.national_application,
        application_type: item?.application_type,
        updated_by: updateBy,
        updated_at: this.ds.serverTimestamp(),
      })
      batch.set(adjustmentRef.doc(movement.key).ref, movement);
      batch.set(criminalRef.doc(item.key).ref, item);
      batch.set(criminalRef.doc(criminal.key).ref, {
        isDelete: false,
        status: STATUS_OBJ.VOID,
        void_by: toEmployee(employee, true),
        void_at: this.ds.serverTimestamp(),
      }, { merge: true });
      batch.set(userRef.doc(citizen.key).ref, {
        criminal_record: {
          application_type_key: item?.application_type?.route,
          key: item?.key,
          nationalKey: item?.national_application?.key
        }
      }, { merge: true });
      batch.set(citizensRef.doc(citizen.key).ref, {
        criminal_record_ref: item?.key,
        national_application: item?.national_application,
        application_type: item?.application_type,
      }, { merge: true });

      batch.commit().then(() => {
        this.process = false;
        callback(true, item);
      }).catch(error => {
        this.process = false;
        alert(error)
        callback(false, null);
      })
    })
  }

  @action
  async getFolderKeyRef(serverDateTime, config, serviceCriminal: any, callback: (criminal_folder_no: string) => void) {
    const { criminal_folder_copy } = config;
    const criminal_folder = (serviceCriminal?.key === 20 ? config?.criminal_folder : config?.criminal_folder_12) || null
    const folder_date_key = toMonthKey(serverDateTime);
    const criminal_folder_date_key_print = toDateKey(serverDateTime);
    const criminal_folder_date_key = criminal_folder?.criminal_folder_date_key || null;

    let resetPrint = (criminal_folder && (criminal_folder_date_key !== folder_date_key)) || (criminal_folder_copy === criminal_folder?.criminal_folder_no_print);
    let keepNumPrint = criminal_folder && (criminal_folder_copy > criminal_folder?.criminal_folder_no_print);
    let monthlyReset = (criminal_folder && (folder_date_key > criminal_folder_date_key));
    let startNum = 0;
    let finalNum = 0;

    if (!criminal_folder) {
      finalNum = startNum + 1;
    } else {
      if (criminal_folder?.criminal_folder_date_key_print === criminal_folder_date_key_print) {//date not change to new date
        if (criminal_folder && (criminal_folder_copy > criminal_folder?.criminal_folder_no_print)) {//check total of print 20copy
          startNum = toNumber(criminal_folder?.criminal_folder_no)
          finalNum = startNum
        } else {
          startNum = toNumber(criminal_folder?.criminal_folder_no);
          finalNum = startNum + 1;
        }
      } else {//change day and reset to start next num and reset print
        startNum = toNumber(criminal_folder?.criminal_folder_no);
        finalNum = startNum + 1;
        resetPrint = true;
        keepNumPrint = false;
      }
    }

    this.ds.settingsRef().set({
      [serviceCriminal?.key === 20 ? `criminal_folder` : `criminal_folder_12`]: {
        criminal_folder_date_key: folder_date_key,
        criminal_folder_no: monthlyReset ? 1 : keepNumPrint ? criminal_folder?.criminal_folder_no : finalNum,
        criminal_folder_no_print: monthlyReset ? 1 : resetPrint ? 1 : this.db.fireFieldValue().increment(1),
        criminal_folder_date_key_print: criminal_folder_date_key_print,
      }
    }, { merge: true }).then(() => {
      const criminal_folder_no = monthlyReset ? getCriminalNo(1) : getCriminalNo(finalNum)
      callback(criminal_folder_no)
    }).catch(err => {
      alert(err)
      callback(null)
    })
  }

  @action
  async getPaymentNoRef(serverDateTime, config, callback: (criminal_payment_no: number) => void) {
    const { criminal_payment } = config;
    const folder_date_key = toDateKey(serverDateTime);
    const criminal_payment_date_key = criminal_payment?.criminal_payment_date_key || null;
    let startNum = 0;
    if (criminal_payment_date_key && (criminal_payment_date_key === folder_date_key)) {
      startNum = criminal_payment?.criminal_payment_no;
    }
    this.ds.settingsRef().set({
      criminal_payment: {
        criminal_payment_date_key: folder_date_key,
        criminal_payment_no: (criminal_payment_date_key && (criminal_payment_date_key !== folder_date_key)) ? 1 : this.db.fireFieldValue().increment(1)
      }
    }, { merge: true }).then(() => {
      const criminal_folder_start_no = startNum + 1;
      callback(criminal_folder_start_no)
    }).catch(err => {
      alert(err)
      callback(null)
    })
  }

  @action
  approvedCriminalCollectDoc(criminal: any, citizen: any, isNotDecree: boolean, isLastRecode, selectedGroupDoc) {
    const batch = this.ds.batch();
    const { currentDepartment, employee, config } = this.auth;
    batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).ref, criminal, { merge: true });

    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),
      criminalRecordKeyRef: criminal?.key,
      citizenKeyRef: citizen?.key,
      criminalStatus: criminal?.status,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: isNotDecree ? null : (criminal?.decree_status || null),
      decree_result: isNotDecree ? null : (criminal?.decree_result || null),
      internal_status: criminal?.internal_status || null,

      default_stampFile: employee?.stampFile || null,
      default_remarkFile: employee?.signatureFile || null,
      default_signatureFile: employee?.signatureFile || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }

    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)

    if (isLastRecode) {
      batch.update(this.ds.criminalRecordFolderRef().doc(selectedGroupDoc.key).ref, {
        status: STATUS_OBJ.DONE,
        collected_doc_at: criminal.collected_doc_at,
        collected_doc_by: criminal.collected_doc_by,
      })
    }
    return batch.commit()
  }

  @action
  checkDocNoExist(nameKey: any, field: string) {
    return this.ds.criminalRecordRef(ref => ref.where(field, '==', nameKey));
  }

  @action
  approvedCriminalInputNumber(criminal: any, citizen: any, isNotDecree: boolean, isLastRecode, selectedGroupDoc) {
    const batch = this.ds.batch();
    const { currentDepartment, employee, config } = this.auth;
    batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).ref, criminal, { merge: true });
    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),
      criminalRecordKeyRef: criminal?.key,
      citizenKeyRef: citizen?.key,
      criminalStatus: criminal?.status,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: isNotDecree ? null : (criminal?.decree_status || null),
      decree_result: isNotDecree ? null : (criminal?.decree_result || null),
      internal_status: criminal?.internal_status || null,

      default_stampFile: employee?.stampFile || null,
      default_remarkFile: employee?.signatureFile || null,
      default_signatureFile: employee?.signatureFile || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }
    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)

    if (isLastRecode) {
      batch.update(this.ds.criminalRecordFolderRef().doc(selectedGroupDoc.key).ref, {
        status: STATUS_OBJ.RECEIVED,
        can_received_at: criminal.can_received_at,
        can_received_expired_at: criminal.can_received_expired_at,
        can_received_by: criminal.can_received_by,
      })

    }
    return batch.commit()
  }

  @action
  async approvedCriminal(criminal: any, citizen: any, isNotDecree: boolean, invalidCitizen?: boolean) {
    const batch = this.ds.batch();
    const { currentDepartment, employee, config, uid } = this.auth;
    if (invalidCitizen && citizen?.phoneNumber) {
      const user = await this.ds.usersRef(ref => ref.where('phoneNumber', '==', citizen?.phoneNumber)).get().toPromise();
      if (user.empty) {
        const userData = {
          key: citizen?.key,
          email: citizen?.email || null,
          photoUrl: citizen?.photo?.downloadUrl || null,
          created_at: this.ds.serverTimestamp(),
          created_by: uid,
          displayName: `${citizen?.first_name}`,
          full_name: `${citizen?.last_name} ${citizen?.first_name}`,
          phoneNumber: citizen?.phoneNumber,
          status: STATUS_OBJ.ACTIVE,
          isPublicAccount: true,
          created_by_officer: true,
          account_type: { key: 1, name: 'Public' },
          login_at: null,
          criminal_record: {
            application_type_key: criminal?.application_type?.route,
            nationalKey: criminal?.national_application?.key,
            key: criminal?.key,
          }
        }
        batch.set(this.ds.usersRef().doc(userData?.key).ref, userData, { merge: true });
      }
    }

    batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).ref, criminal, { merge: true });
    batch.set(this.ds.citizensRef().doc(citizen?.key).ref, citizen, { merge: true });
    batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).collection('citizen').doc(citizen?.key).ref, citizen, { merge: true });
    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),
      criminalRecordKeyRef: criminal?.key,
      citizenKeyRef: citizen?.key,
      criminalStatus: criminal?.status,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: isNotDecree ? null : (criminal?.decree_status || null),
      decree_result: isNotDecree ? null : (criminal?.decree_result || null),
      internal_status: criminal?.internal_status || null,

      default_stampFile: employee?.stampFile || null,
      default_remarkFile: employee?.signatureFile || null,
      default_signatureFile: employee?.signatureFile || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }
    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)
    return batch.commit()
  }

  @action
  async approvedCriminalFingerrint(criminal: any, citizen: any, isNotDecree: boolean, dataImg: string, invalidCitizen?: boolean) {
    const { currentDepartment, employee, config, uid, serverDateTime } = this.auth;
    return new Promise<void>((resolve, reject) => {
      this.getPaymentNoRef(serverDateTime, config, async criminal_payment_no => {
        const batch = this.ds.batch();
        if (invalidCitizen && citizen?.phoneNumber) {
          const user = await this.ds.usersRef(ref => ref.where('phoneNumber', '==', citizen?.phoneNumber)).get().toPromise();
          if (user.empty) {
            const userData = {
              key: citizen?.key,
              email: citizen?.email || null,
              photoUrl: citizen?.photo?.downloadUrl || null,
              created_at: this.ds.serverTimestamp(),
              created_by: uid,
              displayName: `${citizen?.first_name}`,
              full_name: `${citizen?.last_name} ${citizen?.first_name}`,
              phoneNumber: citizen?.phoneNumber,
              status: STATUS_OBJ.ACTIVE,
              isPublicAccount: true,
              created_by_officer: true,
              account_type: { key: 1, name: 'Public' },
              login_at: null,
              criminal_record: {
                application_type_key: criminal?.application_type?.route,
                nationalKey: criminal?.national_application?.key,
                key: criminal?.key,
              }
            }
            batch.set(this.ds.usersRef().doc(userData?.key).ref, userData, { merge: true });
          }
        }
        const fileName = 'fingerprint.bmp'
        const type = 'image'
        const file = await this.storage.uploadBase64(fileName, type, dataImg)

        batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).ref, { ...criminal, finger_print_file: file, criminal_payment_no: criminal_payment_no }, { merge: true });
        batch.set(this.ds.citizensRef().doc(citizen?.key).ref, { ...citizen, finger_print_file: file }, { merge: true });
        batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).collection('citizen').doc(citizen?.key).ref, { ...citizen, finger_print_file: file }, { merge: true });
        const movement = {
          key: this.ds.createId(),
          created_at: this.ds.serverTimestamp(),
          created_by: toEmployee(employee, true),
          profile: toEmployee(employee, true),
          workplaceKey: currentDepartment?.key,
          workplace: toDepartmentNoWorkplace(currentDepartment),
          criminalRecordKeyRef: criminal?.key,
          citizenKeyRef: citizen?.key,
          criminalStatus: criminal?.status,

          criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,
          decree_status: isNotDecree ? null : (criminal?.decree_status || null),
          decree_result: isNotDecree ? null : (criminal?.decree_result || null),
          internal_status: criminal?.internal_status || null,

          default_stampFile: employee?.stampFile || null,
          default_remarkFile: employee?.signatureFile || null,
          default_signatureFile: employee?.signatureFile || null,

          tran_at: this.ds.serverTimestamp(),
          tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
        }
        batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)
        await batch.commit()
        resolve()
      })
    })
  }

  @action
  async approvedCriminalScanFingerPrint(item: any, criminal: any, citizen: any, dataImg: string) {
    const batch = this.ds.batch();
    const { currentDepartment, employee, config } = this.auth;

    const fileName = 'fingerprint.bmp'
    const type = 'image'
    const file = await this.storage.uploadBase64(fileName, type, dataImg)
    const criminalData = {
      ...item,
      finger_print_file: file
    }

    const citizenData = {
      review_at: item.review_at,
      review_by: item.review_by,
      finger_print_file: file,
    }

    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),
      criminalRecordKeyRef: criminal?.key,
      citizenKeyRef: citizen?.key,
      criminalStatus: item?.status,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: null,
      decree_result: null,
      internal_status: criminal?.internal_status || null,

      default_stampFile: employee?.stampFile || null,
      default_remarkFile: employee?.signatureFile || null,
      default_signatureFile: employee?.signatureFile || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }

    batch.update(this.ds.criminalRecordsRef().doc(criminal?.key).ref, { ...criminalData });
    batch.update(this.ds.citizensRef().doc(citizen?.key).ref, { ...citizenData });
    batch.update(this.ds.criminalRecordsRef().doc(criminal?.key).collection('citizen').doc(citizen?.key).ref, { ...citizenData });
    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)

    return batch.commit()
  }

  @action
  updateStatus(criminal: any, status: any) {
    return this.ds.criminalRecordsRef().doc(criminal?.key).set({
      status: status,
      updated_by: this.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
    }, { merge: true })
  }

  @action
  updateStatusBatch(criminals: any[], status: any) {
    const batch = this.ds.batch();
    (criminals || []).forEach((criminal: any) => {
      batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).ref, {
        status: status,
        updated_by: this.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),
      }, { merge: true })
    })
    return batch.commit()
  }

  getMappedProfile() {
    const { employee } = this.auth;
    if(!employee?.key) return null;
    return {
      display_name: employee?.displayName || null,
      photoUrl: employee?.file?.downloadUrl || null,
      key: employee?.key,
    }
  }

  getMappedProfilePublic() {
    const { employee } = this.auth;
    return {
      display_name: employee?.last_name + ' ' + employee?.first_name || null,
      photoUrl: employee?.photo?.downloadUrl || null,
      key: employee?.key,
    }
  }

  @action
  async deleteCriminalRecord(item: any) {
    const batch = this.ds.batch();
    const citizenKey = item?.citizen_ref || null;
    if (citizenKey) {
      const docs = pushToArray(await this.ds.criminalRecordRef(ref => ref.where('citizen_ref', '==', citizenKey)).get().toPromise());
      if (docs?.filter(m => m?.key !== item?.key).length === 0) {
        batch.delete(this.ds.criminalRecordsRef().doc(item?.key).collection('citizen').doc(citizenKey).ref)
      }
    }
    batch.delete(this.ds.criminalRecordsRef().doc(item?.key).ref)
    return batch.commit()
  }

  @action
  saveStoryboard(item: any, isSubmitted: boolean) {
    const batch = this.ds.batch();
    if (this.selectedCriminalRecord) {
      batch.set(this.ds.criminalRecordsRef().doc(this.selectedCriminalRecord?.key).collection('citizen').doc(item?.key).ref, item, { merge: true })
      if (isSubmitted) {
        batch.set(this.ds.criminalRecordsRef().doc(this.selectedCriminalRecord?.key).ref, {
          status: STATUS_OBJ.SUBMITTED,
          updated_at: this.ds.serverTimestamp(),
          updated_by: item?.updated_by,
        }, { merge: true })
      }
    }
    batch.set(this.ds.citizensRef().doc(item?.key).ref, item, { merge: true })
    return batch.commit()
  }

  @observable criminalRecordsRef: Subscription = null;
  @observable criminalGroupDocRef: Subscription = null;
  @observable citizenProfileRef: Subscription = null;
  @action
  async subscribeSelectedCriminalRecord() {
    this.criminalRecordsRef?.unsubscribe()
    this.citizenProfileRef?.unsubscribe()
    this.selectedCitizenProfile = null;
    this.selectedCriminalRecord = null;
  }

  @action
  fetchSelectedCitizen(citizenKey: string, callback?: (item: any) => void) {
    this.citizenProfileRef?.unsubscribe()
    this.criminalRecordsRef?.unsubscribe()
    this.citizenProfileRef = this.ds.citizensRef().doc(citizenKey).valueChanges().subscribe(item => {
      this.selectedCitizenProfile = item;
      callback?.(this.selectedCitizenProfile)
    })
  }


  @action
  fetchSelectedCitizenDoc(citizenKey: string, callback?: (item: any) => void) {
    this.citizenProfileRef?.unsubscribe()
    this.criminalRecordsRef?.unsubscribe()
    this.citizenProfileRef = this.ds.usersRef().doc(citizenKey).valueChanges().subscribe(item => {
      const data = item;
      callback?.(data)
    })
  }

  @action
  async getSelectedCriminalRecord(criminalKey: string) {
    const ref = this.ds.criminalRecordsRef().doc(criminalKey).get().toPromise()
    return pushToObject(await ref)
  }

  @action
  fetchSelectedCriminalRecord(criminalKey: string, callback?: (item: any) => void) {
    this.loadingCriminalRecord = true;
    // comment component no reload so need to display loading to user when change selected criminal.
    this.loadingCommentInternal = true;
    this.loadingCommentPublic = true;

    this.criminalRecordsRef?.unsubscribe();
    this.selectedCitizenProfile = null;
    this.attachment_files = [];
    this.criminalRecordsRef = this.ds.criminalRecordsRef().doc(criminalKey).valueChanges().subscribe(async (doc: any) => {
      this.selectedCriminalRecord = doc ? {
        ...doc,
        amTimeAgo: fromNow(doc?.created_at?.toDate(), true),
        photoUrl: doc?.photo?.downloadUrl ? transformImageSameTokenNo(doc?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR,
        show_confirm: doc?.status?.key === STATUS_OBJ.APPLY.key
      } : null;

      this.headerDocument = this.selectedCriminalRecord;
      this.loadingCriminalRecord = false;

      const { citizen_ref, attachments } = this.selectedCriminalRecord || {};
      this.selectedCitizenProfile = null;
      this.attachment_files = orderBy(attachments || [], 'key')?.map(m => {
        if (`${m?.type}`.indexOf(`image`) > -1) {
          return { ...m, image: true, photoUrl: m?.downloadUrl ? transformImageSameTokenNo(m?.downloadUrl, '720').uri : PHOTO_LIB.EMPTY_PHOTO }
        }
        return { ...m, image: false }
      })

      this.subscribeStatus.next(this.selectedCriminalRecord?.status)

      this.citizenProfileRef?.unsubscribe()
      if (citizen_ref) {
        this.citizenProfileRef = this.ds.criminalRecordsRef().doc(criminalKey).collection('citizen').doc(citizen_ref).valueChanges().subscribe(item => {
          this.selectedCitizenProfile = item ? { ...item, amTimeAgo: fromNow(item?.created_at?.toDate(), true), photoUrl: item?.photo?.downloadUrl ? transformImageSameTokenNo(item?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR } : null;
          callback?.(this.selectedCriminalRecord)
        })
      } else {
        callback?.(this.selectedCriminalRecord)
      }
    })
  }

  @action
  fetchSelectedGroupDoc(groupKey: string, callback?: (item: any) => void) {
    this.criminalGroupDocRef?.unsubscribe();
    this.criminalGroupDocRef = this.ds.groupRequestFormRef().doc(groupKey).valueChanges().subscribe(async (doc: any) => {
      this.selectedGroupDoc = doc
      this.selectedGroupDoc.name = doc?.folder_no_items?.toString()
      callback?.(this.selectedGroupDoc)
    })
  }

  @action
  async unsubscribeForm() {
    this.selectedCriminalRecord = null;
    this.selectedCitizenProfile = null;
    this.criminalRecordsRef?.unsubscribe()
    this.criminalGroupDocRef?.unsubscribe()
    this.citizenProfileRef?.unsubscribe()
    this.citizens = [];
    Promise.resolve()
  }

  /**
   * Every approval listing writes into the same `this.data`, so a snapshot that arrives late —
   * after the officer switched tab, or after an approval moved the record out of the query —
   * used to repaint the list with the previous tab's rows. Each listing fetch takes a token and
   * a snapshot whose token is no longer the current one drops itself instead of writing.
   */
  private listingToken: number = 0;

  private startListing(): number {
    return ++this.listingToken;
  }

  private isStaleListing(token: number): boolean {
    return token !== this.listingToken;
  }

  @action
  async unsubscribe() {
    this.selectedCriminalRecord = null;
    this.selectedCitizenProfile = null;
    this.subscribeStatus.next(false);
    this.fetchCitizensRef?.unsubscribe();
    this.fetchCriminalRecordsByOfficerRef?.unsubscribe();
    this.fetchCriminalRecordsDecreeDescRef?.unsubscribe();
    this.fetchCriminalRecordsByPeriodRef?.unsubscribe();
    this.data = []
    this.citizens = [];
    this.lastVisible = null;
    this.attachment_files = [];
    this.fetchCriminalRecordsInputPrintRef?.unsubscribe();
    this.fetchMolRef?.unsubscribe();
    this.fetchCriminalDoExpireListingRef?.unsubscribe();
    this.fetchCriminalRequestApprovalRef?.unsubscribe();
    this.fetchCriminalApprovedRef?.unsubscribe();
    this.fetchCriminalRejectedRef?.unsubscribe();
    this.fetchCriminalRejectedToWorkplaceRef?.unsubscribe();
    this.fetchCriminalIssuedRef?.unsubscribe();
    this.fetchPaidOnlineDraftPeriodRef?.unsubscribe();
    this.fetchCriminalBusinessRef?.unsubscribe();
    this.fetchCriminalBusinessDecreeRef?.unsubscribe();
    Promise.resolve()
  }

  @action
  unsubscribeSearch(){
    this.searchData = null;
    this.searchResult = null;
    this.searching = false;
    this.emptySearch = false;
    this.fetchSearchRef?.unsubscribe();
    this.fetchSearchLetter3ListingRef?.unsubscribe();
  }

  @action
  async fetchAssistantListing(status: any | null, entry_by: string | null,entry_officer_type: number | null , orderDESC : boolean, callback: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    this.fetchCitizensRef = this.ds.criminalAssistantListingRef(null,status, entry_by,entry_officer_type,orderDESC).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  async fetchMoreAssistantListing(status: any | null, entry_by: string | null,entry_officer_type: number | null , orderDESC : boolean, callback: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCitizensRef?.unsubscribe()
        this.fetchCitizensRef = this.ds.criminalAssistantListingRef(this.lastVisible, status, entry_by,entry_officer_type,orderDESC).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async fetchCriminalLaborListing(status: any | null, entry_by: string | null, orderDESC : boolean, callback: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { currentDepartment, dataEntryOnly, recipient, config } = this.auth;
    let departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    if(this.fetchEntryType === 2){
      departmentKey = config.department_labor?.key
    }
    this.fetchCitizensRef = this.ds.criminalLaborListingRef(null,departmentKey, status, entry_by,orderDESC).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  async fetchMoreLaborListing(status: any | null, entry_by: string | null, orderDESC : boolean, callback: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCitizensRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly, recipient, config } = this.auth;
        let departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        if(this.fetchEntryType === 2){
          departmentKey = config.department_labor?.key
        }
        this.fetchCitizensRef = this.ds.criminalLaborListingRef(this.lastVisible,departmentKey, status, entry_by,orderDESC).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async fetchCriminalListing(applicationType: any | null, urgent: boolean | null, online: any | null, status: any | null, whereOperator: string | null, entry_by: string | null, entry_officer_type : number | null, orderDESC : boolean, callback: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    this.data = null;
    const { currentDepartment, dataEntryOnly, recipient, config, selected_application_embassy } = this.auth;
    console.log("fetchCriminalListing",currentDepartment)
    let departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    if(this.fetchEntryType === 2){
      departmentKey = config.department_labor?.key
    }else if(this.fetchEntryType === 3){
      departmentKey = null;
    }else if(this.fetchEntryType === 4){
      departmentKey = config.department_defense?.key
    }
    this.fetchCitizensRef = this.ds.criminalListingRef(applicationType?.key || null, urgent, null, online, departmentKey, status, recipient, whereOperator, entry_by,entry_officer_type,orderDESC,selected_application_embassy).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (this.data?.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  async fetchMoreCriminalListing(applicationType: any, urgent: boolean, online: any, status: any, whereOperator, entry_by: string, entry_officer_type : any, orderDESC : boolean, callback: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        console.log('fetch more')
        this.fetchCitizensRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly, recipient, config, selected_application_embassy } = this.auth;
        let departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        if(this.fetchEntryType === 2){
          departmentKey = config.department_labor?.key
        }else if(this.fetchEntryType === 3){
          departmentKey = null;
        }else if(this.fetchEntryType === 4){
          departmentKey = config.department_defense?.key
        }
        this.fetchCitizensRef = this.ds.criminalListingRef(applicationType?.key || null, urgent, this.lastVisible, online, departmentKey, status, recipient, whereOperator, entry_by , entry_officer_type,orderDESC,selected_application_embassy).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }
  fetchSearchListingRef: Subscription = null;
  @action
  fetchSearchCriminalListing(applicationType: any, urgent: boolean, online: any, searchString: string, status: any, callback?: (items: any) => void) {
    this.fetchSearchListingRef?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const { currentDepartment, dataEntryOnly,selected_application_embassy } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchSearchListingRef = this.ds.criminalSearchListingRef(applicationType?.key || null, urgent || null, searchString, online || null, status, departmentKey,selected_application_embassy).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  fetchSearchListingLetter1Ref: Subscription = null;
  @action
  fetchSearchCriminalListingLetter1(urgent: boolean, online: any, searchString: string, status: any, callback?: (items: any) => void) {
    this.fetchSearchListingLetter1Ref?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const { currentDepartment, dataEntryOnly,selected_application_embassy } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchSearchListingLetter1Ref = this.ds.criminalSearchListingLetter1Ref(urgent || null, searchString, online || null, status, departmentKey,selected_application_embassy).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  fetchSearchListingLetter2Ref: Subscription = null;
  @action
  fetchSearchCriminalListingLetter2(urgent: boolean, online: any, searchString: string, status: any, callback?: (items: any) => void) {
    this.fetchSearchListingLetter2Ref?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const { currentDepartment, dataEntryOnly,selected_application_embassy } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchSearchListingLetter2Ref = this.ds.criminalSearchListingLetter2Ref(urgent || null, searchString, online || null, status, departmentKey,selected_application_embassy).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  @action
  fetchSearchAssistantListing(searchString: string, entry_by: string, callback?: (items: any) => void) {
    this.fetchSearchListingRef?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    this.fetchSearchListingRef = this.ds.criminalAssistantSearchListingRef(searchString,entry_by).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  @action
  async fetchSearchLaborHandlerListing(searchString: string, departmentKey: string, callback?: (items: any) => void) {
    this.fetchSearchListingRef?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const q1 = this.ds.criminalAssistantSearchListingRef(searchString,null,3).get()
    const q2 = this.ds.criminalLaborHandlerSearchListingRef(searchString,departmentKey).get()
    const [d1,d2]=await Promise.all([
      q1.toPromise(),
      q2.toPromise()
    ]);
    const docs = pushToArray(d1).concat(pushToArray(d2));
    this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
    if (this.searchResult.length === 0) {
      this.emptySearch = true;
    }
    callback?.(this.searchResult)
    this.searching = false;
  }

  fetchSearchLetter3ListingRef: Subscription = null;
  @action
  fetchSearchLetter3CriminalListing(searchString: string, callback?: (items: any) => void) {
    this.fetchSearchLetter3ListingRef?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    this.fetchSearchLetter3ListingRef = this.ds.criminalRecordRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',3)
    .where('keyword','array-contains',searchString).limit(10)).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  fetchSearchLetter1ListingRef: Subscription = null;
  @action
  fetchSearchLetter1CriminalListing(searchString: string, callback?: (items: any) => void) {
    this.fetchSearchLetter1ListingRef?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    this.fetchSearchLetter1ListingRef = this.ds.criminalRecordRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',1)
    .where('keyword','array-contains',searchString).limit(10)).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  fetchSearchLetter2ListingRef: Subscription = null;
  @action
  fetchSearchLetter2CriminalListing(searchString: string, callback?: (items: any) => void) {
    this.fetchSearchLetter2ListingRef?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    this.fetchSearchLetter2ListingRef = this.ds.criminalRecordRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',2)
    .where('keyword','array-contains',searchString).limit(10)).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  fetchCitizensRef: Subscription = null;
  @action
  async fetchCriminalRecords(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void, departmentKeyOverride?: string) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { currentDepartment, dataEntryOnly } = this.auth;
    const departmentKey = departmentKeyOverride ?? (dataEntryOnly ? currentDepartment?.key : null);
    this.fetchCitizensRef = this.ds.criminalRecordsListingRef(status?.key, applicationType?.key || null, urgent, null, online, statusMoreThan, departmentKey).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  // letter 3 general: listing for one ១២ថ្ងៃ / ២០ថ្ងៃ period tab
  fetchCriminalRecordsByPeriodRef: Subscription = null;
  @action
  async fetchCriminalRecordsByPeriod(status: any, applicationType: any, urgentPeriodKey: number, statusMoreThan: any, callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { currentDepartment, dataEntryOnly } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchCriminalRecordsByPeriodRef = this.ds.criminalRecordsListingByPeriodRef(status?.key, applicationType?.key || null, urgentPeriodKey, null, statusMoreThan, departmentKey).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalRecordsByPeriod(status: any, applicationType: any, urgentPeriodKey: number, statusMoreThan: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecordsByPeriodRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly } = this.auth;
        const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        this.fetchCriminalRecordsByPeriodRef = this.ds.criminalRecordsListingByPeriodRef(status?.key, applicationType?.key || null, urgentPeriodKey, this.lastVisible, statusMoreThan, departmentKey).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  fetchCriminalRecordsDecreeDescRef: Subscription = null;
  @action
  async fetchCriminalRecordsDecreeDesc(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { currentDepartment, dataEntryOnly } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchCriminalRecordsDecreeDescRef = this.ds.criminalRecordsListingDecreeDescRef(status?.key, applicationType?.key || null, urgent, null, online, statusMoreThan, departmentKey).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalRecordsDecreeDesc(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecordsDecreeDescRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly } = this.auth;
        const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        this.fetchCriminalRecordsDecreeDescRef = this.ds.criminalRecordsListingDecreeDescRef(status?.key, applicationType?.key || null, urgent, this.lastVisible, online, statusMoreThan, departmentKey).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  fetchMolDecreeRef: Subscription = null;
  @action
  async fetchMolDecree(workplaceKey: string, callback?: (items: any) => void) {
    this.fetchMolDecreeRef?.unsubscribe()
    const { config } = this.auth;
    const departmentKey = config.department_labor?.key;
    this.fetchForApproveRef = this.ds.criminalRecordRef(ref => {
      let condition = ref.where('status.key', '>', STATUS_OBJ?.DECREE?.key).where('workplace_entry.key', '==', departmentKey)
      return condition.orderBy('status.key').orderBy('decree_at','desc').limit(APPS.size);
    }).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  async fetchMolDecreeDoneMore(workplaceKey: string, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchMolDecreeRef?.unsubscribe()
        const { config } = this.auth;
        const departmentKey = config.department_labor?.key
        this.fetchMolDecreeRef = this.ds.criminalRecordRef(ref => {
          let condition = ref.where('status.key', '>',  STATUS_OBJ?.DECREE?.key).where('workplace_entry.key', '==', departmentKey)
          return condition.orderBy('status.key').orderBy('decree_at','desc').startAfter(this.lastVisible?.status?.key,this.lastVisible?.decree_at).limit(APPS.size);
        }).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  fetchMolRef: Subscription = null;
  @action
  async fetchMolPayment(status, statusMoreThan, DESC: boolean,callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { config } = this.auth;
    const departmentKey = config.department_labor?.key
    try{
      this.fetchMolRef = this.ds.criminalMolPaymentListingRef(null,departmentKey, status,statusMoreThan,DESC).valueChanges().subscribe(docs => {
        this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
        this.empty = this.data.length === 0;
        this.lastVisible = null;
        if (docs.length >= APPS.size) {
          this.lastVisible = this.data[this.data.length - 1];
        }
        callback?.(this.data)
      })
    }catch(error){
      console.log('error',error)
    }
  }

  @action
  fetchMolPaymentMore(status, statusMoreThan, DESC: boolean,callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchMolRef?.unsubscribe()
        const { config } = this.auth;
        const departmentKey = config.department_labor?.key
        this.fetchMolRef = this.ds.criminalMolPaymentListingRef(this.lastVisible,departmentKey, status,statusMoreThan,DESC).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async getSearchMolPayment(status, statusMoreThan : any , keyword: string, callback?: (items: any) => void) {
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const { config } = this.auth;
    const departmentKey = config.department_labor?.key
    const docsRef = this.ds.molPaymentSearchListingRef(status, statusMoreThan, departmentKey, keyword).get()
    let docs = pushToArray(await docsRef?.toPromise())
    this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
    if (this.searchResult.length === 0) {
      this.emptySearch = true;
    }
    callback?.(this.searchResult)
    this.searching = false;
  }


  fetchAssistantRef: Subscription = null;
  @action
  async fetchAssistantPayment(status, statusMoreThan, DESC: boolean,callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    try{
      this.fetchAssistantRef = this.ds.criminalAssistantPaymentListingRef(null, status,statusMoreThan,DESC).valueChanges().subscribe(docs => {
        this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
        this.empty = this.data.length === 0;
        this.lastVisible = null;
        if (docs.length >= APPS.size) {
          this.lastVisible = this.data[this.data.length - 1];
        }
        callback?.(this.data)
      })
    }catch(error){
      console.log('error',error)
    }
  }

  @action
  fetchAssistantPaymentMore(status, statusMoreThan, DESC: boolean,callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchAssistantRef?.unsubscribe()
        this.fetchAssistantRef = this.ds.criminalAssistantPaymentListingRef(this.lastVisible, status,statusMoreThan,DESC).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async getSearchAssistantPayment(status, statusMoreThan : any , keyword: string, callback?: (items: any) => void) {
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const { config } = this.auth;
    const departmentKey = config.department_labor?.key
    const docsRef = this.ds.assistantPaymentSearchListingRef(status, statusMoreThan, keyword).get()
    let docs = pushToArray(await docsRef?.toPromise())
    this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
    if (this.searchResult.length === 0) {
      this.emptySearch = true;
    }
    callback?.(this.searchResult)
    this.searching = false;
  }

  fetchCriminalRecordsByOfficerRef: Subscription = null;
  @action
  async fetchCriminalRecordsByOfficer(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchCriminalRecordsByOfficerRef = this.ds.criminalRecordsListingByOfficerRef(status?.key, applicationType?.key || null, urgent, null, online, statusMoreThan, departmentKey, root ? null : uid).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalRecords(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void, departmentKeyOverride?: string) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCitizensRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly } = this.auth;
        const departmentKey = departmentKeyOverride ?? (dataEntryOnly ? currentDepartment?.key : null);
        this.fetchCitizensRef = this.ds.criminalRecordsListingRef(status?.key, applicationType?.key || null, urgent, this.lastVisible, online, statusMoreThan, departmentKey).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  fetchMoreCriminalRecordsByOfficer(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecordsByOfficerRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
        const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        this.fetchCriminalRecordsByOfficerRef = this.ds.criminalRecordsListingByOfficerRef(status?.key, applicationType?.key || null, urgent, this.lastVisible, online, statusMoreThan, departmentKey, root ? null : uid).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }


  fetchCriminalRecordsByOfficerLetter1Ref: Subscription = null;
  @action
  async fetchCriminalRecordsByOfficerLetter1(status: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchCriminalRecordsByOfficerLetter1Ref = this.ds.criminalRecordsListingByOfficerLetter1Ref(status?.key, urgent, null, online, statusMoreThan, departmentKey, root ? null : uid).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalRecordsByOfficerLetter1(status: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecordsByOfficerLetter1Ref?.unsubscribe()
        const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
        const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        this.fetchCriminalRecordsByOfficerLetter1Ref = this.ds.criminalRecordsListingByOfficerLetter1Ref(status?.key, urgent, this.lastVisible, online, statusMoreThan, departmentKey, root ? null : uid).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  fetchCriminalRecordsByOfficerLetter2Ref: Subscription = null;
  @action
  async fetchCriminalRecordsByOfficerLetter2(status: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchCriminalRecordsByOfficerLetter2Ref = this.ds.criminalRecordsListingByOfficerLetter2Ref(status?.key, urgent, null, online, statusMoreThan, departmentKey, root ? null : uid).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalRecordsByOfficerLetter2(status: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void, departmentKeyOverride?: string) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecordsByOfficerLetter2Ref?.unsubscribe()
        const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
        const departmentKey = departmentKeyOverride ?? (dataEntryOnly ? currentDepartment?.key : null);
        this.fetchCriminalRecordsByOfficerLetter2Ref = this.ds.criminalRecordsListingByOfficerLetter2Ref(status?.key, urgent, this.lastVisible, online, statusMoreThan, departmentKey, root ? null : uid).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  fetchCriminalRecordsInputPrintRef: Subscription = null;
  @action
  async fetchCriminalRecordsInputPrintOfficer(callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    this.fetchCriminalRecordsInputPrintRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',3).orderBy('created_at','desc').limit(50)).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  fetchCriminalBusinessRef: Subscription = null;
  @action
  async fetchCriminalBusiness(callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { config } = this.auth;
    this.fetchCriminalBusinessRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_record_category.key','==',config.criminal_record_category_business.key).where('application_type.key','==',3).orderBy('paid_at','desc').limit(50)).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data);
    })
  }

  @action
  fetchMoreCriminalBusiness(callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalBusinessRef?.unsubscribe()
        const { config } = this.auth;
        const { paid_at } = this.lastVisible;
        this.fetchCriminalBusinessRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_record_category.key','==',config.criminal_record_category_business.key).where('application_type.key','==',3).orderBy('paid_at','desc').startAfter(paid_at).limit(50)).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = docs[docs?.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  fetchCriminalBusinessDecreeRef: Subscription = null;
  @action
  async fetchCriminalBusinessDecree(callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    const { config } = this.auth;
    this.fetchCriminalBusinessDecreeRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_record_category.key','==',config.criminal_record_category_business.key).where('application_type.key','==',3).where('status.key','==',STATUS_OBJ.PAID.key).orderBy('paid_at','desc').limit(50)).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data);
    })
  }

  @action
  fetchMoreCriminalBusinessDecree(callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalBusinessDecreeRef?.unsubscribe()
        const { config } = this.auth;
        const { paid_at } = this.lastVisible;
        this.fetchCriminalBusinessDecreeRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_record_category.key','==',config.criminal_record_category_business.key).where('application_type.key','==',3).where('status.key','==',STATUS_OBJ.PAID.key).orderBy('paid_at','desc').startAfter(paid_at).limit(50)).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = docs[docs?.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  fetchCriminalRecords1InputPrintRef: Subscription = null;
  @action
  async fetchCriminalRecords1InputPrintOfficer(callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    this.fetchCriminalRecords1InputPrintRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',1).orderBy('created_at','desc').limit(50)).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalRecords1InputPrintOfficer(callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecords1InputPrintRef?.unsubscribe()
        const { created_at } = this.lastVisible;
        this.fetchCriminalRecords1InputPrintRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',1).orderBy('created_at','desc').startAfter(created_at).limit(50)).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = docs[docs?.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  fetchCriminalRecords2InputPrintRef: Subscription = null;
  @action
  async fetchCriminalRecords2InputPrintOfficer(callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    this.fetchCriminalRecords2InputPrintRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',2).orderBy('created_at','desc').limit(50)).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalRecords2InputPrintOfficer(callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecords2InputPrintRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
        const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        const { created_at } = this.lastVisible;
        this.fetchCriminalRecords2InputPrintRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',2).orderBy('created_at','desc').startAfter(created_at).limit(50)).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = docs[docs?.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  fetchMoreCriminalRecordsInputPrintOfficer(callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCriminalRecordsInputPrintRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly, uid, root } = this.auth;
        const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        const { created_at } = this.lastVisible;
        this.fetchCriminalRecordsInputPrintRef = this.ds.criminalRecordsRef(ref=>ref.where('criminal_input_print','==',true).where('application_type.key','==',3).orderBy('created_at','desc').startAfter(created_at).limit(50)).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = docs[docs?.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }


  fetchFolderByStatusRef: Subscription = null;
  @action
  async fetchFolderByStatus(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: boolean, callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    this.fetchFolderByStatusRef = this.ds.criminalRecordsFolderListingRef(status?.key, applicationType?.key || null, urgent, null, online, statusMoreThan).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR, name: m?.folder_no_items?.toString() }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  fetchGroupRequestFormRef: Subscription = null;
  @action
  async fetchGroupRequestForm(callback?: (items: any) => void) {
    this.fetchGroupRequestFormRef?.unsubscribe();
    this.lastVisible = null;
    this.fetchGroupRequestFormRef = this.ds.groupRequestFormRef().valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, name: (m?.folder_no_items || [])?.toString(), release_date_kh: toKhDate(m?.release_date?.toDate()), amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;

      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  fetchForApproveRef: Subscription = null;
  @action
  fetchCriminalRecordsForApprove(workplaceKey: string, urgent: boolean, isApproved: boolean, callback?: (items: any) => void) {
    this.fetchForApproveRef?.unsubscribe();
    this.fetchForApproveRef = this.ds.criminalRecordRef(ref => {
      let condition = ref.where(isApproved ? 'approved_workplaceKeys' : 'request_approval_workplace', 'array-contains', workplaceKey)
      if (urgent) {
        condition = condition.where('urgent', '==', urgent)
      }
      return condition.orderBy('updated_at').limit(APPS.size);
    }).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  fetchCLByFolderRef: Subscription = null;
  @action
  fetchCLByFolder(workplaceKey: string, config: any, statusKey: string, callback?: (items: any) => void) {
    const { criminal_record_category_labor, criminal_record_category } = config
    this.fetchCLByFolderRef?.unsubscribe();
    this.fetchCLByFolderRef = this.ds.criminalRecordFolderRef(ref => {
      console.log("statusKey",statusKey)
      const field = statusKey === 'approved' ? 'approved_workplaceKeys' : 'request_approval_workplace';
      let condition = ref.where(field, "array-contains", workplaceKey);
      switch (statusKey) {
        case '12Day':
          condition = condition.where('category_folder.key', '==', criminal_record_category.key).where('period_process_document.key', '==', 12)
          break;
        case '20Day':
          condition = condition.where('category_folder.key', '==', criminal_record_category.key).where('period_process_document.key', '==', 20)
          break;
        case 'workers':
          condition = condition.where('category_folder.key', '==', criminal_record_category_labor.key)
          break;
        case 'urgent':
          condition = condition.where('is_urgent', '==', true)
          break;
        default:
          break;
      }
      return condition.orderBy("release_date", "desc").limit(APPS.size);
    }).valueChanges().subscribe(docs => {
      this.dataByFolder = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR, name: m?.folder_no_items?.toString() }));
      this.emptyByFolder = this.dataByFolder.length === 0;
      this.lastVisible = null;
      if (this.dataByFolder.length >= APPS.size) {
        this.lastVisible = this.dataByFolder[this.dataByFolder.length - 1];
      }
      callback?.(this.dataByFolder)
    })
  }

  @action
  fetchMoreCLByFolder(workplaceKey: string, config: any, statusKey: string, callback?: (items: any) => void) {
    const { criminal_record_category_labor, criminal_record_category } = config

    if (!this.lastVisible) return;

    this.fetchCLByFolderRef?.unsubscribe();
    this.fetchCLByFolderRef = this.ds.criminalRecordFolderRef(ref => {
      const field = statusKey === 'approved' ? 'approved_workplaceKeys' : 'request_approval_workplace';
      let condition = ref.where(field, "array-contains", workplaceKey);
      switch (statusKey) {
        case '12Day':
          condition = condition.where('category_folder.key', '==', criminal_record_category.key).where('period_process_document.key', '==', 12)
          break;
        case '20Day':
          condition = condition.where('category_folder.key', '==', criminal_record_category.key).where('period_process_document.key', '==', 20)
          break;
        case 'workers':
          condition = condition.where('category_folder.key', '==', criminal_record_category_labor.key)
          break;
        case 'urgent':
          condition = condition.where('is_urgent', '==', true)
          break;
        default:
          break;
      }
      if (this.lastVisible) {
        const { release_date } = this.lastVisible;
        condition = condition.startAfter(release_date);
      }
      return condition.orderBy("release_date", "desc").limit(APPS.size);
    }).valueChanges().subscribe(docs => {
      this.dataByFolder = this.dataByFolder.concat(docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR, name: m?.folder_no_items?.toString() })));
      this.emptyByFolder = this.dataByFolder.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = docs[docs.length - 1];
      }
      callback?.(this.dataByFolder)
    })
  }



  @action
  fetchMoreCriminalRecordsForApprove(workplaceKey: string, urgent: boolean, isApproved: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchForApproveRef?.unsubscribe();
        this.fetchForApproveRef = this.ds.criminalRecordRef(ref => {

          let condition = ref.where(isApproved ? 'approved_workplaceKeys' : 'request_approval_workplace', 'array-contains', workplaceKey)
          if (urgent) {
            condition = condition.where('urgent', '==', urgent)
          }
          if (this.lastVisible) {
            condition = condition.orderBy('updated_at').startAfter(this.lastVisible?.updated_at)
          }
          return condition.orderBy('updated_at').limit(APPS.size);
        }).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }


  saveCri(data, callback?) {
    return this.ds.criminalRecordsRef().doc(data?.key).set(data, { merge: true }).finally(() => {
      callback && callback(true);
    })
  }

  fetchCriminalRecordRef: Subscription = null
  @action
  getCriminalRecord(key: string, callback?: (item: any) => void) {
    this.fetchCriminalRecordRef && this.fetchCriminalRecordRef?.unsubscribe()
    this.fetchCriminalRecordRef = this.ds.criminalRecordsRef().doc(key).valueChanges().subscribe(doc => {
      callback && callback(doc);
    })
  }

  async getCriminalRecords(keys: string[]){
    const chunkSize = 10;
    const chunkItems = [];
    let docs = []
    for (let i = 0; i < keys?.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);
      chunkItems.push(chunk);
    }
    for await(let item of chunkItems){
      const ref = this.ds.criminalRecordsRef (ref=>ref.where('key','in',item)).get();
      const data = pushToArray(await ref.toPromise());
      docs = docs?.concat(data);
    }
    return docs;
  }

  fetchSearchRef: Subscription = null;
  @action
  fetchSearchCriminalRecords(str: string, statusKey: string, callback?: (items: any) => void) {
    this.fetchSearchRef && this.fetchSearchRef?.unsubscribe()
    this.fetchSearchRef = this.ds.criminalRecordsRef(ref => {
      let condition = ref.where('status.key', '==', statusKey).where('application_type.key','==',3)
      if (str) {
        condition = condition.where('keyword', 'array-contains', str?.toUpperCase())
      }
      return condition.limit(20);
    }).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
    })
  }

  @observable fetchDocumentCommentPublicRef: Subscription = null;
  @observable loadingCommentPublic: boolean = true;
  @action
  fetchDocumentCommentPublic(key: string, callback: (doc: any[]) => void) {
    this.fetchDocumentCommentPublicRef && this.fetchDocumentCommentPublicRef.unsubscribe()
    this.fetchDocumentCommentPublicRef = this.ds.headerDocumentRef().doc(key)
      .collection('documentCommentsPublic')
      .valueChanges().subscribe(data => {
        this.documentCommentsPublicData = orderBy(data, 'created_at');
        this.documentCommentsHeaderPublicData = this.documentCommentsPublicData.filter(f => f.isHeader === true);
        this.documentCommentsChildPublicData = this.documentCommentsPublicData.filter(f => f.isHeader === false);
        callback && callback(this.documentCommentsPublicData)
        this.loadingCommentPublic = false;
      })
  }


  @observable fetchDocumentCommentInternalRef: Subscription = null;
  @observable loadingCommentInternal: boolean = true;
  @action
  fetchDocumentCommentInternal(key: string, callback: (doc: any[]) => void) {
    this.fetchDocumentCommentInternalRef && this.fetchDocumentCommentInternalRef.unsubscribe()
    this.fetchDocumentCommentInternalRef = this.ds.headerDocumentRef().doc(key)
      .collection('documentCommentsInternal')
      .valueChanges().subscribe(data => {
        this.documentCommentsInternalData = orderBy(data, 'created_at');
        this.documentCommentsHeaderInternalData = this.documentCommentsInternalData.filter(f => f.isHeader === true);
        this.documentCommentsChildInternalData = this.documentCommentsInternalData.filter(f => f.isHeader === false);
        callback && callback(this.documentCommentsInternalData)
        this.loadingCommentInternal = false;
      })
  }


  @observable process_edit: boolean = false;
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

  @observable process: boolean = false;
  @action
  async onCommentPublic(selectedDocument: any | null, commentData: any, selectedFile, callback) {
    this.process = true

    const fileData = await this.storageService.upload(selectedFile);
    if (fileData && fileData.length > 0) {
      commentData.files = fileData
    }
    const ref = this.ds.headerDocumentRef().doc(selectedDocument?.key).collection('documentCommentsPublic').doc(commentData?.key)
    commentData.hasSent = true
    ref.set(commentData, { merge: true }).then(() => {
      callback(true)
    }).catch(error => {
      callback(false)
    })
      .finally(() => {
        this.process = false
      })
  }

  @action
  async onCommentInternal(selectedDocument: any | null, commentData: any, selectedFile, callback) {
    this.process = true

    const fileData = await this.storageService.upload(selectedFile);
    if (fileData && fileData.length > 0) {
      commentData.files = fileData
    }
    const ref = this.ds.headerDocumentRef().doc(selectedDocument?.key).collection('documentCommentsInternal').doc(commentData?.key)
    commentData.hasSent = true
    ref.set(commentData, { merge: true }).then(() => {
      callback(true)
    }).catch(error => {
      callback(false)
    })
      .finally(() => {
        this.process = false
      })
  }

  @action
  async updateComment(selectedDocument: any | null, commentData: any, selectedFile, callback) {
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
  async fetchCriminalRecordDoc(documentKey: string, callback) {
    this.process = true
    this.ds.dbRef().collection("criminal_record").doc(documentKey).valueChanges().subscribe(doc => {
      this.process = false
      callback(doc)
    })
  }

  @action
  async updateLinkGroupCriminalRecord(document: any, selectedGroup: any, uid: any, callback) {
    this.process = true
    this.ds.dbRef().collection("criminal_record").doc(document.key).update({
      folder_key_ref: selectedGroup.key,
      link_group_by: uid,
      link_group_at: new Date(),
    }).then(() => {
      this.process = false
      callback(true, null)
    }).catch(error => {
      this.process = false
      callback(false, error)
    })
  }



  @observable getOfficerByWHSubscription: Subscription;
  @observable loading: boolean = true;
  @observable emptyOfficers: boolean = false;
  @observable officers: Array<any> = [];

  @action
  async fetchDocByFolder(groupKey: string) {
    this.loading = true;
    this.getOfficerByWHSubscription = this.ds
      .dbRef().collection("criminal_record", ref => ref.where("folder_key_ref", "==", groupKey))
      .valueChanges()
      .subscribe(
        (result) => {
          let index = 1;
          this.officers = result.map(
            (officer: any) => {
              officer.rowIndex = index; index++;
              return officer;
            });
          this.emptyOfficers = (this.officers.length === 0);
          this.loading = false;
        }
      );
  }

  @observable fetchDataRef: Subscription = null;
  @observable folderItem: any[] = [];
  @observable selectedFolder: any = null;
  @action
  fetchData(folderKey: any, callback?: (items: any[]) => void) {
    this.fetchDataRef?.unsubscribe()
    this.fetchDataRef = this.ds.criminalRecordRef(ref => ref.where('folder_key_ref', '==', folderKey).orderBy('folder_at')).valueChanges().subscribe(docs => {
      this.folderItem = docs;
      callback?.(this.folderItem)
    })
  }

  @action
  async subscribeData() {
    this.fetchDataRef?.unsubscribe()
    this.selectedFolder = null;
    this.folderItem = [];
    Promise.resolve()
  }

  @action approveFolderBatch(criminal: any[], callback: (status: any) => void) {
    this.loading = true;
    const batch = this.ds.batch()
    const docs = criminal?.filter(m=>m?.criminal?.key)
    docs.map(e => {
      batch.set(this.ds.criminalRecordRef().doc(e.criminal?.key).ref, e.criminal, { merge: true })
      batch.set(this.ds.criminalRecordsMovementRef().doc(e.movement?.key).ref, e.movement, { merge: true })
    })
    batch.commit().then(() => {
      callback(true)
    }).catch((error) => {
      alert("Unexpected Issue")
    }).finally(() => this.process = false);
  }

  @action approveCriminalRecordTopM(criminal: any, movement: any, callback) {
    this.loading = true
    const batch = this.ds.batch()
    batch.set(this.ds.criminalRecordRef().doc(criminal?.key).ref, criminal, { merge: true })
    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch((error) => {
      alert("Unexpected Issue")
    }).finally(() => this.process = false);
  }

  @action
  async approvalFolderByOwner(form: any, selectedFolder: any, employee, currentDepartment, callback: (status: boolean, error: string) => void) {
    this.process = true
    
    console.log("form",form)
    console.log("selectedFolder",selectedFolder)
    console.log("employee",employee)
    console.log("currentDepartment",currentDepartment)

    const movement: IHeaderMovement = {
      key: this.ds.createId(),
      created_at: new Date(),
      created_by: employee.key,
      documentKey: selectedFolder?.key || "",
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment)
    }

    const batch = this.ds.batch()
    const movementRef = this.ds.firestore().collection("criminal_record_folder_header_movement").doc(movement?.key)
    const ref = this.ds.firestore().collection("criminal_record_folder").doc(selectedFolder?.key)
    batch.set(ref, { ...form }, { merge: true });
    batch.set(movementRef, movement, { merge: true });

    batch.commit().then(() => {
      callback(true, null)
    }).catch((error) => {
      alert("Unexpected Issue")
    }).finally(() => this.process = false);
  }

  selected_language_obj_to_form_value(selected_language) {
    const khmer_form = selected_language.find(f => f?.key == 1) ? true : false;
    const khmer_amount = selected_language.find(f => f?.key == 1)?.amount || 1;
    const france_form = selected_language.find(f => f?.key == 2) ? true : false;
    const france_amount = selected_language.find(f => f?.key == 2)?.amount || 1;
    const english_form = selected_language.find(f => f?.key == 3) ? true : false;
    const english_amount = selected_language.find(f => f?.key == 3)?.amount || 1;

    return {
      khmer_form: khmer_form,
      khmer_amount: khmer_amount,
      france_form: france_form,
      france_amount: france_amount,
      english_form: english_form,
      english_amount: english_amount,
    }
  }

  @action
  async removeFileCriminalRecord(itemKey: any, attachments: Array<any>, fileRemove: any, callback) {
    this.process = true;
    const fileDoc = attachments.filter(m => m.key !== fileRemove.key);

    await this.storage.deleteFile(fileRemove);
    this.ds.dbRef().collection("criminal_record").doc(itemKey).update({ attachments: fileDoc }).then(() => {
      this.process = false;
      callback(true, null)
    }).catch(error => {
      this.process = false;
      callback(false, error)
    })
  }

  @action
  async saveFileCriminalRecord(selectedCriminalRecord: any, callback) {
    this.process = true;
    const { attachments } = selectedCriminalRecord

    const fileDoc: any[] = [];
    if (this.SELECTED_FILES.length > 0) {
      for (let index = 0; index < this.SELECTED_FILES.length; index++) {
        const element = this.SELECTED_FILES[index];
        const { file, docType } = element
        this.START_UPLOAD = true;
        const soundPath = `/files/${this.ds.createId()}_${file.name}`;
        const soundTask = this.storage.uploadSelectedFile(file, soundPath);
        this.uploadPercent = soundTask.percentageChanges();
        const downloadURL: any = (await soundTask.then(async (f) => {
          return f.ref.getDownloadURL()
        }));

        let fileType = file.type.split('/').slice(0, -1).join('/');
        const fileInfo = {
          filename: soundPath,
          name: file.name,
          downloadUrl: downloadURL,
          fileType: file.type,
          type: fileType,
          fileSize: file.size,
          key: this.ds.createId(),
        }
        const itemFile: any = {
          ...fileInfo,
          key: fileInfo.key,
          docType: docType
        }
        fileDoc.push(itemFile)
        this.START_UPLOAD = false;
      }
    }

    let attachmentData = attachments || []
    attachmentData = attachments.concat(fileDoc);

    this.ds.dbRef().collection("criminal_record").doc(selectedCriminalRecord?.key).update({ attachments: attachmentData }).then(() => {
      this.process = false;
      this.SELECTED_FILES = [];
      callback(true, attachmentData)
    }).catch(error => {
      this.process = false;
      callback(false, attachmentData)

    })
  }

  async getCitizen(citizenKey) {
    const ref = this.ds.dbRef().collection("citizens").doc(citizenKey).get().toPromise();
    const citizenData = pushToObject(await ref);
    return citizenData;
  }
  async getCriminalRecordFolder(folderKey: string){
    const ref = this.ds.criminalRecordFolderRef().doc(folderKey).get().toPromise();
    return pushToObject(await ref)
  }
  updateCustomerReceiveDateStr(str: string,folderKey: string){
    this.ds.criminalRecordFolderRef().doc(folderKey).update({customer_receive_date_str: str})
  }


  @action
  async getSelectedEmbassy(key: string) {
    const docs = await this.ds.embassyRef().doc(key).get().toPromise()
    return pushToObject(docs)
  }

  setDraftApplication(list){
    const newList = list?.map(m=>{
      const key = this.ds.createId()
      return {...m, key: key}
    })
    console.log(newList?.map(m=>m?.key))

    newList?.map((m,index)=>{
      this.ds.criminalRecordRef().doc(m?.key).set(m)
      console.log(index)
    })
  }

  async saveCriminalRecord(data) {
    return await this.ds.criminalRecordsRef().doc(data?.key).set(data, { merge: true })
  }

  fetchOverseaRef: Subscription = null;
  @action
  async fetchOverseaApplication(status, statusMoreThan,callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    try{
      this.fetchOverseaRef = this.ds.overseaListingRef(null,status, statusMoreThan).valueChanges().subscribe(docs => {
        this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
        this.empty = this.data.length === 0;
        this.lastVisible = null;
        if (docs.length >= APPS.size) {
          this.lastVisible = this.data[this.data.length - 1];
        }
        callback?.(this.data)
      })
    }catch(error){
      console.log('error',error)
    }
  }

  @action
  fetchOverseaApplicationMore(status, statusMoreThan,callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchOverseaRef?.unsubscribe()
        this.fetchOverseaRef = this.ds.overseaListingRef(this.lastVisible, status,statusMoreThan).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async getSearchOversea(status, statusMoreThan : any , keyword: string, callback?: (items: any) => void) {
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const { config } = this.auth;
    const departmentKey = config.department_labor?.key
    const docsRef = this.ds.molPaymentSearchListingRef(status, statusMoreThan, departmentKey, keyword).get()
    let docs = pushToArray(await docsRef?.toPromise())
    this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
    if (this.searchResult.length === 0) {
      this.emptySearch = true;
    }
    callback?.(this.searchResult)
    this.searching = false;
  }


  saveCriminalOverseaAttachPDF(criminal: any){
    const batch = this.ds.batch();
    const { currentDepartment, employee, config } = this.auth;
    batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).ref, criminal, { merge: true });
    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),

      attachment_pdf: criminal?.attachment_pdf,

      criminalRecordKeyRef: criminal?.key,
      criminalStatus: criminal?.status,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: criminal?.decree_status || null,
      decree_result: criminal?.decree_result || null,

      internal_status: criminal?.internal_status || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }
    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)
    return batch.commit()
  }

  saveWithdrawCriminalRecord(criminal: any){
    const batch = this.ds.batch();
    const { currentDepartment, employee, config } = this.auth;
    batch.set(this.ds.criminalRecordsRef().doc(criminal?.key).ref, criminal, { merge: true });
    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),
      criminalRecordKeyRef: criminal?.key,
      criminalStatus: criminal?.status,
      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,
      decree_status: criminal?.decree_status || null,
      decree_result: criminal?.decree_result || null,
      internal_status: criminal?.internal_status || null,
      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }
    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)
    return batch.commit()
  }

  // async resolveUserCriminalRecord(){
  //   const users = pushToArray(await this.ds.usersRef().get().toPromise())
  //   console.log('users',users?.filter(f=>f?.criminal_record))
  //   // const batch = this.ds.batch()
  //   // users?.filter(f=>f?.key)?.map(m=>{
  //   //   const ref = this.ds.usersRef().doc(m?.key).ref
  //   //   batch.update(ref,{criminal_record: null})
  //   // })
  //   // batch.commit().then(()=>{
  //   //   console.log('done')
  //   // })
  // }

  // async resolveCitizenCriminalRecord(){
  //   const citizens = pushToArray(await this.ds.citizensRef().get().toPromise())
  //   const batch = this.ds.batch()
  //   citizens?.filter(f=>f?.key)?.map(m=>{
  //     const ref = this.ds.citizensRef().doc(m?.key).ref
  //     batch.update(ref,{criminal_record_ref: null,criminal_record: null})
  //   })
  //   batch.commit().then(()=>{
  //     console.log('done')
  //   })
  // }

  // async clearCriminalRecord(){
  //   const criminal = pushToArray(await this.ds.criminalRecordRef(ref=>ref.limit(500)).get().toPromise())
  //   console.log('criminal',criminal)
  //   if(criminal?.length === 500){
  //     return;
  //   }
  //   const batch = this.ds.batch()
  //   criminal.map(m=>{
  //     const ref = this.ds.criminalRecordRef().doc(m?.key).ref
  //     batch.delete(ref)
  //   })
  //   if(criminal?.length < 500){
  //     batch.commit().then(()=>{
  //       console.log('done')
  //     })
  //   }
  // }

  async checkReceipt(keys){
    const ref = this.ds.paymentReceiptRef(ref=>ref?.where('key','in',keys))
    return pushToArray(await ref.get().toPromise())
  }

  async getPaymentOptions(){
    const ref = this.ds.paymentOptionRef().get().toPromise();
    return pushToArray(await ref)
  }


  async fetchFilterDropdownData(
    collectionName: string,
    text: any,
    orderField: string,
  ) {
    const query = this.db.collectionRef(collectionName,ref=>{
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

  async getCountry(){
    return pushToArray(await this.ds.countriesRef().get().toPromise())
  }

  async getEmbassyByCountryKey(ckey: string){
    const ref = this.db.collectionRef('embassy',ref=>ref.where('country.key','==',ckey))
    return  pushToArray(await ref.get().toPromise())
  }

  async getCriminalInvoice(key: string){
    const ref = this.ds.paymentReceiptRef(ref=>ref.where('criminalRef','==',key).limit(1))
    return (pushToArray(await ref.get().toPromise()))?.[0]
  }

  async getInvoiceNumber(){
    const { config, serverDateTime } = this.auth;
    const { payment_receipt_number, payment_receipt_month_key } = config;
    const monthKey = toMonthReceiptKey(serverDateTime);
    let num = monthKey === payment_receipt_month_key ? payment_receipt_number : 1
    const number = num?.toString()?.padStart(6,'0')
    await this.ds.settingsRef().update({
      payment_receipt_number: monthKey === payment_receipt_month_key ? this.db.fireFieldValue().increment(1) : 1,
      payment_receipt_month_key: monthKey
    })
    return `${monthKey}${number}`
  }

  async createInvoiceCriminal(ref:string ,total: number, payment_option: any, bank_option: any,criminal: any, invoice_key:string,invoice_id:string,invoice_created_at: any){
    const { serverDateTime } = this.auth;
    let invoiceId = invoice_id
    if(!invoiceId){
      invoiceId = await this.getInvoiceNumber();
    }
    const invoice: any = {
      key: invoice_key,
      invoice_id: invoiceId,
      isDelete: false,
      created_at: invoice_created_at?.toDate() || serverDateTime,
      created_by: this.getMappedProfile(),
      updated_at: serverDateTime,
      date_key: toDateKey(invoice_created_at?.toDate() || serverDateTime),
      page_key: pageKey(),

      status: STATUS_OBJ.PENDING,

      urgent_obj: criminal?.urgent_obj,
      criminal_language: criminal?.criminal_language,
      apply_from: criminal?.apply_from,
      isStudent: criminal?.isStudent || false,
      national_application: criminal?.national_application,
      bank_option: bank_option,
      payment_option: payment_option,
      total_amount: total,
      criminalRef: ref,
    }

    const batch = this.ds.batch()
    const invoiceRef = this.ds.paymentReceiptRef().doc(invoice?.key).ref
    batch.set(invoiceRef,invoice, {merge: true})
    const criminalRef = this.ds.criminalRecordRef().doc(criminal?.key).ref
    batch.set(criminalRef,criminal, {merge: true})
    return batch.commit()
  }

  saveManualPaid(criminal,movement,invoice){
    const batch = this.ds.batch();
    const criminalRef = this.ds.criminalRecordRef().doc(criminal?.key).ref
    const movementRef = this.ds.criminalRecordsMovementRef().doc(movement?.key).ref
    const invoiceRef = this.ds.paymentReceiptRef().doc(invoice?.key).ref
    batch.set(criminalRef,criminal ,{merge: true})
    batch.set(movementRef,movement ,{merge: true})
    batch.set(invoiceRef,invoice ,{merge: true})
    return batch.commit()
  }

  saveManualPaidNoMoment(criminal,invoice){
    const batch = this.ds.batch();
    const criminalRef = this.ds.criminalRecordRef().doc(criminal?.key).ref
    const invoiceRef = this.ds.paymentReceiptRef().doc(invoice?.key).ref
    batch.set(criminalRef,criminal ,{merge: true})
    batch.set(invoiceRef,invoice ,{merge: true})
    return batch.commit()
  }


  fetchPaidOnlineRef: Subscription = null;
  @action
  async fetchCriminalPaidOnline(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    await this.fetchPaidOnlineRef?.unsubscribe()
    this.lastVisible = null;
    this.fetchPaidOnlineRef = this.ds.paidOnlineListingRef(status?.key, null,statusMoreThan).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalPaidOnline(status: any, applicationType: any, urgent: boolean, online: any, statusMoreThan: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchPaidOnlineRef?.unsubscribe()
        const { currentDepartment, dataEntryOnly } = this.auth;
        const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
        this.fetchPaidOnlineRef = this.ds.paidOnlineListingRef(status?.key, this.lastVisible,statusMoreThan).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  saveCriminalStartProcess(criminal: any, process_date: Date ){
    const batch = this.ds.batch();
    const { currentDepartment, employee, config } = this.auth;
    // let withdraw_date = workingDay(holidays, serverDateTime, criminal?.urgent_obj?.key || 20)

    let payment_option = criminal?.payment_option
    if((criminal?.paid_remark?.length == 14) && (!criminal?.payment_option?.name?.includes("Credit"))){
      payment_option = {
        ...criminal?.payment_option,
        name : "Credit/Debit Card",
        name_kh : "ប័ណ្ណឥណទាន"
      }
    }else if((criminal?.paid_remark?.length != 14) && criminal?.payment_option?.name?.includes("Credit")) {
      payment_option = {
        ...criminal?.payment_option,
        name : "ACLEDA PAY(Can process payment from all Bakong Participated Banks)",
        name_kh : "​អេស៊ីលីដា(អាចទូទាត់បានគ្រប់ធនាគាទាំងអស់ដែលជាសមាជិករបស់បាគង)"
      }
    }
    const data = {
      key: criminal?.key,
      issue_process_at: this.db.serverTimestamp(),
      start_process_at : process_date,
      start_process_by : this.getMappedProfile(),
      // withdraw_date: withdraw_date,
      // withdraw_date_key: toDateKey(withdraw_date),
      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
      status: STATUS_OBJ?.START_PROCESS,
      payment_option : payment_option,
    }
    batch.update(this.ds.criminalRecordsRef().doc(data?.key).ref, data);
    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),

      criminalRecordKeyRef: criminal?.key,
      criminalStatus: STATUS_OBJ?.START_PROCESS,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: criminal?.decree_status || null,
      decree_result: criminal?.decree_result || null,

      internal_status: criminal?.internal_status || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }
    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)
    return batch.commit()
  }

  async getPaidOnlineNotYetProcess(){
    const queryRef = this.ds.criminalRecordRef(ref=>ref.where('paid_online','==',true).where('status.key','==',STATUS_OBJ.PAID.key).orderBy('paid_at'))
    const docs = pushToArray(await queryRef?.get().toPromise())
    return docs || []
  }

  searchPaidOnlineApplication(receiptRef: string){
    const queryRef = this.ds.criminalRecordRef(ref=>ref.where('receipt_ref','==',receiptRef).limit(1))
    return queryRef
  }

  searchPaidOnlineApplicationKeyword(str: string){
    const queryRef = this.ds.criminalRecordRef(ref=>ref.where('paid_online','==',true).where('keyword','array-contains',str).limit(50))
    return queryRef
  }

  async getReceipts(keys: string[]){
    const chunkSize = 10;
    const chunkItems = [];
    let docs = []
    for (let i = 0; i < keys?.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);
      chunkItems.push(chunk);
    }
    for await(let item of chunkItems){
      const ref = this.ds.paymentReceiptRef (ref=>ref.where('key','in',item)).get();
      const data = pushToArray(await ref.toPromise());
      docs = docs?.concat(data);
    }
    return docs;
  }

  updateDateProcessDoc(criminal: any,process_date: any,withdraw_date:any){
    const data = {
      key: criminal?.key,
      issue_process_at: this.db.serverTimestamp(),
      start_process_at : process_date,
      start_process_by : this.getMappedProfile(),
      withdraw_date: withdraw_date,
      withdraw_date_key: toDateKey(withdraw_date),
      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }
    return this.ds.criminalRecordsRef().doc(data?.key).update(data)
  }

  fetchPaidOnlinePeriodRef: Subscription = null;
  @action
  async fetchPaidOnlinePeriod(startPeriod: any, endPeriod: any, callback?: (items: any) => void) {
    await this.fetchPaidOnlinePeriodRef?.unsubscribe()
    this.lastVisible = null;
    this.fetchPaidOnlinePeriodRef = this.ds.paidOnlinePeriod(endPeriod,null).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalPaidOnlinePeriod(endPeriod: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchPaidOnlinePeriodRef?.unsubscribe()
        this.fetchPaidOnlinePeriodRef = this.ds.paidOnlinePeriod(endPeriod,this.lastVisible).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  fetchPaidOnlineDraftPeriodRef: Subscription = null;
  @action
  fetchPaidOnlineDraftPeriod(callback?: (items: any) => void) {
    this.fetchPaidOnlineDraftPeriodRef?.unsubscribe()
    this.lastVisible = null;
    this.fetchPaidOnlineDraftPeriodRef = this.ds.paidOnlineDraft(null).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  fetchMoreCriminalPaidOnlineDraftPeriod(callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchPaidOnlineDraftPeriodRef?.unsubscribe()
        this.fetchPaidOnlineDraftPeriodRef = this.ds.paidOnlineDraft(this.lastVisible).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  updateCriminalRecord(data){
    const ref = this.ds.criminalRecordRef().doc(data?.key);
    return ref.update(data);
  }
  
  @action
  createNewDocumentForVerify(criminal,language_key: number){
    console.log('criminal', criminal);

    const ref = this.ds.criminalDocumentVerify()
    const cri_ref = this.ds.criminalRecordRef().doc(criminal?.key).ref
    const batch = this.ds.batch();
    let headerData: any = {
      do_verify: true,
    }
    switch(language_key){
      case CRIMINAL_APPLICATION_LANGUAGE?.KHMER?.key :
        const default_kh = `<p><span style="font-family:Fasthand, Fasthand;font-size:22px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ឈ្មោះខាងលើនេះ </span><span style="font-family:'Times New Roman';font-size:22px;">( <span style="font-family:Fasthand, Fasthand;font-size:22px; font-weight:bold;"> ${criminal?.last_name}  ${criminal?.first_name} </span> )</span><span style="font-family:Fasthand, Fasthand;font-size:22px;"> ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕</span></p>`
        const kh_data = {
          key : this.ds.createId(),
          created_at: this.ds.serverTimestamp(),
          created_by: this.getMappedProfile(),

          criminal_header_key: criminal?.key,
          criminal_language_key: CRIMINAL_APPLICATION_LANGUAGE?.KHMER?.key,
          name: ((criminal?.last_name||'')+' '+(criminal?.first_name||'')),
          nickname: hasWhiteSpace(criminal?.nickname) ? criminal?.nickname : '/' ,
          gender: criminal?.gender?.name ,
          originNationality: criminal?.before_nationality?.kh_nationality ,
          currentNationality: criminal?.current_nationality?.kh_nationality ,
          placeOfBirth: mapBirthAddressCriminalRecord(criminal),
          dateOfBirth: mapDobCriminalRecord(criminal),
          currentAddress: mapCurrentAddressCriminalRecord(criminal),
          occupation: criminal?.occupation ,
          fatherName: criminal?.father_name? criminal?.father_name : "មិនដឹង",
          fatherDateOfBirth: (criminal?.fatherIsDead?.key !== STATUS_LIVES.DEAD.key) ? mapFatherDobCriminalRecord(criminal) : "(ស្លាប់)",
          fatherOriginNationality: criminal?.father_before_nationality?.kh_nationality?criminal?.father_before_nationality?.kh_nationality:'/',
          fatherCurrentNationality: criminal?.father_current_nationality?.kh_nationality?criminal?.father_current_nationality?.kh_nationality:'/',
          fatherPlaceOfBirth: mapFatherBirthAddressCriminalRecord(criminal),
          motherName: criminal?.mother_name ? criminal?.mother_name : 'មិនដឹង' ,
          motherDateOfBirth: (criminal?.motherIsDead?.key !== STATUS_LIVES.DEAD.key) ? mapMotherDobCriminalRecord(criminal) : "(ស្លាប់)",
          motherOriginNationality: criminal?.mother_before_nationality?.kh_nationality?criminal?.mother_before_nationality?.kh_nationality:'/',
          motherCurrentNationality: criminal?.mother_current_nationality?.kh_nationality?criminal?.mother_current_nationality?.kh_nationality:'/',
          motherPlaceOfBirth: mapMotherBirthAddressCriminalRecord(criminal),
          partnerName: criminal?.spouse || '/' ,
          partnerOccupation: criminal?.spouseCurrentOccupation || '/' ,
          partnerDateOfBirth: (criminal?.spouseIsDead?.key !== STATUS_LIVES.DEAD.key) ? mapSpouseDobCriminalRecord(criminal) : "(ស្លាប់)",
          partnerOriginNationality: criminal?.spouse_before_nationality?.kh_nationality || '/' ,
          partnerCurrentNationality: criminal?.spouse_current_nationality?.kh_nationality || '/' ,
          confirmationNote: htmlToText(criminal?.decree_result?.name ? criminal?.decree_result?.name : default_kh ),
          issueDate: toDateTextKhmer(criminal?.criminal_letter_date?.toDate() || new Date()),
          expiredDate: "",
        }
        batch.set(ref.doc(kh_data.key).ref, kh_data, {merge: true})
        headerData = {
          ...headerData,
          verify_qr_kh: null,
        }
        if(!criminal?.criminal_letter_date){
          headerData.criminal_letter_date = new Date();
        }
        break;

      case CRIMINAL_APPLICATION_LANGUAGE?.ENGLISH?.key :
        const decree_en = `<p><span style="font-family:'Times New Roman';font-size:26px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The above-mentioned person (<strong>${nameEnTransformer(criminal)}</strong>) does not have any imprisonment record that shall be registered in Bulletin Number 3 of criminal record held by the Ministry of Justice until &nbsp;the date of issuance of this Bulletin.</span></p>`
        const  eng_data = {
          key : this.ds.createId(),
          created_at: this.ds.serverTimestamp(),
          created_by: this.getMappedProfile(),

          criminal_header_key: criminal?.key,
          criminal_language_key: CRIMINAL_APPLICATION_LANGUAGE?.ENGLISH?.key,
          name: nameEnTransformer(criminal),
          nickname: criminal?.nick_name_en ? criminalEnStringUpperCase(criminal?.nick_name_en) : '/' ,
          gender: criminal?.gender?.name_en ,
          originNationality: criminal?.before_nationality?.en_nationality ? criminal?.before_nationality?.en_nationality ==='Cambodian'?'Khmer' : criminal?.before_nationality?.en_nationality : '/',
          currentNationality: criminal?.current_nationality?.en_nationality ? criminal?.current_nationality?.en_nationality ==='Cambodian'?'Khmer' : criminal?.current_nationality?.en_nationality : '/',
          placeOfBirth: criminal?.foreignerPlaceOfBirth_en || '/',
          dateOfBirth: criminalDobEn(criminal),
          currentAddress: criminal?.permanentAddressText_en || '/',
          occupation: criminal?.occupation_en || '/' ,
          fatherName: criminal?.father_name_en || '/' ,
          fatherDateOfBirth: criminal?.fatherIsDead?.key !== STATUS_LIVES.DEAD.key ? criminalFatherDobEn(criminal) : "(Deceased)",
          fatherOriginNationality: criminal?.father_before_nationality?.en_nationality ? criminal?.father_before_nationality?.en_nationality === 'Cambodian'?'Khmer':  criminal?.father_before_nationality?.en_nationality :'/',
          fatherCurrentNationality: criminal?.father_current_nationality?.en_nationality ? criminal?.father_current_nationality?.en_nationality === 'Cambodian'?'Khmer':  criminal?.father_current_nationality?.en_nationality :'/',
          fatherPlaceOfBirth: criminal?.foreignerFatherBirthAddress_en || '/',
          motherName: criminal?.mother_name_en || '/' ,
          motherDateOfBirth: criminal?.motherIsDead?.key !== STATUS_LIVES.DEAD.key ? criminalMotherDobEn(criminal) : "(Deceased)",
          motherOriginNationality: criminal?.mother_before_nationality?.en_nationality ? criminal?.mother_before_nationality?.en_nationality === 'Cambodian' ? 'Khmer' : criminal?.mother_before_nationality?.en_nationality :'/',
          motherCurrentNationality: criminal?.mother_current_nationality?.en_nationality ? criminal?.mother_current_nationality?.en_nationality === 'Cambodian' ? 'Khmer' : criminal?.mother_current_nationality?.en_nationality :'/',
          motherPlaceOfBirth: criminal?.foreignerMotherBirthAddress_en || '/',
          partnerName: criminal?.spouse_en || '/',
          partnerOccupation: criminal?.spouseCurrentOccupation_en || '/' ,
          partnerDateOfBirth: criminal?.spouseIsDead?.key !== STATUS_LIVES.DEAD.key ?  criminalSpouseDobDobEn(criminal) : "(Deceased)",
          partnerOriginNationality: criminal?.spouse_before_nationality ? criminal?.spouse_before_nationality?.en_nationality==='Cambodian'?'Khmer': criminal?.spouse_before_nationality?.en_nationality || '/' : '/',
          partnerCurrentNationality: criminal?.spouse_current_nationality ? criminal?.spouse_current_nationality?.en_nationality==='Cambodian'?'Khmer': criminal?.spouse_current_nationality?.en_nationality || '/' : '/',
          confirmationNote: htmlToText(criminal?.decree_result?.name_en ? criminal?.decree_result?.name_en : decree_en),
          issueDate: formatCriminalDateEn(criminal?.criminal_letter_date?.toDate() || new Date() )  ,
          expiredDate: "",
        }
        batch.set(ref.doc(eng_data.key).ref, eng_data, {merge: true})
        headerData = {
          ...headerData,
          verify_qr_en: null,
        }
        if(!criminal?.criminal_letter_date){
          headerData.criminal_letter_date = new Date();
        }
        break;

      case CRIMINAL_APPLICATION_LANGUAGE?.FRENCH?.key :
        const decree_fr = `<p><span style="font-family:'Times New Roman';font-size:26px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; La personne précitée ( </span><span style="font-family:'Times New Roman';font-size:26px;"><strong>${nameEnTransformer(criminal)}</strong></span><span style="font-family:'Times New Roman';font-size:26px;"> ) &nbsp;n'a pas d'antécédents de condamnation à prison devant figurer sur le bulletin no 3 du casier judiciaire déposé au ministère de la Justice à partir de la date de publication ce bulletin.</span></p>`
        const gender = GENDER_DATA.find(f=>f?.key === criminal?.gender?.key);
        const fr_data = {
          key : this.ds.createId(),
          created_at: this.ds.serverTimestamp(),
          created_by: this.getMappedProfile(),

          criminal_header_key: criminal?.key,
          criminal_language_key: CRIMINAL_APPLICATION_LANGUAGE?.FRENCH?.key,
          name: nameEnTransformer(criminal),
          nickname: criminal?.nick_name_en ? criminalEnStringUpperCase(criminal?.nick_name_en) : '/' ,
          gender: gender?.name_fr ,
          originNationality: criminal?.before_nationality?.fr_nationality ? criminal?.before_nationality?.fr_nationality ==='Cambodian'?'Khmer' : criminal?.before_nationality?.fr_nationality : '/',
          currentNationality: criminal?.current_nationality?.fr_nationality ? criminal?.current_nationality?.fr_nationality ==='Cambodian'?'Khmer' : criminal?.current_nationality?.fr_nationality : '/',
          placeOfBirth: criminal?.foreignerPlaceOfBirth_fr || '/',
          dateOfBirth: criminalDobEn(criminal),
          currentAddress: criminal?.permanentAddressText_fr || '/',
          occupation: criminal?.occupation_fr || '/' ,
          fatherName: criminal?.father_name_en || '/' ,
          fatherDateOfBirth: criminal?.fatherIsDead?.key !== STATUS_LIVES.DEAD.key ? criminalFatherDobEn(criminal) : "(Deceased)",
          fatherOriginNationality: criminal?.father_before_nationality?.fr_nationality ? criminal?.father_before_nationality?.fr_nationality === 'Cambodgien'?'Khmère':  criminal?.father_before_nationality?.fr_nationality :'/',
          fatherCurrentNationality: criminal?.father_current_nationality?.fr_nationality ? criminal?.father_current_nationality?.fr_nationality === 'Cambodgien'?'Khmère':  criminal?.father_current_nationality?.fr_nationality :'/',
          fatherPlaceOfBirth: criminal?.foreignerFatherBirthAddress_en || '/',
          motherName: criminal?.mother_name_en || '/' ,
          motherDateOfBirth: criminal?.motherIsDead?.key !== STATUS_LIVES.DEAD.key ? criminalMotherDobEn(criminal) : "(Deceased)",
          motherOriginNationality: criminal?.mother_before_nationality?.fr_nationality ? criminal?.mother_before_nationality?.fr_nationality === 'Cambodgien'?'Khmère' : criminal?.mother_before_nationality?.fr_nationality :'/',
          motherCurrentNationality: criminal?.mother_current_nationality?.fr_nationality ? criminal?.mother_current_nationality?.fr_nationality === 'Cambodgien'?'Khmère' : criminal?.mother_current_nationality?.fr_nationality :'/',
          motherPlaceOfBirth: criminal?.foreignerMotherBirthAddress_en || '/',
          partnerName: criminal?.spouse_en || '/',
          partnerOccupation: criminal?.spouseCurrentOccupation_en || '/' ,
          partnerDateOfBirth: criminal?.spouseIsDead?.key !== STATUS_LIVES.DEAD.key ?  criminalSpouseDobDobEn(criminal) : "(Deceased)",
          partnerOriginNationality: criminal?.spouse_before_nationality ? criminal?.spouse_before_nationality?.fr_nationality==='Cambodgien'?'Khmère': criminal?.spouse_before_nationality?.fr_nationality || '/' : '/',
          partnerCurrentNationality: criminal?.spouse_current_nationality ? criminal?.spouse_current_nationality?.fr_nationality==='Cambodgien'?'Khmère': criminal?.spouse_current_nationality?.fr_nationality || '/' : '/',
          confirmationNote: htmlToText(criminal?.decree_result?.name_fr ? criminal?.decree_result?.name_fr:decree_fr),
          issueDate: formatCriminalDateFr(criminal?.criminal_letter_date?.toDate() || new Date())  ,
          expiredDate: "",
        }
        batch.set(ref.doc(fr_data.key).ref, fr_data, {merge: true})
        headerData = {
          ...headerData,
          verify_qr_fr: null,
        }

        if(!criminal?.criminal_letter_date){
          headerData.criminal_letter_date = new Date();
        }

        break;
      default:
        break;
    }
    batch.update(cri_ref,headerData)
    return batch.commit();
  }


  fetchSearchDoExpireRef: Subscription = null;
  @action
  fetchSearchDoExpireListing(applicationType: any, urgent: boolean, online: any, searchString: string, status: any, callback?: (items: any) => void) {
    this.fetchSearchDoExpireRef?.unsubscribe()
    this.searchResult = [];
    this.emptySearch = false;
    this.searching = true;
    const { currentDepartment, dataEntryOnly,selected_application_embassy } = this.auth;
    const departmentKey = dataEntryOnly ? currentDepartment?.key : null;
    this.fetchSearchDoExpireRef = this.ds.criminalSearchDoExpireListingRef(applicationType?.key || null, urgent || false, searchString, online || null, status, departmentKey,selected_application_embassy).valueChanges().subscribe(docs => {
      this.searchResult = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      if (this.searchResult.length === 0) {
        this.emptySearch = true;
      }
      callback?.(this.searchResult)
      this.searching = false;
    })
  }

  @action
  async getDocumentVerify(verify_key: string){
    const ref = this.ds.criminalDocumentVerify(ref=>ref.where('verify_key', '==' ,verify_key).limit(1))
    const docs = pushToArray(await ref.get().toPromise())
    return docs?.[0] || null
  }

  fetchCriminalRequestApprovalRef: Subscription = null
  fetchCriminalApprovedRef: Subscription = null
  fetchCriminalRejectedRef: Subscription = null
  fetchCriminalRejectedToWorkplaceRef: Subscription = null
  fetchCriminalIssuedRef: Subscription = null
  fetchCriminalDoExpireListingRef: Subscription = null
  @action
  async fetchCriminalDoExpireListing(applicationType: any | null, callback: (items: any) => void) {
    await this.unsubscribe();
    this.lastVisible = null;
    this.data = null;
    this.fetchCriminalDoExpireListingRef = this.ds.criminalDoExpireListingRef(applicationType?.key , null).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (this.data?.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }

  @action
  async fetchMoreCriminalDoExpireListing(applicationType: any, callback: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        await this.unsubscribe();
        this.fetchCitizensRef = this.ds.criminalDoExpireListingRef(applicationType?.key, this.lastVisible).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  async findApplicationFromReceiptKey(receiptKey: string){
    try{
      const receipt = await this.ds.paymentReceiptRef().doc(receiptKey).get().toPromise();
      const receiptDoc = pushToObject(receipt);
      if(!receiptDoc.criminalRef) return null;
      const application = await this.ds.criminalRecordRef().doc(receiptDoc.criminalRef).get().toPromise();
      return pushToObject(application);
    }catch(e){
      return null;
    }
  }

  @action
  async getDigitalFlowFirst(){
    const ref = await this.ds.criminalFlowRef(ref=>ref?.where('category.key','==',DOCUMENT_FLOW_CATEGORY.digital.key).orderBy('flowNo')).get().toPromise();
    return pushToArray(ref);
  }

  @action
  async fetchCriminalRequestApprovalData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    const token = this.startListing();
    await this.unsubscribe();
    this.lastVisible = null;
    this.data = null;
    let sub: Subscription = null;
    sub = this.ds.criminalRequestApprovalListingRef(workplaceKey, null, applicationTypeKey).valueChanges().subscribe(docs => {
      // a snapshot of a listing the officer already left must not repaint the current tab
      if (this.isStaleListing(token)) {
        sub?.unsubscribe();
        return;
      }
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (this.data?.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
    this.fetchCriminalRequestApprovalRef = sub;
  }

  @action
  async fetchMoreCriminalRequestApprovalData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        const token = this.listingToken;
        this.fetchCriminalRequestApprovalRef?.unsubscribe();
        let moreSub: Subscription = null;
        moreSub = this.ds.criminalRequestApprovalListingRef(workplaceKey, this.lastVisible, applicationTypeKey).valueChanges().subscribe(data => {
          if (this.isStaleListing(token)) {
            moreSub?.unsubscribe();
            return;
          }
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
        this.fetchCriminalRequestApprovalRef = moreSub;
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async fetchCriminalApprovedData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    const token = this.startListing();
    await this.unsubscribe();
    this.lastVisible = null;
    this.data = null;
    let sub: Subscription = null;
    sub = this.ds.criminalApprovedListingRef(workplaceKey, null, applicationTypeKey).valueChanges().subscribe(docs => {
      // a snapshot of a listing the officer already left must not repaint the current tab
      if (this.isStaleListing(token)) {
        sub?.unsubscribe();
        return;
      }
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (this.data?.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
    this.fetchCriminalApprovedRef = sub;
  }

  @action
  async fetchMoreCriminalApprovedData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        const token = this.listingToken;
        this.fetchCriminalApprovedRef?.unsubscribe();
        let moreSub: Subscription = null;
        moreSub = this.ds.criminalApprovedListingRef(workplaceKey, this.lastVisible, applicationTypeKey).valueChanges().subscribe(data => {
          if (this.isStaleListing(token)) {
            moreSub?.unsubscribe();
            return;
          }
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
        this.fetchCriminalApprovedRef = moreSub;
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async fetchCriminalIssuedData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    const token = this.startListing();
    await this.unsubscribe();
    this.lastVisible = null;
    this.data = null;
    let sub: Subscription = null;
    sub = this.ds.criminalIssuedListingRef(workplaceKey, null, applicationTypeKey).valueChanges().subscribe(docs => {
      // a snapshot of a listing the officer already left must not repaint the current tab
      if (this.isStaleListing(token)) {
        sub?.unsubscribe();
        return;
      }
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (this.data?.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
    this.fetchCriminalIssuedRef = sub;
  }

  @action
  async fetchMoreCriminalIssuedData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        const token = this.listingToken;
        this.fetchCriminalIssuedRef?.unsubscribe();
        let moreSub: Subscription = null;
        moreSub = this.ds.criminalIssuedListingRef(workplaceKey, this.lastVisible, applicationTypeKey).valueChanges().subscribe(data => {
          if (this.isStaleListing(token)) {
            moreSub?.unsubscribe();
            return;
          }
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
        this.fetchCriminalIssuedRef = moreSub;
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async fetchCriminalRejectedData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    const token = this.startListing();
    await this.unsubscribe();
    this.lastVisible = null;
    this.data = null;
    let sub: Subscription = null;
    sub = this.ds.criminalRejectedListingRef(workplaceKey, null, applicationTypeKey).valueChanges().subscribe(docs => {
      // a snapshot of a listing the officer already left must not repaint the current tab
      if (this.isStaleListing(token)) {
        sub?.unsubscribe();
        return;
      }
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (this.data?.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
    this.fetchCriminalRejectedRef = sub;
  }

  @action
  async fetchMoreCriminalRejectedData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        const token = this.listingToken;
        this.fetchCriminalRejectedRef?.unsubscribe();
        let moreSub: Subscription = null;
        moreSub = this.ds.criminalRejectedListingRef(workplaceKey, this.lastVisible, applicationTypeKey).valueChanges().subscribe(data => {
          if (this.isStaleListing(token)) {
            moreSub?.unsubscribe();
            return;
          }
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
        this.fetchCriminalRejectedRef = moreSub;
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async fetchCriminalRejectedToWorkplaceData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    const token = this.startListing();
    await this.unsubscribe();
    this.lastVisible = null;
    this.data = null;
    if (!workplaceKey) {
      this.data = [];
      this.empty = true;
      callback?.(this.data);
      return;
    }
    let sub: Subscription = null;
    sub = this.ds.criminalRejectedToWorkplaceListingRef(workplaceKey, null, applicationTypeKey).valueChanges().subscribe(docs => {
      // a snapshot of a listing the officer already left must not repaint the current tab
      if (this.isStaleListing(token)) {
        sub?.unsubscribe();
        return;
      }
      this.data = docs?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (this.data?.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
    this.fetchCriminalRejectedToWorkplaceRef = sub;
  }

  @action
  async fetchMoreCriminalRejectedToWorkplaceData(workplaceKey: string, callback: (items: any) => void, applicationTypeKey?: number) {
    try {
      if (!this.lastVisible || !workplaceKey) {
        return;
      } else {
        const token = this.listingToken;
        this.fetchCriminalRejectedToWorkplaceRef?.unsubscribe();
        let moreSub: Subscription = null;
        moreSub = this.ds.criminalRejectedToWorkplaceListingRef(workplaceKey, this.lastVisible, applicationTypeKey).valueChanges().subscribe(data => {
          if (this.isStaleListing(token)) {
            moreSub?.unsubscribe();
            return;
          }
          const docs = data?.map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data?.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data?.length - 1]
          } else {
            this.lastVisible = null;
          }
          callback?.(this.data)
        })
        this.fetchCriminalRejectedToWorkplaceRef = moreSub;
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  rejectCriminalRecordDigitalFlow(criminal: Partial<ICriminalRecord>){
    const { currentDepartment, employee, config } = this.auth;
    const batch = this.ds.batch();
    batch.update(this.ds.criminalRecordsRef().doc(criminal?.key).ref, criminal);

    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),
      criminalRecordKeyRef: criminal?.key,
      citizenKeyRef: criminal?.citizen_ref,
      criminalStatus: criminal?.status,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: criminal?.decree_status || null,
      decree_result: criminal?.decree_result || null,
      internal_status: criminal?.internal_status || null,

      reject_reason: criminal?.reject_reason || null,
      reject_to_workplace: criminal?.reject_to_workplace || null,

      default_stampFile: employee?.stampFile || null,
      default_remarkFile: employee?.signatureFile || null,
      default_signatureFile: employee?.signatureFile || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }

    console.log("movement",movement)
    console.log("criminal",criminal)

    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)
    return batch.commit();
  }

  @action
  approvalCriminalRecordDigitalFlow(criminal: Partial<ICriminalRecord>){
    const { currentDepartment, employee, config, uid } = this.auth;
    const batch = this.ds.batch();
    batch.update(this.ds.criminalRecordsRef().doc(criminal?.key).ref, criminal);

    const movement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: criminal?.updated_by,
      profile: toEmployee(employee, true),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment),
      criminalRecordKeyRef: criminal?.key,
      citizenKeyRef: criminal?.citizen_ref,
      criminalStatus: criminal?.status,

      criminalCategory: criminal?.criminal_record_category,
      criminalSkipWorkplace: config?.criminal_record_category_labor?.key === criminal?.criminal_record_category?.key,

      decree_status: criminal?.decree_status || null,
      decree_result: criminal?.decree_result || null,
      internal_status: criminal?.internal_status || null,

      default_stampFile: employee?.stampFile || null,
      default_remarkFile: employee?.signatureFile || null,
      default_signatureFile: employee?.signatureFile || null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    }

    console.log("criminal",criminal);
    console.log("movement",movement);

    batch.set(this.ds.criminalRecordsMovementRef().doc(movement?.key).ref, movement)
    return batch.commit();
  }

}