import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { docStatusObj } from 'src/app/dummy/status';
import { MappingService } from '../services/mapping.service';

@Pipe({
    name: 'dateOnly',
    standalone: false
})
export class DateOnlyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) return;
    const date = new Date(value);
    return new DatePipe('en-US').transform(date, 'MMM dd, yyyy');
  }
}


@Pipe({
    name: 'docStatus',
    standalone: false
})
export class DocStatusPipe implements PipeTransform {

  transform(status: any, args?: any): any {
    switch (status?.key) {
      case docStatusObj.released?.key:
        return 's2'
      case docStatusObj.final?.key:
        return 's11'
      case docStatusObj.void?.key:
        return 's4'
      default:
        return null
    }
  }

}



@Pipe({
    name: 'findDocumentAccount',
    standalone: false
})
export class FindDocumentAccountPipe implements PipeTransform {

  transform(accountKey: string, accountKeys: any[]): boolean {
    const find = accountKeys?.find(m => m?.accountKey === accountKey) || null;
    return find ? true : false;
  }

}


@Pipe({
    name: 'filterData',
    standalone: false
})
export class FilterDataPipe implements PipeTransform {

  transform(data: any[], field: string, key: any): any[] {
    // const items = data.filter(m => `${m[field]}` === `${key}`)
    // return items;

    if (!key) return data;
    const items = data.filter(m => m[field] && m[field] === key)
    return items;
  }

}

@Pipe({
    name: 'filterUserPermissionApproval',
    standalone: false
})
export class FilterUserPermissionApprovalPipe implements PipeTransform {

  transform(data: any[]): any[] {
    const items = data.filter(m => m?.permission?.key === 2 || m?.permission?.key === 3)
    return MappingService.orderByDesc(items, "approval_order");
  }

}


@Pipe({
    name: 'validData',
    standalone: false
})
export class validDataPipe implements PipeTransform {

  transform(data: any[], field: string, key: any): boolean {
    const items = data?.find(m => m[field] === key) ? true : false;
    return items;
  }

}


@Pipe({
    name: 'checkWorkplace',
    standalone: false
})
export class CheckWorkplacePipe implements PipeTransform {

  transform(data: any[], key: string): boolean {
    const item = data?.find(m => m?.key === key && m?.requestApproved)
    return item ? true : false;
  }

}


@Pipe({
    name: 'workplacesReport',
    standalone: false
})
export class WorkplaceReportPipe implements PipeTransform {

  transform(data: any[]): any[] {
    return data?.filter((m, index) => {
      if (index === 0) return m;
      if (m?.isWorkplace && m?.showInHeader) return m
    })
  }

}


@Pipe({
    name: 'workplaceCompletedReport',
    standalone: false
})
export class WorkplaceCompletedReportPipe implements PipeTransform {

  transform(item, data: any[]): boolean {
    return data?.find(m => m?.workplaceKey === item?.office?.key) ? true : false;
  }

}

@Pipe({
    name: 'validateUrl',
    standalone: false
})
export class ValidateUrlPipe implements PipeTransform {

  transform(text: string): boolean {
    let url;
    try {
      url = new URL(text);
      return true
    } catch (_) {
      return false;
    }
  }

}

@Pipe({
    name: 'validDob',
    standalone: false
})
export class validDobPipe implements PipeTransform {
  transform(val1: any, val2: any, val3: any): boolean {
    if (val1 || val2 || val3) {
      return true;
    } else {
      return false;
    }
  }

}
