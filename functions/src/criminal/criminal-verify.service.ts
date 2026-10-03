import * as admin from 'firebase-admin';
import axios from 'axios';
import * as fn from 'firebase-functions';
import { mapVerifyOa } from './criminal-verify.oa';

/**
 * Client for the OA verify system, inlining what `triggerVerifyOADocument` and the
 * `onCallSignVerifyOA` callable of the verify codebase do:
 *
 *   `/api/generate` — creates the document at OA, answers with its key, url and QR image
 *   `/api/issue`    — publishes it (keyed by our own `document_verify.key`)
 *   `/api/expire`   — sets the date it stops verifying
 *
 * The final-approval handler drives generate + issue itself, and the expiry date rides along in
 * the issue call, so `/api/expire` is only left for the "Set Expire" button. `onCallSignVerifyOA`
 * cannot be reached server to server (it requires `request.auth`).
 *
 * Override the OA host with `firebase functions:config:set verify.oa_url="https://…"`.
 */
export const DEFAULT_OA_URL = 'https://verify.moj.gov.kh/oa';
export const OA_GENERATE_PATH = '/api/generate';
export const OA_ISSUE_PATH = '/api/issue';
export const OA_EXPIRE_PATH = '/api/expire';
export const OA_STATUS_PATH = '/api/get_document_status';
export const OA_TIMEOUT_MS = 60000;
/** backoff of the "Set Expire" button, in ms between attempts; issuing needs none of this */
export const OA_EXPIRE_RETRY_DELAYS_MS = [5000, 15000, 30000];
/** where the generated QR images are stored, same folder the verify codebase uses */
export const VERIFY_QR_FOLDER = 'verify_qr';

export interface IVerifyIssued {
    verify_key: string;
    verify_url: string;
    verify_qr: string | null;
}

export function oaUrl(path: string): string {
    const config = (() => {
        try {
            return fn.config()?.verify || {};
        } catch (e) {
            return {};
        }
    })() as any;

    const base = `${config?.oa_url || DEFAULT_OA_URL}`.replace(/\/+$/, '');
    return `${base}${path}`;
}

/**
 * Generates and issues one `document_verify` document at OA and stores its QR image.
 * Throws when OA refuses any of the two calls — the caller records the failure on the record.
 *
 * `/api/issue` carries `expires_at` all the way to
 * `service.verify.gov.kh/api/external/documents/{id}/issue`, so the real +90 day date is sent here
 * rather than the `new Date()` the verify codebase's trigger sends. The document comes out already
 * carrying the date it stops verifying on, which is why nothing calls `/api/expire` afterwards.
 */
export async function issueVerifyDocument(documentVerify: any, expiresAt: Date): Promise<IVerifyIssued> {
    const documentId = documentVerify?.key;
    const generated = await postToUrl<any>(oaUrl(OA_GENERATE_PATH), mapVerifyOa(documentVerify));

    await postToUrl<any>(oaUrl(OA_ISSUE_PATH), { document_id: documentId, expires_at: expiresAt.toISOString() });

    const verify_qr = generated?.qrcode_data
        ? await uploadBase64(generated.qrcode_data, VERIFY_QR_FOLDER, generated?.key || documentId, 'png')
        : null;

    return { verify_key: generated?.key, verify_url: generated?.url, verify_qr };
}

/**
 * Changes the expiry date of an already-issued document, which is what the officer-driven
 * `scan-expire-date` flow and the "Set Expire" button do. Issuing sets the date on its own, so
 * the approval never needs this.
 *
 * Retried with backoff: right after issuing, the upstream can still refuse a document whose
 * signature has not settled. Resolves to null on success, or the error message of the last attempt.
 */
export async function expireVerifyDocument(
    documentId: string,
    expiresAt: Date,
    retryDelays: number[] = OA_EXPIRE_RETRY_DELAYS_MS,
): Promise<string | null> {
    const delays = [0, ...retryDelays];

    let lastError = 'not attempted';
    for (const delay of delays) {
        if (delay) await wait(delay);
        try {
            await postToUrl<any>(oaUrl(OA_EXPIRE_PATH), { document_id: documentId, expires_at: expiresAt.toISOString() });
            return null;
        } catch (err) {
            lastError = errorMessage(err);
        }
    }
    return lastError;
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Raw answer of `/api/get_document_status/{id}`, for the "Get Verify Status" button.
 * Never throws: a refusal is part of the answer.
 *
 * Informational only — do not put it in front of `/api/expire`. It answers `403` for documents
 * that `/api/expire` then accepts, so gating on it skips calls that would have worked.
 */
export async function verifyDocumentStatus(documentId: string): Promise<{ ok: boolean, status: number, body: any }> {
    try {
        const response = await axios.get(`${oaUrl(OA_STATUS_PATH)}/${encodeURIComponent(documentId)}`, { timeout: OA_TIMEOUT_MS });
        return { ok: true, status: response.status, body: response.data ?? null };
    } catch (err) {
        const status = (err as any)?.response?.status || 0;
        return { ok: false, status, body: (err as any)?.response?.data ?? errorMessage(err) };
    }
}

export function errorMessage(err: any): string {
    const body = err?.response?.data;
    const fromBody = body?.error?.message || body?.error || body?.message;
    if (fromBody) return `${typeof fromBody === 'string' ? fromBody : JSON.stringify(fromBody)}`.slice(0, 500);
    if (err?.response?.status) return `HTTP ${err.response.status}`;
    return `${err?.message || err}`.slice(0, 500);
}

async function postToUrl<T>(url: string, body: any): Promise<T> {
    const response = await axios.post<T>(url, body, {
        timeout: OA_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
}

/**
 * Stores a base64 payload in the default bucket and returns a download URL, the same shape of URL
 * the app already stores in `verify_qr_kh` / `_en` / `_fr` and renders on the printed bulletin.
 */
export async function uploadBase64(base64: string, folder: string, name: string, extension: string): Promise<string> {
    const bucket = admin.storage().bucket();
    const path = `${folder}/${name}.${extension}`;
    const file = bucket.file(path);
    const token = createDownloadToken();

    await file.save(Buffer.from(`${base64}`.replace(/^data:.*;base64,/, ''), 'base64'), {
        resumable: false,
        contentType: `image/${extension}`,
        metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    });

    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** uuid v4, the token format the Firebase SDKs put on a download URL */
function createDownloadToken(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
}
