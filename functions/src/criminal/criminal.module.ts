import * as admin from "firebase-admin";
import { Change, EventContext } from "firebase-functions/lib/cloud-functions";
import { INotification } from "../interfaces/interface";
import { DOCUMENT_FLOW_CATEGORY, notificationType, STATUS_OBJ } from "../services/data";
import { addDay, addMonth, calcCRDays, createKey, findNextKey, orderBy, pageKey, pushObjArray, pushToArray, pushToObject, toDateKey, toFlatten, toUniq } from "../services/mapping";
import * as _ from 'lodash';

export function _onCriminalRecordApplyByCitizenRef(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc: any = change.after.data() || change.before.data();
    if (!change.before.exists && doc?.status?.key === STATUS_OBJ.DRAFT?.key) {
        return null;
    }
    const isStatusNotChange = _.isEqual(change.before?.data()?.status, change.after.data()?.status);
    if (change.before.exists && change.after.exists) {
        if (isStatusNotChange) return null;
        if (doc?.status?.key !== STATUS_OBJ.DRAFT?.key && doc?.status?.key !== STATUS_OBJ.APPLY?.key) return null;
    }

    const db = admin.firestore();
    const { status } = doc;
    const settingRef = db.collection('settings').doc('config')
    const groupOfOfficerRef = db.collection('group_users_account');
    return admin.firestore().runTransaction(async transaction => {
        const configDoc = await transaction.get(settingRef)
        const setting = pushToObject(configDoc);
        const criminal_record_support: any = setting?.criminal_record_support || null;
        const officersDocs = await transaction.get(groupOfOfficerRef.doc(setting?.officerVerifyCriminalApplication).collection('group_members').where('officer_type.key', '==', doc?.apply ? 1 : 2).select('key', 'file', 'officerId', 'last_name', 'first_name', 'officer_counter'));

        const currentOfficerKey = (doc?.apply ? setting?.officerVerifyKey : setting?.officerVerifyOfflineKey) || null;
        const officerItems = orderBy(pushToArray(officersDocs), 'officerId')
        const officerKeys = officerItems?.map(m => m?.key);

        let officerKeyVerify = findNextKey(officerKeys, currentOfficerKey);
        const officerVerify = officerItems?.find(m => m?.key === officerKeyVerify);

        if (!change.before.exists && change.after.exists) {
            applyCriminal(doc, criminal_record_support, officerVerify, db, transaction)
        } else if (change.before.exists && !change.after.exists) {
            voidCriminal(doc, criminal_record_support, db, transaction)
        } else if (change.before.exists && change.after.exists && !isStatusNotChange) {

            switch (status?.key) {
                case STATUS_OBJ.DRAFT.key:
                    voidCriminal(doc, criminal_record_support, db, transaction)
                    break;
                case STATUS_OBJ.APPLY.key:
                    applyCriminal(doc, criminal_record_support, officerVerify, db, transaction)
                    break;
                default:
                    break;
            }
        }
        return null;
    })
}


export function _onCommentCriminalRecordRef(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc: any = change.after.data() || change.before.data();
    const db = admin.firestore();
    const { created_at, created_by, text, messageKeys, criminalRecordKey, workplaceKey } = doc;
    const notificationsRef = db.collection('notifications')
    const userRef = db.collection('users')
    const workplaceRef = db.collection('department')
    return admin.firestore().runTransaction(async transaction => {
        if (change.after.exists) {
            const notify: INotification = {
                key: createKey('notifications'),
                created_at: created_at,
                created_by: created_by?.key,
                date_key: toDateKey(new Date()),
                page_key: pageKey(),
                keyword: [],
                //====
                title: `ព្រឹត្តិបត្រថ្កោលទោស`,
                title_en: `BULLETIN OF CRIMINAL RECORD`,
                title_fr: `BULLETIN DE CASIER JUDICIAIRE`,
                body: `${text}`,
                body_en: `${text}`,
                body_fr: `${text}`, 
                notifyTo: messageKeys,
                parentKey: null,
                transactionKey: criminalRecordKey,
                notifyBy: created_by,
                type: notificationType.CRIMINAL,
            }
            transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            messageKeys?.map((key: string) => {
                if (workplaceKey) {
                    transaction.set(userRef.doc(key), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                } else {
                    transaction.set(workplaceRef.doc(key), { total_criminal_message_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                }
            })
        }
    })
}

export function _onCriminalRecordMovementRef(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc: any = change.after.data() || change.before.data();
    const { default_stampFile, default_remarkFile, default_signatureFile, criminalSkipWorkplace, from_paid_un_fill, criminalRecordKeyRef, criminalStatus, created_by, decree_result, decree_status, citizenKeyRef, workplaceKey, key, tran_at, tran_date_key } = doc;
    const db = admin.firestore();
    return admin.firestore().runTransaction(async transaction => {
        const notificationsRef = db.collection('notifications')
        const criminalDoc = await transaction.get(db.collection('criminal_record').doc(criminalRecordKeyRef));
        const criminal = pushToObject(criminalDoc) as any;
        const { request_approval_workplace, citizen_ref, folder_key_ref } = criminal || {}
        const workplaceApproved: any[] = criminal?.workplaces || [];
        const approved_officers = pushObjArray(criminal?.approved_officers || [], created_by)
        const userRef = db.collection('users')
        const workplaceRef = db.collection('department')
        let notifiyKeys: any[] = [];

        if (criminalStatus?.key === STATUS_OBJ.REVIEW?.key) {//submitted to start process do criminal latter
            const workplaceKeysDoc = await transaction.get(db.collection('criminal_flow')
                .where('category.key', '==', DOCUMENT_FLOW_CATEGORY.normal.key)
                .orderBy('flowNo'))
            const workplaceData = pushToArray(workplaceKeysDoc);
            const isUrgent = criminal?.urgent;
            const workplaces = orderBy(((criminalSkipWorkplace || isUrgent) ? workplaceData.filter(m => !m?.canSkipByCategory) : workplaceData)?.map(m => ({
                key: m.key,
                department: m?.department,
                canSkipByCategory: m?.canSkipByCategory,
                flowNo: m?.flowNo
            })), 'flowNo')
            
            const notifyWorkplace = workplaces[0];

            transaction.set(db.collection('criminal_record').doc(criminalRecordKeyRef), {
                submitted_remark: {
                    movementKey: key,
                    submitted_at: tran_at,
                    submitted_by: created_by,
                },
                request_approval_workplace: [notifyWorkplace?.department?.key],
                approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                approved_officers: approved_officers,
                workplaceKeys: workplaces?.map(m => m?.department?.key),
                workplaces: workplaces,
            }, { merge: true })


            if (workplaces?.length > 0) {
                const notify: INotification = {
                    key: createKey('notifications'),
                    created_at: tran_at,
                    created_by: created_by?.key,
                    date_key: tran_date_key,
                    page_key: pageKey(),
                    keyword: [],
                    //====
                    title: `ទទួលពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស`,
                    title_en: `Receive Application for BULLETIN OF CRIMINAL RECORD`,
                    title_fr: `Recevoir une demande de BULLETIN DE CASIER JUDICIAIRE`,
                    body: `មានសំណើរសុំព្រឹត្តិបត្រព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ត្រូវចុះនិទ្ទេស`,
                    body_en: `There is a request for BULLETIN OF CRIMINAL RECORD ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} Must be decree`,
                    body_fr: `Il y a une demande pour ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} Doit être un décret`,
                    notifyTo: [notifyWorkplace?.department?.key],
                    parentKey: null,
                    transactionKey: criminalRecordKeyRef,
                    notifyBy: created_by,
                    type: notificationType.CRIMINAL,
                }
                transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
                transaction.set(workplaceRef.doc(notifyWorkplace?.department?.key), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                //statistic apply for report
                notifiyKeys = [
                    { key: notifyWorkplace?.department?.key, name: 'workplace' }
                ]
                statisticCriminal(transaction, doc, criminal, 'total_criminal_submitted', 'total_criminal_submitted_female', notifiyKeys)
            }
        } else if (criminalStatus?.key === STATUS_OBJ.CONFIRM_APPLICATION?.key) {
            const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `ព័ត៌មាននិងឯកសារពាក្យស្នើសុំបានពិនិត្យថាត្រឹមត្រូវដោយមន្ត្រីការិយាល័យថ្កោលទោស`,
                title_en: `Application Information and Documents Verified`,
                title_fr: `Informations sur la candidature et documents vérifiés`,
                body: `ព័ត៌មានព្រឹត្តិបត្រថ្កោលទោសរបស់លោកអ្នកឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ព័ត៌មានគ្រប់គ្រាន់ និងត្រឹមត្រូវ លោកអ្នកអាចមកបង់ប្រាក់ ផ្ដល់ស្នាមម្រាមដៃ និងឯកសារយោងនៅការិយាល័យថ្កោលទោស ជាមួយ ${criminal?.officerVerifyRef?.last_name} ${criminal?.officerVerifyRef?.first_name} នៅបញ្ចូលលេខ ${criminal?.officerVerifyRef?.officer_counter}`,
                body_en: `Your application ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} verified. You can come and provide fingerprints, documents, and pay with ${criminal?.officerVerifyRef?.last_name} ${criminal?.officerVerifyRef?.first_name} counter ${criminal?.officerVerifyRef?.officer_counter}`,
                body_fr: `Ton application ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} vérifié. Vous pouvez venir fournir vos empreintes digitales, vos documents et payer avec ${criminal?.officerVerifyRef?.last_name} ${criminal?.officerVerifyRef?.first_name} comptoir ${criminal?.officerVerifyRef?.officer_counter}`,
                notifyTo: [criminal?.citizen_ref],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: created_by,
                type: notificationType.CRIMINAL,
            }
            transaction.set(userRef.doc(criminal?.officerVerifyRef?.key), {
                total_criminal_verify_notify: admin.firestore.FieldValue.increment(1)
            }, { merge: true })
            transaction.set(db.collection('criminal_statistic').doc('general'), {
                total_criminal_verify_notify: admin.firestore.FieldValue.increment(1)
            }, { merge: true })
            transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            transaction.set(userRef.doc(citizen_ref), { total_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
            notifiyKeys = [
                { key: criminal?.citizen_ref, name: 'user' }
            ]
            statisticCriminal(transaction, doc, criminal, 'total_criminal_confirm', 'total_criminal_confirm_female', notifiyKeys)
        } else if (criminalStatus?.key === STATUS_OBJ.PAID?.key) {
            const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `ដាក់ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស`,
                title_en: `Apply for BULLETIN OF CRIMINAL RECORD`,
                title_fr: `Poser sa candidature BULLETIN DE CASIER JUDICIAIRE`,
                body: `ឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} បានបង់ប្រាក់រូចរាល់`,
                body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} payment is successful`,
                body_fr: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} le paiement est réussi`,
                notifyTo: [criminal?.citizen_ref],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: created_by,
                type: notificationType.CRIMINAL,
            }
            transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            transaction.set(userRef.doc(citizen_ref), { total_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
            if (!from_paid_un_fill) {
                notifiyKeys = [
                    { key: criminal?.citizen_ref, name: 'user' }
                ]
                if(criminal?.apply_from?.key === 'oversea' && criminal?.application_embassy?.key){
                  const notify: INotification = {
                    key: createKey('notifications'),
                    created_at: tran_at,
                    created_by: created_by?.key,
                    date_key: tran_date_key,
                    page_key: pageKey(),
                    keyword: [],
                    //====
                    title: `ដាក់ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស`,
                    title_en: `Apply for BULLETIN OF CRIMINAL RECORD`,
                    title_fr: `Poser sa candidature BULLETIN DE CASIER JUDICIAIRE`,
                    body: `ឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} បានបង់ប្រាក់ និងដាក់ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស`,
                    body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} apply and paid successfully`,
                    body_fr: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} postuler et payer avec succès`,
                    notifyTo: [criminal?.application_embassy?.key],
                    parentKey: null,
                    transactionKey: criminalRecordKeyRef,
                    notifyBy: {
                      photoUrl: criminal?.photoUrl,
                      name: 'SYSTEM',
                      key: 'SYSTEM'
                    },
                    type: notificationType.CRIMINAL,
                  }
                  transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
                  notifiyKeys.push({key:criminal?.application_embassy?.key, name:'oversea'})
                }
                statisticCriminal(transaction, doc, criminal, 'total_criminal_paid', 'total_criminal_paid_female', notifiyKeys)
            }
        } else if (criminalStatus?.key === STATUS_OBJ.PAID_UN_FILLED?.key) {
            const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `ដាក់ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស`,
                title_en: `Apply for BULLETIN OF CRIMINAL RECORD`,
                title_fr: `Poser sa candidature BULLETIN DE CASIER JUDICIAIRE`,
                body: `ឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} បានបង់ប្រាក់រូចរាល់ សូមអរគុណ`,
                body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} payment is successful`,
                body_fr: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} le paiement est réussi`,
                notifyTo: [criminal?.citizen_ref],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: created_by,
                type: notificationType.CRIMINAL,
            }
            transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            transaction.set(userRef.doc(citizen_ref), { total_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
            notifiyKeys = [
                { key: criminal?.citizen_ref, name: 'user' }
            ]
            statisticCriminal(transaction, doc, criminal, 'total_criminal_paid', 'total_criminal_paid_female', notifiyKeys)
            statisticCriminal(transaction, doc, criminal, 'total_criminal_paid_un_fill', 'total_criminal_paid_un_fill_female', [])
        } else if (criminalStatus?.key === STATUS_OBJ.DECREE?.key && decree_result) { //set decree record
            let decreeNote = decree_result as any;
            if (decree_result?.key) {
                const decreeNotes = await transaction.get(db.collection('criminal_notes').doc(decree_result?.key))
                decreeNote = pushToObject(decreeNotes)
            }
            const oldWorkplace = workplaceApproved?.find(m => m?.department?.key === (request_approval_workplace[0] || workplaceKey))
            const findIndexWorkplace = workplaceApproved?.findIndex(m => m?.department?.key === (request_approval_workplace[0] || workplaceKey));
            workplaceApproved[findIndexWorkplace] = {
                ...oldWorkplace,
                approved_by: created_by,
                approved_at: tran_at,
            }
            const nextWorkplaceItems = workplaceApproved?.filter(m => m?.flowNo > oldWorkplace?.flowNo);
            const nextWorkplace = nextWorkplaceItems[0];
            transaction.set(db.collection('citizens').doc(citizenKeyRef), {
                decree_remark: {
                    movementKey: key,
                    decree_at: tran_at,
                    decree_by: created_by,
                    decree_status: decree_status,
                    decree_result: decree_result?.key ? {
                        key: decreeNote?.key,
                        name: decreeNote?.name,
                        name_en: decreeNote?.name_en,
                        name_fr: decreeNote?.name_fr
                    } : {
                        name: decree_result?.name,
                        name_en: decree_result?.name_en,
                        name_fr: decree_result?.name_fr
                    }
                }
            }, { merge: true })
            transaction.set(db.collection('criminal_record').doc(criminalRecordKeyRef), {
                workplaces: workplaceApproved,
                decree_remark: {
                    movementKey: key,
                    decree_at: tran_at,
                    decree_by: created_by,
                    decree_status: decree_status,
                    decree_result: decree_result?.key ? {
                        key: decreeNote?.key,
                        name: decreeNote?.name,
                        name_en: decreeNote?.name_en,
                        name_fr: decreeNote?.name_fr
                    } : {
                        name: decree_result?.name,
                        name_en: decree_result?.name_en,
                        name_fr: decree_result?.name_fr
                    }
                },
                request_approval_workplace: [nextWorkplace?.department?.key],
                approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(oldWorkplace?.department?.key),
                approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                approved_officers: approved_officers,
            }, { merge: true })
            if (nextWorkplace) {
                const notify: INotification = {
                    key: createKey('notifications'),
                    created_at: tran_at,
                    created_by: created_by?.key,
                    date_key: tran_date_key,
                    page_key: pageKey(),
                    keyword: [],
                    //====
                    title: `ផ្ដល់និទ្ទេស`,
                    title_en: `Decree`,
                    title_fr: `Décret`,
                    body: `ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} បានផ្ដល់និទ្ទេស`,
                    body_en: `Application ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} decree completed`,
                    body_fr: `Application ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} décret terminé`,
                    notifyTo: [nextWorkplace?.department?.key],
                    parentKey: null,
                    transactionKey: criminalRecordKeyRef,
                    notifyBy: created_by,
                    type: notificationType.CRIMINAL,
                }

                transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
                transaction.set(workplaceRef.doc(nextWorkplace?.department?.key), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                //statistic apply for report
                notifiyKeys = [
                    { key: nextWorkplace?.department?.key, name: 'workplace' }
                ]
                statisticCriminal(transaction, doc, criminal, 'total_criminal_decree', 'total_criminal_decree_female', notifiyKeys)
            }
        } else if (criminalStatus?.key === STATUS_OBJ.PROCESSING?.key) { //internal process approval
            let folderItems: any[] = [];
            let folder: any = null;
            if (folder_key_ref) {
                const folderData = await transaction.get(db.collection('criminal_record_folder').doc(folder_key_ref))
                folder = pushToObject(folderData)
                const folderItemsData = await transaction.get(db.collection('criminal_record').where('folder_key_ref', '==', folder_key_ref).select('key', 'status'))
                folderItems = toUniq(toFlatten(pushToArray(folderItemsData)?.filter(m => m?.status?.key === STATUS_OBJ.APPROVED.key)?.map(m => m?.key).concat([criminalRecordKeyRef])));
            }

            const lastWorkplace = workplaceApproved[workplaceApproved.length - 1] || null;
            const oldWorkplace = workplaceApproved?.find(m => m?.department?.key === (request_approval_workplace[0] || workplaceKey))
            const nextWorkplaceItems = workplaceApproved?.filter(m => m?.flowNo > oldWorkplace?.flowNo);
            const nextWorkplace = nextWorkplaceItems[0] || null;

            if (lastWorkplace?.department?.key === workplaceKey) {
                const expired_date = addMonth(tran_at?.toDate(), 3).toDate();
                const findIndexWorkplace = workplaceApproved?.findIndex(m => m?.department?.key === (request_approval_workplace[0] || workplaceKey));
                workplaceApproved[findIndexWorkplace] = {
                    ...oldWorkplace,
                    approved_by: created_by,
                    approved_at: tran_at,
                    default_stampFile: default_stampFile,
                    default_remarkFile: default_remarkFile,
                    default_signatureFile: default_signatureFile
                }
                transaction.set(db.collection('criminal_record').doc(criminalRecordKeyRef), {
                    workplaces: workplaceApproved,
                    request_approval_workplace: [],
                    approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                    approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                    approved_officers: approved_officers,
                    status: STATUS_OBJ.APPROVED,
                    internal_status: STATUS_OBJ.APPROVED,
                    internal_approved_at: tran_at,
                    internal_approved_by: created_by,
                    received_expired_date: expired_date,
                    received_expired_date_key: toDateKey(expired_date)
                }, { merge: true })

                if (folderItems?.length === folder?.criminal_records?.length) {
                    transaction.set(db.collection('criminal_record_folder').doc(criminal?.folder_key_ref), {
                        workplaces: workplaceApproved,
                        request_approval_workplace: [],
                        approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                        approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                        approved_officers: approved_officers,
                        status: STATUS_OBJ.APPROVED,
                        internal_approved_at: tran_at,
                        internal_approved_by: created_by,
                        received_expired_date: expired_date,
                        received_expired_date_key: toDateKey(expired_date)
                    }, { merge: true })
                } else {
                    transaction.set(db.collection('criminal_record_folder').doc(criminal?.folder_key_ref), {
                        workplaces: workplaceApproved,
                        approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                        approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                        approved_officers: approved_officers,
                    }, { merge: true })
                }
                //statistic apply for report

                statisticCriminal(transaction, doc, criminal, 'total_criminal_approved', 'total_criminal_approved_female', [])
            } else {
                const findIndexWorkplace = workplaceApproved?.findIndex(m => m?.department?.key === (request_approval_workplace[0] || workplaceKey));
                workplaceApproved[findIndexWorkplace] = {
                    ...oldWorkplace,
                    approved_by: created_by,
                    approved_at: tran_at,
                    default_stampFile: default_stampFile,
                    default_remarkFile: default_remarkFile,
                    default_signatureFile: default_signatureFile
                }
                transaction.set(db.collection('criminal_record').doc(criminalRecordKeyRef), {
                    workplaces: workplaceApproved,
                    request_approval_workplace: [nextWorkplace?.department?.key],
                    approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                    approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                    approved_officers: approved_officers,
                }, { merge: true })
                if (folderItems?.length === folder?.criminal_records?.length) {
                    transaction.set(db.collection('criminal_record_folder').doc(criminal?.folder_key_ref), {
                        workplaces: workplaceApproved,
                        request_approval_workplace: [nextWorkplace?.department?.key],
                        approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                        approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                        approved_officers: approved_officers,
                    }, { merge: true })
                    const workplaceKeyNotify = lastWorkplace?.department?.key === workplaceKey ? workplaceKey : nextWorkplace?.department?.key;
                    const notify: INotification = {
                        key: createKey('notifications'),
                        created_at: tran_at,
                        created_by: created_by?.key,
                        date_key: tran_date_key,
                        page_key: pageKey(),
                        keyword: [],
                        //====
                        title: `បញ្ជីលេខរៀង ${folder?.folder_no_items?.toString()}`,
                        title_en: `Number list ${folder?.folder_no_items?.toString()}`,
                        title_fr: `Liste de numéros ${folder?.folder_no_items?.toString()}`,
                        body: `ព្រឹត្តិបត្រថ្កោលទោសបញ្ជីលេខរៀង ${folder?.folder_no_items?.toString()} បានអនុម័តដោយជោគជ័យដោយ ${created_by?.display_name || created_by?.full_name}`,
                        body_en: `Criminal record number list ${folder?.folder_no_items?.toString()} successfully approved by ${created_by?.display_name || created_by?.full_name}`,
                        body_fr: `Criminal record liste de numéros ${folder?.folder_no_items?.toString()} approuvé avec succès par ${created_by?.display_name || created_by?.full_name}`,
                        notifyTo: [workplaceKeyNotify],
                        parentKey: null,
                        transactionKey: folder?.key,
                        notifyBy: created_by,
                        type: notificationType.CRIMINAL_FOLDER,
                    }
                    transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
                    transaction.set(workplaceRef.doc(workplaceKeyNotify), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                } else {
                    transaction.set(db.collection('criminal_record_folder').doc(criminal?.folder_key_ref), {
                        workplaces: workplaceApproved,
                        approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                        approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                        approved_officers: approved_officers,
                    }, { merge: true })
                }
            }

        } else if (criminalStatus?.key === STATUS_OBJ.RECEIVED?.key) {
            const addExpiredMonth = addDay(tran_at?.toDate(), 10).toDate();
            const dayAndWeekend = calcCRDays(tran_at?.toDate(), addExpiredMonth)

            const fromDateNumberKey = toDateKey(tran_at?.toDate())
            const toDateNumberKey = toDateKey(addExpiredMonth)
            const holidayDoc = await transaction.get(db.collection('public_holiday').where("from_date_key", ">=", fromDateNumberKey).where("from_date_key", "<=", toDateNumberKey))
            const holidayData = holidayDoc.docs.map(m => ({ key: m.data().key }));
            const totalD = dayAndWeekend + holidayData.length
            const expired_date = addDay(tran_at?.toDate(), totalD).toDate();

            let folderItems: any[] = [];
            let folder: any = null;
            if (folder_key_ref) {
                const folderData = await transaction.get(db.collection('criminal_record_folder').doc(folder_key_ref))
                folder = pushToObject(folderData)
                const folderItemsData = await transaction.get(db.collection('criminal_record').where('folder_key_ref', '==', folder_key_ref).select('key', 'status'))
                folderItems = toUniq(toFlatten(pushToArray(folderItemsData)?.filter(m => m?.status?.key === STATUS_OBJ.RECEIVED.key)?.map(m => m?.key).concat([criminalRecordKeyRef])));
            }
            if (folderItems?.length === folder?.criminal_records?.length) {
                transaction.set(db.collection('criminal_record_folder').doc(criminal?.folder_key_ref), {
                    workplaces: workplaceApproved,
                    request_approval_workplace: [],
                    approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                    approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                    approved_officers: approved_officers,
                    status: STATUS_OBJ.RECEIVED,
                    internal_approved_at: tran_at,
                    internal_approved_by: created_by,
                    received_expired_date: expired_date,
                    received_expired_date_key: toDateKey(expired_date)
                }, { merge: true })
            }
            transaction.set(db.collection('criminal_record').doc(criminalRecordKeyRef), {
                workplaces: workplaceApproved,
                request_approval_workplace: [],
                approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                approved_officers: approved_officers,
                // status: STATUS_OBJ.APPROVED,
                // internal_status: STATUS_OBJ.APPROVED,
                internal_approved_at: tran_at,
                internal_approved_by: created_by,
                received_expired_date: expired_date,
                received_expired_date_key: toDateKey(expired_date)
            }, { merge: true })
            const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `អនុម័តលើព្រឹត្តិបត្រថ្កោលទោស`,
                title_en: `Approve Criminal Record`,
                title_fr: `Approuver le casier judiciaire`,
                body: `ព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'ដែលមានលេខទូរសព្ទ ' + criminal?.phoneNumber : ''} បានអនុម័តដោយជោគជ័យ សូមមកដកព្រឹត្តិបត្រថ្កោលទោសរបស់លោកអ្នកនៅរៀងរាល់ម៉ោងធ្វើការ`,
                body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name}'s criminal Record ${criminal?.phoneNumber ? 'with phone number ' + criminal?.phoneNumber : ''} successfully approved, please come to retrieve your criminal record`,
                body_fr: `Criminal record ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'avec numéro de téléphone ' + criminal?.phoneNumber : ''} approuvé avec succès, merci de venir récupérer votre document`,
                notifyTo: [criminal?.citizen_ref],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: created_by,
                type: notificationType.CRIMINAL,
            }
            transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            notifiyKeys = [
                { key: criminal?.citizen_ref, name: 'user' }
            ]
            if(criminal?.apply_from?.key === 'oversea' && criminal?.application_embassy?.key){
              const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `ព្រឹត្តិបត្រថ្កោលទោសរៀបចំរួចរាល់`,
                title_en: `Criminal Record Done`,
                title_fr: `Criminal Record Fait`,
                body: `ព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'ដែលមានលេខទូរសព្ទ ' + criminal?.phoneNumber : ''} បានរៀបចំរួចរាល់`,
                body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name}'s criminal Record ${criminal?.phoneNumber ? 'with phone number ' + criminal?.phoneNumber : ''} done`,
                body_fr: `Criminal record ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'avec numéro de téléphone ' + criminal?.phoneNumber : ''} faite`,
                notifyTo: [criminal?.application_embassy?.key],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: {
                  photoUrl: criminal?.photoUrl,
                  name: 'SYSTEM',
                  key: 'SYSTEM'
                },
                type: notificationType.CRIMINAL,
              }
              transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
              notifiyKeys.push({key:criminal?.application_embassy?.key, name:'oversea'})
            }
            statisticCriminal(transaction, doc, criminal, 'total_criminal_printed', 'total_criminal_printed_female', notifiyKeys)
        } else if (criminalStatus?.key === STATUS_OBJ.DONE?.key) {
            const expired_date = addMonth(tran_at?.toDate(), 3).toDate();
            let folderItems: any[] = [];
            let folder: any = null;
            if (folder_key_ref) {
                const folderData = await transaction.get(db.collection('criminal_record_folder').doc(folder_key_ref))
                folder = pushToObject(folderData)
                const folderItemsData = await transaction.get(db.collection('criminal_record').where('folder_key_ref', '==', folder_key_ref).select('key', 'status'))
                folderItems = toUniq(toFlatten(pushToArray(folderItemsData)?.filter(m => m?.status?.key === STATUS_OBJ.DONE.key)?.map(m => m?.key).concat([criminalRecordKeyRef])));
            }

            if (folderItems?.length === folder?.criminal_records?.length) {
                transaction.set(db.collection('criminal_record_folder').doc(criminal?.folder_key_ref), {
                    workplaces: workplaceApproved,
                    request_approval_workplace: [],
                    approved_workplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                    approved_officerKey: admin.firestore.FieldValue.arrayUnion(created_by?.key),
                    approved_officers: approved_officers,
                    status: STATUS_OBJ.DONE,
                    internal_approved_at: tran_at,
                    internal_approved_by: created_by,

                    expired_date: expired_date,
                    expired_date_key: toDateKey(expired_date)
                }, { merge: true })
            }

            const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `ដកយកព្រឹត្តិបត្រថ្កោលទោស`,
                title_en: `Received Criminal Record`,
                title_fr: `Reçue Criminal Record`,
                body: `ព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'ដែលមានលេខទូរសព្ទ ' + criminal?.phoneNumber : ''} បានដកព្រឹត្តិបត្រថ្កោលទោស`,
                body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name}'s criminal Record ${criminal?.phoneNumber ? 'with phone number ' + criminal?.phoneNumber : ''} received criminal record`,
                body_fr: `Criminal record ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'avec numéro de téléphone ' + criminal?.phoneNumber : ''} reçue criminal record`,
                notifyTo: [criminal?.citizen_ref],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: created_by,
                type: notificationType.CRIMINAL,
            }
            transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            //statistic apply for report
            notifiyKeys = [
                { key: criminal?.citizen_ref, name: 'user' }
            ]

            if(criminal?.apply_from?.key === 'oversea' && criminal?.application_embassy?.key){
              const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `ដកយកព្រឹត្តិបត្រថ្កោលទោស`,
                title_en: `Received Criminal Record`,
                title_fr: `Reçue Criminal Record`,
                body: `ព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'ដែលមានលេខទូរសព្ទ ' + criminal?.phoneNumber : ''} បានដកព្រឹត្តិបត្រថ្កោលទោស`,
                body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name}'s criminal Record ${criminal?.phoneNumber ? 'with phone number ' + criminal?.phoneNumber : ''} received criminal record`,
                body_fr: `Criminal Record ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'avec numéro de téléphone ' + criminal?.phoneNumber : ''} reçue criminal record`,
                notifyTo: [criminal?.application_embassy?.key],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: {
                  photoUrl: criminal?.photoUrl,
                  name: 'SYSTEM',
                  key: 'SYSTEM'
                },
                type: notificationType.CRIMINAL,
              }
              transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
              notifiyKeys.push({key:criminal?.application_embassy?.key, name:'oversea'})
            }

            statisticCriminal(transaction, doc, criminal, 'total_criminal_withdrawal', 'total_criminal_withdrawal_female', notifiyKeys)
        } else if (criminalStatus?.key === STATUS_OBJ.VOID?.key) {
            const notify: INotification = {
                key: createKey('notifications'),
                created_at: tran_at,
                created_by: created_by?.key,
                date_key: tran_date_key,
                page_key: pageKey(),
                keyword: [],
                //====
                title: `មោឃៈព្រឹត្តិបត្រថ្កោលទោស`,
                title_en: `Void Criminal Record`,
                title_fr: `Vide Criminal Record`,
                body: `ព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'ដែលមានលេខទូរសព្ទ ' + criminal?.phoneNumber : ''} ត្រូវបានដាក់ជាមោឃៈ`,
                body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name}'s criminal Record ${criminal?.phoneNumber ? 'with phone number ' + criminal?.phoneNumber : ''} is void.`,
                body_fr: `Criminal record ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'avec numéro de téléphone ' + criminal?.phoneNumber : ''} est nul.`,
                notifyTo: [criminal?.citizen_ref],
                parentKey: null,
                transactionKey: criminalRecordKeyRef,
                notifyBy: created_by,
                type: notificationType.CRIMINAL,
            }
            transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
            //statistic apply for report
            notifiyKeys = [
                { key: criminal?.citizen_ref, name: 'user' }
            ]
            statisticCriminal(transaction, doc, criminal, 'total_criminal_void', 'total_criminal_void_female', notifiyKeys)
        }
        return null;
    })
}

export function statisticCriminal(transaction: FirebaseFirestore.Transaction, tranDoc: any, criminal: any, total_field: string, total_female_field: string, notifiyKeys: any[]) {
    //statistic apply for report
    const db = admin.firestore();
    const statisticRef = db.collection('criminal_statistic')
    const { gender, national_application, current_nationality, attachments, isStudent, labor_form, workplace_entry } = criminal;
    const { tran_date_key, tran_at } = tranDoc;
    const findStudent = isStudent && (attachments || [])?.find((m: any) => m?.docType?.key === 1);
    if (findStudent) {
        transaction.set(statisticRef.doc('general'), {
            total_student: admin.firestore.FieldValue.increment(1),
            [`${total_field}_student`]: admin.firestore.FieldValue.increment(1),
            [`${total_female_field}_student`]: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(1),

            [`${national_application?.key}_student`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0),
            [`${current_nationality?.key}_student`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0)

        }, { merge: true })
        transaction.set(statisticRef.doc(`${tran_date_key}`), {
            total_student: admin.firestore.FieldValue.increment(1),
            [`${total_field}_student`]: admin.firestore.FieldValue.increment(1),
            [`${total_female_field}_student`]: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(1),

            [`${national_application?.key}_student`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0),
            [`${current_nationality?.key}_student`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0),

            date_key: tran_date_key,
            date_at: tran_at,
        }, { merge: true })
    }
    if (labor_form && workplace_entry?.key) {
        transaction.set(db.collection('department').doc(workplace_entry?.key), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
    }

    if (notifiyKeys?.length > 0) {
        notifiyKeys?.map(m => {
            if (m?.name === 'workplace') {
                transaction.set(db.collection('department').doc(m?.key), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
            } else if (m?.name === 'user') {
                transaction.set(db.collection('users').doc(m?.key), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
            }else if(m?.name === 'oversea'){
              transaction.set(db.collection('embassy').doc(m?.key), { total_criminal_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
            }
        })
    }
    transaction.set(statisticRef.doc('general').collection('nationality').doc(current_nationality?.key), current_nationality, { merge: true })
    transaction.set(statisticRef.doc(`${tran_date_key}`).collection('nationality').doc(current_nationality?.key), current_nationality, { merge: true })
    transaction.set(statisticRef.doc('general'), {
        [`${total_field}`]: admin.firestore.FieldValue.increment(1),
        [`${total_female_field}`]: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(1),

        [`${national_application?.key}`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0),
        [`${national_application?.key}_female`]: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(total_female_field === 'total_criminal_paid_female' ? 1 : 0),
        [`${current_nationality?.key}`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0)
    }, { merge: true })
    transaction.set(statisticRef.doc(`${tran_date_key}`), {
        [`${total_field}`]: admin.firestore.FieldValue.increment(1),
        [`${total_female_field}`]: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(1),

        [`${national_application?.key}`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0),
        [`${national_application?.key}_female`]: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(total_female_field === 'total_criminal_paid_female' ? 1 : 0),
        [`${current_nationality?.key}`]: admin.firestore.FieldValue.increment(total_field === 'total_criminal_paid' ? 1 : 0),

        date_key: tran_date_key,
        date_at: tran_at,
    }, { merge: true })
}



function voidCriminal(doc: any, criminal_record_support: any, db: FirebaseFirestore.Firestore, transaction: FirebaseFirestore.Transaction) {
    const { created_by, gender, tran_date_key, officerVerifyRef } = doc;
    const statisticRef = db.collection('criminal_statistic')
    const workplaceRef = db.collection('department')
    const userRef = db.collection('users')
    transaction.set(userRef.doc(created_by?.key), {
        total_criminal_notify: admin.firestore.FieldValue.increment(-1)
    }, { merge: true })

    transaction.set(userRef.doc(officerVerifyRef?.key), {
        total_criminal_request_verify_notify: admin.firestore.FieldValue.increment(-1)
    }, { merge: true })

    transaction.set(workplaceRef.doc(criminal_record_support?.key), {
        total_criminal_apply: admin.firestore.FieldValue.increment(-1)
    }, { merge: true })
    //statistic apply for report
    transaction.set(statisticRef.doc('general'), {
        total_criminal_request_verify_notify: admin.firestore.FieldValue.increment(-1),
        total_criminal_apply: admin.firestore.FieldValue.increment(-1),
        total_criminal_apply_female: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(-1),
    }, { merge: true })
    transaction.set(statisticRef.doc(`${tran_date_key}`), {
        total_criminal_apply: admin.firestore.FieldValue.increment(1),
        total_criminal_apply_female: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(-1),
    }, { merge: true })
}

function applyCriminal(doc: any, criminal_record_support: any, officerVerify: any, db: FirebaseFirestore.Firestore, transaction: FirebaseFirestore.Transaction) {
    const { created_by, first_name, last_name, last_name_en, first_name_en, keyword, key, phoneNumber, photo, gender, tran_at, tran_date_key, apply } = doc;

    const messageKeys = [criminal_record_support?.key, created_by?.key];
    const notificationsRef = db.collection('notifications')
    const statisticRef = db.collection('criminal_statistic')
    const settingRef = db.collection('settings').doc('config')
    const workplaceRef = db.collection('department')
    const criminalRecordRef = db.collection('criminal_record')

    const userRef = db.collection('users')
    const notify: INotification = {
        key: createKey('notifications'),
        created_at: tran_at,
        created_by: created_by?.key,
        date_key: tran_date_key,
        page_key: pageKey(),
        keyword: keyword,
        //====
        title: `ដាក់ពិនិត្យពាក្យស្នើសុំ`,
        title_en: `Submit Application`,
        title_fr: `Présenter une demande`,
        body: `ព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${last_name || last_name_en} ${first_name || first_name_en} ${phoneNumber ? 'ដែលមានលេខទូរសព្ទ ' + phoneNumber : ''} បានដាក់ពិនិត្យព័ត៌មានពាក្យស្នើសុំ`,
        body_en: `${last_name || last_name_en} ${first_name || first_name_en}'s criminal record ${phoneNumber ? 'with phone number ' + phoneNumber : ''} submit application for review.`,
        body_fr: `Criminal record ${last_name || last_name_en} ${first_name || first_name_en} ${phoneNumber ? 'avec numéro de téléphone ' + phoneNumber : ''} soumettre une demande de révision.`,
        notifyTo: messageKeys,
        parentKey: null,
        transactionKey: key,
        notifyBy: {
            ...created_by,
            photoUrl: photo?.downloadUrl || created_by?.photoUrl || null,
        },
        type: notificationType.CRIMINAL,
    }
    transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });

    transaction.set(settingRef, { [apply ? `officerVerifyKey` : `officerVerifyOfflineKey`]: officerVerify?.key }, { merge: true })

    transaction.set(userRef.doc(officerVerify?.key), {
        total_criminal_request_verify_notify: admin.firestore.FieldValue.increment(1)
    }, { merge: true })

    transaction.set(userRef.doc(created_by?.key), {
        total_criminal_notify: admin.firestore.FieldValue.increment(1)
    }, { merge: true })
    transaction.set(workplaceRef.doc(criminal_record_support?.key), {
        total_criminal_apply: admin.firestore.FieldValue.increment(1)
    }, { merge: true })
    //statistic apply for report
    transaction.set(statisticRef.doc('general'), {
        total_criminal_request_verify_notify: admin.firestore.FieldValue.increment(1),
        total_criminal_apply: admin.firestore.FieldValue.increment(1),
        total_criminal_apply_female: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(1),
    }, { merge: true })
    transaction.set(statisticRef.doc(`${tran_date_key}`), {
        total_criminal_apply: admin.firestore.FieldValue.increment(1),
        total_criminal_apply_female: gender?.key === 1 ? admin.firestore.FieldValue.increment(0) : admin.firestore.FieldValue.increment(1),
    }, { merge: true })
    transaction.set(criminalRecordRef.doc(doc.key), { officerVerifyRef: officerVerify }, { merge: true })
}
