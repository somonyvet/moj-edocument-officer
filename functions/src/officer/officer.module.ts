import * as admin from "firebase-admin";
import { Change, EventContext } from "firebase-functions/lib/cloud-functions";
import { IDepartment, IOfficer } from "../interfaces/interface";
import { notificationType, STATUS_OBJ } from "../services/data";
import { createKey, groupBy, pageKey, pushObjArray, pushToArray, pushToObject, toDateKey } from "../services/mapping";

export function _onWriteOfficeMember(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc: any = change.after.data() || change.before.data();
    const key: string = change.after.id || change.before.id;
    const db = admin.firestore();
    const departmentKey = context?.params?.departmentKey;
    const { officerId, first_name, last_name, workingOffices } = doc;
    const officeRef = db.collection('department').doc(departmentKey)
    const officerWorkplace = workingOffices.find((m: any) => m?.office?.key === departmentKey);
    if (!officerWorkplace) return null;
    const managementLevelKey = officerWorkplace?.office?.ranking?.key;
    if (!managementLevelKey) return null;
    const managementLevelRef = db.collection('management_level').doc(managementLevelKey)

    return admin.firestore().runTransaction(async transaction => {
        const positionData = await transaction.get(managementLevelRef);
        const managementLevel: any = pushToObject(positionData)
        const isHeadOfWorkplace = (managementLevel?.positionManager || []).find((m: any) => m?.key === officerWorkplace?.position?.key) || null;
        const isTopManagement = (managementLevel?.positionManager || []).find((m: any) => m?.order > officerWorkplace?.position?.order) || null;
        //check if head of workplace
        if (isHeadOfWorkplace) {
            const officeData = await transaction.get(officeRef);
            const office: IDepartment = pushToObject(officeData)
            const { headerOfficer } = office;
            let headerOfficerList: any[] = [];
            if (!change.after.exists) {
                headerOfficerList = headerOfficer.filter(m => m.key !== key)
            } else {
                headerOfficerList = pushObjArray(headerOfficer, {
                    key: key,
                    officerId, first_name, last_name,
                    position: isHeadOfWorkplace,
                })
            }
            headerOfficerList = groupBy(headerOfficerList, "key", 'position.order')
            const keys = headerOfficerList.map(m => m.key);
            return transaction.set(officeRef, {
                headerOfficer: headerOfficerList,
                headerOfficerKeys: keys
            }, { merge: true })
        } else if (isTopManagement) {
            //check if top management
            const officeData = await transaction.get(officeRef);
            const office: IDepartment = pushToObject(officeData)
            const { topManagement } = office;
            let headerOfficerList: any[] = [];
            if (!change.after.exists) {
                headerOfficerList = topManagement.filter(m => m.key !== key)
            } else {
                headerOfficerList = pushObjArray(topManagement, {
                    key: key,
                    officerId, first_name, last_name,
                    position: isTopManagement,
                })
            }
            headerOfficerList = groupBy(headerOfficerList, "key", 'position.order')
            const keys = headerOfficerList.map(m => m.key);
            return transaction.set(officeRef, {
                topManagement: headerOfficerList,
                topManagementKeys: keys
            }, { merge: true })

        }
        return null;
    })
}

export function _onWriteOfficer(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc: any = change.after.data() || change.before.data();
    const beforeData = change?.before?.data() || null;
    const afterData = change?.after?.data() || null;
    const key: string = change.after.id || change.before.id;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(key)
    const item: IOfficer = doc;

    const notificationsRef = db.collection('notifications')
    const departmentRef = db.collection('department');
    const officerRef = db.collection('officers');
    return admin.firestore().runTransaction(async transaction => {
        if (change.before.exists && !change.after.exists) {
            return transaction.delete(userRef)
        } else if (change.after.exists) {

            if (item?.status?.key === STATUS_OBJ.PENDING.key) {
                return null;
            }
            // if (beforeData?.status?.key === afterData?.status?.key) return

            const officeDocs = await transaction.get(departmentRef.where('approveOfficerForm', '==', true).select('key', 'isDelete'));
            const offices = pushToArray(officeDocs)?.filter(m => !m?.isDelete)?.map(m => m?.key);
            if (item?.status?.key === STATUS_OBJ.SUBMITTED?.key) {
                let bodyInfo = `មន្រ្តីអត្តលេខ៖${item?.officerId} ឈ្មោះ៖ ${item?.last_name} ${item?.first_name} បានដាក់សាលាកប័ត្រព័ត៌មាននិងជីវប្រវត្តិរូបមន្ត្រីនគរបាលជាតិដើម្បីត្រួតពិនិត្យអនុម័ត`;
                const notify = {
                    key: createKey('department_document_movement'),
                    created_at: new Date(),
                    created_by: item?.updated_by,
                    date_key: toDateKey(new Date()),
                    page_key: pageKey(),
                    keyword: item?.keyword,
                    //====
                    title: `អគ្គនាយកដ្ឋាន អន្តោប្រវេសន៍`,
                    body: bodyInfo,
                    notifyTo: offices,
                    transactionKey: item.key,
                    profile: {
                        key: item?.key,
                        last_name: item?.last_name,
                        first_name: item?.first_name,
                        file: item?.file || item?.photo
                    },
                    type: notificationType.HR,
                    notifyBy: {
                        key: item.key,
                        displayName: `${item?.last_name} ${item?.first_name}`,
                        file: item?.file || item?.photo || null,
                    }
                }
                offices?.map(m => {
                    transaction.set(departmentRef.doc(m), { total_hr_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                })
                return transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            }
            if (item?.status?.key === STATUS_OBJ.ACTIVE.key || (!change.before.exists && !item?.fromForm)) {
                const email = `${`${item.officerId}`.trim()}@immigration.gov.kh`;
                const fullName = `${item?.last_name} ${item?.first_name}`;
                const user = {
                    created_at: item?.created_at,
                    created_by: item?.created_by,
                    key: key,
                    company: item?.company || null,
                    email: email,
                    isAdmin: item?.isAdmin || false,
                    displayName: fullName,
                    full_name: fullName,
                    phoneNumber: item?.phoneNumber || null,
                    fromForm: item?.fromForm || false,
                    status: item?.status,
                }
                if (beforeData?.status?.key === STATUS_OBJ.SUBMITTED.key && afterData?.status?.key === STATUS_OBJ.ACTIVE.key) {
                    let bodyInfo = `មន្រ្តីអត្តលេខ៖${item?.officerId} ឈ្មោះ៖ ${item?.last_name} ${item?.first_name} ត្រូវបានអនុម័តអោយប្រើប្រាស់ប្រព័ន្ធអគ្គនាយកដ្ឋាន អន្តោប្រវេសន៍`;
                    const notifyTo = [item?.key].concat(item?.officeKeys || [])
                    const notify = {
                        key: createKey('department_document_movement'),
                        created_at: new Date(),
                        created_by: item?.updated_by,
                        date_key: toDateKey(new Date()),
                        page_key: pageKey(),
                        keyword: item?.keyword,
                        //====
                        title: `អគ្គនាយកដ្ឋាន អន្តោប្រវេសន៍`,
                        body: bodyInfo,
                        notifyTo: notifyTo,
                        transactionKey: item.key,
                        type: notificationType.HR,
                        profile: {
                            key: item?.key,
                            last_name: item?.last_name,
                            first_name: item?.first_name,
                            file: item?.file || item?.photo
                        },
                        notifyBy: {
                            key: item?.approvedBy?.key,
                            displayName: `${item?.approvedBy?.displayName}`,
                            file: item?.approvedBy?.file || item?.approvedBy?.photo || null,
                        }
                    }
                    item?.officeKeys?.map(m => {
                        transaction.set(departmentRef.doc(m), { total_hr_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                    })
                    transaction.set(officerRef.doc(item?.key), { total_hr_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                    transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
                }
                return transaction.set(userRef, user, { merge: true })
            }
        }
        return null;
    })
}
