import { CRIMINAL_APPLICATION_LANGUAGE } from "../services/data";

/**
 * Payload builder for the OA verify system's `/api/generate` — the `mapVerifyOa` of the verify
 * codebase (`triggerVerifyOADocument`).
 *
 * The shape is fixed by the OA encryption server's own config (`server-config-prod.json`):
 * `data` is validated against an AJV schema requiring `id`, `recipient` and `certificate`, every
 * recipient field being a plain string, and `id_field: "id"` means `data.id` becomes the
 * `document_id` that `/api/issue` and `/api/expire` are keyed by — which is why both are called
 * with our own `document_verify.key`.
 */
export const OA_INSTITUTION = 'Ministry of Justice';
export const OA_INSTITUTION_KM = 'ក្រសួងយុត្តិធម៌';

/** the `language` enum the OA schema accepts */
export function oaLanguage(languageKey: number): string {
    switch (languageKey) {
        case CRIMINAL_APPLICATION_LANGUAGE.ENGLISH.key: return 'en';
        case CRIMINAL_APPLICATION_LANGUAGE.FRENCH.key: return 'fr';
        default: return 'km';
    }
}

export function mapVerifyOa(documentVerify: any): any {
    const doc = documentVerify || {};
    return {
        data: {
            id: doc?.key,
            recipient: {
                name: text(doc?.name),
                nickname: text(doc?.nickname),
                gender: text(doc?.gender),
                originNationality: text(doc?.originNationality),
                currentNationality: text(doc?.currentNationality),
                placeOfBirth: text(doc?.placeOfBirth),
                dateOfBirth: text(doc?.dateOfBirth),
                currentAddress: text(doc?.currentAddress),
                occupation: text(doc?.occupation),
                fatherName: text(doc?.fatherName),
                fatherDateOfBirth: text(doc?.fatherDateOfBirth),
                fatherOriginNationality: text(doc?.fatherOriginNationality),
                fatherCurrentNationality: text(doc?.fatherCurrentNationality),
                fatherPlaceOfBirth: text(doc?.fatherPlaceOfBirth),
                motherName: text(doc?.motherName),
                motherDateOfBirth: text(doc?.motherDateOfBirth),
                motherOriginNationality: text(doc?.motherOriginNationality),
                motherCurrentNationality: text(doc?.motherCurrentNationality),
                motherPlaceOfBirth: text(doc?.motherPlaceOfBirth),
                partnerName: text(doc?.partnerName),
                partnerOccupation: text(doc?.partnerOccupation),
                partnerDateOfBirth: text(doc?.partnerDateOfBirth),
                partnerOriginNationality: text(doc?.partnerOriginNationality),
                partnerCurrentNationality: text(doc?.partnerCurrentNationality),
                confirmationNote: text(doc?.confirmationNote),
                issueDate: text(doc?.issueDate),
                expiredDate: text(doc?.expiredDate),
                language: oaLanguage(doc?.criminal_language_key),
            },
            certificate: {
                institution: OA_INSTITUTION,
                institutionKm: OA_INSTITUTION_KM,
            },
        },
    }
}

/** every recipient field is a required string in the OA schema, so nothing may go out as null */
function text(value: any): string {
    if (value === null || value === undefined) return '';
    return `${value}`;
}
