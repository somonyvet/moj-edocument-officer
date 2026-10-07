import { UntypedFormGroup, UntypedFormControl, AbstractControl } from '@angular/forms';
import * as _ from 'lodash';
import { startWith, map } from 'rxjs/operators';
import moment from 'moment'
import { IDepartment, IManagementLevel, IOfficer, IRanking } from 'src/app/interfaces/document/document.interface';
import { ICompany } from 'src/app/interfaces/user';
import { orderBy, toLocaleNumber } from './convert.service';
import { REPORT_PERIOD_OBJECT } from 'src/app/dummy/config';
import { IMmeMainProgram } from 'src/app/interfaces/mme';
import { KHMER_DAY, KHMER_MONTH_ARRAY, monthOfYear, months } from 'src/app/dummy/report';
import { STATUS_LIVES } from 'src/app/dummy/appinfo';

export class MappingService {

  static autoComplete(stateCtrl: AbstractControl, data: any, type) {
    return stateCtrl.valueChanges.pipe(startWith(''),
      map(state => state ? this.filterStates(data, stateCtrl?.value, type) : data.slice())
    );
  }

  public static validSelected(control: AbstractControl): { [s: string]: boolean } {
    const value = control.value;
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value?.key === 'number') {
        return null;
      }
      if (!value.key && !value.id) {
        return { validKey: true }
      }
    }
  }

  static filterStates(data: any[], value: any, type: string): any[] {
    if (!value) return data;
    if (value.key || value.id || !data) {
      return data;
    }
    return data.filter(state => state && state[type]?.toLowerCase().indexOf(`${value}`?.toLowerCase()) > -1);
  }
  static orderBy(rows: Array<any>, field: string) {
    return _.orderBy(rows, [field])
  }

  static orderByDesc(rows: Array<any>, field: string) {
    return _.orderBy(rows, [field], "desc")
  }

  static groupBy(data: Array<any>, field: string, orderBy: string) {
    const rows = _.uniqBy(data, field)
    return _.orderBy(rows, [orderBy])
  }

  static groupByOrderDesc(data: Array<any>, field: string, orderBy: string) {
    const rows = _.uniqBy(data, field)
    return _.orderBy(rows, [orderBy], ['desc'])
  }

  static provinceObj(item: any) {
    const obj = toNull(item)
    if (obj) {
      return {
        key: item.key,
        name: toNull(item.name),
        id: toNull(item.id),
        en_name: toNull(item.en_name),
      };
    } else return null;
  }

  static districtObj(item: any) {
    const obj = toNull(item)
    if (obj) {
      return {
        key: item.key,
        name: toNull(item.name),
        id: toNull(item.id),
        en_name: toNull(item.en_name),
      };
    } else return null;
  }

  static communeObj(item: any) {
    const obj = toNull(item)
    if (obj) {
      return {
        key: item.key,
        name: toNull(item.name),
        id: toNull(item.id),
        en_name: toNull(item.en_name),
      };
    } else return null;
  }
}

export function validateAllFormFields(formGroup: UntypedFormGroup) {
  Object.keys(formGroup.controls).forEach(field => {
    const control = formGroup.get(field);
    if (control instanceof UntypedFormControl) {
      control.markAsTouched({ onlySelf: true });
    } else if (control instanceof UntypedFormGroup) {
      this.validateAllFormFields(control);
    }
  });
}

export function getDocStatusKeyByUser(currentDepartment: IDepartment | null) {
  const role = currentDepartment?.ranking?.order;
  let key = 0
  switch (role) {
    case 4: key = 1;
      break;
    case 3: key = 2;
      break;
    case 2: key = 4;
      break;
    case 1: key = 6;
      break;
  }
  return (key)
}

export function toNumber(value) {
  if (value === null || value === "" || value === undefined) {
    return 0;
  }
  if (Number.isNaN(value)) return 0;
  return Number(value);
}
export function toNull(value) {
  if (value === null || value === "" || value === undefined) {
    return null;
  }
  return value;
}

export function pageKey() {
  return Number(moment().format('YYYYMMDDHHmmss'))
}


export function objectToArray(obj: any) {
  const mapped = Object.keys(obj).map(key => {
    return ({ type: key, value: obj[key] })
  });
  return mapped
}


export function objectToArrayData(obj: any) {
  const mapped = Object.keys(obj).map(key => {
    return ({
      type: key,
      key: key,
      ...obj[key]
    })
  });
  return mapped
}


export function dateRefNo() {
  return moment().format('YYMM')
}

export function lastWeek() {
  return moment().subtract('week', 1).toDate()
}

export function renameDuplicate(fileName: string, lastDuplicateFileName: string) {
  const num = lastDuplicateFileName.split("(").pop().split(")")[0];
  const valid = isValidNumber(Number(num)) ? Number(num) : 0;
  return `${splitFileName(fileName)} (${valid + 1})${splitExtension(fileName)}`
}

export function splitFileName(fileName: string) {
  if (!fileName) return '';
  const ex = ` ${fileName}`.split('.').pop() || '';
  return fileName.slice(0, -(ex.length + 1))
}

export function splitExtension(fileName: string) {
  if (!fileName) return '';
  const fileExtension = `${fileName}`.split('.');
  return `.${fileExtension[fileExtension.length - 1]}`;
}

export function isValidNumber(num: any) {
  return !!num && num !== Infinity && num !== -Infinity && !isNaN(num) || num === 0
}

export function toCapitalize(value) {
  let string = null;
  if (value) string = value.toUpperCase().toString().trim();
  return string;
}


export const createKeywords = name => {
  const arrName = [];
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
      ...keywordName
    ])
  ];
}

export function toNameKey(name: string) {
  return `${name}`.trim().toLocaleUpperCase()
}

export function toGeoData(item) {
  const obj = toNull(item)
  if (obj) {
    return {
      key: item.key,
      name: toNull(item.name),
      id: toNull(item.id),
      name_en: toNull(item?.en_name || item?.name || null),
      geo_prefix: item?.geo_prefix || null,
    };
  } else return null;
}


export function toUserAccount(item) {
  const obj = toNull(item)
  if (obj) {
    return {
      key: item.key,
      displayName: `${item?.last_name} ${item?.first_name}`,
      file: item?.file || item?.photo || null
    };
  } else return null;
}

export function orderListFormat(number: any) {
  const num = toNumber(number);
  const remainZero = `00000`.substring(0, 5 - (`${num}`.length));
  return `${remainZero}${num}`;
}

export function getCriminalNo(number: any) {
  const num = toNumber(number);
  const remainZero = `000`.substring(0, 3 - (`${num}`.length));
  return `${remainZero}${num}`;
}

export function toRanking(ranking: IRanking) {
  if (ranking) {
    const { key, name_en, name, order } = ranking;
    return { key: key, name_en: name_en || null, name: name || null, order: order || null }
  }
  return null;
}


export function toManagementLevel(ranking: IManagementLevel) {
  if (ranking) {
    const { key, name_en, name, order, nameKey } = ranking;
    return { key: key, name_en: name_en || null, name: name || null, order: order, nameKey: nameKey || null }
  }
  return null;
}
export function toManagementLevelMME(ranking: any) {
  if (ranking) {
    const { key, name_en, name, keyPath } = ranking;
    return { key: key, name_en: name_en || null, name: name || null, order: key, keyPath: keyPath || null }
  }
  return null;
}

export function toWorkplace(item: IDepartment) {
  const { key, name_en, name, order, node, subOfDepartment, index, isWorkplace, adminOffice, ranking, showInHeader, verifyFromAssistant, completedDuration } = item || {};
  return {
    key: key,
    name_en: name_en || null,
    name: name || null,
    order: order,
    showInHeader: showInHeader || false,
    isWorkplace, adminOffice,
    subOfDepartment: subOfDepartment ? toCompany(subOfDepartment) : null,
    ranking: toRanking(ranking),
    index: index,
    node: node || null,
    verifyFromAssistant: verifyFromAssistant || false,
    completedDuration: completedDuration || 0,
  }
}

export function toDepartment(item: IDepartment) {
  if (item) {
    const { key, name_en, name, ranking, code, workplace, subOfDepartment, adminOffice } = item;
    return { key: key, name_en: name_en || null, name: name || null, ranking: ranking ? toRanking(ranking) : null, code: code || null, workplace: workplace || [], subOfDepartment: subOfDepartment || null, adminOffice: adminOffice || false }
  }
  return null;
}
export function toDepartmentMME(item: IMmeMainProgram) {
  if (item) {
    const { key, name_en, name, ranking, code, workplace, subOfProgram } = item;
    return { key: key, name_en: name_en || null, name: name || null, ranking: ranking ? toRanking(ranking) : null, code: code || null, workplace: workplace || [], subOfProgram: subOfProgram || null }
  }
  return null;
}

export function toDepartmentNoWorkplace(item: any) {
  if (item) {
    const { key, name_en, name, code, ranking } = item;
    return { key: key, name_en: name_en || null, name: name || null, ranking: ranking ? toRanking(ranking) : null, code: code || null }
  }
  return null;
}
export function toSubWorkplace(item: any) {
  if (item) {
    const { key, name_en, name, code, ranking } = item;
    return { key: key, name_en: name_en || null, name: name || null, ranking: ranking ? toRanking(ranking) : null, code: code || null }
  }
  return null;
}

export function toCompany(item: ICompany) {
  if (item) {
    const { key, name_en, name } = item;
    return { key: key, name_en: name_en || null, name: name || null }
  }
  return null;
}

export function toKeyAndName(item: any) {
  if (item) {
    const { key, name } = item;
    return { key: key, name: name || null }
  }
  return null;
}

export function toWorkplaceAssistant(item: any) {
  if (item) {
    const { key, name_en, name, positionAssistantKeys, order } = item || {};
    return {
      key: key,
      name_en: name_en || null,
      name: name || null,
      order: order,
      positionAssistantKeys: positionAssistantKeys || []
    }
  }
  return null;
}

export function toSourceBudget(item: any) {
  if (item) {
    const { key, checked, name, positionAssistantKeys, created_by } = item || {};
    return {
      key: key,
      name: name || null,
      checked: checked,
      created_by: created_by || []
    }
  }
  return null;
}

export function toFlatten(rows: Array<any>) {
  return _.flatten(rows)
}

export function groupBySort(data: Array<any>, field: string, filedOrderBy: string): any[] {
  const rows = _.uniqBy(data, field)
  return _.orderBy(rows, [filedOrderBy])
}

export function groupBy(data: Array<any>, field: string): any[] {
  const rows = _.uniqBy(data, field)
  return rows
}

export function toUniq(data: Array<any>): any[] {
  const rows = _.uniq(data)
  return rows
}


export function toOfficer(item: IOfficer) {
  const { key, last_name, first_name, position } = item;
  return { key, last_name: last_name || null, first_name: first_name || null, position: position || null }
}


export function toPosition(item: IRanking) {
  const { key, name, order, name_en } = item;
  return { key, name: name || null, name_en: name_en || null, order }
}

export function addDays(date: Date, totalDays: number): Date {
  return moment(date).add(totalDays, "days").toDate()
}

export function toTimePickerData(date: Date) {
  const time = moment(date);
  return {
    hour: time.hours(),
    minute: time.minutes()
  }
}

export function toDateFromTimePickerData(date: Date, timePicker: any) {
  const { hour, minute } = timePicker
  const time = moment(date).set("hour", hour).set("minute", minute);
  return time.toDate()
}


export function toWorkplaceKeys(workplace: any[]): string[] {
  let keys: string[] = [];
  let keyDepartment = '';
  workplace.map(item => {
    keyDepartment = keyDepartment === '' ? item.key : `${keyDepartment}_${item?.key}`;
    keys.push(keyDepartment)
  })
  return keys;
}

export function toUserWorkplaceKey(workplace: any[]): string {
  let keyDepartment = '';
  workplace.map(item => {
    keyDepartment = keyDepartment === '' ? item.key : `${keyDepartment}_${item?.key}`;
  })
  return keyDepartment;
}

export function getFromDateToDate(periodStatus: any) {
  switch (periodStatus?.key) {
    case REPORT_PERIOD_OBJECT.today?.key:
      return {
        fromDate: moment().toDate(),
        toDate: moment().toDate()
      }
    case REPORT_PERIOD_OBJECT.this_week?.key:
      return {
        fromDate: moment().startOf('isoWeek').toDate(),
        toDate: moment().endOf('isoWeek').toDate()
      }
    case REPORT_PERIOD_OBJECT.this_month?.key:
      return {
        fromDate: moment().startOf('months').toDate(),
        toDate: moment().endOf('months').toDate()
      }
    case REPORT_PERIOD_OBJECT.yesterday?.key:
      return {
        fromDate: moment().subtract(1, 'day').toDate(),
        toDate: moment().subtract(1, 'day').toDate()
      }
    default:
      break;
  }
}

export function getYear(date: Date) {
  const momentData = moment(date)
  return toNumber(momentData.format('YYYY'))
}

export function toEmployee(item: IOfficer, getFile?: boolean) {
  const { key, first_name, last_name, officerId, position, file } = item;
  if (getFile)
    return {
      key: key,
      officerId,
      first_name: first_name || null,
      last_name: last_name || null,
      position: position || null,
      file: file || null,
    }
  return {
    key: key,
    officerId,
    first_name: first_name || null,
    last_name: last_name || null,
    position: position || null,
  }
}

export function getYearData(item) {
  const { key, name, year, yearKey } = item;
  const data = {
    key: key || null,
    name: name || null,
    year: year || null,
    yearKey: yearKey || null,
  }
  return data;
}

export function getPermission(userPermission: any, userPermissionData: any[], currentDepartment: IDepartment | null, document?: any | null) {
  const userOption = {
    hideButton: true,
    disabledBtn: true,
    needVerifyFromAssistant: false,
    hasApprove: false
  }

  if (userPermission?.key === document?.created_by) {
    return (userOption)
  }

  if (!document?.approvedByKeys.includes(userPermission?.key)) {
    if (document?.completedByKeys.includes(userPermission?.key)) {
      userOption.hideButton = false;
      userOption.hasApprove = true;
    };
    return (userOption)
  }

  if (userPermission?.permission?.key === 1) {
    userOption.hideButton = true;
    userOption.disabledBtn = true;
    return userOption;
  }

  if (userPermission?.completedTask) {
    userOption.hideButton = false
    userOption.hasApprove = true
    return (userOption)
  }
  if (userPermission?.permission?.key === 2 || userPermission?.permission?.key === 3) {

    let lowerApprovalUser = userPermissionData.filter(m => m?.approval_order < userPermission?.approval_order)
    lowerApprovalUser = MappingService.orderByDesc(lowerApprovalUser, "approval_order")

    const lowerApprovalItem = lowerApprovalUser[0] || null
    userOption.hideButton = false
    if (lowerApprovalItem && lowerApprovalItem.completedTask) {
      userOption.disabledBtn = false
    } else {
    }

    // let isActive = false
    // const workplaces = orderBy(document?.workplaces, "ranking.order", 'desc').filter(m => m?.isActive)
    // const documentCurrentWorkplace = document?.workplaces.find(m => m.key === currentDepartment?.key);
    // const currentDocumentIndex = workplaces.findIndex(m => m?.key === documentCurrentWorkplace?.key);
    // const underCurrentWorkplaceIndex = currentDocumentIndex === 0 ? 0 : currentDocumentIndex - 1;
    // const underCurrentWorkplaceKey = currentDocumentIndex === 0 ? documentCurrentWorkplace?.key : workplaces[underCurrentWorkplaceIndex]?.key;
    // isActive = currentDocumentIndex === 0 ? documentCurrentWorkplace?.allowUsed : (document.completedWorkplaceKeys.includes(underCurrentWorkplaceKey) && documentCurrentWorkplace?.allowUsed);

    // const assistant = userPermissionData.find(m => (m.workplaceKey === currentDepartment?.key) && m.assistant)
    // const hasSignedFromAssist = assistant?.completedTask
    // userOption.hideButton = !documentCurrentWorkplace


    // if (isActive) {
    //   if (documentCurrentWorkplace?.verifyFromAssistant) {
    //     userOption.disabledBtn = userPermission?.assistant ? false : hasSignedFromAssist ? false : true
    //     userOption.needVerifyFromAssistant = userPermission?.assistant ? false : hasSignedFromAssist ? false : true
    //   } else {
    //     userOption.disabledBtn = false
    //   }
    // }
    return (userOption)
  }
  return (userOption)
}


export function fromNow(date: Date, kh: boolean = false) {
  const AT = kh ? 'នៅ' : 'at'
  return moment(date).calendar('', {
    sameDay: `[${kh ? moment(date).locale("km").fromNow() : moment(date).fromNow()}]`,
    nextDay: `[${kh ? 'ថ្ងៃស្អែក' : 'Tomorrow'}] [${AT}] h:mm A`,
    nextWeek: `dddd [${AT}] h:mm A`,
    lastDay: `[${kh ? 'ម្សិលមិញ' : 'Yesterday'}] [${AT}] h:mm A`,
    lastWeek: `MMM DD [${AT}] h:mm A`,
    sameElse: `MMM DD [${AT}] h:mm A`
  });
}

export function getYearsList(length: number) {
  const getCurrentYear = new Date().getFullYear(); // current year
  return Array.from({ length: length }, (_, i) => getCurrentYear - i);
}


export function toYearKey(date: Date): number {
  return toNumber(moment(date).format('YYYY'))
}

export function workingDay(holidays: any[], date: Date, durationAddDay: number) {
  const daysArr: any[] = [];
  let i = 0;
  while (durationAddDay > daysArr.length) {
    const thisDay = moment(date).add(i, 'days');
    const dayName = thisDay.format('dddd')?.toLocaleLowerCase();
    if (!['saturday', 'sunday']?.includes(dayName) && !holidays?.find(m => m?.from_date_key === toDateKey(thisDay?.toDate()))) {
      daysArr.push(thisDay?.toDate())
    }
    i++;
  }
  return daysArr[daysArr.length - 1];
}


export function workingDayMinus(holidays: any[], date: Date, durationMinus: number) {
  const daysArr: any[] = [];
  let i = 0;
  while (durationMinus > daysArr.length) {
    const thisDay = moment(date).add((i * -1), 'days');
    const dayName = thisDay.format('dddd')?.toLocaleLowerCase();
    if (!['saturday', 'sunday']?.includes(dayName) && !holidays?.find(m => m?.from_date_key === toDateKey(thisDay?.toDate()))) {
      daysArr.push(thisDay?.toDate())
    }
    i++;
  }
  return daysArr[daysArr.length - 1]
}

export function todayDate(date: Date, days: any[], months: any[], years: any[]) {
  const m = moment(date);
  const dd = m.format('DD')
  const mm = m.format('MM')
  const yyyy = m.format('YYYY')
  return {
    day: days?.find(r => r.key === dd),
    month: months?.find(r => r?.key === mm),
    year: years?.find(r => r?.key === yyyy)
  }
}

export function toCodeKey(name: string) {
  return `${name}`.trim().toLocaleUpperCase()
}

export function toDateKey(date: Date) {
  return Number(moment(date).format('YYYYMMDD'))
}

export function toMonthKey(date: Date) {
  return Number(moment(date).format('YYYYMM'))
}

export function toKhmerNumber(number: any) {
  const khNumber = [`០`, `១`, `២`, `៣`, `៤`, `៥`, `៦`, `៧`, `៨`, `៩`];
  const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const chars = Array.from(`${number}`);
  const items = chars.map(m => {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (`${element}` === `${m}`) return khNumber[index]
    }
    return m;
  })
  let result = '';
  items.map(m => {
    result = result + `${m}`
  })
  return result;
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

export function formatFormDate(date?: Date | any): Date {
  if (!date) return undefined
  else if ('toDate' in date && typeof date?.toDate === 'function') {
    return date.toDate()
  } else if (
    (typeof date === 'object' && Object.keys(date).length > 0 && moment(date as Date).isValid()) ||
    ('toString' in date && typeof date?.toString === 'function' && moment(date as Date).isValid())
  ) {
    return moment(date as Date).toDate()
  }
  return undefined
}

export function getOnlyYear(date: Date): number {
  const years = moment(date).format("YYYY");
  return toNumber(years)
}

export function getAmPm(num) {
  if (num >= 12) { return 1 }; // pm
  return 0; // am
}


export function nFormatter(num: any, digits?: any) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits || 0).replace(rx, "$1") + item.symbol : "0";
}

export function hasWhiteSpace(s) {
  if (s) {
    return s.indexOf(' ') >= 0;
  } else {
    return false;
  }
}


export function toYearOfPeriodLocal(date: any) {
  const index = moment(date).locale('km').format("YYYY");
  return index;
}

export function toDayOfMonthLocal(date: any) {
  const index = moment(date).locale('km').format("DD");
  return index;
}


export function validSelected(control: AbstractControl): {
  [s: string]: boolean;
} {
  const value = control.value;
  if (value !== undefined && value !== null && value !== '') {
    if (!value.key && !value.id) {
      return { validKey: true };
    }
  }
  return null;
}
export function autoComplete(
  stateCtrl: AbstractControl,
  data: any,
  field: string,
  checkField?: string
) {
  return stateCtrl.valueChanges.pipe(
    startWith(``),
    map((state) =>
      state
        ? filterStates(data, stateCtrl?.value, field, checkField)
        : data.slice().slice(0, 50)
    )
  );
}

export function filterStates(
  data: any[],
  value: any,
  field: string,
  checkField?: string
): any[] {
  if (value?.key || value?.id || value[checkField] || value[field]) {
    return data.slice(0, 50);
  }
  return data
    ?.filter((state) => {
      return (
        state &&
        state[field] &&
        `${state[field]}`?.toLowerCase().indexOf(`${value?.toLowerCase()}`) > -1
      );
    })
    .slice(0, 50);
}

export function mapToCountryData(item: any){
  if(!item?.key) return null;
  else{
    return {
      key: item?.key,
      en_short_name: item?.en_short_name || null,
      kh_short_name: item?.kh_short_name || null,
      fr_short_name: item?.fr_short_name || null,
    }
  }
}

export function mapToEmbassyData(item: any){
  if(!item?.key) return null;
  else{
    return{
      key: item?.key,
      name: item?.name,
      khName: item?.khName,
    }
  }
}

export function mapToPaymentOption(item: any){
  if(!item?.key) return null;
  else{
    return{
      key: item?.key,
      nationality: item?.nationality,
      duration: item?.duration,
      apply_from: item?.apply_from,
      isStudent: item?.isStudent || false,
      khmer_price: item?.khmer_price,
      france_price: item?.france_price,
      english_price: item?.english_price,
      tran_fee: item?.tran_fee,
    }
  }
}

export function toMonthReceiptKey(date: Date) {
  const dateKey = moment(date).format('YYMM');
  return dateKey.toString();
}

export function isLocalStorageAvailable(){
  var test = 'test';
  try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
  } catch(e) {
      return false;
  }
}

export function mapBirthAddressCriminalRecord(criminalRecord: any){
  if(!criminalRecord?.key) return '/'
  let address = ''

  if(criminalRecord?.isTextAddress){
    address = criminalRecord?.foreignerPlaceOfBirth
  }else{

    if(criminalRecord?.birthAddress?.village?.name){
      address += (criminalRecord?.birthAddress?.village?.geo_prefix?.name? criminalRecord?.birthAddress?.village?.geo_prefix?.name : 'ភូមិ') + criminalRecord?.birthAddress?.village?.name
    }

    if(criminalRecord?.birthAddress?.commune?.name){
      address += " " + (criminalRecord?.birthAddress?.commune?.geo_prefix?.name? criminalRecord?.birthAddress?.commune?.geo_prefix?.name : 'ឃុំ') + criminalRecord?.birthAddress?.commune?.name
    }

    if(criminalRecord?.birthAddress?.district?.name){
      address += " " + (criminalRecord?.birthAddress?.district?.geo_prefix?.name? criminalRecord?.birthAddress?.district?.geo_prefix?.name : 'ស្រុក') + criminalRecord?.birthAddress?.district?.name
    }

    if(criminalRecord?.birthAddress?.province?.name){
      address += " " + (criminalRecord?.birthAddress?.province?.geo_prefix?.name? criminalRecord?.birthAddress?.province?.geo_prefix?.name : 'ខេត្ត') + criminalRecord?.birthAddress?.province?.name
    }
  }
  return address
}

export function mapCurrentAddressCriminalRecord(criminalRecord: any){
  if(!criminalRecord?.key) return '/'
  let address = ''

  if(criminalRecord?.isTextAddress){
    address = criminalRecord?.permanentAddressText
  }else{

    if(criminalRecord?.permanentAddress?.home_no){
      address += 'ផ្ទះលេខ ' + toKhmerNumber(criminalRecord?.home_no);
    }

    if(criminalRecord?.permanentAddress?.street_no){
      address += 'ផ្លូវ ' + toKhmerNumber(criminalRecord?.street_no);
    }

    if(criminalRecord?.permanentAddress?.village?.name){
      address += (criminalRecord?.permanentAddress?.village?.geo_prefix?.name? criminalRecord?.permanentAddress?.village?.geo_prefix?.name : 'ភូមិ') + criminalRecord?.permanentAddress?.village?.name
    }

    if(criminalRecord?.permanentAddress?.commune?.name){
      address += " " + (criminalRecord?.permanentAddress?.commune?.geo_prefix?.name? criminalRecord?.permanentAddress?.commune?.geo_prefix?.name : 'ឃុំ') + criminalRecord?.permanentAddress?.commune?.name
    }

    if(criminalRecord?.permanentAddress?.district?.name){
      address += " " + (criminalRecord?.permanentAddress?.district?.geo_prefix?.name? criminalRecord?.permanentAddress?.district?.geo_prefix?.name : 'ស្រុក') + criminalRecord?.permanentAddress?.district?.name
    }

    if(criminalRecord?.permanentAddress?.province?.name){
      address += " " + (criminalRecord?.permanentAddress?.province?.geo_prefix?.name? criminalRecord?.permanentAddress?.province?.geo_prefix?.name : 'ខេត្ត') + criminalRecord?.permanentAddress?.province?.name
    }
  }
  return address
}


export function mapDobCriminalRecord(criminalRecord: any){
  return cut0inString(criminalRecord?.dateOfBirthDay?.name) + " " + criminalRecord?.dateOfBirthMonth?.name + " " + criminalRecord?.dateOfBirthYear?.name
}

export function  cut0inString(str: any): any {
  if(!str || str?.length === 0) return;
  return(str[0] === '០' || str[0] === '0') ? str.slice(1) : str;
}

export function mapFatherDobCriminalRecord(criminalRecord: any){
  let str = ""
  if(criminalRecord.fatherIsDead?.key !== STATUS_LIVES.DEAD.key){
    if(criminalRecord?.fatherDob?.year||criminalRecord?.fatherDob?.month||criminalRecord?.fatherDob?.day){
      str = `${criminalRecord?.fatherDob?.day?.name ? cut0inString(criminalRecord?.fatherDob?.day?.name):''} ${criminalRecord?.fatherDob?.month?.name ? criminalRecord?.fatherDob?.month?.name : ''} ${criminalRecord?.fatherDob?.year?.name ? criminalRecord?.fatherDob?.year?.name : ''}`
    }else{
      str = '/'
    }
  }
  return str?.trim();
}

export function mapFatherBirthAddressCriminalRecord(criminalRecord: any){
  if(!criminalRecord?.key) return '/'
  let address = ''

  if(criminalRecord?.isTextAddress){
    address = criminalRecord?.foreignerFatherBirthAddress ?  criminalRecord?.foreignerFatherBirthAddress : '/'
  }else{

    if(criminalRecord?.fatherBirthAddress?.district?.name){
      address += " " + (criminalRecord?.fatherBirthAddress?.district?.geo_prefix?.name? criminalRecord?.fatherBirthAddress?.district?.geo_prefix?.name : 'ស្រុក') + criminalRecord?.fatherBirthAddress?.district?.name
    }

    if(criminalRecord?.fatherBirthAddress?.province?.name){
      address += " " + (criminalRecord?.fatherBirthAddress?.province?.geo_prefix?.name? criminalRecord?.fatherBirthAddress?.province?.geo_prefix?.name : 'ខេត្ត') + criminalRecord?.fatherBirthAddress?.province?.name
    }
  }
  return address
}

export function mapMotherDobCriminalRecord(criminalRecord: any){
  let str = ""
  if(criminalRecord.motherIsDead?.key !== STATUS_LIVES.DEAD.key){
    if(criminalRecord?.motherDob?.year||criminalRecord?.motherDob?.month||criminalRecord?.motherDob?.day){
      str = `${criminalRecord?.motherDob?.day?.name ? cut0inString(criminalRecord?.motherDob?.day?.name):''} ${criminalRecord?.motherDob?.month?.name ? criminalRecord?.motherDob?.month?.name : ''} ${criminalRecord?.motherDob?.year?.name ? criminalRecord?.motherDob?.year?.name : ''}`
    }else{
      str = '/'
    }
  }
  return str?.trim()
}

export function mapMotherBirthAddressCriminalRecord(criminalRecord: any){
  if(!criminalRecord?.key) return '/'
  let address = ''
  if(criminalRecord?.isTextAddress){
    address = criminalRecord?.foreignerMotherBirthAddress ?  criminalRecord?.foreignerMotherBirthAddress : '/'
  }else{
    if(criminalRecord?.motherBirthAddress?.district?.name){
      address += " " + (criminalRecord?.motherBirthAddress?.district?.geo_prefix?.name? criminalRecord?.motherBirthAddress?.district?.geo_prefix?.name : 'ស្រុក') + criminalRecord?.motherBirthAddress?.district?.name
    }
    if(criminalRecord?.motherBirthAddress?.province?.name){
      address += " " + (criminalRecord?.motherBirthAddress?.province?.geo_prefix?.name? criminalRecord?.motherBirthAddress?.province?.geo_prefix?.name : 'ខេត្ត') + criminalRecord?.motherBirthAddress?.province?.name
    }
  }
  return address
}

export function mapSpouseDobCriminalRecord(criminalRecord: any){
  let str = ""
  if(criminalRecord.spouseIsDead?.key !== STATUS_LIVES.DEAD.key){
    if(criminalRecord?.spouseDob?.year||criminalRecord?.spouseDob?.month||criminalRecord?.spouseDob?.day){
      str = `${criminalRecord?.spouseDob?.day?.name ? cut0inString(criminalRecord?.spouseDob?.day?.name):''} ${criminalRecord?.spouseDob?.month?.name ? criminalRecord?.spouseDob?.month?.name : ''} ${criminalRecord?.spouseDob?.year?.name ? criminalRecord?.spouseDob?.year?.name : ''}`
    }else{
      str = '/'
    }
  }
  return str?.trim();
}


export function htmlToText(str: string){
  // Create a temporary div element
  let tempDiv = document.createElement('div');
  // Set the HTML content to the div
  tempDiv.innerHTML = str;
  // Get the text content of the div (this strips out the HTML tags)
  return (tempDiv.textContent || tempDiv.innerText || "").trim();
}


export function toDateTextKhmer(value: Date){
  if (!value) return;
  const d_date = new Date(value);
  const d_value = cut0inString(toLocaleNumber(d_date.getDate(), 2))

  const m_date = new Date(value);
  const m_value = KHMER_MONTH_ARRAY[m_date.getMonth()]

  const date = new Date(value);
  const y_value = toLocaleNumber(date.getFullYear())

  return `${d_value} ${m_value} ${y_value}`
}

export function nameEnTransformer(criminal: any){
  var lastName = criminal?.last_name_en
  var arr = lastName?.replace(/\s+/g, ' ').trim().split(" ");
  let str1 = '';
  if (Array.isArray(arr) && arr.length > 0) {
    str1 = arr?.map(i => (i?.toUpperCase())).join(" ")
  }

  var FName = criminal?.first_name_en
  var arr2 = FName?.replace(/\s+/g, ' ').trim().split(" ");
  let str2 = '';
  if (Array.isArray(arr2) && arr2.length > 0) {
    str2 = arr2?.map(i => (i?.toUpperCase())).join(" ")
  }
  return str1?.toUpperCase() + " " + str2?.toUpperCase();
}

export function criminalEnStringUpperCase(str: string){
  if(!str) return;
  var arr = str.replace(/\s+/g, ' ').trim().split(" ");
  if (Array.isArray(arr) && arr.length > 0) {
    const newString = arr?.map(i => (i?.toUpperCase())).join(" ")
    return newString
  }
  return str?.toUpperCase()
}

export function criminalDobEn(criminal: any) {
  if (criminal?.dateOfBirthDay?.name_en || criminal?.dateOfBirthMonth?.name_en|| criminal?.dateOfBirthYear?.name_en) {
    let str = '';
    str = (criminal?.dateOfBirthMonth?.name_en || "") + " " + (cut0inString(criminal?.dateOfBirthDay?.name_en) || "");
    str = ( str === '' || str === ' ' ) ?  null : str;
    str = str ? str + ', ' + criminal?.dateOfBirthYear?.name_en :  criminal?.dateOfBirthYear?.name_en;
    return str?.trim();
  } else {
    return '/';
  }
}

export function criminalFatherDobEn(criminal: any) {
  if (criminal?.fatherDob?.day?.name_en || criminal?.fatherDob?.month?.name_en|| criminal?.fatherDob?.year?.name_en) {
    let str = '';
    str = (criminal?.fatherDob?.month?.name_en || "") + " " + (cut0inString(criminal?.fatherDob?.day?.name_en) || "");
    str = ( str === '' || str === ' ' ) ?  null : str;
    str = str ? str + ', ' + criminal?.fatherDob?.year?.name_en :  criminal?.fatherDob?.year?.name_en;
    return str?.trim();
  } else {
    return '/';
  }
}

export function criminalMotherDobEn(criminal: any) {
  if (criminal?.motherDob?.day?.name_en || criminal?.motherDob?.month?.name_en|| criminal?.motherDob?.year?.name_en) {
    let str = '';
    str = (criminal?.motherDob?.month?.name_en || "") + " " + (cut0inString(criminal?.motherDob?.day?.name_en) || "");
    str = ( str === '' || str === ' ' ) ?  null : str;
    str = str ? str + ', ' + criminal?.motherDob?.year?.name_en :  criminal?.motherDob?.year?.name_en;
    return str?.trim();
  } else {
    return '/';
  }
}

export function criminalSpouseDobDobEn(criminal: any) {
  if (criminal?.spouseDob?.day?.name_en || criminal?.spouseDob?.month?.name_en|| criminal?.spouseDob?.year?.name_en) {
    let str = '';
    str = (criminal?.spouseDob?.month?.name_en || "") + " " + (cut0inString(criminal?.spouseDob?.day?.name_en) || "");
    str = ( str === '' || str === ' ' ) ?  null : str;
    str = str ? str + ', ' + criminal?.spouseDob?.year?.name_en :  criminal?.spouseDob?.year?.name_en;
    return str?.trim();
  } else {
    return '/';
  }
}

export function criminalDateEn(value: Date){
  if (!value) return;
  const d_date = new Date(value);
  const d_value = cut0inString(toLocaleNumber(d_date.getDate(), 2))

  const m_date = new Date(value);
  const m_value = m_date.toString();

  const date = new Date(value);
  const y_value = toLocaleNumber(date.getFullYear())

  return `${d_value} ${m_value} ${y_value}`
}

export function formatCriminalDateEn(date: Date): string {
  const str = moment(date).format("MMMM D, YYYY")
  return str;
}

export function formatCriminalDateFr(date: Date): string {
  const str1 = moment(date).format("D");
  const str2 = monthFr(date);
  const str3 = moment(date).format("YYYY");
  return `${str1}, ${str2}, ${str3}`;
}

export function monthFr(date: any): any {
  const month = new Date(date).toLocaleString('default', { month: 'long' });
  const arrMonth = Object.values(monthOfYear)
  return arrMonth.find(f=> f?.name_en === month)?.name_fr
}


export function isValidUrl(string) {
  try {
      new URL(string);
      return true;
  } catch (_) {
      return false;
  }
}

export function momentObjectToDate(date: any) {
  return date?._isAMomentObject ? date?.toDate() : date;
}
