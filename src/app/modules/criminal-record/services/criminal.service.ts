import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/compat/firestore";
import { AuthStore } from "src/app/stores/auth.store";
import firebase from 'firebase/compat/app';
import { APPS } from "src/app/dummy/config";
import { STATUS_OBJ } from "src/app/dummy/appinfo";
import { addDay } from "src/app/shared/services/convert.service";

@Injectable({
    providedIn: 'root'
})
export class CriminalService {

    constructor(
      private db: AngularFirestore,
      private auth: AuthStore
    ){}

    publicHolidayRef(ref?: QueryFn) {
        return this.db.collection("public_holiday", ref);
    }

    settingsRef() {
        return this.db.collection('settings').doc('config')
    }

    // one doc per letter number counter: settings/letter1, settings/letter2, settings/letter3_business
    latterNoSettingRef(key: string) {
        return this.db.collection('settings').doc<any>(key)
    }

    criminalFlowRef(ref?: QueryFn) {
        return this.db.collection('criminal_flow', ref)
    }

    criminalRecordCategoryRef(ref?: QueryFn) {
        return this.db.collection('criminal_record_categories', ref)
    }

    nationalityRef(ref?: QueryFn) {
        return this.db.collection('countries', ref)
    }

    decreeNotedRef(ref?: QueryFn) {
        return this.db.collection('criminal_notes', ref)
    }


    departmentsRef(ref?: QueryFn) {
        return this.db.collection('department', ref)
    }

    criminalRecordsRef(ref?: QueryFn) {
        return this.db.collection('criminal_record', ref)
    }

    criminalRecordsMovementRef(ref?: QueryFn) {
        return this.db.collection('criminal_record_movements', ref)
    }

    citizensRef(ref?: QueryFn) {
        return this.db.collection('citizens', ref)
    }

    criminalAdjustmentsRef(ref?: QueryFn) {
        return this.db.collection('criminal_adjustments', ref)
    }


    citizensListingRef(nationalKhmerKey: any, lastVisible: any) {
        return this.db.collection('citizens', ref => {
            let whereRef = ref.where('status.key', '==', STATUS_OBJ.ACTIVE.key).where('application_type.key','==',3)
            if (nationalKhmerKey) {
                whereRef = whereRef.where('current_nationality.key', '==', nationalKhmerKey)
            } else {
                whereRef = whereRef.where('current_nationality.key', '!=', nationalKhmerKey).orderBy('current_nationality.key')
            }
            if (lastVisible) {
                whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            } else {
                whereRef = whereRef.orderBy('created_at')
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalRecordUserListingRef(uid: string, lastVisible: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('citizen_ref', '==', uid)
            if (lastVisible) {
                whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            } else {
                whereRef = whereRef.orderBy('created_at')
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalAssistantListingRef(lastVisible: any, status: any, entry_by: any,entry_officer_type:number | null, orderDESC:boolean) {
      return this.db.collection('criminal_record', ref => {
          let whereRef = ref
            .where('status.key', '>=', status?.key || STATUS_OBJ.CONFIRM_APPLICATION.key)
            .where('application_type.key', 'in', [2, 3])
            .orderBy('status.key')
          if (entry_by) {
            whereRef = whereRef.where('entry_by.key', '==', entry_by)
          }
          if(entry_officer_type) {
            whereRef = whereRef.where('entry_officer_type.key','==',entry_officer_type)
          }
          if (lastVisible) {
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc').startAfter(lastVisible?.status?.key,lastVisible?.created_at)
          } else {
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc')
          }
          return whereRef.limit(APPS.size)
      })
    }

    criminalMolPaymentListingRef(lastVisible: any,departmentKey: any, status: any , statusMoreThan: any , orderDESC:boolean) {
      return this.db.collection('criminal_record', ref => {
        let whereRef = null
        if(statusMoreThan === ">="){
          whereRef = ref.where('status.key',statusMoreThan, status?.key).where('workplace_entry.key', '==', departmentKey).where('application_type.key','==',3).orderBy('status.key')
        }else{
          whereRef = ref.where('status.key',statusMoreThan, status?.key).where('workplace_entry.key', '==', departmentKey).where('application_type.key','==',3)
        }
        if (lastVisible) {
          if(statusMoreThan === ">="){
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc').startAfter(lastVisible?.status?.key,lastVisible?.created_at)
          }else{
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc').startAfter(lastVisible?.created_at)
          }
        } else {
          whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc')
        }
        return whereRef.limit(APPS.size)
      })
    }

    criminalAssistantPaymentListingRef(lastVisible: any, status: any , statusMoreThan: any , orderDESC:boolean) {
      return this.db.collection('criminal_record', ref => {
        let whereRef = null
        if(statusMoreThan === ">="){
          whereRef = ref.where('status.key',statusMoreThan, status?.key).where('entry_officer_type.key', '==', 3).where('application_type.key','==',3).orderBy('status.key')
        }else{
          whereRef = ref.where('status.key',statusMoreThan, status?.key).where('entry_officer_type.key', '==', 3).where('application_type.key','==',3)
        }
        if (lastVisible) {
          if(statusMoreThan === ">="){
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc').startAfter(lastVisible?.status?.key,lastVisible?.created_at)
          }else{
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc').startAfter(lastVisible?.created_at)
          }
        } else {
          whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc')
        }
        return whereRef.limit(APPS.size)
      })
    }

    criminalLaborListingRef(lastVisible: any,departmentKey: any, status: any, entry_by: any, orderDESC:boolean) {
      return this.db.collection('criminal_record', ref => {
          const defaultStatusKey = departmentKey ? STATUS_OBJ.DRAFT.key : STATUS_OBJ.CONFIRM_APPLICATION.key
          let whereRef = ref
            .where('status.key', '>=', status?.key || defaultStatusKey)
            .where('application_type.key', 'in', [2, 3])
            .orderBy('status.key')
          if (departmentKey) {
              whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
          }
          if (entry_by) {
            whereRef = whereRef.where('entry_by.key', '==', entry_by)
          }
          if (lastVisible) {
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc').startAfter(lastVisible?.status?.key,lastVisible?.created_at)
          } else {
            whereRef = whereRef.orderBy('created_at', orderDESC ? 'desc' : 'asc')
          }
          return whereRef.limit(APPS.size)
      })
    }

    criminalListingRef(applicationTypeKey: number, urgent: boolean, lastVisible: any, online: any, departmentKey: any, status: any, isRecipient: boolean, whereOperator: any, entry_by: any, entry_officer_type : number | null,orderDESC:boolean, selected_application_embassy: any) {
        return this.db.collection('criminal_record', ref => {
            const applicationTypeFilter = (q: any) => applicationTypeKey
                ? q.where('application_type.key', '==', applicationTypeKey)
                : q.where('application_type.key', 'in', [2, 3])
            let whereRef = applicationTypeFilter(ref.where('status.key', whereOperator || '>=', status?.key || STATUS_OBJ.CONFIRM_APPLICATION.key)).orderBy('status.key')
            if (whereOperator === '==') {
                whereRef = applicationTypeFilter(ref.where('status.key', '==', status?.key || STATUS_OBJ.CONFIRM_APPLICATION.key))
            }
            if (departmentKey) {
                whereRef = applicationTypeFilter(ref.where('status.key', whereOperator || '>=', status?.key || STATUS_OBJ.DRAFT.key).orderBy('status.key').where('workplace_entry.key', '==', departmentKey))
                if (whereOperator === '==') {
                    whereRef = applicationTypeFilter(ref.where('status.key', whereOperator, status?.key || STATUS_OBJ.DRAFT.key).where('workplace_entry.key', '==', departmentKey))
                }
            }
            if (isRecipient) {
                whereRef = applicationTypeFilter(ref.where('status.key', whereOperator || '>=', STATUS_OBJ.PAID_UN_FILLED.key).orderBy('status.key'))
                if (whereOperator === '==') {
                    whereRef = applicationTypeFilter(ref.where('status.key', '==', STATUS_OBJ.PAID_UN_FILLED.key))
                }
            }
            if (typeof online === 'boolean') {
                whereRef = whereRef.where('apply', '==', online)
            }
            if (entry_by) {
              whereRef = whereRef.where(isRecipient ? 'paid_by.key' : 'entry_by.key', '==', entry_by)
            }
            if (urgent) {
                whereRef = whereRef.where('urgent', '==', urgent)
            }
            if(entry_officer_type){
              whereRef = whereRef.where('entry_officer_type.key', '==', entry_officer_type)
            }
            if(selected_application_embassy){
              if (whereOperator === '==') {
                whereRef = applicationTypeFilter(ref.where('status.key', '==', status?.key))
              }
              whereRef = whereRef.where('application_embassy.key', '==', selected_application_embassy?.key)
            }
            if (lastVisible) {
              whereRef = whereRef.orderBy('created_at', (isRecipient||orderDESC) ? 'desc' : 'asc').startAfter(lastVisible?.status?.key,lastVisible?.created_at)
            } else {
              whereRef = whereRef.orderBy('created_at', (isRecipient||orderDESC) ? 'desc' : 'asc')
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalAssistantSearchListingRef(searchString: string, entry_by: string, entry_officer_type?: number) {
      return this.db.collection('criminal_record', ref => {
          let whereRef = ref.where('status.key', '>=', STATUS_OBJ.DRAFT.key).orderBy('status.key')
          if (entry_by) {
            whereRef = ref.where('entry_by.key', '==', entry_by)
          }
          if(entry_officer_type){
            whereRef = ref.where('entry_officer_type.key','==',entry_officer_type)
          }
          if (searchString) {
              whereRef = whereRef.where('keyword', 'array-contains', searchString)
          }
          return whereRef.orderBy('created_at').limit(10)
      })
    }

    criminalLaborHandlerSearchListingRef(searchString: string, departmentKey: string ) {
      return this.db.collection('criminal_record', ref => {
          let whereRef = ref.where('status.key', '>=', STATUS_OBJ.DRAFT.key).where('application_type.key','in',[2, 3]).orderBy('status.key')
          if(departmentKey){
            whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
          }
          if (searchString) {
              whereRef = whereRef.where('keyword', 'array-contains', searchString)
          }
          return whereRef.orderBy('created_at').limit(10)
      })
    }

    criminalSearchListingRef(applicationTypeKey: number, urgent: boolean, searchString: string, online: any, status: any, departmentKey: string,selected_application_embassy: any) {
        return this.db.collection('criminal_record', ref => {
            const applicationTypeFilter = (q: any) => applicationTypeKey
                ? q.where('application_type.key', '==', applicationTypeKey)
                : q.where('application_type.key', 'in', [2, 3])
            let whereRef = applicationTypeFilter(ref.where('status.key', '>=', STATUS_OBJ.DRAFT.key)).orderBy('status.key')
            if (status?.key) {
                whereRef = applicationTypeFilter(ref.where('status.key', '<=', status?.key)).orderBy('status.key')
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (typeof online === 'boolean') {
                whereRef = whereRef.where('apply', '==', online)
            }
            if (urgent) {
                whereRef = whereRef.where('urgent', '==', urgent)
            }
            if(selected_application_embassy){
              whereRef = applicationTypeFilter(ref.where('status.key', '>=', STATUS_OBJ.PAID.key).orderBy('status.key')
              .where('application_embassy.key', '==', selected_application_embassy?.key))
            }
            if (searchString) {
                whereRef = whereRef.where('keyword', 'array-contains', searchString)
            }
            return whereRef.orderBy('created_at').limit(10)
        })
    }

    criminalSearchListingLetter1Ref(urgent: boolean, searchString: string, online: any, status: any, departmentKey: string,selected_application_embassy: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '>=', STATUS_OBJ.DRAFT.key).where('application_type.key','==',1).orderBy('status.key')
            if (status?.key) {
                whereRef = ref.where('status.key', '<=', status?.key).where('application_type.key','==',1).orderBy('status.key')
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (typeof online === 'boolean') {
                whereRef = whereRef.where('apply', '==', online)
            }
            if (urgent) {
                whereRef = whereRef.where('urgent', '==', urgent)
            }
            if(selected_application_embassy){
              whereRef =  ref.where('status.key', '>=', STATUS_OBJ.PAID.key).orderBy('status.key')
              .where('application_embassy.key', '==', selected_application_embassy?.key).where('application_type.key','==',1)
            }
            if (searchString) {
                whereRef = whereRef.where('keyword', 'array-contains', searchString)
            }
            return whereRef.orderBy('created_at').limit(10)
        })
    }

    criminalSearchListingLetter2Ref(urgent: boolean, searchString: string, online: any, status: any, departmentKey: string,selected_application_embassy: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '>=', STATUS_OBJ.DRAFT.key).where('application_type.key','==',2).orderBy('status.key')
            if (status?.key) {
                whereRef = ref.where('status.key', '<=', status?.key).where('application_type.key','==',2).orderBy('status.key')
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (typeof online === 'boolean') {
                whereRef = whereRef.where('apply', '==', online)
            }
            if (urgent) {
                whereRef = whereRef.where('urgent', '==', urgent)
            }
            if(selected_application_embassy){
              whereRef =  ref.where('status.key', '>=', STATUS_OBJ.PAID.key).orderBy('status.key')
              .where('application_embassy.key', '==', selected_application_embassy?.key).where('application_type.key','==',2)
            }
            if (searchString) {
                whereRef = whereRef.where('keyword', 'array-contains', searchString)
            }
            return whereRef.orderBy('created_at').limit(10)
        })
    }

    molPaymentSearchListingRef(status, statusMoreThan, departmentKey, keyword ) {
      return this.db.collection('criminal_record', ref => {
        let whereRef = ref.where('status.key', statusMoreThan, status?.key).where('workplace_entry.key','==',departmentKey).where('keyword', 'array-contains', keyword).orderBy('status.key').where('application_type.key','==',3)
        return whereRef.orderBy('created_at').limit(30)
      })
    }

    assistantPaymentSearchListingRef(status, statusMoreThan, keyword ) {
      return this.db.collection('criminal_record', ref => {
        let whereRef = ref.where('status.key', statusMoreThan, status?.key).where('entry_officer_type.key', '==', 3).where('keyword', 'array-contains', keyword).orderBy('status.key').where('application_type.key','==',3)
        return whereRef.orderBy('created_at').limit(30)
      })
    }

    criminalRecordsListingByOfficerRef(statusKey: number, applicationTypeKey: number, urgent: boolean, lastVisible: any, online: any, statusMoreThan?: any, departmentKey?: any, uid?: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '==', statusKey).where('isDelete','==',false).where('application_type.key','==',3);
            if (uid) {
                whereRef = whereRef.where('officerVerifyRef.key', '==', uid)
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (statusMoreThan) {
                if (uid) {
                    whereRef = ref.where('status.key', statusMoreThan, statusKey).where('officerVerifyRef.key', '==', uid).orderBy('status.key').where('application_type.key','==',3)
                } else {
                    whereRef = ref.where('status.key', statusMoreThan, statusKey).orderBy('status.key').where('application_type.key','==',3)
                }
            }
            if (lastVisible) {
                whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            } else {
                whereRef = whereRef.orderBy('created_at')
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalRecordsListingByOfficerLetter1Ref(statusKey: number, urgent: boolean, lastVisible: any, online: any, statusMoreThan?: any, departmentKey?: any, uid?: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '==', statusKey).where('isDelete','==',false).where('application_type.key','==',1);
            if (uid) {
                whereRef = whereRef.where('officerVerifyRef.key', '==', uid)
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (statusMoreThan) {
                if (uid) {
                    whereRef = ref.where('status.key', statusMoreThan, statusKey).where('officerVerifyRef.key', '==', uid).orderBy('status.key').where('application_type.key','==',1)
                } else {
                    whereRef = ref.where('status.key', statusMoreThan, statusKey).orderBy('status.key').where('application_type.key','==',1)
                }
            }
            if (lastVisible) {
                whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            } else {
                whereRef = whereRef.orderBy('created_at')
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalRecordsListingByOfficerLetter2Ref(statusKey: number, urgent: boolean, lastVisible: any, online: any, statusMoreThan?: any, departmentKey?: any, uid?: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '==', statusKey).where('isDelete','==',false).where('application_type.key','==',2);
            if (uid) {
                whereRef = whereRef.where('officerVerifyRef.key', '==', uid)
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (statusMoreThan) {
                if (uid) {
                    whereRef = ref.where('status.key', statusMoreThan, statusKey).where('officerVerifyRef.key', '==', uid).orderBy('status.key').where('application_type.key','==',2)
                } else {
                    whereRef = ref.where('status.key', statusMoreThan, statusKey).orderBy('status.key').where('application_type.key','==',2)
                }
            }
            if (lastVisible) {
                whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            } else {
                whereRef = whereRef.orderBy('created_at')
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalRecordsListingRef(statusKey: number, applicationTypeKey: number, urgent: boolean, lastVisible: any, online: any, statusMoreThan?: any, departmentKey?: any) {
      return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '==', statusKey)
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (statusMoreThan) {
                const scopedRef = departmentKey ? ref.where('workplace_entry.key', '==', departmentKey) : ref
                if (statusMoreThan === '<=') {
                    whereRef = scopedRef.where('status.key', '<=', statusKey).where('status.key', '>', STATUS_OBJ.DRAFT.key).orderBy('status.key')
                } else if (statusMoreThan === '<') {
                    // everything submitted but not yet reaching statusKey, drafts excluded
                    whereRef = scopedRef.where('status.key', '<', statusKey).where('status.key', '>', STATUS_OBJ.DRAFT.key).orderBy('status.key')
                } else if (statusMoreThan === '==') {
                    whereRef = scopedRef.where('status.key', '==', statusKey)
                } else {
                    whereRef = scopedRef.where('status.key', statusMoreThan || '>=', statusKey).orderBy('status.key')
                }
            }
            if (typeof online === 'boolean') {
                whereRef = whereRef.where('apply', '==', online)
            }
            if (applicationTypeKey) {
                whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
            }else{
                whereRef = whereRef.where('application_type.key', '==', 3)
            }
            if (urgent) {
                whereRef = whereRef.where('urgent', '==', urgent)
            }
            if (lastVisible) {
                whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            } else {
                whereRef = whereRef.orderBy('created_at')
            }
            return whereRef.limit(APPS.size)
        })
    }

    // letter 3 general: the ១២ថ្ងៃ / ២០ថ្ងៃ period tabs query on urgent_obj.key
    criminalRecordsListingByPeriodRef(statusKey: number, applicationTypeKey: number, urgentPeriodKey: number, lastVisible: any, statusMoreThan?: any, departmentKey?: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '==', statusKey)
            if (statusMoreThan) {
                if (statusMoreThan === '<') {
                    whereRef = ref.where('status.key', '<', statusKey).where('status.key', '>', STATUS_OBJ.DRAFT.key).orderBy('status.key')
                } else if (statusMoreThan === '==') {
                    whereRef = ref.where('status.key', '==', statusKey)
                } else {
                    whereRef = ref.where('status.key', statusMoreThan || '>=', statusKey).orderBy('status.key')
                }
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (applicationTypeKey) {
                whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
            }
            if (urgentPeriodKey) {
                whereRef = whereRef.where('urgent_obj.key', '==', urgentPeriodKey)
            }
            if (lastVisible) {
                whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            } else {
                whereRef = whereRef.orderBy('created_at')
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalRecordsListingDecreeDescRef(statusKey: number, applicationTypeKey: number, urgent: boolean, lastVisible: any, online: any, statusMoreThan?: any, departmentKey?: any) {
        return this.db.collection('criminal_record', ref => {
            let whereRef = ref.where('status.key', '==', statusKey)
            let orderByStatus = false;
            if (statusMoreThan) {
                if (statusMoreThan === '<=') {
                    whereRef = ref.where('status.key', '<=', statusKey).where('status.key', '>', STATUS_OBJ.DRAFT.key).orderBy('status.key')
                    orderByStatus = true;
                } else if (statusMoreThan === '==') {
                    whereRef = ref.where('status.key', '==', statusKey)
                } else {
                    whereRef = ref.where('status.key', statusMoreThan || '>=', statusKey).orderBy('status.key')
                    orderByStatus = true;
                }
            }
            if (departmentKey) {
                whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
            }
            if (typeof online === 'boolean') {
                whereRef = whereRef.where('apply', '==', online)
            }
            if (applicationTypeKey) {
                whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
            }else{
                whereRef = whereRef.where('application_type.key', '==', 3)
            }
            if (urgent) {
                whereRef = whereRef.where('urgent', '==', urgent)
            }
            whereRef = whereRef.orderBy('decree_at', 'desc')
            if (lastVisible) {
                whereRef = orderByStatus
                    ? whereRef.startAfter(lastVisible?.status?.key, lastVisible?.decree_at)
                    : whereRef.startAfter(lastVisible?.decree_at)
            }
            return whereRef.limit(APPS.size)
        })
    }

    criminalRecordsFolderListingRef(statusKey: number, applicationTypeKey: number, urgent: boolean, lastVisible: any, online: any, statusMoreThan?: boolean) {
        return this.db.collection('criminal_record_folder', ref => {
            let whereRef = ref.where('status.key', '==', statusKey).where('application_type.key','==',3)
            // if (statusMoreThan) {
            //     whereRef = ref.where('status.key', '>=', statusKey).orderBy('status.key')
            // }
            // if (typeof online === 'boolean') {
            //     whereRef = whereRef.where('apply', '==', online)
            // }
            // if (applicationTypeKey) {
            //     whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
            // }
            // if (urgent) {
            //     whereRef = whereRef.where('urgent', '==', urgent)
            // }
            // if (lastVisible) {
            //     whereRef = whereRef.orderBy('created_at').startAfter(lastVisible?.created_at)
            // } else {
            //     whereRef = whereRef.orderBy('created_at')
            // }
            return whereRef.limit(APPS.size)
        })
    }

    groupRequestFormRef(ref?: QueryFn) {
        return this.db.collection('criminal_record_folder', ref)
    }

    usersRef(ref?: QueryFn) {
        return this.db.collection('users', ref)
    }
    storesRef(ref?: QueryFn) {
        return this.db.collection('company', ref)
    }

    storeRef() {
        return this.db.collection('company').doc(this.auth?.selectedCompany?.key)
    }

    displayNameFn(user: any): string {
        return user?.name || null;
    }

    serverTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp()
    }

    firestore() {
        return this.db.firestore
    }

    dbRef() {
        return this.db
    }

    createId() {
        return this.db.createId()
    }

    batch() {
        return this.db.firestore.batch()
    }

    criminalRecordRef(ref?: QueryFn) {
        return this.db.collection('criminal_record', ref)
    }

    criminalRecordFolderRef(ref?: QueryFn) {
        return this.db.collection('criminal_record_folder', ref)
    }

    // citizensRef(ref?:QueryFn){
    //   return this.db.collection('citizens',ref)
    // }

    countriesRef(ref?: QueryFn) {
        return this.db.collection('countries', ref)
    }

    headerDocumentRef(ref?: QueryFn) {
        return this.db.collection<any>('documents_header', ref)
    }

    embassyRef(ref?: QueryFn) {
      return this.db.collection<any>('embassy', ref)
    }

    overseaListingRef(lastVisible: any, status: any , statusMoreThan: any) {
      return this.db.collection('criminal_record', ref => {
        let whereRef = ref.where('apply_from.key','==','oversea').where('application_type.key','==',3)
        if(statusMoreThan === ">="){
          whereRef = whereRef.where('status.key',statusMoreThan, status?.key).orderBy('status.key')
        }else{
          whereRef = whereRef.where('status.key',statusMoreThan, status?.key)
        }
        if (lastVisible) {
          if(statusMoreThan === ">="){
            whereRef = whereRef.orderBy('received_at', 'desc').startAfter(lastVisible?.status?.key,lastVisible?.received_at)
          }else{
            whereRef = whereRef.orderBy('paid_at', 'asc').startAfter(lastVisible?.paid_at)
          }
        } else {
          whereRef = whereRef.orderBy('paid_at', 'asc')
        }
        return whereRef.limit(APPS.size)
      })
    }

    overseaSearchListingRef(status, statusMoreThan, keyword ) {
      return this.db.collection('criminal_record', ref => {
        let whereRef = ref.where('apply_from.key','==','oversea').where('status.key', statusMoreThan, status?.key).where('keyword', 'array-contains', keyword).orderBy('status.key').where('application_type.key','==',3)
        return whereRef.orderBy('created_at').limit(30)
      })
    }

    paymentReceiptRef(ref?:QueryFn){
      return  this.db.collection('payment_receipt', ref)
    }


  paymentOptionRef(ref?: QueryFn){
    return this.db.collection<any>('payment_options',ref)
  }

  paidOnlineListingRef(statusKey: number,lastVisible: any,statusMoreThan?: any) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref.where('paid_online', '==', true).where('application_type.key','==',3)
        if (statusMoreThan !== "==") {
            if (statusMoreThan === '<=') {
                whereRef = whereRef.where('status.key', '<=', statusKey).where('status.key', '>', STATUS_OBJ.DRAFT.key).orderBy('status.key')
            } else if (statusMoreThan === '==') {
                whereRef = whereRef.where('status.key', '==', statusKey)
            } else {
                whereRef = whereRef.where('status.key', statusMoreThan || '>=', statusKey).orderBy('status.key')
            }
        }else{
          whereRef = whereRef.where('status.key', '==', statusKey)
        }
        if (lastVisible) {
          if (statusMoreThan !== "==") {
            whereRef = whereRef.orderBy('start_process_at','desc').startAfter([lastVisible?.status?.key,lastVisible?.start_process_at])
          }else{
            whereRef = whereRef.orderBy('paid_at').startAfter(lastVisible?.paid_at)
          }
        } else {
          if (statusMoreThan !== "==") {
            whereRef = whereRef.orderBy('start_process_at','desc')
          }else{
            whereRef = whereRef.orderBy('paid_at')
          }
        }
        return whereRef.limit(APPS.size)
      })

  }

  paidOnlinePeriod(endPeriod: any,lastVisible: any){
    return this.db.collection('criminal_record', ref => {
      let condition = ref.where('paid_online', '==', true).where('status.key','==',STATUS_OBJ.PAID?.key).where('paid_at','<=',endPeriod).orderBy('paid_at').where('application_type.key','==',3)
      if(lastVisible){
        condition = condition.startAfter(lastVisible) 
      }
      return condition.limit(APPS.size)
    })
  }

  paidOnlineDraft(lastVisible: any){
    const { serverDateTime } = this.auth
    const lastMonth = addDay(new Date(serverDateTime), -30).toDate();;
    return this.db.collection('criminal_record', ref => {
      let condition = ref.where('paid_online', '==', true).where("paid_at",">=",lastMonth).where('status.key','==',STATUS_OBJ.DRAFT?.key).where('application_type.key','==',3).orderBy("paid_at",'desc')
      if(lastVisible){
        condition = condition.startAfter(lastVisible) 
      }
      return condition.limit(APPS.size)
    })
  }

  criminalDocumentVerify(ref?:QueryFn){
    return this.db.collection('document_verify', ref)
  }

  criminalSearchDoExpireListingRef(applicationTypeKey: number, urgent: boolean, searchString: string, online: any, status: any, departmentKey: string,selected_application_embassy: any) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref.where('application_type.key','==',3).where('do_expire_at', '>', new Date('1/1/2000')).orderBy('do_expire_at','desc')
        if (departmentKey) {
            whereRef = whereRef.where('workplace_entry.key', '==', departmentKey)
        }
        if (typeof online === 'boolean') {
            whereRef = whereRef.where('apply', '==', online)
        }
        if (applicationTypeKey) {
            whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
        }
        if (urgent) {
            whereRef = whereRef.where('urgent', '==', urgent)
        }
        if (searchString) {
            whereRef = whereRef.where('keyword', 'array-contains', searchString)
        }
        return whereRef.limit(20)
    })
  }

  criminalRequestApprovalListingRef(workplaceKey: string, lastVisible: any, applicationTypeKey?: number) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref
          .where('request_approval_workplace_keys', 'array-contains', workplaceKey)
          .orderBy('last_approved_at', 'desc')
        if (applicationTypeKey) {
          whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
        }
        if (lastVisible) {
          whereRef = whereRef.startAfter(lastVisible?.last_approved_at)
        }
        return whereRef.limit(APPS.size)
    })
  }

  criminalApprovedListingRef(workplaceKey: string, lastVisible: any, applicationTypeKey?: number) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref
          .where('approved_workplaceKeys', 'array-contains', workplaceKey)
          .orderBy('last_approved_at', 'desc')
        if (applicationTypeKey) {
          whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
        }
        if (lastVisible) {
          whereRef = whereRef.startAfter(lastVisible?.last_approved_at)
        }
        return whereRef.limit(APPS.size)
    })
  }

  criminalIssuedListingRef(workplaceKey: string, lastVisible: any, applicationTypeKey?: number) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref
          .where('approved_workplaceKeys', 'array-contains', workplaceKey)
          .where('internal_status.key', '==', STATUS_OBJ.APPROVED.key)
          .orderBy('last_approved_at', 'desc')
        if (applicationTypeKey) {
          whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
        }
        if (lastVisible) {
          whereRef = whereRef.startAfter(lastVisible?.last_approved_at)
        }
        return whereRef.limit(APPS.size)
    })
  }

  criminalRejectedListingRef(workplaceKey: string, lastVisible: any, applicationTypeKey?: number) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref
          .where('rejected_workplaceKeys', 'array-contains', workplaceKey)
          .orderBy('last_approved_at', 'desc')
        if (applicationTypeKey) {
          whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
        }
        if (lastVisible) {
          whereRef = whereRef.startAfter(lastVisible?.last_approved_at)
        }
        return whereRef.limit(APPS.size)
    })
  }

  // records a later approver sent back to this workplace, waiting to be corrected and re-submitted
  criminalRejectedToWorkplaceListingRef(workplaceKey: string, lastVisible: any, applicationTypeKey?: number) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref
          .where('request_approval_workplace_keys', 'array-contains', workplaceKey)
          .where('internal_status.key', '==', STATUS_OBJ.INTERNAL_PROCESS_REJECT.key)
          .orderBy('last_approved_at', 'desc')
        if (applicationTypeKey) {
          whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
        }
        if (lastVisible) {
          whereRef = whereRef.startAfter(lastVisible?.last_approved_at)
        }
        return whereRef.limit(APPS.size)
    })
  }

  criminalDoExpireListingRef(applicationTypeKey: number, lastVisible: any) {
    return this.db.collection('criminal_record', ref => {
        let whereRef = ref.where('application_type.key','==',3).where('do_expire_at', '>', new Date('1/1/2000')).orderBy('do_expire_at','desc')
        if (applicationTypeKey) {
            whereRef = whereRef.where('application_type.key', '==', applicationTypeKey)
        }
        if (lastVisible) {
          whereRef = whereRef.startAfter(lastVisible?.do_expire_at)
        }
        return whereRef.limit(APPS.size)
    })
  }

}
