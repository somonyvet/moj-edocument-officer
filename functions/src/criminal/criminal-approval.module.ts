import * as admin from "firebase-admin";
import { Change, EventContext } from "firebase-functions/lib/cloud-functions";
import { INotification } from "../interfaces/interface";
import { DOCUMENT_FLOW_CATEGORY, notificationType, STATUS_OBJ } from "../services/data";
import { addDay, addMonth, createKey, pageKey, toDateKey } from "../services/mapping";
import { statisticCriminal } from "./criminal.module";
import {
    buildDocumentVerify, commitLetterNo, criminalLanguageKeys, ILetterNo,
    letterSettingKey, nextLetterNo, verifyQrFieldOfLanguage,
} from "./criminal-letter.module";
import { errorMessage, issueVerifyDocument } from "./criminal-verify.service";


/** a digital bulletin stays valid for 90 days from the day it is issued */
export const CRIMINAL_LETTER_VALID_DAYS = 90;

/**
 * Digital approval flow: the client only stamps `internal_status = APPROVED` when the
 * last workplace of `workplaceKeys` approves. This trigger closes the record on the
 * server side: status, expiry date, letter number, issuing to the verify system,
 * notifications and statistic.
 */
export function _onCriminalRecordFinalApprovalRef(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
    const before: any = change.before.data();
    const after: any = change.after.data();

    if (!change.after.exists || !after) return null;
    if (after?.document_flow_category?.key !== DOCUMENT_FLOW_CATEGORY.digital.key) return null;

    const isFinalApproved = after?.internal_status?.key === STATUS_OBJ.APPROVED.key;
    const wasFinalApproved = before?.internal_status?.key === STATUS_OBJ.APPROVED.key;
    // only the transition into the final approval matters, otherwise our own write loops back
    if (!isFinalApproved || wasFinalApproved) return null;
    if (after?.status?.key === STATUS_OBJ.APPROVED.key) return null;

    const db = admin.firestore();
    const criminalRecordKeyRef = after?.key || change.after.id;
    const { citizen_ref, tran_by, tran_at, updated_by } = after;
    const approved_by = tran_by || updated_by || null;
    const approved_at = tran_at || admin.firestore.Timestamp.now();
    const approved_date = approved_at?.toDate ? approved_at.toDate() : new Date();
    const tran_date_key = toDateKey(approved_date);
    const expire_at = addDay(approved_date, CRIMINAL_LETTER_VALID_DAYS).toDate();
    let verifyDocs: any[] = [];

    return db.runTransaction(async transaction => {
        const criminalDoc = await transaction.get(db.collection('criminal_record').doc(criminalRecordKeyRef));
        const criminal = criminalDoc.data() as any;
        if (!criminal) return null;
        // another instance may have closed the record already
        if (criminal?.status?.key === STATUS_OBJ.APPROVED.key) return null;

        // every read of a transaction has to happen before its first write
        const settingKey = criminal?.letter_no ? null : letterSettingKey(criminal?.application_type?.key);
        const letterNo: ILetterNo | null = settingKey ? await nextLetterNo(transaction, db, settingKey, approved_date) : null;

        const notificationsRef = db.collection('notifications')
        const userRef = db.collection('users')
        const documentVerifyRef = db.collection('document_verify')
        const expired_date = addMonth(approved_date, 3).toDate();

        const recordUpdate: any = {
            status: STATUS_OBJ.APPROVED,
            internal_status: STATUS_OBJ.APPROVED,
            request_approval_workplace_keys: [],
            internal_approved_at: approved_at,
            internal_approved_by: approved_by,
            received_expired_date: expired_date,
            received_expired_date_key: toDateKey(expired_date),
        }

        if (letterNo) {
            commitLetterNo(transaction, db, letterNo, approved_at)
            recordUpdate.letter_no = letterNo.letter_no;
            recordUpdate.letter_no_text = letterNo.letter_no_text;
            recordUpdate.letter_no_year = letterNo.letter_no_year;
            recordUpdate.letter_no_at = approved_at;
            recordUpdate.keyword = admin.firestore.FieldValue.arrayUnion(letterNo.letter_no_text);
        }

        // issue to verify: one document_verify per issued language, the QR itself is filled in by the verify system
        const criminal_letter_date = criminal?.criminal_letter_date || approved_at;
        recordUpdate.criminal_letter_date = criminal_letter_date;
        recordUpdate.do_verify = true;
        recordUpdate.issued_at = approved_at;
        recordUpdate.issued_by = approved_by;

        const issuedLetterNo: ILetterNo | null = letterNo || (criminal?.letter_no ? {
            letter_no: criminal?.letter_no,
            letter_no_text: criminal?.letter_no_text,
            letter_no_year: criminal?.letter_no_year,
            letter_setting_key: null,
            letter_prefix: null,
        } : null);

        // the bulletin stops verifying 90 days after it is issued
        const verify_expire_target = addDay(approved_date, CRIMINAL_LETTER_VALID_DAYS).toDate();
        recordUpdate.expired_date = verify_expire_target;
        recordUpdate.expired_date_key = toDateKey(verify_expire_target);
        recordUpdate.do_expire_at = approved_at;
        recordUpdate.do_expire_by = approved_by;

        // a retried transaction re-runs this callback, so the documents are collected from scratch
        verifyDocs = [];
        criminalLanguageKeys(criminal).forEach((languageKey: number) => {
            const verifyDoc = buildDocumentVerify(
                { ...criminal, key: criminalRecordKeyRef, criminal_letter_date },
                languageKey,
                issuedLetterNo,
                approved_at,
                approved_date,
                approved_by,
            );
            // `verify_expire_target` is the date `/api/issue` will be given, kept on the document
            // so the "Set Expire" button can post the same one if it ever has to be set again
            const targetedVerifyDoc = { ...verifyDoc, verify_expire_target };
            verifyDocs.push(targetedVerifyDoc);
            transaction.set(documentVerifyRef.doc(verifyDoc.key), targetedVerifyDoc, { merge: true });
            // `null` is what the print UI reads as "handed to the verify system, QR pending"
            recordUpdate[verifyQrFieldOfLanguage(languageKey)] = null;
        })

        transaction.set(db.collection('criminal_record').doc(criminalRecordKeyRef), recordUpdate, { merge: true })

        const notify: INotification = {
            key: createKey('notifications'),
            created_at: approved_at,
            created_by: approved_by?.key,
            date_key: tran_date_key,
            page_key: pageKey(),
            keyword: [],
            //====
            title: `អនុម័តលើព្រឹត្តិបត្រថ្កោលទោស`,
            title_en: `Approve Criminal Record`,
            title_fr: `Approuver le casier judiciaire`,
            body: `ព្រឹត្តិបត្រថ្កោលទោសឈ្មោះ ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'ដែលមានលេខទូរសព្ទ ' + criminal?.phoneNumber : ''} បានអនុម័តដោយជោគជ័យ`,
            body_en: `${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name}'s criminal Record ${criminal?.phoneNumber ? 'with phone number ' + criminal?.phoneNumber : ''} successfully approved`,
            body_fr: `Criminal record ${criminal?.last_name || criminal?.last_name_en} ${criminal?.first_name || criminal?.first_name} ${criminal?.phoneNumber ? 'avec numéro de téléphone ' + criminal?.phoneNumber : ''} approuvé avec succès`,
            notifyTo: [citizen_ref],
            parentKey: null,
            transactionKey: criminalRecordKeyRef,
            notifyBy: approved_by,
            type: notificationType.CRIMINAL,
        }
        transaction.set(notificationsRef.doc(notify.key), notify, { merge: true });
        if (citizen_ref) {
            transaction.set(userRef.doc(citizen_ref), { total_notify: admin.firestore.FieldValue.increment(1) }, { merge: true })
        }

        const notifiyKeys: any[] = citizen_ref ? [{ key: citizen_ref, name: 'user' }] : [];

        if (criminal?.apply_from?.key === 'oversea' && criminal?.application_embassy?.key) {
            const embassyNotify: INotification = {
                ...notify,
                key: createKey('notifications'),
                notifyTo: [criminal?.application_embassy?.key],
                notifyBy: {
                    photoUrl: criminal?.photoUrl,
                    name: 'SYSTEM',
                    key: 'SYSTEM'
                },
            }
            transaction.set(notificationsRef.doc(embassyNotify.key), embassyNotify, { merge: true });
            notifiyKeys.push({ key: criminal?.application_embassy?.key, name: 'oversea' })
        }

        statisticCriminal(transaction, { tran_at: approved_at, tran_date_key }, criminal, 'total_criminal_approved', 'total_criminal_approved_female', notifiyKeys)
        return true;
    }).then(async (approved: boolean | null) => {
        // nothing was closed by this run (already approved, or record gone) so there is nothing to issue
        if (!approved) return null;
        return issueToVerify(db, criminalRecordKeyRef, verifyDocs, expire_at);
    })
}

/**
 * Generates and issues every document of the record at the verify system, then writes back what
 * OA answered: `verify_key` / `verify_url` and the QR the printed bulletin shows.
 *
 * The expiry date rides along in the `/api/issue` call, so no separate `/api/expire` is needed:
 * the document is issued already carrying the date it stops verifying on.
 *
 * Runs after the transaction commits because these are network side effects and must not be
 * replayed on a transaction retry. A failure is recorded on the record rather than thrown, so a
 * verify-system outage never rolls back an approval that is already final.
 */
async function issueToVerify(
    db: FirebaseFirestore.Firestore,
    criminalRecordKeyRef: string,
    verifyDocs: any[],
    expire_at: Date,
) {
    if (!verifyDocs.length) return null;

    const recordUpdate: any = {};
    const errors: string[] = [];

    // one after another: OA is a single external service and the documents of one record are few
    for (const verifyDoc of verifyDocs) {
        try {
            const issued = await issueVerifyDocument(verifyDoc, expire_at);

            await db.collection('document_verify').doc(verifyDoc.key).set({
                verify_key: issued.verify_key || verifyDoc.key,
                verify_url: issued.verify_url || null,
                verify_qr: issued.verify_qr || null,
                // `/api/issue` carried this date, so the document is issued already expiring on it
                verify_expire_at: expire_at,
            }, { merge: true })

            if (issued.verify_qr) {
                recordUpdate[verifyQrFieldOfLanguage(verifyDoc.criminal_language_key)] = issued.verify_qr;
            }
        } catch (err) {
            errors.push(`${verifyDoc.key}: ${errorMessage(err)}`);
        }
    }

    if (errors.length) console.error(`verify OA issuing failed for ${criminalRecordKeyRef}`, errors.join('; '));

    await db.collection('criminal_record').doc(criminalRecordKeyRef).set({
        ...recordUpdate,
        verify_issued: !errors.length,
        verify_issued_at: admin.firestore.Timestamp.now(),
        verify_issue_error: errors.length ? errors.join('; ') : null,
    }, { merge: true })
    return null;
}
