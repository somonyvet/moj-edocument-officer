import { CRIMINAL_APPLICATION_LANGUAGE, CRIMINAL_LETTER_SETTING, STATUS_LIVES } from "../services/data";
import { createKey } from "../services/mapping";
import {
    criminalDobEn, criminalEnStringUpperCase, criminalFatherDobEn, criminalMotherDobEn, criminalSpouseDobEn,
    formatCriminalDateEn, formatCriminalDateFr, genderFr, hasWhiteSpace, htmlToText,
    mapBirthAddressCriminalRecord, mapCurrentAddressCriminalRecord, mapDobCriminalRecord,
    mapFatherBirthAddressCriminalRecord, mapFatherDobCriminalRecord,
    mapMotherBirthAddressCriminalRecord, mapMotherDobCriminalRecord, mapSpouseDobCriminalRecord,
    nameEnTransformer, toDateTextKhmer, toEnNationality, toFrApplicantNationality, toFrNationality,
} from "./criminal-verify.mapping";

export const CRIMINAL_LETTER_SETTINGS_COLLECTION = 'settings';
export const DEFAULT_LETTER_NO_PADDING = 4;

export interface ILetterNo {
    letter_no: number;
    letter_no_text: string;
    letter_no_year: number;
    letter_setting_key: string | null;
    letter_prefix: string | null;
}

function letterSetting(settingKey: string | null): any {
    if (!settingKey) return null;
    return (CRIMINAL_LETTER_SETTING as any)[settingKey] || null;
}

/** each letter type keeps its own counter, keyed by the record's application type */
export function letterSettingKey(applicationTypeKey: any): string | null {
    const setting = Object.values(CRIMINAL_LETTER_SETTING)
        .find((m: any) => m.application_type_key === applicationTypeKey);
    return setting?.key || null;
}

/**
 * Reads the counter doc (`settings/{letter1|letter2|letter3_business}`, alongside `settings/config`) and returns the next number.
 * Each new year the numbering restarts at the configured `start_no` (1 when unset), so an
 * officer can set where a year begins without ever touching the live counter.
 * The caller must run this before any write in the transaction, then pass the result to
 * `commitLetterNo` so the counter is persisted with the same transaction.
 */
export async function nextLetterNo(
    transaction: FirebaseFirestore.Transaction,
    db: FirebaseFirestore.Firestore,
    settingKey: string,
    issuedDate: Date,
): Promise<ILetterNo> {
    const settingRef = db.collection(CRIMINAL_LETTER_SETTINGS_COLLECTION).doc(settingKey);
    const setting = (await transaction.get(settingRef)).data() as any;

    const year = issuedDate.getFullYear();
    const isSameYear = setting?.year_key === year;
    const start_no = Number(setting?.start_no) > 0 ? Number(setting?.start_no) : 1;
    const letter_no = isSameYear ? (Number(setting?.last_no) || 0) + 1 : start_no;

    const prefix = setting?.prefix || '';
    const padding = Number(setting?.padding) > 0 ? Number(setting?.padding) : DEFAULT_LETTER_NO_PADDING;
    const padded = `${letter_no}`.padStart(padding, '0');
    // every letter type shares one format: prefix + padded number + `/` + the last two digits of
    // the year, e.g. `ព.ថ.៣0012/26` (printed in khmer digits by the letter view).
    // `include_year: false` drops the `/26` tail
    const body = `${prefix}${padded}`;
    const letter_no_text = setting?.include_year === false ? body : `${body}/${yearKeyShort(year)}`;

    return { letter_no, letter_no_text, letter_no_year: year, letter_setting_key: settingKey, letter_prefix: prefix };
}

/** the two digit year the number ends with; 2026 -> `26` */
export function yearKeyShort(year: number): string {
    return `${year}`.slice(-2).padStart(2, '0');
}

/** persists the counter; the settings doc is created on first use so a fresh environment needs no seeding */
export function commitLetterNo(
    transaction: FirebaseFirestore.Transaction,
    db: FirebaseFirestore.Firestore,
    letterNo: ILetterNo,
    issuedAt: any,
) {
    if (!letterNo?.letter_setting_key) return;
    const settingRef = db.collection(CRIMINAL_LETTER_SETTINGS_COLLECTION).doc(letterNo.letter_setting_key);
    transaction.set(settingRef, {
        key: letterNo.letter_setting_key,
        name: letterSetting(letterNo.letter_setting_key)?.name || letterNo.letter_setting_key,
        application_type_key: letterSetting(letterNo.letter_setting_key)?.application_type_key || null,
        prefix: letterNo.letter_prefix || null,
        last_no: letterNo.letter_no,
        year_key: letterNo.letter_no_year,
        last_no_at: issuedAt,
        updated_at: issuedAt,
    }, { merge: true })
}

/** languages the bulletin is issued in; the record keeps them in `criminal_language`, Khmer when unset */
export function criminalLanguageKeys(criminal: any): number[] {
    const keys = (criminal?.criminal_language || [])
        .map((m: any) => m?.key)
        .filter((key: any) => key === CRIMINAL_APPLICATION_LANGUAGE.KHMER.key
            || key === CRIMINAL_APPLICATION_LANGUAGE.FRENCH.key
            || key === CRIMINAL_APPLICATION_LANGUAGE.ENGLISH.key);
    return keys.length > 0 ? keys : [CRIMINAL_APPLICATION_LANGUAGE.KHMER.key];
}

export function verifyQrFieldOfLanguage(languageKey: number): string {
    switch (languageKey) {
        case CRIMINAL_APPLICATION_LANGUAGE.ENGLISH.key: return 'verify_qr_en';
        case CRIMINAL_APPLICATION_LANGUAGE.FRENCH.key: return 'verify_qr_fr';
        default: return 'verify_qr_kh';
    }
}

/**
 * Builds one `document_verify` payload, mirroring `createNewDocumentForVerify` in
 * criminalApplication.store.ts.
 *
 * `verify_key` is set to the document's own key on purpose: the verify-system trigger
 * (`triggerVerifyOADocument`) bails out on any document that already carries one, and the
 * digital flow issues its documents itself rather than leaving them to that trigger. The
 * final-approval handler overwrites it with the key OA answers with.
 */
export function buildDocumentVerify(criminal: any, languageKey: number, letterNo: ILetterNo | null, issuedAt: any, issuedDate: Date, createdBy: any) {
    const key = createKey('document_verify');
    const base = {
        key,
        // marks the document as "not for the auto-issuing trigger"; replaced by OA's key on issue
        verify_key: key,
        document_flow_category: criminal?.document_flow_category || null,
        created_at: issuedAt,
        created_by: createdBy,
        criminal_header_key: criminal?.key,
        criminal_language_key: languageKey,
        letter_no: letterNo?.letter_no || null,
        letter_no_text: letterNo?.letter_no_text || null,
        letter_no_year: letterNo?.letter_no_year || null,
        application_type: criminal?.application_type || null,
        expiredDate: "",
    }

    const letterDate = criminal?.criminal_letter_date?.toDate ? criminal.criminal_letter_date.toDate() : issuedDate;
    const fatherAlive = criminal?.fatherIsDead?.key !== STATUS_LIVES.DEAD.key;
    const motherAlive = criminal?.motherIsDead?.key !== STATUS_LIVES.DEAD.key;
    const spouseAlive = criminal?.spouseIsDead?.key !== STATUS_LIVES.DEAD.key;

    if (languageKey === CRIMINAL_APPLICATION_LANGUAGE.ENGLISH.key) {
        const decree_en = `<p><span style="font-family:'Times New Roman';font-size:26px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The above-mentioned person (<strong>${nameEnTransformer(criminal)}</strong>) does not have any imprisonment record that shall be registered in Bulletin Number 3 of criminal record held by the Ministry of Justice until &nbsp;the date of issuance of this Bulletin.</span></p>`;
        return {
            ...base,
            name: nameEnTransformer(criminal),
            nickname: criminal?.nick_name_en ? criminalEnStringUpperCase(criminal?.nick_name_en) : '/',
            gender: criminal?.gender?.name_en,
            originNationality: toEnNationality(criminal?.before_nationality),
            currentNationality: toEnNationality(criminal?.current_nationality),
            placeOfBirth: criminal?.foreignerPlaceOfBirth_en || '/',
            dateOfBirth: criminalDobEn(criminal),
            currentAddress: criminal?.permanentAddressText_en || '/',
            occupation: criminal?.occupation_en || '/',
            fatherName: criminal?.father_name_en || '/',
            fatherDateOfBirth: fatherAlive ? criminalFatherDobEn(criminal) : "(Deceased)",
            fatherOriginNationality: toEnNationality(criminal?.father_before_nationality),
            fatherCurrentNationality: toEnNationality(criminal?.father_current_nationality),
            fatherPlaceOfBirth: criminal?.foreignerFatherBirthAddress_en || '/',
            motherName: criminal?.mother_name_en || '/',
            motherDateOfBirth: motherAlive ? criminalMotherDobEn(criminal) : "(Deceased)",
            motherOriginNationality: toEnNationality(criminal?.mother_before_nationality),
            motherCurrentNationality: toEnNationality(criminal?.mother_current_nationality),
            motherPlaceOfBirth: criminal?.foreignerMotherBirthAddress_en || '/',
            partnerName: criminal?.spouse_en || '/',
            partnerOccupation: criminal?.spouseCurrentOccupation_en || '/',
            partnerDateOfBirth: spouseAlive ? criminalSpouseDobEn(criminal) : "(Deceased)",
            partnerOriginNationality: toEnNationality(criminal?.spouse_before_nationality),
            partnerCurrentNationality: toEnNationality(criminal?.spouse_current_nationality),
            confirmationNote: htmlToText(criminal?.decree_result?.name_en || decree_en),
            issueDate: formatCriminalDateEn(letterDate),
        }
    }

    if (languageKey === CRIMINAL_APPLICATION_LANGUAGE.FRENCH.key) {
        const decree_fr = `<p><span style="font-family:'Times New Roman';font-size:26px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; La personne précitée ( </span><span style="font-family:'Times New Roman';font-size:26px;"><strong>${nameEnTransformer(criminal)}</strong></span><span style="font-family:'Times New Roman';font-size:26px;"> ) &nbsp;n'a pas d'antécédents de condamnation à prison devant figurer sur le bulletin no 3 du casier judiciaire déposé au ministère de la Justice à partir de la date de publication ce bulletin.</span></p>`;
        return {
            ...base,
            name: nameEnTransformer(criminal),
            nickname: criminal?.nick_name_en ? criminalEnStringUpperCase(criminal?.nick_name_en) : '/',
            gender: genderFr(criminal),
            originNationality: toFrApplicantNationality(criminal?.before_nationality),
            currentNationality: toFrApplicantNationality(criminal?.current_nationality),
            placeOfBirth: criminal?.foreignerPlaceOfBirth_fr || '/',
            dateOfBirth: criminalDobEn(criminal),
            currentAddress: criminal?.permanentAddressText_fr || '/',
            occupation: criminal?.occupation_fr || '/',
            fatherName: criminal?.father_name_en || '/',
            fatherDateOfBirth: fatherAlive ? criminalFatherDobEn(criminal) : "(Deceased)",
            fatherOriginNationality: toFrNationality(criminal?.father_before_nationality),
            fatherCurrentNationality: toFrNationality(criminal?.father_current_nationality),
            fatherPlaceOfBirth: criminal?.foreignerFatherBirthAddress_en || '/',
            motherName: criminal?.mother_name_en || '/',
            motherDateOfBirth: motherAlive ? criminalMotherDobEn(criminal) : "(Deceased)",
            motherOriginNationality: toFrNationality(criminal?.mother_before_nationality),
            motherCurrentNationality: toFrNationality(criminal?.mother_current_nationality),
            motherPlaceOfBirth: criminal?.foreignerMotherBirthAddress_en || '/',
            partnerName: criminal?.spouse_en || '/',
            partnerOccupation: criminal?.spouseCurrentOccupation_en || '/',
            partnerDateOfBirth: spouseAlive ? criminalSpouseDobEn(criminal) : "(Deceased)",
            partnerOriginNationality: toFrNationality(criminal?.spouse_before_nationality),
            partnerCurrentNationality: toFrNationality(criminal?.spouse_current_nationality),
            confirmationNote: htmlToText(criminal?.decree_result?.name_fr || decree_fr),
            issueDate: formatCriminalDateFr(letterDate),
        }
    }

    const default_kh = `<p><span style="font-family:Fasthand, Fasthand;font-size:22px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ឈ្មោះខាងលើនេះ </span><span style="font-family:'Times New Roman';font-size:22px;">( <span style="font-family:Fasthand, Fasthand;font-size:22px; font-weight:bold;"> ${criminal?.last_name}  ${criminal?.first_name} </span> )</span><span style="font-family:Fasthand, Fasthand;font-size:22px;"> ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕</span></p>`;
    return {
        ...base,
        name: `${criminal?.last_name || ''} ${criminal?.first_name || ''}`.trim(),
        nickname: hasWhiteSpace(criminal?.nickname) ? criminal?.nickname : '/',
        gender: criminal?.gender?.name,
        originNationality: criminal?.before_nationality?.kh_nationality,
        currentNationality: criminal?.current_nationality?.kh_nationality,
        placeOfBirth: mapBirthAddressCriminalRecord(criminal),
        dateOfBirth: mapDobCriminalRecord(criminal),
        currentAddress: mapCurrentAddressCriminalRecord(criminal),
        occupation: criminal?.occupation,
        fatherName: criminal?.father_name || "មិនដឹង",
        fatherDateOfBirth: fatherAlive ? mapFatherDobCriminalRecord(criminal) : "(ស្លាប់)",
        fatherOriginNationality: criminal?.father_before_nationality?.kh_nationality || '/',
        fatherCurrentNationality: criminal?.father_current_nationality?.kh_nationality || '/',
        fatherPlaceOfBirth: mapFatherBirthAddressCriminalRecord(criminal),
        motherName: criminal?.mother_name || 'មិនដឹង',
        motherDateOfBirth: motherAlive ? mapMotherDobCriminalRecord(criminal) : "(ស្លាប់)",
        motherOriginNationality: criminal?.mother_before_nationality?.kh_nationality || '/',
        motherCurrentNationality: criminal?.mother_current_nationality?.kh_nationality || '/',
        motherPlaceOfBirth: mapMotherBirthAddressCriminalRecord(criminal),
        partnerName: criminal?.spouse || '/',
        partnerOccupation: criminal?.spouseCurrentOccupation || '/',
        partnerDateOfBirth: spouseAlive ? mapSpouseDobCriminalRecord(criminal) : "(ស្លាប់)",
        partnerOriginNationality: criminal?.spouse_before_nationality?.kh_nationality || '/',
        partnerCurrentNationality: criminal?.spouse_current_nationality?.kh_nationality || '/',
        confirmationNote: htmlToText(criminal?.decree_result?.name || default_kh),
        issueDate: toDateTextKhmer(letterDate),
    }
}
