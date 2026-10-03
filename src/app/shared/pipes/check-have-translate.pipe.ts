import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkHaveTranslate'
})
export class CheckHaveTranslatePipe implements PipeTransform {

  transform(item: Array<any>): any {
    if(!item) return null
    const result = item.find(m=> m?.key === 2 || m?.key === 3)
    if(result) return 'បកប្រែ' || ''
  }

}

@Pipe({
  name: 'getKhmerCopyCount'
})
export class GetKhmerCopyCountPipe implements PipeTransform {

  transform(item: Array<any>): any {
    if(!item) return null
    const result = item.find(m=> m?.key === 1)
    if(result) return (result?.amount ?? 0);
    return;
  }

}

@Pipe({
  name: 'getEnglishCopyCount'
})
export class GetEnglishCopyCountPipe implements PipeTransform {

  transform(item: Array<any>): any {
    if(!item) return null

    const result = item.find(m=> m?.key === 3)

    if(result) return (result?.amount ?? 0);
    return;
  }

}

@Pipe({
  name: 'getFrenchCopyCount'
})
export class GetFrenchCopyCountPipe implements PipeTransform {

  transform(item: Array<any>): any {
    if(!item) return null
    const result = item.find(m=> m?.key === 2)

    if(result) return (result?.amount ?? 0);
    return;
  }

}


@Pipe({
  name: 'getKhmerAmount'
})
export class GetKhmerAmount implements PipeTransform {
  transform(item: Array<any>): any {
    if(!item) return null
    const result = item?.find(f => f?.key === 1)
    return result?.amount || 1;
  }
}


@Pipe({
  name: 'genderFr'
})
export class GenderFr implements PipeTransform {
  transform(item: string): any {
    if(!item) return null
    if(item?.toLocaleLowerCase() === 'male'){
      return 'Masculin'
    }
    if(item?.toLocaleLowerCase() === 'female'){
      return 'féminin'
    }
    return item;
  }
}

@Pipe({
  name: 'isMolApply'
})
export class IsMolApply implements PipeTransform {
  transform(item: any, molWorkplaceKey: string): any {
    if(!item) return false;
    if(item?.workplace_entry?.key === molWorkplaceKey){
      return true;
    }else{
      return false;
    }
  }
}
