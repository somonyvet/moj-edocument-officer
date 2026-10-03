import { AbstractControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import * as moment from 'moment'
import firebase from 'firebase/compat/app';
import * as _ from 'lodash';
import { months, periodData } from 'src/app/dummy/report';
import { toNumber } from './mapping.service';

@Injectable({
  providedIn: 'root'
})
export class ConvertService {

  constructor() { }

  static calcRangeDays(a, b) {
    const d1 = moment(a)
    const d2 = moment(b)

    const days = d2.diff(d1, 'days') + 1;
    return days;
  }

  static calcCRDays(a, b) {
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
      cur.add(1, 'days')
    }

    return businessDays + weekend;
  }

  static calcWorkingCRDays(a, b) {
    const d1 = moment(a)
    const d2 = moment(b)

    const days = d2.diff(d1, 'days');

    // Subtract all the weekend days
    let businessDays = days;
    let weekend = 0;

    const cur = d1.clone();

    for (let i = 0; i < days; i++) {
      if (cur.day() === 0 || cur.day() === 6) {
        weekend++;
      }
      cur.add(1, 'days')
    }

    return businessDays + weekend;
  }

  static calcBusinessDays(a, b) {
    const d1 = moment(a)
    const d2 = moment(b)

    // Calc all days used including last day ( the +1 )
    const days = d2.diff(d1, 'days') + 1;

    // how many full weekends occured in this time span
    const weekends = Math.floor(days / 7);

    // Subtract all the weekend days
    let businessDays = days;

    const cur = d1.clone();
    for (let i = 0; i < days; i++) {
      if (cur.day() === 0 || cur.day() === 6) {
        businessDays--;
      }
      cur.add(1, 'days')
    }

    return businessDays;
  }

  static calcWeekendsDays(a, b) {
    const d1 = moment(a)
    const d2 = moment(b)

    // Calc all days used including last day ( the +1 )
    const days = d2.diff(d1, 'days') + 1;

    // how many full weekends occured in this time span
    const weekends = Math.floor(days / 7);

    // Subtract all the weekend days
    let businessDays = days;

    const cur = d1.clone();
    let w = 0
    for (let i = 0; i < days; i++) {
      if (cur.day() === 0 || cur.day() === 6) {
        w++;
      }
      cur.add(1, 'days')
    }

    return w;
  }

  static dateFormat(date: Date) {
    return moment(date).format('D/MM/YYYY');
  }

  static uniqueArray(arrArg) {
    return arrArg.filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });
  }

  static getNumber(value: any, getval: any): number {
    if (value === NaN || value === null || value === undefined || value === '') {
      return getval;
    }
    return Number(value);
  }


  static toCapitalize(value) {
    let string = '';
    if (value) string = value.toUpperCase().toString().trim();
    return string;
  }

  static toFloatFixed2(value) {
    if (value === null || value === "" || value === undefined) {
      return 0;
    }
    if (Number(value) === NaN) return 0;
    return Number(value.toFixed(2));
  }

  static toNumber(value) {
    if (value === null || value === "" || value === undefined) {
      return 0;
    }
    if (Number(value) === NaN) return 0;
    return Number(value);
  }

  static numberOnly(sender: any) {
    let numb = sender.match(/\d/g);
    numb = numb.join("");
    return this.toNumber(numb);
  }

  static toYear(date: Date) {
    return moment(date).format('YYYY');
  }

  public toCapitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  public toLoverCase(string) {
    return string.toLoverCase();
  }

  static toNull(value) {
    if (value === null || value === "" || value === undefined) {
      return null;
    }
    return value;
  }

  static toNullInputValue(input: AbstractControl) {
    if (input === undefined || undefined === null) return null;
    const value = input.value;
    if (value === null || value === "" || value === undefined) {
      return null;
    }
    return value;
  }
  static orderBy(data: Array<any>, field: string) {
    return _.orderBy(data, [field])
  }
  static orderByDesc(data: Array<any>, field: string) {
    return _.orderBy(data, [field], ['desc'])
  }
  static toNullInputKey(input: AbstractControl) {
    if (input === undefined || undefined === null) return null;
    const value = input.value;
    if (value === null || value === "" || value === undefined) {
      return null;
    }
    return value.key;
  }


  static yearSuffix() {
    return moment().format('YY').toString();
  }
  static addWeek(interval: number) {
    return moment().add(interval, 'week').toDate()
  }

  static addMonth(interval: number) {
    return moment().add(interval, 'month').toDate()
  }

  static pageKey() {
    return Number(moment().format('YYYYMMDDHHmmss'))
  }

  static toDateKey(date: any) {
    return Number(moment(date).format('YYYYMMDD'))
  }

  static toDateFromKey(dateKey: string) {
    return moment(dateKey, 'YYYYMMDD').toDate()
  }

  static dateKey() {
    return Number(moment().format('YYYYMMDD'))
  }

  static hourToNumber(time) {
    return Number(moment(time, 'hh:mm a').format('HH').toString() + '.' + moment(time, 'hh:mm a').format('mm').toString());
  }

  static toHour(time) {
    return moment(time, 'hh:mm a').format('hh:mm a')
  }

  static generate_testing_invoiceNo(config) {
    var number = Number(moment().format('YYMMDD').toString() + (config.invoice_shufit + 1).toString());
    return number;
  }

  static generate_puc_id(config) {
    var number = moment().format('YY').toString() + (config.puc_id + 1).toString();
    return number;
  }

  static getDateOfLastYearNew() {
    const current = toNumber(moment(new Date()).subtract(1, 'years').format('YYYY'))
    const last = current - 1;
    return {
      form_date: toNumber(`${last}1120`),
      to_date: toNumber(`${current}1119`),
    };
  }
  static getDateSecondSemester() {
    const current = toNumber(moment(new Date()).format('YYYY'))
    const last = current;
    return {
      form_date: toNumber(`${last}0520`),
      to_date: toNumber(`${current}1119`),
    };
  }
  static getDateFirstQuarter() {
    const current = toNumber(moment(new Date()).format('YYYY'))
    const last = current - 1;
    return {
      form_date: toNumber(`${last}1120`),
      to_date: toNumber(`${current}0219`),
    };
  }

  static getDateSecondQuarter() {
    const current = toNumber(moment(new Date()).format('YYYY'))
    const last = current;
    return {
      form_date: toNumber(`${last}0220`),
      to_date: toNumber(`${current}0519`),
    };
  }

  static getDateFirstSemester() {
    const current = toNumber(moment(new Date()).format('YYYY'))
    const last = current - 1;
    return {
      form_date: toNumber(`${last}1120`),
      to_date: toNumber(`${current}0519`),
    };
  }
  static getDateCurrentMonth() {
    const current = moment(new Date()).format('YYYYMM')
    const last = toNumber(moment(new Date()).subtract(1, 'months').format('YYYYMM'))
    return {
      form_date: toNumber(`${last}20`),
      to_date: toNumber(`${current}19`),
    };
  }
  static getDateNineMonth() {
    const current = toNumber(moment(new Date()).format('YYYY'))
    const last = current - 1;
    return {
      form_date: toNumber(`${last}1120`),
      to_date: toNumber(`${current}0819`),
    };
  }

  static getDateOfYearNew() {
    const current = toNumber(moment(new Date()).format('YYYY'))
    const last = current - 1;
    return {
      form_date: toNumber(`${last}1120`),
      to_date: toNumber(`${current}1119`),
    };
  }

  static numberToDate(date: number) {
    return moment(date, 'YYYYMMDD').toDate();
  }

}

export function addDay(date: Date, value: number) {
  return moment(date).add(value, 'days')
}

export function checkIsSatORSun(date: Date) {
  const day = moment(date).day()
  let result = null
  if (day === 6) result = addDay(date, 2)
  else if (day === 0) result = addDay(date, 1)
  else result = moment(date)

  return result
}

export function addMonth(date: Date, value: number) {
  return moment(date).add(value, 'month')
}

export function toMonthKh(date: any) {
  const index = moment(date).format("MM");
  return months[index].name
}

export function covertNumKhmerToLatin(num: string) {
  const rmSpace = num.toString().replace(/\s/g, '')
  const str = rmSpace.split("");
  let dStr = null
  if (str.length > 0) {
    str.map(d => {
      if (d && d !== " ") {
        dStr = `${dStr ? dStr : ''}${toLatinNumber(d)}`
      }
    })
  }

  return dStr
}

export function toLatinNumber(num) {
  let value = null
  const numStr = `${num}`
  switch (numStr) {
    case '០':
      value = 0
      break;
    case '0':
      value = 0
      break;
    case '១':
      value = 1
      break;
    case '1':
      value = 1
      break;
    case '២':
      value = 2
      break;
    case '2':
      value = 2
      break;
    case '៣':
      value = 3
      break;
    case '3':
      value = 3
      break;
    case '៤':
      value = 4
      break;
    case '4':
      value = 4
      break;
    case '៥':
      value = 5
      break;
    case '5':
      value = 5
      break;
    case '៦':
      value = 6
      break;
    case '6':
      value = 6
      break;
    case '៧':
      value = 7
      break;
    case '7':
      value = 7
      break;
    case '៨':
      value = 8
      break;
    case '8':
      value = 8
      break;
    case '៩':
      value = 9
      break;
    case '9':
      value = 9
      break;
    default:
      break;
  }
  return value;
}

export function getStartAndEndOfDay(date: Date) {
  const start = new Date(date)
  const end = new Date(date)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getStartAndEndOfDayFromAndToDate(from: Date, to: Date) {
  const start = new Date(from)
  const end = new Date(to)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getStartEndPeroidWithHours(from: Date, to: Date, fromHour: number, toHour: number){
  const start = new Date(from)
  const end = new Date(to)
  start.setHours(fromHour, 0, 0, 0)
  end.setHours(toHour, 0, 0, 0)
  return { start, end }
}

export function toKhDay(date: any) {
  if (!date) return
  return moment(date).locale('km').format('DD');
}

export function toKhMonth(date: any) {
  if (!date) return
  return moment(date).locale('km').format('MMMM');
}

export function toKhYear(date: any) {
  if (!date) return
  return moment(date).locale('km').format('Y');
}

export function sum(data: Array<any>, field: string) {
  if (!data) return 0;
  return data.reduce((a, b) => a + Number(b[field]), 0)
}

export function sumStock(data: Array<any>) {
  if (!data) return 0;
  return data.reduce((a, b: any) => {
    const { movementType, qty } = b;
    const j = a + Number(qty * movementType.factor)
    return j;
  }, 0)
}

export function pushToArray(snapshot: firebase.firestore.QuerySnapshot): Array<any> {
  if (snapshot.empty) return [];
  return snapshot.docs.map(m => ({ ...m.data() }));
}

export function pushToObject(snapshot: firebase.firestore.DocumentSnapshot): any {
  if (!snapshot.exists) return null;
  return { ...snapshot.data() }
}

export function removeObjArray(data: Array<any>, key: string): any {
  let value = [];
  if (data && data.length > 0) {
    value = data.filter(m => m.key !== key);
  }
  return value;
}

export function fieldValueArrayObject(value: any, field, batches: Array<any>) {
  let result: Array<any> = batches;
  if (batches && batches.length > 0) {
    const { key } = value
    const invalid = batches.filter(m => m[field] === key).length === 0;
    if (invalid) result.push(value);
  }
  else {
    result = [];
    result.push(value);
  }
  return result;
}

export function fieldValueArray(key: any, batches: Array<any>) {
  let result: Array<any> = batches;
  if (batches && batches.length > 0) {
    const invalid = batches.filter(m => m === key).length === 0;
    if (invalid) result.push(key);
  }
  else {
    result = [];
    result.push(key);
  }
  return result;
}


export function removeStingArray(data: Array<any>, key: string): any {
  let value = [];
  if (data && data.length > 0) {
    value = data.filter(m => m !== key);
  }
  return value;
}

export function pushObjArray(data: Array<any>, newItem: any, field: any = "key") {
  let value = [];
  if (data && data.length > 0) {
    value = data;
    const exist = value.filter(m => m[field] === newItem.key);
    if (exist && exist.length > 0) {
      const index = value.findIndex((obj => obj[field] == newItem.key));
      value[index] = newItem;
    } else {
      value.push(newItem);
    }
  } else {
    value.push(newItem);
  }

  return value;
}

export function updateObjArray(data: Array<any>, newItem: any, field: any = "key") {
  const value = [...data];
  if (data && data.length > 0) {
    const exist = value.filter(m => m[field] === newItem.key);
    if (exist && exist.length > 0) {
      const index = value.findIndex((obj => obj[field] == newItem.key));
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
      const index = value.findIndex((obj => obj == key));
      value[index] = key;
    } else {
      value.push(key);
    }
  } else {
    value.push(key);
  }

  return value;
}

export function orderBy(rows: Array<any>, field: string, ascDesc: _.Many<boolean | "asc" | "desc"> = "asc"): any[] {
  return _.orderBy(rows, [field], ascDesc)
}

export function orderByDesc(rows: Array<any>, field: string, ascDesc: _.Many<boolean | "asc" | "desc"> = "asc") {
  return _.orderBy(rows, [field], "desc")
}

export function orderByData(rows: Array<any>, field: string, ascDesc: _.Many<boolean | "asc" | "desc"> = "asc") {
  return _.orderBy(rows, [field], ascDesc)
}

export function toUniq(data: Array<any>): any[] {
  const rows = _.uniq(data)
  return rows
}

export function toLocaleNumber(num: number, digit?: number) {
  if (typeof num !== 'number') return null;
  var numInteger = num;
  var numString = numInteger?.toString();
  if (digit && digit > 0 && numString?.length < digit) {
    numString = '0' + numString;
  }
  var khmerNumber = '';
  var numbersKhmer = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  for (var i = 0; i < numString.length; i++) {
    khmerNumber += numbersKhmer[parseInt(numString[i])];
  }
  return khmerNumber;
};

export function khmerNumberToEN(khNum: string) {
  if (typeof khNum !== 'string') return;

  let strNum: string = ''
  const numbersKhmer = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

  for (let i = 0; i < khNum?.length; i++) {
    strNum += numbersKhmer.findIndex(f => f === khNum[i])
  }

  return parseInt(strNum);
}

export function toDayOfMonth(date: any) {
  const index = moment(date).format("DD");
  return index;
}

export function toMonthOfYear(date: Date) {
  const index = moment(date).format("MM");
  return index;
}

export function toYearOfPeriod(date: any) {
  const index = moment(date).format("YYYY");
  return index;
}

export function getDateReport(optionKey) {
  const items = periodData.filter(m => m.key === optionKey)[0];
  switch (toNumber(items.key)) {
    case 1:
      const fromDate1 = ConvertService.getDateCurrentMonth().form_date
      const toDate1 = ConvertService.getDateCurrentMonth().to_date
      return {
        fromDate: fromDate1,
        toDate: toDate1
      }
    case 2:
      const fromDate2 = ConvertService.getDateFirstQuarter().form_date
      const toDate2 = ConvertService.getDateFirstQuarter().to_date
      return {
        fromDate: fromDate2,
        toDate: toDate2
      }
    case 3:
      const fromDate3 = ConvertService.getDateSecondQuarter().form_date
      const toDate3 = ConvertService.getDateSecondQuarter().to_date
      return {
        fromDate: fromDate3,
        toDate: toDate3
      }
    case 4:
      const fromDate4 = ConvertService.getDateFirstSemester().form_date
      const toDate4 = ConvertService.getDateFirstSemester().to_date
      return {
        fromDate: fromDate4,
        toDate: toDate4
      }
    case 5:
      const fromDate5 = ConvertService.getDateSecondSemester().form_date
      const toDate5 = ConvertService.getDateSecondSemester().to_date
      return {
        fromDate: fromDate5,
        toDate: toDate5
      }
    case 6:
      const fromDate6 = ConvertService.getDateNineMonth().form_date
      const toDate6 = ConvertService.getDateNineMonth().to_date
      return {
        fromDate: fromDate6,
        toDate: toDate6
      }
    case 7:
      const fromDate7 = ConvertService.getDateOfYearNew().form_date
      const toDate7 = ConvertService.getDateOfYearNew().to_date
      return {
        fromDate: fromDate7,
        toDate: toDate7
      }
    case 8:
      const fromDate8 = ConvertService.getDateOfLastYearNew().form_date
      const toDate8 = ConvertService.getDateOfLastYearNew().to_date
      return {
        fromDate: fromDate8,
        toDate: toDate8
      }
    default:
      break;
  }

}

export function dateTimeToSeconds(date: Date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  let totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

  return totalSeconds;
}


export function getDayDifference(startDate: Date, endDate: Date): number {
  const msInDay = 24 * 60 * 60 * 1000;
  if (startDate && endDate)
    return Math.round(Math.abs(Number(endDate) - Number(startDate)) / msInDay) + 1;
  else
    return 0;
}


