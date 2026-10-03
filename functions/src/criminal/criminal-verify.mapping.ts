import { GENDER_DATA, khmerMonthsArray, MONTH_OF_YEAR, STATUS_LIVES } from "../services/data";

/**
 * Display mappers for the `document_verify` document.
 * Ported from src/app/shared/services/mapping.service.ts so the server can build the
 * same payload the client builds in `createNewDocumentForVerify`.
 */

export function toKhmerNumber(num: any, digit?: number) {
    const numbersKhmer = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    let numString = `${num}`;
    if (digit && digit > 0 && numString.length < digit) {
        numString = '0' + numString;
    }
    let result = '';
    for (let i = 0; i < numString.length; i++) {
        const index = parseInt(numString[i], 10);
        result += isNaN(index) ? numString[i] : numbersKhmer[index];
    }
    return result;
}

export function cut0inString(str: any): any {
    if (!str || str?.length === 0) return str;
    return (str[0] === '០' || str[0] === '0') ? str.slice(1) : str;
}

/**
 * The rich-text editor writes its indentation as entities (`&ensp;`, `&emsp;`, `&nbsp;`) and as
 * unicode spaces. The verify system prints the decree as plain text, where those come out as
 * boxes or stray gaps, so everything that is only spacing is flattened to one ordinary space.
 * The browser-side twin of this (`htmlToText` in mapping.service.ts) gets that for free from the
 * DOM; here it has to be spelled out.
 */
export function htmlToText(str: string) {
    if (!str) return '';
    return `${str}`
        .replace(/<[^>]*>/g, '')
        // spacing entities, named and numeric, all become a plain space
        .replace(/&nbsp;|&ensp;|&emsp;|&thinsp;|&#160;|&#8194;|&#8195;|&#8201;/gi, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // `&amp;` last, so an escaped entity is not decoded twice
        .replace(/&amp;/g, '&')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
        // zero-width characters carry no meaning in print: drop them outright
        .replace(/[\u200b-\u200d\u2060\ufeff]/g, '')
        // every other kind of space (non-breaking, en, em, thin, ideographic) becomes an ordinary one
        .replace(/[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** the client treats a nickname without a space as "not provided" */
export function hasWhiteSpace(s: any) {
    if (!s) return false;
    return `${s}`.indexOf(' ') >= 0;
}

export function toDateTextKhmer(value: Date) {
    if (!value) return '';
    const date = new Date(value);
    return `${cut0inString(toKhmerNumber(date.getDate(), 2))} ${khmerMonthsArray[date.getMonth()]} ${toKhmerNumber(date.getFullYear())}`;
}

export function formatCriminalDateEn(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${MONTH_OF_YEAR[d.getMonth()]?.name_en} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatCriminalDateFr(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()}, ${MONTH_OF_YEAR[d.getMonth()]?.name_fr}, ${d.getFullYear()}`;
}

export function nameEnTransformer(criminal: any) {
    const upper = (value: any) => `${value || ''}`.replace(/\s+/g, ' ').trim().toUpperCase();
    return `${upper(criminal?.last_name_en)} ${upper(criminal?.first_name_en)}`.trim();
}

export function criminalEnStringUpperCase(str: string) {
    if (!str) return str;
    return `${str}`.replace(/\s+/g, ' ').trim().toUpperCase();
}

function dobEn(dob: any) {
    if (dob?.day?.name_en || dob?.month?.name_en || dob?.year?.name_en) {
        let str: any = `${dob?.month?.name_en || ''} ${cut0inString(dob?.day?.name_en) || ''}`;
        str = (str === '' || str === ' ') ? null : str;
        str = str ? `${str}, ${dob?.year?.name_en}` : dob?.year?.name_en;
        return `${str}`.trim();
    }
    return '/';
}

function dobKh(dob: any) {
    if (dob?.year || dob?.month || dob?.day) {
        return `${dob?.day?.name ? cut0inString(dob?.day?.name) : ''} ${dob?.month?.name || ''} ${dob?.year?.name || ''}`.trim();
    }
    return '/';
}

export function criminalDobEn(criminal: any) {
    return dobEn({ day: criminal?.dateOfBirthDay, month: criminal?.dateOfBirthMonth, year: criminal?.dateOfBirthYear });
}

export function criminalFatherDobEn(criminal: any) {
    return dobEn(criminal?.fatherDob);
}

export function criminalMotherDobEn(criminal: any) {
    return dobEn(criminal?.motherDob);
}

export function criminalSpouseDobEn(criminal: any) {
    return dobEn(criminal?.spouseDob);
}

export function mapDobCriminalRecord(criminal: any) {
    return `${cut0inString(criminal?.dateOfBirthDay?.name) || ''} ${criminal?.dateOfBirthMonth?.name || ''} ${criminal?.dateOfBirthYear?.name || ''}`.trim();
}

export function mapFatherDobCriminalRecord(criminal: any) {
    if (criminal?.fatherIsDead?.key === STATUS_LIVES.DEAD.key) return '';
    return dobKh(criminal?.fatherDob);
}

export function mapMotherDobCriminalRecord(criminal: any) {
    if (criminal?.motherIsDead?.key === STATUS_LIVES.DEAD.key) return '';
    return dobKh(criminal?.motherDob);
}

export function mapSpouseDobCriminalRecord(criminal: any) {
    if (criminal?.spouseIsDead?.key === STATUS_LIVES.DEAD.key) return '';
    return dobKh(criminal?.spouseDob);
}

function geoPart(geo: any, defaultPrefix: string) {
    if (!geo?.name) return '';
    return `${geo?.geo_prefix?.name || defaultPrefix}${geo?.name}`;
}

export function mapBirthAddressCriminalRecord(criminal: any) {
    if (!criminal?.key) return '/';
    if (criminal?.isTextAddress) return criminal?.foreignerPlaceOfBirth || '/';
    const address = criminal?.birthAddress;
    return [
        geoPart(address?.village, 'ភូមិ'),
        geoPart(address?.commune, 'ឃុំ'),
        geoPart(address?.district, 'ស្រុក'),
        geoPart(address?.province, 'ខេត្ត'),
    ].filter(m => m).join(' ');
}

export function mapCurrentAddressCriminalRecord(criminal: any) {
    if (!criminal?.key) return '/';
    if (criminal?.isTextAddress) return criminal?.permanentAddressText || '/';
    const address = criminal?.permanentAddress;
    return [
        address?.home_no ? `ផ្ទះលេខ ${toKhmerNumber(criminal?.home_no)}` : '',
        address?.street_no ? `ផ្លូវ ${toKhmerNumber(criminal?.street_no)}` : '',
        geoPart(address?.village, 'ភូមិ'),
        geoPart(address?.commune, 'ឃុំ'),
        geoPart(address?.district, 'ស្រុក'),
        geoPart(address?.province, 'ខេត្ត'),
    ].filter(m => m).join(' ');
}

export function mapFatherBirthAddressCriminalRecord(criminal: any) {
    if (!criminal?.key) return '/';
    if (criminal?.isTextAddress) return criminal?.foreignerFatherBirthAddress || '/';
    return [
        geoPart(criminal?.fatherBirthAddress?.district, 'ស្រុក'),
        geoPart(criminal?.fatherBirthAddress?.province, 'ខេត្ត'),
    ].filter(m => m).join(' ');
}

export function mapMotherBirthAddressCriminalRecord(criminal: any) {
    if (!criminal?.key) return '/';
    if (criminal?.isTextAddress) return criminal?.foreignerMotherBirthAddress || '/';
    return [
        geoPart(criminal?.motherBirthAddress?.district, 'ស្រុក'),
        geoPart(criminal?.motherBirthAddress?.province, 'ខេត្ត'),
    ].filter(m => m).join(' ');
}

export function genderFr(criminal: any) {
    return GENDER_DATA.find(f => f?.key === criminal?.gender?.key)?.name_fr || null;
}

/** `Cambodian`/`Cambodgien` are printed as `Khmer`/`Khmère` on the bulletin */
export function toEnNationality(nationality: any) {
    const value = nationality?.en_nationality;
    if (!value) return '/';
    return value === 'Cambodian' ? 'Khmer' : value;
}

export function toFrNationality(nationality: any) {
    const value = nationality?.fr_nationality;
    if (!value) return '/';
    return value === 'Cambodgien' ? 'Khmère' : value;
}

/**
 * The applicant's own row compares the French nationality against the *English* spelling,
 * unlike the parent/partner rows above. Kept as-is to match what the client writes today.
 */
export function toFrApplicantNationality(nationality: any) {
    const value = nationality?.fr_nationality;
    if (!value) return '/';
    return value === 'Cambodian' ? 'Khmer' : value;
}
