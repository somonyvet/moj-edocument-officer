import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toLocaleNumber } from '../services/convert.service';
import { KHMER_MONTH_ARRAY, monthOfYear } from 'src/app/dummy/report';
import { getAmPm, toKhmerNumber } from '../services/mapping.service';
import moment from 'moment';

@Pipe({
    name: 'dateTime',
    standalone: false
})
export class DateTimePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) return;
    const date = new Date(value);
    return new DatePipe('en-US').transform(date, 'MMM dd, yyyy hh:MM:ss a');
  }
}
@Pipe({
    name: 'khmerDateOnly',
    standalone: false
})
export class KhmerDatePipe implements PipeTransform {

  transform(value: any, type?: any): any {
    if (!value) return;
    let d = null;
    if (type === 'day') {
      d = moment(value).locale('km').format('D');
    }
    if (type === 'month') {
      d = moment(value).locale('km').format('MMMM');
    }
    if (type === 'year') {
      d = moment(value).locale('km').format('Y');
    }
    return d
  }

}

@Pipe({
    name: 'khmerDateDisplay',
    standalone: false
})
export class KhmerDateDisplayPipe implements PipeTransform {

  transform(value: any): any {
    if (!value) return;
    const d = `${moment(value).locale('km').format('D')} / ${moment(value).locale('km').format('MMMM')} / ${moment(value).locale('km').format('Y')}`
    return d
  }

}

@Pipe({
    name: 'dateDayKh',
    standalone: false
})
export class DateDayKh implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) return;
    const date = new Date(value);
    return toLocaleNumber(date.getDate(), 2)
  }
}

@Pipe({
    name: 'dateMonthKh',
    standalone: false
})
export class DateMonthKhPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) return;
    const date = new Date(value);
    return KHMER_MONTH_ARRAY[date.getMonth()]
  }
}

@Pipe({
    name: 'dateYearKh',
    standalone: false
})
export class DateYearKh implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) return;
    const date = new Date(value);
    return toLocaleNumber(date.getFullYear())
  }
}


@Pipe({
    name: 'dateKh',
    standalone: false
})
export class DateKh implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) return;
    const date = new Date(value);
    const formattedDate =
      toLocaleNumber(date.getDate(), 2)
      + '-'
      + KHMER_MONTH_ARRAY[date.getMonth()]
      + '-'
      + toLocaleNumber(date.getFullYear())
    return formattedDate;
  }
}


@Pipe({
    name: 'dateTimeKh',
    standalone: false
})
export class DateTimeKh implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) return;
    const ampm= [ 'ព្រឹក', 'ល្ងាច' ]
    let hours = value.getHours();
    if( hours > 12 ) { hours -= 12; };

    const formattedDate =
      toLocaleNumber(value.getDate(), 2)
      + '-'
      + KHMER_MONTH_ARRAY[value.getMonth()]
      + '-'
      + toLocaleNumber(value.getFullYear())
      + ' ' + 'ម៉ោង' + ' '
      + toLocaleNumber( hours, 2 )
      + ':'
      + toLocaleNumber( value.getMinutes(), 2 )
      + ' '
      + ampm[getAmPm(value.getHours())];

    return formattedDate;
  }
}

@Pipe({
    name: 'convertWorkingHour',
    standalone: false
})
export class ConvertWorkingHourPipe implements PipeTransform {
  transform(timeInSeconds: number, args?: any): any {
    if (timeInSeconds <= 0) {
      let zero = toLocaleNumber(0);
      return zero + ' ម៉ោង ' + zero + ' នាទី ' + zero + ' វិនាទី ';
    } else {
      let h = Math.floor(timeInSeconds / 3600);
      let m = Math.floor(timeInSeconds % 3600 / 60);
      let s = Math.floor(timeInSeconds % 3600 % 60);

      // let hDisplay = (h <= 9 ? toLocaleNumber(0).toString() + toLocaleNumber(h) : toLocaleNumber(h)) + "ម៉ោង ";
      // let mDisplay = (m <= 9 ? toLocaleNumber(0).toString() + toLocaleNumber(m) : toLocaleNumber(m)) + 'នាទី ';
      // let sDisplay = (s <= 9 ? toLocaleNumber(0).toString() + toLocaleNumber(s) : toLocaleNumber(s)) + 'វិនាទី';
      return toLocaleNumber(h) + ' ម៉ោង ' + toLocaleNumber(m) + ' នាទី ' + toLocaleNumber(s) + ' វិនាទី ';
    }
  }
}




@Pipe({
    name: 'monthFrPipe',
    standalone: false
})
export class MonthFrPipe implements PipeTransform {
  transform(date: any, args?: any): any {
    const month = new Date(date).toLocaleString('default', { month: 'long' });
    const arrMonth = Object.values(monthOfYear)
    return arrMonth.find(f=> f?.name_en === month)?.name_fr
  }
}
@Pipe({
    name: 'khmerNumber',
    standalone: false
})
export class khmerNumberPipe implements PipeTransform {
  transform(number: any): unknown {
    if (number) return toKhmerNumber(number);
    return null;
  }
}

@Pipe({
    name: 'arrNumberToStr',
    standalone: false
})
export class arrNumberToStrPipe implements PipeTransform {
  transform(list: any,isKhmer?: boolean): unknown {
    if (!list?.length) return;
    if(isKhmer){
      list = list?.map(m=>{
        return toKhmerNumber(m);
      })
      return list.join(", ")
    }else{
      return list.join(", ")
    }
  }
}


@Pipe({
    name: 'pipeCut0',
    standalone: false
})
export class PipeCut0 implements PipeTransform {
  transform(str: any): any {
    if(!str || str?.length === 0) return;
    return(str[0] === '០' || str[0] === '0') ? str.slice(1) : str;
  }
}

