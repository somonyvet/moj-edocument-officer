import { ILeaveRequest } from 'src/app/interfaces/attendance';
import { IAttendance, IAttendanceCheckIn, IWorkingHour } from './../../interfaces/attendance';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { ICategory, IDepartment, IEcosystem, IHeaderInformation, IInstitution, IManagementLevel, IOfficer, IPosition, IProvince, IRanking, IRemarkOfficer, ISettings, IUserPined, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { APPS, DOCUMENT_TYPE_OBJECT } from 'src/app/dummy/config';
import firebase from 'firebase/compat/app';
import { docStatusObj, LIST_TYPE } from 'src/app/dummy/status';
import { IMmeProgram } from 'src/app/interfaces/mme';
@Injectable({
  providedIn: 'root'
})

export class DatabaseService {

  private messageSource = new BehaviorSubject<number>(0)
  currentMessage = this.messageSource.asObservable();

  private routeSource = new BehaviorSubject('')
  currentIDMessage = this.routeSource.asObservable();

  constructor(
    private db: AngularFirestore
  ) { }

  criminalRecordCategoryRef(ref?: QueryFn) {
    return this.db.collection('criminal_record_categories', ref)
  }

  settingsRef() {
    return this.db.collection('settings').doc<any>('config')
  }
  settingsMMERef() {
    return this.db.collection('settings_mme').doc<ISettings>('config')
  }

  fireFieldValue() {
    return firebase.firestore.FieldValue;
  }

  serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp()
  }

  displayFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  displayFnName(user: any): string {
    if (user) {
      const { profile } = user;
      return profile && profile.last_name && profile.first_name ? profile.last_name + profile.first_name : '';
    }
  }

  userRef(ref?: QueryFn) {
    return this.db.collection('users', ref)
  }

  userPinedRef(uid: string, ref?: QueryFn) {
    return this.db.collection('users').doc(uid).collection<IUserPined>('pinned_docs', ref)
  }

  documentRef(ref?: QueryFn) {
    return this.db.collection('documents', ref)
  }

  notificationsRef(ref?: QueryFn) {
    return this.db.collection('notifications', ref)
  }


  documentCommentRef(keyDoc: any, ref?: QueryFn) {
    return this.db.collection('documents').doc(keyDoc).collection('documentComments', ref);
  }

  viewersRef(headerKey: string) {
    return this.documentHeaderRef().doc(headerKey).collection('viewers')
  }

  documentHeaderRef(ref?: QueryFn) {
    return this.db.collection('documents_header', ref)
  }

  documentTemplateRef(ref?: QueryFn) {
    return this.db.collection('documents_template', ref)
  }
  fetchDocumentTemplateRef(id: string) {
    return this.db.collection('documents_template').doc(id)
  }

  documentStatisticRef(ref?: QueryFn) {
    return this.db.collection('documents_header_statistics', ref)
  }

  documentAccountPermissionRef(headerKey: string, ref?: QueryFn) {
    return this.db.collection('documents_header').doc(headerKey).collection('user_permission', ref)
  }

  documentAccountPermissionWorkplaceRef(headerKey: string, ref?: QueryFn) {
    return this.db.collection('documents_header').doc(headerKey).collection('user_permission_reports', ref)
  }

  replyDocumentRef(ref?: QueryFn) {
    return this.db.collection('documents_reply_reports', ref)
  }

  documentFileStreamRef(documentKey: string, ref?: QueryFn) {
    return this.db.collection('documents').doc(documentKey).collection('document_flow', ref)
  }

  headerDocumentRef(ref?: QueryFn) {
    return this.db.collection<IHeaderInformation>('documents_header', ref)
  }

  headerDocumentFileStreamRef(documentKey: string, ref?: QueryFn) {
    return this.db.collection('documents_header').doc(documentKey).collection('document_flow', ref)
  }

  headerDocumentOfficerCheckedRef(documentKey: string, ref?: QueryFn) {
    return this.db.collection('documents_header').doc(documentKey).collection('user_permission', ref)
  }

  headerDocumentMovementRef(ref?: QueryFn) {
    return this.db.collection('documents_header_movement', ref)
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


  //   @action documentListingRef(user: any, currentDepartment: IDepartment, listType: any) {
  //     let ref: any = documentHeaderRef()
  //     if (listType.key === LIST_TYPE.pinned_docs.key) {
  //         ref = usersRef().doc(user?.key).collection("pinned_docs").orderBy("created_at", "desc")
  //     } else if (listType.key === LIST_TYPE.recent_docs.key) {
  //         ref = usersRef().doc(user?.key).collection("recent_documents").orderBy("created_at", "desc")
  //     } else if (listType?.key === LIST_TYPE.signature_docs.key) {
  //         ref = documentHeaderRef().where("approvedByKeys", "array-contains", user?.key)
  //             .where("isDelete", "==", false).where("doc_status.key", ">=", docStatusObj.approvedByOffice.key);
  //     } else if (listType?.key === LIST_TYPE.agreed_docs.key) {
  //         ref = documentHeaderRef().where("peopleKeys", "array-contains", user?.key)
  //             .where("doc_status.key", ">=", currentDepartment?.ranking?.order)
  //             .orderBy("doc_status.key").orderBy('created_at', 'desc')
  //     } else if (listType?.key === LIST_TYPE.rejected_docs.key) {
  //         ref = documentHeaderRef().where("peopleKeys", "array-contains", user?.key)
  //             .where("doc_status.key", "==", docStatusObj.void.key).orderBy("created_at", "desc")
  //     }
  //     else if (listType?.key === LIST_TYPE.completed_doc.key) {
  //         ref = documentHeaderRef().where("peopleKeys", "array-contains", user?.key)
  //             .where("doc_status.key", "==", docStatusObj.final.key).orderBy("created_at", "desc")
  //     } else if (listType?.key === LIST_TYPE.already_approved_doc.key) {
  //         ref = documentHeaderRef().where("completedByKeys", "array-contains", user?.key).orderBy("created_at", "desc")
  //     } else if (listType?.key === LIST_TYPE.document_note.key) {
  //         ref = documentHeaderRef().where('peopleKeys', 'array-contains', user?.key)
  //             .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
  //             .orderBy('created_at', 'desc')
  //     }
  //     else if (listType?.key === LIST_TYPE.received_document.key) {
  //         ref = documentHeaderRef().where('receivedWorkplaceKeys', 'array-contains', user?.key).orderBy('created_at', 'desc')
  //     }
  //     else if (listType?.key === LIST_TYPE.urgent_docs.key) {
  //         ref = documentHeaderRef().where("peopleKeys", "array-contains", user?.key)
  //             .where("priority.key", "==", 2)
  //             .orderBy("doc_status.key")
  //             .orderBy("created_at", "desc")
  //     } else {
  //         ref = ref.orderBy("created_at", "desc")
  //     }
  //     return (ref)
  // }

  documentApprovalRef(uid: string, lastVisible: any, field: string, isReleased: boolean) {
    return this.db.collection('documents_header', ref => {
      let condition = ref
        .where("isDelete", "==", false)
        .where(field, "array-contains", uid)
      if (isReleased) {
        condition = condition.where('doc_status.key', '==', docStatusObj.released.key)
      } else {
        condition = condition.where('doc_status.key', '!=', docStatusObj.hold.key)
          .orderBy('doc_status.key')
      }
      if (lastVisible) {
        const { created_at } = lastVisible
        condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
      } else {
        condition = condition.orderBy('created_at', 'desc');
      }
      return condition.limit(APPS.size);
    });
  }

  documentListingRef(user: any, currentDepartment: any, listType: any, lastVisible: any) {
    switch (listType.key) {
      case LIST_TYPE.pinned_docs.key:

        return this.db.collection("users").doc(user.key).collection('pinned_docs', ref => {
          let condition = ref.orderBy('created_at', 'desc')
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.recent_docs.key:

        return this.db.collection("users").doc(user.key).collection('recent_documents', ref => {
          let condition = ref.orderBy('created_at', 'desc')
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.signature_docs.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where("approvedByKeys", "array-contains", user?.key)
            // .where("doc_status.key", ">=", docStatusObj.approvedByOffice.key)
            .orderBy('created_at', 'desc')
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.agreed_docs.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where("peopleKeys", "array-contains", user?.key)
            .where("doc_status.key", ">=", currentDepartment?.ranking?.order)
            .orderBy("doc_status.key")
            .orderBy('created_at', 'desc')
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.rejected_docs.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where("peopleKeys", "array-contains", user?.key)
            .where("doc_status.key", "==", docStatusObj.void.key)
            .orderBy("created_at", "desc")
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.completed_doc.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where("peopleKeys", "array-contains", user?.key)
            .where("doc_status.key", "==", docStatusObj.final.key)
            .orderBy("created_at", "desc")
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.not_completed_doc.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where('workplace.key', '==', currentDepartment?.key)
            .where("final", "==", true)
            .where("doc_status.key", "==", docStatusObj.released.key)
            .where("isDelete", "==", false)
            .orderBy('created_at', 'desc')
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.already_approved_doc.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where("completedByKeys", "array-contains", user?.key)
            .orderBy("created_at", "desc")
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.not_yet_approved_doc.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where("approvedByKeys", "array-contains", user?.key)
            .orderBy("doc_status.key")
            .orderBy("created_at")
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.document_note.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where('peopleKeys', 'array-contains', user?.key)
            .where('doc_type.key', '==', DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key)
            .orderBy('created_at', 'desc')
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.received_document.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where('receivedWorkplaceKeys', 'array-contains', user?.key)
            .orderBy('created_at', 'desc')
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      case LIST_TYPE.urgent_docs.key:

        return this.db.collection('documents_header', ref => {
          let condition = ref
            .where("isDelete", "==", false)
            .where("peopleKeys", "array-contains", user?.key)
            .where("priority.key", "==", 2)
            .orderBy("doc_status.key")
            .orderBy("created_at", "desc")
          if (lastVisible) {
            const { created_at } = lastVisible
            condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
          }
          return condition.limit(APPS.size);
        });

      default:
        break;
    }
    return this.db.collection('documents_header', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { created_at } = lastVisible
        condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
      }
      return condition.orderBy('node').orderBy('order').limit(APPS.size);
    });
  }

  departmentRef(lastVisible: any) {
    return this.db.collection<IDepartment>('department', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { created_at } = lastVisible
        condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
      }
      return condition.orderBy('node').orderBy('order').limit(APPS.size);
    });
  }

  departmentDBRef(lastVisible: any) {
    return this.db.collection<IDepartment>('department', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { created_at } = lastVisible
        condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
      }
      return condition.orderBy('node').orderBy('order') //.limit(APPS.size);
    });
  }
  programRef(lastVisible?: any) {
    return this.db.collection<any>('mme_program', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { created_at } = lastVisible
        condition = condition.orderBy('created_at', 'desc').startAfter(created_at)
      }
      return condition.orderBy('node').orderBy('order').limit(APPS.size);
    });
  }

  departmentFireRef(ref?: QueryFn) {
    return this.db.collection<IDepartment>('department', ref);
  }
  programFireRef(ref?: QueryFn) {
    return this.db.collection<any>('mme_program', ref);
  }
  institutionFireRef(ref?: QueryFn) {
    return this.db.collection<any>('institution', ref);
  }


  companyFireRef(ref?: QueryFn) {
    return this.db.collection<any>('company', ref);
  }

  rankingRef(lastVisible?: any) {
    return this.db.collection<IRanking>('ranking', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('order').startAfter(order)
      } else {
        condition = condition.orderBy('order')
      }
      return condition.limit(APPS.size);
    });
  }

  officersRef(statusKey: number, workplaceKey: string, lastVisible?: any, search?: string) {
    return this.db.collection<IOfficer>('officers', ref => {
      let condition = ref.where('isDelete', '==', false).where('status.key', '==', statusKey)
      if (search) {
        condition = condition.where('keyword', 'array-contains', search)
      } else if (workplaceKey) {
        condition = condition.where('officeKeys', 'array-contains', workplaceKey)
      }
      if (lastVisible) {
        const { created_at } = lastVisible
        condition = condition.orderBy('created_at').startAfter(created_at)
      } else {
        condition = condition.orderBy('created_at')
      }
      return condition.limit(APPS.size);
    });
  }

  userAccountRef(text?: string, lastVisible?: any) {
    return this.db.collection<IOfficer>('officers', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (text) {
        condition = condition.where("keyword", "array-contains", text.toUpperCase())
      }
      if (lastVisible) {
        const { officerIdNo } = lastVisible
        condition = condition.orderBy('officerIdNo').startAfter(officerIdNo)
      } else {
        condition = condition.orderBy('officerIdNo')
      }
      return condition.limit(APPS.size);
    });
  }


  documentsTemplateRef(workplaceKey, lastVisible?: any) {
    return this.db.collection<any>('documents_template', ref => {
      let condition = ref.where('isDelete', '==', false)
      // .where('workplace.key','==', workplaceKey)
      if (lastVisible) {
        const { documentNo } = lastVisible
        condition = condition.orderBy('documentNo').startAfter(documentNo)
      } else {
        condition = condition.orderBy('documentNo')
      }
      return condition.limit(APPS.size);
    });
  }

  officerRef(ref?: QueryFn) {
    return this.db.collection<IOfficer | any>('officers', ref)
  }

  officerFireRef() {
    return this.firestore().collection('officers');
  }

  officerByDepartmentRef(departmentKey: string, workingHourKey: string, lastVisible?: any) {
    return this.db.collection<IOfficer>('officers', ref => {
      let condition = ref.where('isDelete', '==', false);
      // .where('workingHourKey', '==', null);
      if (departmentKey) condition = condition.where('officeKeys', 'array-contains', departmentKey);
      if (lastVisible) {
        const { officerId } = lastVisible;
        condition = condition.orderBy('officerId').startAfter(officerId);
      } else {
        condition = condition.orderBy('officerId');
      }
      // return condition.limit(APPS.size);
      return condition;
    });
  }

  officerByWorkingHourRef(workingHourKey: string, lastVisible?: any) {
    return this.db.collection<IOfficer>('officers', ref => {
      let condition = ref.where('isDelete', '==', false);
      if (workingHourKey) condition = condition.where('workingHourKey', '==', workingHourKey);
      if (lastVisible) {
        const { officerId } = lastVisible;
        condition = condition.orderBy('officerId').startAfter(officerId);
      } else {
        condition = condition.orderBy('officerId');
      }
      // return condition.limit(APPS.size);
      return condition;
    });
  }

  registrationFormRef(ref?: QueryFn) {
    return this.db.collection<any>('officers', ref)
  }

  officerMMERef(ref?: QueryFn) {
    return this.db.collection<IOfficer | any>('officers_mme', ref)
  }

  officerPositionMovementRef(ref?: QueryFn) {
    return this.db.collection<IOfficer>('officers_position_movement', ref)
  }

  officerMMEPositionMovementRef(ref?: QueryFn) {
    return this.db.collection<IOfficer>('officers_mme_position_movement', ref)
  }

  rankingFireRef(ref?: QueryFn) {
    return this.db.collection<IRanking>('ranking', ref);
  }

  managementLevelRef(lastVisible?: any) {
    return this.db.collection<IManagementLevel>('management_level', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('order').startAfter(order)
      } else {
        condition = condition.orderBy('order')
      }
      return condition.limit(APPS.size);
    });
  }

  ecosystemRef(lastVisible?: any) {
    return this.db.collection<IEcosystem>('ecosystem', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('node').orderBy('order').startAfter(order)
      } else {
        condition = condition.orderBy('node').orderBy('order')
      }
      return condition.limit(APPS.size);
    });
  }


  managementLevelFireRef(ref?: QueryFn) {
    return this.db.collection<IManagementLevel>('management_level', ref);
  }


  ecosystemFireRef(ref?: QueryFn) {
    return this.db.collection<IEcosystem>('ecosystem', ref);
  }

  positionFireRef(ref?: QueryFn) {
    return this.db.collection<IPosition>('positions', ref);
  }

  sectorsFireRef(ref?: QueryFn) {
    return this.db.collection<ICategory>('sectors', ref);
  }
  sectorsRef(lastVisible?: any) {
    return this.db.collection<ICategory>('sectors', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('order').startAfter(order)
      } else {
        condition = condition.orderBy('order')
      }
      return condition.limit(APPS.size);
    });
  }

  categoryFireRef(ref?: QueryFn) {
    return this.db.collection<ICategory>('category', ref);
  }
  categoryRef(lastVisible?: any) {
    return this.db.collection<ICategory>('category', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('order').startAfter(order)
      } else {
        condition = condition.orderBy('order')
      }
      return condition.limit(APPS.size);
    });
  }

  positionRef(lastVisible?: any) {
    return this.db.collection<IPosition>('positions', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('order').startAfter(order)
      } else {
        condition = condition.orderBy('order')
      }
      return condition.limit(APPS.size);
    });
  }

  groupRequestFormRef(ref?: QueryFn) {
    return this.db.collection('criminal_record_folder', ref)
  }

  institutionRef(lastVisible?: any) {
    return this.db.collection<IInstitution>('institution', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('name').startAfter(order)
      } else {
        condition = condition.orderBy('name')
      }
      return condition.limit(APPS.size);
    })
  }

  provinceRef(lastVisible?: any) {
    return this.db.collection<IProvince>('province', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('name').startAfter(order)
      } else {
        condition = condition.orderBy('name')
      }
      return condition.limit(APPS.size);
    })
  }

  remarksRef(lastVisible?: any) {
    return this.db.collection<IRemarkOfficer>('remark_officers', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('created_at').startAfter(order)
      } else {
        condition = condition.orderBy('created_at')
      }
      return condition.limit(APPS.size);
    });
  }


  mmeYearProgramRef(lastVisible?: any) {
    return this.db.collection<IYearProgram>('mme_year_program', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('created_at').startAfter(order)
      } else {
        condition = condition.orderBy('created_at')
      }
      return condition.limit(APPS.size);
    });
  }

  mmeProgramRef(lastVisible?: any, path?: any, sub?: any, key?: string, departmentKeys?: string) {
    // return this.db.collection<any>('mme_main_program', ref => {
    return this.db.collection<any>('mme_program', ref => {
      let condition = ref.where('isDelete', '==', false)
      if (lastVisible) {
        const { order } = lastVisible
        condition = condition.orderBy('created_at').startAfter(order)
      } else {
        condition = condition.orderBy('created_at')
      }
      if (path) {
        condition = condition.where('ranking.key', '==', path?.key)
      }
      if (sub) {
        condition = condition.where('subOfProgram.key', '==', sub)
      }
      if (key) {
        condition = condition.where('key', '==', key)
      }
      if (departmentKeys) {
        condition = condition.where('departmentKeys', 'array-contains', departmentKeys)
      }
      return condition.limit(APPS.size);
    });
  }

  mmeProgramSaveRef(ref?: QueryFn) {
    // return this.db.collection<any>('mme_main_program', ref);
    return this.db.collection<any>('mme_program', ref);
  }

  mmeYearFilterRef(ref?: QueryFn) {
    return this.db.collection<any>('mme_year_program', ref);
  }
  mmeSourceBudgetRef(lastVisible?: any) {
    return this.db.collection<IMmeProgram>('mme_source_budget', ref => {
      if (lastVisible) {
        const { order } = lastVisible
        ref.orderBy('created_at').startAfter(order)
      } else {
        ref.orderBy('created_at')
      }
      return ref.limit(APPS.size);
    });
  }
  fetchSourceBudgetRef(ref?: QueryFn) {
    return this.db.collection<IYearProgram>('mme_source_budget', ref);
  }
  remarkFireRef(ref?: QueryFn) {
    return this.db.collection<IRemarkOfficer>('remark_officers', ref);
  }
  remarkTextRef(ref?: QueryFn) {
    return this.db.collection<IRemarkOfficer>('officers', ref);
  }
  planingCategoryRef(ref?: QueryFn) {
    return this.db.collection('planing_category', ref)
  }
  achievementStatusRef(ref?: QueryFn) {
    return this.db.collection('project_achievement_status', ref)
  }
  quarterRef(ref?: QueryFn) {
    return this.db.collection('project_quarters', ref);
  }
  compareWithObj(a: any, b: any): boolean {
    if (b) return a?.key === b?.key;
  }

  workingHoursRef(ref?: QueryFn) {
    return this.db.collection<IWorkingHour>('working_hours', ref);
  }

  workingHoursFireRef() {
    return this.firestore().collection('working_hours');
  }

  workingHoursSearchRef(search?: string) {
    return this.db.collection<IWorkingHour>('working_hours', ref => {
      let condition = ref.where('isDeleted', '==', false);
      if (search) {
        condition = condition.where('keyword', 'array-contains', search);
      }
      condition = condition.orderBy('name', 'asc');
      return condition;
    });
  }

  officerAttendancesRef(userKey: string, ref?: QueryFn) {
    return this.db.collection<IAttendance>('officers/' + userKey + '/officer-attendances', ref);
  }
  officerAttendanceCICOsRef(userKey: string, attendanceKey: string, ref?: QueryFn) {
    return this.db.collection<IAttendanceCheckIn>('officers/' + userKey + '/officer-attendances/' + attendanceKey + '/officer-attendance-cicos', ref);
  }

  officerAttendanceListRef(userKey: string, lastVisible?: any, search?: string) {
    return this.db.collection<IAttendance>('officers/' + userKey + '/officer-attendances', ref => {
      let condition = ref.where('isDeleted', '==', false)
      if (search) {
        condition = condition.where('keyword', 'array-contains', search)
      }

      if (lastVisible) {
        const { createdAt } = lastVisible;
        condition = condition.orderBy('createdAt', 'desc').startAfter(createdAt);
      } else {
        condition = condition.orderBy('createdAt', 'desc');
      }
      return condition.limit(APPS.size);
    });
  }

  everyOfficerAttendancesRef(startDateKey: string, endDateKey: string, lastVisible?: any, search?: string) {
    return this.db.collectionGroup<IAttendance>('officer-attendances', ref => {
      let condition = ref
        .where('isDeleted', '==', false)
        .where('key', '>=', startDateKey)
        .where('key', '<=', endDateKey);

      if (search) {
        condition = condition.where('keyword', 'array-contains', search)
      }

      if (lastVisible) {
        const { officer } = lastVisible;
        condition = condition.orderBy('key').orderBy('officer.officerId', 'desc').startAfter(officer.officerId);
      } else {
        condition = condition.orderBy('key').orderBy('officer.officerId', 'desc');
      }
      return condition.limit(APPS.size);
    });
  }

  hrHolidaysRef(lastVisible?: any, search?: string) {
    return this.db.collection<IAttendance>('holidays', ref => {
      let condition = ref
        .where('isDeleted', '==', false);

      if (search) {
        condition = condition.where('keyword', 'array-contains', search)
      }

      if (lastVisible) {
        const { createdAt } = lastVisible;
        condition = condition.orderBy('createdAt', 'desc').startAfter(createdAt);
      } else {
        condition = condition.orderBy('createdAt', 'desc');
      }
      return condition.limit(APPS.size);
    });
  }

  officerLeaveRequestRef(requestKey: number, lastVisible?: any, search?: string) {
    return this.db.collectionGroup<ILeaveRequest>('officer-leave-requests', ref => {
      let condition = ref.where('isDeleted', '==', false).where('type.key', '==', requestKey);
      if (search) {
        condition = condition.where('keyword', 'array-contains', search)
      }

      if (lastVisible) {
        const { createdAt } = lastVisible;
        condition = condition.orderBy('createdAt', 'desc').startAfter(createdAt);
      } else {
        condition = condition.orderBy('createdAt', 'desc');
      }
      return condition.limit(APPS.size);
    });
  }


  officerLeaveRequestSearchRef(requestKey: number, search?: string) {
    search = search?.toUpperCase();

    return this.db.collection<IWorkingHour>('officer-leave-requests', ref => {
      let condition = ref.where('isDeleted', '==', false).where('type.key', '==', requestKey);
      if (search) {
        condition = condition.where('keyword', 'array-contains', search);
      }
      condition = condition.orderBy('createdAt', 'desc');
      return condition.limit(APPS.size);
    });
  }

  officerLeaveRequestCollectionRef(ref?: QueryFn) {
    return this.db.collection<ILeaveRequest>('officer-leave-requests', ref);
  }

  embassyRef(ref?: QueryFn){
    return this.db.collection<any>('embassy', ref);
  }

  collectionRef(name: string,ref?: QueryFn){
    return this.db.collection<any>(name,ref)
  }
}
