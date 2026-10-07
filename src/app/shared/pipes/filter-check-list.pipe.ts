import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterCheckList',
    standalone: false
})
export class FilterCheckListPipe implements PipeTransform {

  transform(value: any, args: any[]): any {
    return args.filter(m => m.key === value.key).length > 0 ? 'check_box' : 'check_box_outline_blank';
  }

}

@Pipe({
    name: 'filterDocParent',
    standalone: false
})
export class FilterDocParent implements PipeTransform {
  transform(list: any[], key: string): any {
    if (list && list.length === 0) return
    return list.filter(f => f?.doc_parent && f?.doc_parent === key);
  }
}

@Pipe({
    name: 'checkListFileImg',
    standalone: false
})
export class CheckListFileImg implements PipeTransform {
  transform(list: any[]): any {
    return list.find(f => f?.type === 'image');
  }
}

@Pipe({
    name: 'checkListFileDoc',
    standalone: false
})
export class CheckListFileDoc implements PipeTransform {
  transform(list: any[]): any {
    return list.find(f => f?.type === 'application');
  }
}

@Pipe({
    name: 'filterImgFiles',
    standalone: false
})
export class FilterImgFiles implements PipeTransform {
  transform(list: any[]): any {
    return list.filter(f => f?.type === 'image');
  }
}

@Pipe({
    name: 'filterDocFiles',
    standalone: false
})
export class FilterDocFiles implements PipeTransform {
  transform(list: any[]): any {
    return list.filter(f => f?.type === 'application');
  }
}

@Pipe({
    name: 'filterNationalList',
    standalone: false
})
export class FilterNationalList implements PipeTransform {
  transform(list: any[],str:string): any {
    return list?.filter(f => f?.kh_nationality?.toUpperCase()?.includes(str?.toUpperCase()));
  }
}

@Pipe({
    name: 'filterCountriesList',
    standalone: false
})
export class FilterCountriesList implements PipeTransform {
  transform(list: any[],str:string,isKhmerForm?:boolean): any {
    if(isKhmerForm){
      return list?.filter(f => f?.kh_short_name?.toUpperCase()?.includes(str?.toUpperCase()));
    }else{
      return list?.filter(f => f?.en_short_name?.toUpperCase()?.includes(str?.toUpperCase()));
    }
  }
}
