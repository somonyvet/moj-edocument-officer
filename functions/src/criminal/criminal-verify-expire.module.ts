import * as admin from "firebase-admin";
import { expireVerifyDocument, verifyDocumentStatus } from "./criminal-verify.service";

/**
 * Debug helpers for the verify system, behind the two buttons on the digital bulletin page.
 *
 * The expiry date is set by `/api/issue` itself during the final approval, so nothing here runs
 * on its own — this is what an officer reaches for when a document has to be inspected, or its
 * date posted again by hand.
 */

/**
 * Backs the "Get Verify Status" button: asks the verify system what it knows about every document
 * of one record, next to what we recorded for it. A browser cannot ask the OA server directly —
 * it serves no CORS headers — so the question goes through here.
 */
export async function _onCallVerifyDocumentStatusRef(data: any): Promise<any> {
    const docs = await documentsOf(data);
    return Promise.all(docs.map(({ id, data: verifyDoc }) => describe(id, verifyDoc)));
}

/**
 * Backs the "Set Expire" button: posts `/api/expire` for every document of one record right now,
 * with `expire_at` when the caller names a date, otherwise the date the approval put aside
 * (`verify_expire_target`). One attempt per document, so the answer — success or refusal — is what
 * the officer sees, rather than a retry loop.
 *
 * Answers in the same shape as the status button, so both fill the same panel.
 */
export async function _onCallSetVerifyExpireRef(data: any): Promise<any> {
    const db = admin.firestore();
    const requested = data?.expire_at ? new Date(data.expire_at) : null;
    const docs = await documentsOf(data);

    return Promise.all(docs.map(async ({ id, data: verifyDoc }) => {
        const target = verifyDoc?.verify_expire_target;
        const expiresAt = requested || (target?.toDate ? target.toDate() : (target ? new Date(target) : null));

        if (!expiresAt || isNaN(expiresAt.getTime())) {
            return describe(id, verifyDoc, 'no expiry date to set: pass expire_at or wait for the approval to set verify_expire_target');
        }

        const error = await expireVerifyDocument(id, expiresAt, []);
        const update: any = error
            ? { verify_expire_error: error }
            : { verify_expire_at: expiresAt, verify_expire_error: null };

        await db.collection('document_verify').doc(id).set(update, { merge: true })

        return describe(id, { ...verifyDoc, ...update }, error || `expired at ${expiresAt.toISOString()}`);
    }))
}

/** the documents of one record, or the single document the caller named */
async function documentsOf(data: any): Promise<{ id: string, data: any }[]> {
    const db = admin.firestore();
    const headerKey = data?.header_key;

    if (!headerKey) {
        const doc = await db.collection('document_verify').doc(data?.document_id).get();
        return [{ id: doc.data()?.key || doc.id, data: doc.data() as any }];
    }

    const snapshot = await db.collection('document_verify').where('criminal_header_key', '==', headerKey).get();
    return snapshot.docs.map(doc => ({ id: doc.data()?.key || doc.id, data: doc.data() as any }));
}

/** one document as the debug panel shows it: what we recorded, plus what OA answers right now */
async function describe(id: string, verifyDoc: any, expire_result: string | null = null): Promise<any> {
    const status = await verifyDocumentStatus(id);
    return {
        document_id: id,
        criminal_language_key: verifyDoc?.criminal_language_key ?? null,
        verify_url: verifyDoc?.verify_url || null,
        verify_expire_at: toIso(verifyDoc?.verify_expire_at),
        verify_expire_target: toIso(verifyDoc?.verify_expire_target),
        verify_expire_error: verifyDoc?.verify_expire_error || null,
        expire_result,
        // what the verify system itself answers right now
        issued: status.ok,
        status: status.status,
        response: status.body,
    }
}

function toIso(value: any): string | null {
    if (!value) return null;
    const date = value?.toDate ? value.toDate() : new Date(value);
    return isNaN(date?.getTime?.()) ? null : date.toISOString();
}
