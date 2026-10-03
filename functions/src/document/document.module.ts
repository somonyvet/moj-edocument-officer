import * as admin from "firebase-admin";
import { Change, EventContext } from "firebase-functions/lib/cloud-functions";
import { IDepartment, IFolder, IHeaderInformation, IHeaderMovement, IOfficer, IReplyDocument, IStreamDocument, IUserPermission } from "../interfaces/interface";
import { ACCOUNT_PERMISSION_OBJECT, docStatusObj, DOC_CATEGORY_OBJ, driveObj, notificationType, STATUS_OBJ } from "../services/data";
import { createKey, orderByDesc, pageKey, pushObjArray, pushToArray, pushToObject, toCapitalize, toDateKey, toUserObject } from "../services/mapping";

export function documents_reply_reportsRef(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc = (change.after.data() || change.before.data()) as IReplyDocument;
    const db = admin.firestore();
    const { workplace, documentKey, created_by, parentDocumentKey, created_at, keyword, documentNo } = doc as IReplyDocument;
    const documentRef = db.collection('documents_header')
    const officerRef = db.collection('officers')
    const notificationsRef = db.collection('notifications')
    return admin.firestore().runTransaction(async transaction => {
        const documentData = await transaction.get(documentRef.doc(parentDocumentKey));
        const officerData = await transaction.get(officerRef.doc(created_by));
        const document = pushToObject(documentData) as IHeaderInformation;
        const profile = pushToObject(officerData) as IOfficer;
        const { peopleKeys, receivedWorkplaceCompletedByDocKeys } = document;
        let bodyInfo = `ឯកសារ ${document?.documentNo} - ${document?.documentTitle} បានចុះឯកសារចូលលេខ ${documentNo} ដោយ ${profile?.last_name} ${profile?.first_name} នៃ${workplace?.name || ''}`;
        const notify: any = {
            key: createKey('notifications'),
            created_at: new Date(),
            created_by: created_by,
            date_key: toDateKey(new Date()),
            page_key: pageKey(),
            keyword: keyword,
            //====
            title: ``,
            body: `${bodyInfo}`,
            notifyTo: peopleKeys || [],
            parentKey: parentDocumentKey || null,
            transactionKey: documentKey,
            notifyBy: {
                key: profile.key,
                displayName: `${profile?.last_name} ${profile?.first_name}`,
                file: profile?.file || null,
            },
        }
        const item = {
            key: documentKey,
            created_by,
            created_at,
            workplaceKey: workplace?.key,
        }
        const receivedWorkplaceCompleted = pushObjArray(receivedWorkplaceCompletedByDocKeys || [], item);
        transaction.set(documentRef.doc(parentDocumentKey), {
            receivedWorkplaceCompletedByDocKeys: receivedWorkplaceCompleted,
            receivedWorkplace: admin.firestore.FieldValue.arrayUnion(workplace?.key)
        }, { merge: true });
        return transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
    })
}

export function onWriteMovementHeaderDocumentRef(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc = (change.after.data() || change.before.data()) as IHeaderMovement;
    const { documentKey, workplaceKey, profile, workplace } = doc;
    const db = admin.firestore();
    const notificationsRef = db.collection('notifications')
    const documentRef = db.collection('documents_header').doc(documentKey)
    const documentAccountRef = db.collection('documents_header').doc(documentKey).collection('user_permission')
    const movementRef = db.collection('department_document_movement');
    const departmentRef = db.collection('department')
    const officerRef = db.collection('officers')

    return admin.firestore().runTransaction(async transaction => {
        const documentData = await transaction.get(documentRef)
        const documentAccountsData = await transaction.get(documentAccountRef.where('isDelete', '==', false))
        const headerDoc = pushToObject(documentData) as IHeaderInformation;
        const { completedByKeys, documentNo, documentTitle, keyword, doc_parent, approvedByKeys } = headerDoc;

        const documentAccounts = pushToArray(documentAccountsData) as IUserPermission[];
        const workplaceAccounts = documentAccounts.filter(m => m?.workplaceKey === workplaceKey && m?.permission?.key !== ACCOUNT_PERMISSION_OBJECT.readOnly?.key);
        const totalComplete = workplaceAccounts.filter(m => completedByKeys.concat(profile?.key).includes(m?.accountKey)).length;

        let peopleKeys = documentAccounts?.map(m => m?.key)
        const final = approvedByKeys.length <= 1;
        // let receivedWorkplaceKeys: string[] = [];
        const userPermission = documentAccounts.find(m => m?.key === profile?.key);
        let bodyInfo = `ឯកសារ ${documentNo} - ${documentTitle} ត្រូវបានពិនិត្យនិងឯកភាពដោយ ${profile?.last_name} ${profile?.first_name} នៃ${workplace?.name || ''}`;
        if (userPermission?.permission?.key === ACCOUNT_PERMISSION_OBJECT?.canConfirm?.key) {
            bodyInfo = `ឯកសារ ${documentNo} - ${documentTitle} បានពិនិត្យត្រឹមត្រូវដោយ ${profile?.last_name} ${profile?.first_name} នៃ${workplace?.name || ''}`;
        }

        //RANKING DEPARTMENT
        let departmentOfficeCC = []
        let ccTo: string[] = [];
        if (workplace?.ranking?.order === 5) {
            const departmentOfficeCCData = await transaction.get(departmentRef.doc(workplaceKey).collection("department_members_offices_cc").select('key'))
            departmentOfficeCC = pushToArray(departmentOfficeCCData);

            departmentOfficeCC.map(m => {
                ccTo.push(m?.key)
            })
        }

        // ADD CLONE DOCUMENT
        // let documentItemData: any = null
        // let documentSectionsData: any = []

        // let documentUserPermissionData: any = []

        // if (headerDoc?.doc_parent && headerDoc?.doc_type?.key === DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key && final && !headerDoc?.cloneRef) {
        //     const documentItemDoc = await transaction.get(db.collection('documents').doc(documentKey))
        //     documentItemData = pushToObject(documentItemDoc)

        //     const documentSectionsDoc = await transaction.get(db.collection('documents').doc(documentKey).collection("sections"))
        //     documentSectionsData = pushToArray(documentSectionsDoc)

        //     const documentUserPermissionDoc = await transaction.get(db.collection('documents_header').doc(documentKey).collection("user_permission"))
        //     documentUserPermissionData = pushToArray(documentUserPermissionDoc)

        // }

        //when final document from head;
        if (final) {
            const sectionsData = await transaction.get(db.collection('documents').doc(documentKey).collection('sections').where('type.key', '==', 8));
            if (sectionsData.empty) {
                transaction.set(documentRef, {
                    doc_status: docStatusObj.final,
                }, { merge: true });
            } else {
                const receivedWorkplaces = pushToArray(sectionsData).filter(m => !m?.isHeader && !m?.isRejected);
                // receivedWorkplaceKeys = receivedWorkplaces.map(m => m?.office?.key)

                receivedWorkplaces?.map(workplace => {
                    const departmentJob = {
                        key: createKey('department_document_movement'),
                        created_at: new Date(),
                        created_by: profile?.key,
                        date_key: toDateKey(new Date()),
                        page_key: pageKey(),
                        keyword: headerDoc?.keyword,
                        //====
                        title: `ប្រព័ន្ធគ្រប់គ្រងឯកសារឌីជីថល`,
                        body: bodyInfo,
                        notifyTo: [],
                        parentKey: null,
                        transactionKey: headerDoc.key,
                        departmentKey: workplace?.office?.key,
                        type: workplace?.type,
                        ranking: null,
                        notifyBy: {
                            key: profile.key,
                            displayName: `${profile?.last_name} ${profile?.first_name}`,
                            file: profile?.file || null,
                        }
                    }
                    transaction.set(movementRef.doc(departmentJob.key), departmentJob, { merge: true })
                })
            }
        }

        // ADD CLONE DOCUMENT
        // if (headerDoc?.doc_parent && headerDoc?.doc_type?.key === DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO.key && final && !headerDoc?.cloneRef) {
        //     const newDocKey = createKey("documents")
        //     if (documentItemData) {
        //         transaction.set(db.collection('documents').doc(newDocKey), { ...documentItemData, key: newDocKey, cloneFromRef: documentKey }, { merge: true })
        //     }

        //     if (documentSectionsData && documentSectionsData.length > 0) {
        //         documentSectionsData.map((m: any) => {
        //             transaction.set(db.collection('documents').doc(newDocKey).collection("sections").doc(m.key), m, { merge: true })
        //         })
        //     }

        //     if (headerDoc) {
        //         transaction.set(db.collection('documents_header').doc(newDocKey), { ...headerDoc, key: newDocKey, doc_type: DOCUMENT_TYPE_OBJECT.MEMO, cloneFromRef: documentKey }, { merge: true })
        //         transaction.set(db.collection('documents_header').doc(documentKey), { cloneRef: newDocKey }, { merge: true })
        //     }

        //     if (documentUserPermissionData && documentUserPermissionData.length > 0) {
        //         documentUserPermissionData.map((m: any) => {
        //             if (!m?.isDelete)
        //                 transaction.set(db.collection('documents_header').doc(newDocKey).collection("user_permission").doc(m.key), { ...m, documentKey: newDocKey }, { merge: true })
        //         })
        //     }
        // }

        if (totalComplete === workplaceAccounts.length) {
            transaction.set(documentRef, {
                completedByKeys: admin.firestore.FieldValue.arrayUnion(profile?.key),
                approvedByKeys: admin.firestore.FieldValue.arrayRemove(profile?.key),
                completedWorkplaceKeys: admin.firestore.FieldValue.arrayUnion(workplaceKey),
                final: final,
                // receivedWorkplaceKeys: receivedWorkplaceKeys?.length > 0 ? admin.firestore.FieldValue.arrayUnion(...receivedWorkplaceKeys) : headerDoc.receivedWorkplaceKeys,
                // accountKeys: receivedWorkplaceKeys?.length > 0 ? admin.firestore.FieldValue.arrayUnion(...receivedWorkplaceKeys) : headerDoc.accountKeys,
            }, { merge: true });
        } else {
            transaction.set(documentRef, {
                completedByKeys: admin.firestore.FieldValue.arrayUnion(profile?.key),
                approvedByKeys: admin.firestore.FieldValue.arrayRemove(profile?.key),
                final: final,
                // receivedWorkplaceKeys: receivedWorkplaceKeys?.length > 0 ? admin.firestore.FieldValue.arrayUnion(...receivedWorkplaceKeys) : headerDoc.receivedWorkplaceKeys,
                // accountKeys: receivedWorkplaceKeys?.length > 0 ? admin.firestore.FieldValue.arrayUnion(...receivedWorkplaceKeys) : headerDoc?.accountKeys,
            }, { merge: true });
        }

        //RANKING DEPARTMENT
        if (workplace?.ranking?.order === 5) {
            transaction.set(documentRef, {
                ccKeys: admin.firestore.FieldValue.arrayUnion(...ccTo),
            }, { merge: true });
        }

        transaction.set(documentAccountRef.doc(profile?.key), {
            approvedAt: new Date(),
            approvedBy: profile?.key,
            completedTask: true,
        }, { merge: true })

        const notify: any = {
            key: createKey('notifications'),
            created_at: new Date(),
            created_by: profile?.key,
            date_key: toDateKey(new Date()),
            page_key: pageKey(),
            keyword: keyword,
            //====
            title: `ប្រព័ន្ធគ្រប់គ្រងឯកសារឌីជីថល`,
            body: `${bodyInfo}`,
            notifyTo: peopleKeys || [],
            parentKey: doc_parent || null,
            transactionKey: documentKey,
            notifyBy: {
                key: profile.key,
                displayName: `${profile?.last_name} ${profile?.first_name}`,
                file: profile?.file || null,
            }
        }

        transaction.set(departmentRef.doc(workplace.key), { total_approval_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        let upperWorkPlaceData = documentAccounts.filter((m: any) => (m.profile?.key !== profile?.key) && (m.profile.position.order < profile.position.order))
        upperWorkPlaceData = orderByDesc(upperWorkPlaceData, "profile.position.order")
        const upperWorkPlaceItem: any = upperWorkPlaceData?.length > 0 ? upperWorkPlaceData[0] : null
        if (upperWorkPlaceItem)
            transaction.set(officerRef.doc(upperWorkPlaceItem?.profile?.key), { total_approval_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })

        return transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
    })
}

export function addBlockNoteReceiveWorkPlaceFN(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc = (change.after.data() || change.before.data()) as IStreamDocument;
    const db = admin.firestore();
    const { departmentKey, transactionKey } = doc as any;
    const departmentRef = db.collection('department')
    const documentsHeaderRef = db.collection('documents_header').doc(transactionKey)
    const ref = db.collection('documents_header').doc(transactionKey).collection("block_notes").doc(departmentKey)
    const documentRef = db.collection('documents').doc(transactionKey).collection('sections')
    // const notificationsRef = db.collection('notifications')
    // const officerRef = db.collection('officers')
    let notifyTo: string[] = [];
    return admin.firestore().runTransaction(async transaction => {

        const receivedWorkplaceNewData = await transaction.get(documentRef.where("office.key", "==", departmentKey));
        const receivedWorkplaceNewDoc: any = pushToArray(receivedWorkplaceNewData);
        const receivedWorkplaceNew = receivedWorkplaceNewDoc.filter((m: any) => !m?.isHeader && !m?.isRejected && m?.office?.headerOfficer).length > 0 ? receivedWorkplaceNewDoc.filter((m: any) => !m?.isHeader && !m?.isRejected && m?.office?.headerOfficer)[0] : null;

        const subDepartmentDoc = await transaction.get(departmentRef.where('subOfDepartment.key', '==', departmentKey))
        const subDepartmentData: IDepartment[] = pushToArray(subDepartmentDoc);
        const subDepartmentItem = subDepartmentData?.length > 0 ? subDepartmentData[0] : null;

        if (subDepartmentItem) {
            subDepartmentItem?.headerOfficer?.map((m: any) => {
                notifyTo.push(m.key)
            })
        }

        if (receivedWorkplaceNew) {
            receivedWorkplaceNew?.office?.headerOfficer?.map((m: any) => {
                notifyTo.push(m.key)
            })
        }

        // const notify: INotification = {
        //     key: createKey('notifications'),
        //     created_at: new Date(),
        //     created_by: profile?.key,
        //     date_key: toDateKey(new Date()),
        //     page_key: pageKey(),
        //     keyword: keyword,
        //     //====
        //     title: `ប្រព័ន្ធគ្រប់គ្រងឯកសារឌីជីថល`,
        //     body: `លោកអនុប្រធាននាយកដ្ឋានបានជូនចំណាត់ការ`,
        //     notifyTo: notifyTo || [],
        //     parentKey: null,
        //     transactionKey: transactionKey,
        //     notifyBy: {
        //         key: profile.key,
        //         displayName: `${profile?.last_name} ${profile?.first_name}`,
        //         file: profile?.file || null,
        //     }
        // }

        // const notify: INotification = {
        //     key: createKey('notifications'),
        //     created_at: new Date(),
        //     created_by: notifyBy?.key,
        //     date_key: toDateKey(new Date()),
        //     page_key: pageKey(),
        //     keyword: keyword,
        //     //====
        //     title: title,
        //     body: `${body}`,
        //     notifyTo: notifyTo || [],
        //     parentKey: parentKey || null,
        //     transactionKey: transactionKey,
        //     notifyBy: notifyBy
        // }

        // transaction.set(departmentRef.doc(departmentKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        // notifyTo?.map(peopleKey => {
        //     transaction.set(officerRef.doc(peopleKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        // })


        if (notifyTo?.length > 0) {
            transaction.set(ref, {
                receivedWorkplaceKeys: admin.firestore.FieldValue.arrayUnion(...notifyTo),
            }, { merge: true })
        }

        transaction.set(documentsHeaderRef, {
            receivedBlockNoteWorkPlaceExistKeys: admin.firestore.FieldValue.arrayUnion(...[departmentKey]),
        }, { merge: true })

        // return transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
    })
}

export function _onDepartmentDocumentMovementNotifyToAdminOffice(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc = (change.after.data() || change.before.data()) as IStreamDocument;
    const db = admin.firestore();
    const { departmentKey, transactionKey, notifyBy, keyword, title, body, parentKey } = doc as any;
    const departmentRef = db.collection('department')
    const documentHeaderRef = db.collection('documents_header').doc(transactionKey)
    const documentRef = db.collection('documents').doc(transactionKey).collection('sections')
    const notificationsRef = db.collection('notifications')
    const officerRef = db.collection('officers')
    let notifyTo: string[] = [];
    return admin.firestore().runTransaction(async transaction => {

        const receivedWorkplaceNewData = await transaction.get(documentRef.where("office.key", "==", departmentKey));
        const receivedWorkplaceNewDoc: any = pushToArray(receivedWorkplaceNewData);
        const receivedWorkplaceNew = receivedWorkplaceNewDoc.filter((m: any) => !m?.isHeader && !m?.isRejected && m?.office?.headerOfficer).length > 0 ? receivedWorkplaceNewDoc.filter((m: any) => !m?.isHeader && !m?.isRejected && m?.office?.headerOfficer)[0] : null;

        const receivedWorkplaceData = await transaction.get(departmentRef.doc(departmentKey));
        const receivedWorkplace: IDepartment = pushToObject(receivedWorkplaceData);

        const departmentData = await transaction.get(departmentRef.where('parent', 'array-contains', departmentKey).where('adminOffice', '==', true).where('ranking.order', '>', receivedWorkplace?.ranking?.order).orderBy('ranking.order'))
        const adminOffices: IDepartment[] = pushToArray(departmentData);

        const departmentOfficeReceivedData = await transaction.get(departmentRef.doc(departmentKey).collection("department_offices_received").select('key'))
        const departmentOfficeReceived: IDepartment[] = pushToArray(departmentOfficeReceivedData);

        departmentOfficeReceived.map(m => {
            notifyTo.push(m?.key)
        })

        const positionAssistantKeys = receivedWorkplace?.workplaceAssistants?.find(m => m?.key === departmentKey);
        if (positionAssistantKeys && positionAssistantKeys?.positionAssistantKeys?.length > 0) {
            const positionAssistantKey = positionAssistantKeys?.positionAssistantKeys[0];
            const assistantData = await transaction.get(officerRef.where('positionWorkplaceKeys', 'array-contains', `${departmentKey}_${positionAssistantKey}`).select('key'))
            if (!assistantData.empty) {
                const assistants = pushToArray(assistantData)
                assistants?.map(peopleKey => {
                    notifyTo.push(peopleKey)
                    transaction.set(officerRef.doc(peopleKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                })
            }
        }

        let receivedBlockNoteWorkPlace: string[] = [];
        if (receivedWorkplace?.userBlockNoteDirection) {
            receivedBlockNoteWorkPlace.push(departmentKey)
        }

        if (receivedWorkplaceNew) {
            receivedWorkplaceNew?.office?.headerOfficer?.map((m: any) => {
                notifyTo.push(m.key)
            })
        }

        adminOffices?.map(office => {
            office?.headerOfficerKeys?.map(key => {
                notifyTo.push(key)
            })
        })

        const notify: any = {
            key: createKey('notifications'),
            created_at: new Date(),
            created_by: notifyBy?.key,
            date_key: toDateKey(new Date()),
            page_key: pageKey(),
            keyword: keyword,
            //====
            title: title,
            body: `${body}`,
            notifyTo: notifyTo || [],
            parentKey: parentKey || null,
            transactionKey: transactionKey,
            notifyBy: notifyBy
        }

        transaction.set(departmentRef.doc(departmentKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        notifyTo?.map(peopleKey => {
            transaction.set(officerRef.doc(peopleKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        })
        adminOffices?.map(m => {
            transaction.set(departmentRef.doc(m?.key), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        })

        if (notifyTo?.length > 0) {
            transaction.set(documentHeaderRef, {
                receivedWorkplaceKeys: admin.firestore.FieldValue.arrayUnion(...notifyTo),
                accountKeys: admin.firestore.FieldValue.arrayUnion(...notifyTo),
            }, { merge: true })
        }

        if (receivedBlockNoteWorkPlace?.length > 0) {
            transaction.set(documentHeaderRef, {
                receivedBlockNoteWorkPlaceKeys: admin.firestore.FieldValue.arrayUnion(...receivedBlockNoteWorkPlace),
            }, { merge: true })
        }

        return transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
    })
}

export function _onDepartmentDocumentMovementNotifyToAdminOffice1(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc = (change.after.data() || change.before.data()) as IStreamDocument;
    const db = admin.firestore();
    const { departmentKey, transactionKey, notifyBy, keyword, title, body, parentKey } = doc as any;
    const departmentRef = db.collection('department')
    const documentHeaderRef = db.collection('documents_header').doc(transactionKey)
    const notificationsRef = db.collection('notifications')
    const officerRef = db.collection('officers')
    let notifyTo: string[] = [];
    return admin.firestore().runTransaction(async transaction => {

        const receivedWorkplaceData = await transaction.get(departmentRef.doc(departmentKey));
        const receivedWorkplace: IDepartment = pushToObject(receivedWorkplaceData);

        const departmentData = await transaction.get(departmentRef.where('parent', 'array-contains', departmentKey).where('adminOffice', '==', true).where('ranking.order', '>', receivedWorkplace?.ranking?.order).orderBy('ranking.order'))
        const adminOffices: IDepartment[] = pushToArray(departmentData);

        const positionAssistantKeys = receivedWorkplace?.workplaceAssistants?.find(m => m?.key === departmentKey);
        if (positionAssistantKeys && positionAssistantKeys?.positionAssistantKeys?.length > 0) {
            const positionAssistantKey = positionAssistantKeys?.positionAssistantKeys[0];
            const assistantData = await transaction.get(officerRef.where('positionWorkplaceKeys', 'array-contains', `${departmentKey}_${positionAssistantKey}`).select('key'))
            if (!assistantData.empty) {
                const assistants = pushToArray(assistantData)
                assistants?.map(peopleKey => {
                    notifyTo.push(peopleKey)
                    transaction.set(officerRef.doc(peopleKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
                })
            }
        }
        receivedWorkplace?.headerOfficerKeys?.map(key => {
            notifyTo.push(key)
        })
        adminOffices?.map(office => {
            office?.headerOfficerKeys?.map(key => {
                notifyTo.push(key)
            })
        })
        const notify: any = {
            key: createKey('notifications'),
            created_at: new Date(),
            created_by: notifyBy?.key,
            date_key: toDateKey(new Date()),
            page_key: pageKey(),
            keyword: keyword,
            //====
            title: title,
            body: `${body}`,
            notifyTo: notifyTo || [],
            parentKey: parentKey || null,
            transactionKey: transactionKey,
            notifyBy: notifyBy
        }

        transaction.set(departmentRef.doc(departmentKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        notifyTo?.map(peopleKey => {
            transaction.set(officerRef.doc(peopleKey), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        })
        adminOffices?.map(m => {
            transaction.set(departmentRef.doc(m?.key), { total_inbox_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        })

        transaction.set(documentHeaderRef, {
            receivedWorkplaceKeys: admin.firestore.FieldValue.arrayUnion(...notifyTo),
            accountKeys: admin.firestore.FieldValue.arrayUnion(...notifyTo),
        }, { merge: true })
        return transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
    })
}

export function _onDocumentStatusChanged(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const doc = (change.after.data() || change.before.data()) as IHeaderInformation;
    const key: string = change.after.id || change.before.id;

    const { doc_status, updated_by, updated_at, documentTitle, keyword, documentNo, doc_parent, workplace, document_category, files, company, created_at } = doc;
    if (!document_category || document_category?.key !== DOC_CATEGORY_OBJ.edoc?.key) {
        return null;
    }

    const db = admin.firestore();
    const notificationsRef = db.collection('notifications')
    const officerRef = db.collection('officers')
    const documentAccountRef = db.collection('documents_header').doc(key).collection('user_permission')

    return admin.firestore().runTransaction(async transaction => {
        const userData = await transaction.get(officerRef.doc(updated_by))
        const user: IOfficer = pushToObject(userData);
        const documentAccountsData = await transaction.get(documentAccountRef.where('isDelete', '==', false).select('key', 'workplaceKey', 'profile', 'approval_order'))
        const documentAccounts: any[] = pushToArray(documentAccountsData);
        const peopleKeys = documentAccounts?.map(m => m?.key);
        const beforeFiles: any[] = (change.before?.data()?.files || [])?.map((m: any) => m?.key);
        const afterFiles: any[] = change.after?.data()?.files || []?.map((m: any) => m?.key);
        const fileDelete = beforeFiles?.filter(key => !afterFiles?.includes(key));
        fileDelete?.map(m => {
            transaction.delete(db.collection('file_folder').doc(m))
        })
        if (files && files.length > 0) {
            const pathItem = {
                key: 'my_files',
                name: 'បណ្ណសារដ្ឋាន',
                name_en: 'My Files',
                path: '/my_files',
                isMyFile: true,
            }
            const pathData = [pathItem]
            const pathString = pathData.map(m => m.key);
            const currentPath = pathData[pathData.length - 1];
            const folder: IFolder = {
                key: `edoc`,
                status: STATUS_OBJ.ACTIVE,
                isDelete: false,
                isFavorite: false,
                isParentDelete: false,
                created_at: created_at,
                created_by: toUserObject(user),
                updated_by: toUserObject(user),
                updated_at: updated_at,
                date_key: toDateKey(new Date()),
                page_key: pageKey(),
                keyword: toCapitalize(documentNo),
                keywords: keyword,
                path: pathData,
                pathString: pathString,
                currentPath: currentPath,
                //fields
                name: `ឯកសារឌីជីថល`,
                fileTag: { color: '#79b8ff' },
                groupKey: [],
                companyKey: company.key,
                companyData: {
                    key: company.key,
                    name: company.name,
                    id: company.id || company.key,
                },
                type: driveObj.folder,
                allowUpload: false,
                yearFolder: false,
                rootLevel: false,
                hashtag: [],
                sharedWith: ['___PUBLIC___'],
                announcement: false,
                shareStatus: true,
                workplace: workplace,
            }
            transaction.set(db.collection('file_folder').doc(folder?.key), folder, { merge: true })
            const folderPath: any = {
                key: folder?.key,
                name: `${folder?.name}`,
                path: `/my_files/${folder?.key}`,
                isDelete: false,
                isFavorite: folder?.isFavorite,
                fileTag: folder?.fileTag,
                type: folder?.type,
                created_by: folder?.created_by,
                isMyFile: false,
            }
            const pathFolderData = pathData.concat([folderPath])
            const pathFolderString = pathFolderData.map(m => m.key);
            const currentFolderPath = pathFolderData[pathFolderData.length - 1];
            const folderEDoc: IFolder = {
                key: key,
                status: STATUS_OBJ.ACTIVE,
                isDelete: false,
                isFavorite: false,
                isParentDelete: false,
                created_at: created_at,
                created_by: toUserObject(user),
                updated_by: toUserObject(user),
                updated_at: updated_at,
                date_key: toDateKey(new Date()),
                page_key: pageKey(),
                keyword: toCapitalize(documentNo),
                keywords: keyword,
                path: pathFolderData,
                pathString: pathFolderString,
                currentPath: currentFolderPath,
                //fields
                name: `${documentNo} - ${documentTitle}`,
                fileTag: { color: '#79b8ff' },
                groupKey: [],
                companyKey: company.key,
                companyData: {
                    key: company.key,
                    name: company.name,
                    id: company.id || company.key,
                },
                type: driveObj.folder,
                allowUpload: false,
                yearFolder: false,
                rootLevel: false,
                hashtag: [],
                sharedWith: peopleKeys || [],
                announcement: false,
                shareStatus: false,
                workplace: workplace,
            }
            transaction.set(db.collection('file_folder').doc(folderEDoc?.key), folderEDoc, { merge: true })

            files?.map(file => {
                const filePath: any = {
                    key: folderEDoc?.key,
                    name: `${folderEDoc?.name}`,
                    path: `/my_files/${folderEDoc?.key}`,
                    isDelete: false,
                    isFavorite: folderEDoc?.isFavorite,
                    fileTag: folderEDoc?.fileTag,
                    type: folderEDoc?.type,
                    created_by: folderEDoc?.created_by,
                    isMyFile: false,
                }
                const filePathData = pathFolderData.concat([filePath])
                const filePathString = filePathData.map(m => m.key);
                const fileCurrentPath = filePathData[filePathData.length - 1];
                const fileItem: IFolder = {
                    ...file,
                    key: file?.key,
                    status: STATUS_OBJ.ACTIVE,
                    isDelete: false,
                    isFavorite: false,
                    isParentDelete: false,
                    created_at: created_at,
                    created_by: toUserObject(user),
                    updated_by: toUserObject(user),
                    updated_at: updated_at,
                    date_key: toDateKey(new Date()),
                    page_key: pageKey(),
                    keyword: toCapitalize(documentNo),
                    keywords: keyword,
                    path: filePathData,
                    pathString: filePathString,
                    currentPath: fileCurrentPath,
                    //fields
                    name: `${file?.name}`,
                    fileTag: { color: '#79b8ff' },
                    groupKey: [],
                    companyKey: company.key,
                    companyData: {
                        key: company.key,
                        name: company.name,
                        id: company.id || company.key,
                    },
                    file: file,
                    type: driveObj.file,
                    fileType: file?.type,
                    allowUpload: false,
                    yearFolder: false,
                    rootLevel: false,
                    hashtag: [],
                    sharedWith: peopleKeys || [],
                    announcement: false,
                    shareStatus: false,
                    workplace: workplace,
                }
                transaction.set(db.collection('file_folder').doc(fileItem?.key), fileItem, { merge: true })
            })
        }
        if (change.before.exists && !change.after.exists) {
            if (files && files?.length > 0) {
                transaction.delete(db.collection('file_folder').doc(key))
                files?.map(file => {
                    transaction.delete(db.collection('file_folder').doc(file?.key))
                })
            }
            return null;
        }
        if (change.before.exists && change.after.exists) {
            const before = change.before.data();
            const after = change.after.data();
            if (before?.doc_status?.key === after?.doc_status?.key) {
                return 'no change status';
            }
        }

        let bodyInfo = `ឯកសារ ${documentNo} - ${documentTitle} បញ្ចប់ការធ្វើសេចក្តីព្រាងនឹងដាក់ត្រួតពិនិត្យឯកភាពដោយ ${user?.last_name} ${user?.first_name} នៃ${user?.currentDepartment?.name || ''}`;
        switch (doc_status?.key) {
            case docStatusObj.hold.key:
                bodyInfo = `បង្កើតឯកសារថ្មីលេខ ${documentNo} - ${documentTitle} ដោយ ${user?.last_name} ${user?.first_name} នៃ${user?.currentDepartment?.name || ''}`;
                break;
            case docStatusObj.final.key:
                bodyInfo = `ឯកសារលេខ ${documentNo} - ${documentTitle} ត្រូវបានបិទបញ្ចប់ដោយជោគជ័យដោយ ${user?.last_name} ${user?.first_name} នៃ${user?.currentDepartment?.name || ''}`;
                break;
            case docStatusObj.void.key:
                bodyInfo = `ឯកសារលេខ ${documentNo} - ${documentTitle} ត្រូវបានដាក់ជាមួយមោឃៈដោយ ${user?.last_name} ${user?.first_name} នៃ${user?.currentDepartment?.name || ''}`;
                break;
            default:
                break;
        }
        const notify: any = {
            key: createKey('notifications'),
            created_at: new Date(),
            created_by: updated_by,
            date_key: toDateKey(new Date()),
            page_key: pageKey(),
            keyword: keyword,
            //====
            title: `ប្រព័ន្ធគ្រប់គ្រងឯកសារឌីជីថល`,
            body: `${bodyInfo}`,
            notifyTo: peopleKeys || [],
            parentKey: doc_parent || null,
            transactionKey: key,
            type: notificationType.DOC_NOTIFY,
            notifyBy: {
                key: user.key,
                displayName: user?.displayName,
                file: user?.file || null,
            }
        }

        documentAccounts.map((u: any) => {
            if (u?.workplaceKey !== workplace.key)
                transaction.set(officerRef.doc(u?.profile?.key), { total_approval_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        })
        return transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
    })
}
