import * as _ from 'lodash';
import * as moment from 'dayjs';
import * as admin from "firebase-admin";
import { months } from './data';
import { IDepartment } from '../interfaces/interface';

export function createKey(collection: any) {
    const docRef = admin.firestore().collection(collection).doc()
    return docRef.id;
}

export function toNameKey(name: string) {
    return `${name}`.trim().toLocaleUpperCase()
}

export function calcRangeDays(a: Date, b: Date) {
    const d1 = moment(a)
    const d2 = moment(b)

    const days = d2.diff(d1, 'days') + 1;
    return days;
}

export function calcCRDays(a: Date, b: Date) {
    const d1 = moment(a)
    const d2 = moment(b)

    const days = d2.diff(d1, 'days') + 1;

    // Subtract all the weekend days
    let businessDays = days;
    let weekend = 0;

    const cur = d1.clone();

    for (let i = 0; i < days; i++) {
        if (cur.day() === 0 || cur.day() === 6) {
            weekend++;
        }
    }

    return businessDays + weekend;
}


export function toHour(date: Date) {
    return moment(date).format("hh:mm A");
}
export function toDay(date: Date) {
    return moment(date).format("D");
}
export function toYear(date: Date) {
    return moment(date).format("YYYY");
}

export function toKhCalendar(date: Date) {
    const day = moment(date).format("D");
    const years = moment(date).format("YYYY");
    return `ថ្ងៃ${toDayKh(date)} ទី${day} ខែ${toMonthKh(date)} ឆ្នាំ${years}`
}

export function toMonthKh(date: any) {
    const index = moment(date).format("MM");
    return months[index].name
}

export function toKhDate(date: Date) {
    const day = moment(date).format("D");
    const years = moment(date).format("YYYY");
    return `ថ្ងៃទី${day} ខែ${toMonthKh(date)} ឆ្នាំ${years}`
}

export function toDayKh(date: Date) {
    const m = moment(date);
    const day = m.format("dddd");
    let dayName: string = "";
    switch (day) {
        case "Monday": dayName = "ច័ន្ទ";
            break;
        case "Tuesday": dayName = "អង្គារ";
            break;
        case "Wednesday":
            dayName = "ពុធ"
            break;
        case "Thursday":
            dayName = "ព្រហស្បតិ៍"
            break;
        case "Friday":
            dayName = "សុក្រ"
            break;
        case "Saturday":
            dayName = "សៅរ៍"
            break;
        case "Sunday":
            dayName = "អាទិត្យ"
            break;
        default:
            break;
    }
    return dayName
}

export function dayRemaining(startDate: Date, endDate: Date) {
    return moment(endDate).diff(moment(startDate), 'days')
}

export function sumArray(data: Array<any>, field: string) {
    if (!data) return 0;
    return data.reduce((a, b) => a + Number(b[field]), 0)
}

export function toZeroString(value: any) {
    const result = toNumber(value);
    return result !== 0 ? result : "0";
}

export function toFloatFixed2(value: any) {
    if (value === null || value === "" || value === undefined) {
        return 0;
    }
    if (Number.isNaN(Number(value))) return 0;
    return Number(value.toFixed(2));
}

export function toNumber(value: any) {
    if (value === null || value === undefined || value === "") {
        return 0;
    }
    if (Number.isNaN(Number(value))) return 0;
    return Number(value);
}

export function toNull(value: any) {
    if (value === "" || value === undefined) {
        return null;
    }
    return value;
}

export function pushObjArray(data: Array<any>, newItem: any) {
    let value = [];
    if (data && data.length > 0) {
        value = data;
        const exist = value.filter(m => m.key === newItem.key);
        if (exist && exist.length > 0) {
            const index = value.findIndex((obj => obj.key === newItem.key));
            value[index] = newItem;
        } else {
            value.push(newItem);
        }
    } else {
        value.push(newItem);
    }

    return value;
}

export function pushStringArray(data: Array<any>, key: string) {
    let value = [];
    if (data && data.length > 0) {
        value = data;
        const exist = value.filter(m => m === key);
        if (exist && exist.length > 0) {
            const index = value.findIndex((obj => obj === key));
            value[index] = key;
        } else {
            value.push(key);
        }
    } else {
        value.push(key);
    }

    return value;
}

export function removeObjArray(data: Array<any>, key: string): any {
    let value = [];
    if (data && data.length > 0) {
        value = data.filter(m => m.key !== key);
    }
    return value;
}

export function removeStingArray(data: Array<any>, key: string): any {
    let value = [];
    if (data && data.length > 0) {
        value = data.filter(m => m !== key);
    }
    return value;
}

export function updatedArrayItem(data: Array<any>, newItem: any) {
    const exist = data.filter(m => m.key === newItem.key);
    if (exist && exist.length > 0) {
        const index = data.findIndex((obj => obj.key == newItem.key));
        data[index] = newItem;
    } else {
        data.push(newItem);
    }
    return data;
}

export function orderBy(data: Array<any>, field: string) {
    return _.orderBy(data, [field])
}

export function orderByDesc(data: Array<any>, field: string) {
    return _.orderBy(data, [field], ['desc'])
}

export function groupBy(data: Array<any>, field: string, filedOrderBy: string) {
    const rows = _.uniqBy(data, field)
    return _.orderBy(rows, [filedOrderBy])
}

export function groupByOnly(data: Array<any>, field: string) {
    const rows = _.uniqBy(data, field)
    return rows;
}

export function groupByDesc(data: Array<any>, field: string, filedOrderBy: string) {
    const rows = _.uniqBy(data, field)
    return _.orderBy(rows, [filedOrderBy], ['desc'])
}

export function pageKey() {
    return Number(moment().format('YYYYMMDDHHmmss'))
}

export function toDateKey(date: Date) {
    return Number(moment(date).format('YYYYMMDD'))
}

export function toDayKey(date: Date) {
    const dateKey = moment(date).format('DD');
    return dateKey.toString();
}

export function toOnlyMonthKey(date: Date) {
    const dateKey = moment(date).format('MM');
    return dateKey.toString();
}

export function toMonthKey(date: Date) {
    const dateKey = moment(date).format('YYYYMM');
    return dateKey.toString();
}

export function toYearKey(date: Date) {
    const dateKey = moment(date).format('YYYY');
    return dateKey.toString();
}

export function getDateKey(day: any, month: any, year: any) {

    // let yearKey = null;
    // if ((toNumber(month) >= 11 && toNumber(day) >= 20) || toNumber(month) >= 12) {
    //     const yearKeyAdd = toNumber(year) + 1;
    //     yearKey = `${yearKeyAdd}`
    // } else {
    //     yearKey = `${year}`;
    // }

    let monthKey = null;
    let yearKeyAdd = null;
    let yearKey = null;
    if (toNumber(day) <= 19) {
        monthKey = `${year}${month}`;
    } else {
        const monthKeyAdd = toNumber(month) + 1;
        let index = monthKeyAdd.toString();
        if (index.length === 1) {
            index = `0${index}`;
        }

        if (toNumber(index) >= 13) {
            yearKeyAdd = toNumber(year) + 1;
            monthKey = `${yearKeyAdd}01`
        } else {
            monthKey = `${year}${index}`
        }
    }

    let dayKey = null;
    if (yearKeyAdd) {
        yearKey = `${yearKeyAdd}`;
    } else {
        yearKey = `${year}`;
    }

    dayKey = `${year}${month}${day}`;

    const result = {
        yearKey: yearKey,
        monthKey: monthKey,
        dayKey: dayKey,
    }
    return result;
}

export function addressObj(item: any) {
    const obj = toNull(item)
    if (obj) {
        return {
            key: item.key,
            id: toNull(item.id),
            house_nr: toNull(item.house_nr),
            street: toNull(item.street),
            resident_type: toNull(item.resident_type),
            CitizenId: toNull(item.CitizenId),
            village: toNull(item.village),
            commune: toNull(item.commune),
            district: toNull(item.district),
            province: toNull(item.province),
        };
    } else return null;
}

export function findNextKey(keys: string[], currentKey: any) {
    if (keys.length === 0) return 'adgHDzEeP7JaxvwEvqpt';//default bong KIMLUX
    if (!currentKey) return keys[0];
    const findIndex = keys?.findIndex(m => m === currentKey);
    if (findIndex === keys.length - 1) return keys[0];
    return keys[findIndex + 1];
}

export function pushToArray(snapshot: admin.firestore.QuerySnapshot): Array<any> {
    if (snapshot.empty) return [];
    return snapshot.docs.map(m => ({ ...m.data() }));
}

export function pushToObject(snapshot: admin.firestore.DocumentSnapshot): any {
    if (!snapshot.exists) return null;
    return { ...snapshot.data(), id: snapshot.id }
}

export function toCapitalize(value: any) {
    let string = null;
    if (value && value !== "") string = value.toString().toUpperCase().trim();
    return string;
}

export const createKeywords = (name: any) => {
    let arrName: any = [];
    let curName = '';
    let nextName = '';
    String(name).trim().split(/[ .\-_ ]/).forEach(letter => {
        curName += letter;
        arrName.push(toCapitalize(letter));
        arrName.push(toCapitalize(curName));
    });

    String(name).split('').forEach(letter => {
        nextName += letter;
        arrName.push(toCapitalize(nextName));
    });

    return arrName;
}

export function generateKeywords(names: string[]) {
    const keywordName = _.flattenDeep(_.map(names, (m) => createKeywords(m))).filter(a => a)
    return [
        ...new Set([
            '~N/A~',
            ...keywordName
        ])
    ];
}

export function nationalityObj(item: any) {
    const obj = toNull(item)
    if (obj) {
        return {
            key: item.key,
            name: toNull(item.name),
            nationality: toNull(item.nationality),
            alpha_2_code: toNull(item.alpha_2_code),
            alpha_3_code: toNull(item.alpha_3_code),
        };
    } else return null;
}

export function geoObj(item: any) {
    const obj = toNull(item)
    if (obj) {
        return {
            key: item.key,
            id: toNull(item.id),
            name: toNull(item.name),
            en_name: toNull(item.en_name),
        };
    } else return null;
}

export function ownerObj(item: any) {
    const obj = toNull(item)
    if (obj) {
        return {
            key: item.key,
            full_name: toNull(item.full_name),
            lastName: toNull(item.lastName),
            firstName: toNull(item.firstName),
            gender: toNull(item.gender),
            dob: toNull(item.dob),
            contactNumber: toNull(item.contactNumber),
            nationality: nationalityObj(item.nationality),
            photoFile: toNull(item.photoFile),
            province: geoObj(item.province),
        };
    } else return null;
}

export function addMonth(date: Date, value: number) {
    return moment(date).add(value, 'month')
}

export function addDay(date: Date, value: number) {
    return moment(date).add(value, 'days')
}

export function businessTypeObj(item: any) {
    const obj = toNull(item)
    if (obj) {
        return {
            key: item.key,
            name: toNull(item.name),
        };
    } else return null;
}

export function numberToDate(date: number) {
    return moment(date, 'YYYYMMDD').toDate();
}


export function toDepartment(item: IDepartment) {
    if (item) {
        const { key, name_en, name, order, code } = item;
        return { key: key, name_en: name_en || null, name: name || null, order: order || null, code: code || null }
    }
    return null;
}

export function toFlatten(rows: Array<any>) {
    return _.flatten(rows)
}

export function toUniq(data: Array<any>): any[] {
    const rows = _.uniq(data)
    return rows
}

export function sum(data: Array<any>, field: string) {
    return data.reduce((a, b) => a + toNumber(b[field]), 0)
}

export function generateRefNo(index: number, refPrefix?: any) {
    const prefix = Number(moment().format('YYMM'));
    const no = index + 1;
    return `${refPrefix || ''}${prefix}${no}`;
}

export function formatMoney(val: any, decimalPlace: any = 2, decimal: any = '.', thousands: any = ',') {
    try {
        let amount: any = val;
        let decimalCount = Math.abs(decimalPlace);
        decimalCount = isNaN(decimalPlace) ? 2 : decimalPlace;
        const negativeSign = amount < 0 ? '-' : '';
        let i: any = parseInt((amount = Math.abs(toNumber(amount) || 0).toFixed(decimalCount))).toString();
        let j = i.length > 3 ? i.length % 3 : 0;
        return (
            negativeSign +
            (j ? i.substr(0, j) + thousands : '') +
            i.substr(j).replace(/(\d{3})(?=\d)/g, '1' + thousands) +
            (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : '')
        );
    } catch (e) {
        return null
    }
}

export function toUserObject(account: any) {
    const { key, full_name, file, displayName, email, phoneNumber, photoURL } = account
    return {
        key: toNull(key),
        displayName: displayName || null,
        full_name: toNull(full_name || displayName),
        photoURL: file?.downloadUrl || photoURL || null,
        email: email || null,
        phoneNumber: phoneNumber || null,
        uid: key,
        file: {
            downloadUrl: file?.downloadUrl || null,
            fileName: file?.name || null,
        },
    }
}
