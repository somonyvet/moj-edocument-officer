import { Pipe, PipeTransform } from '@angular/core';
import { hasWhiteSpace, toKhmerNumber } from '../services/mapping.service';

@Pipe({
  name: 'nicknameSpace'
})
export class NicknameSpace implements PipeTransform {
  transform(str: string): any {
    if(hasWhiteSpace(str)){
      return str;
    }else{
      return false
    }
  }
}

@Pipe({
  name: 'addMoreSpaceToString'
})
export class AddMoreSpaceToString implements PipeTransform {
  transform(str: string): any {
    if(!str) return;
    var arr = str.trim().split(" ")
    if (Array.isArray(arr) && arr.length > 0) {
      const newString = arr?.filter(i =>  { if(i!="") return i;}).join("&emsp;")
      return newString
    }
  }
}

@Pipe({
  name: 'addMoreSpaceToStringAddress'
})
export class AddMoreSpaceToStringAddress implements PipeTransform {
  transform(str: string): any {
    if(!str) return;
    var arr = str.trim().split(" ")
    if (Array.isArray(arr) && arr.length > 0) {
      const newString = arr?.map(i => { if(i!="") return i;}).join("&emsp;<wbr>")
      return newString
    }
  }
}

@Pipe({
  name: 'khmerNumAddress'
})
export class KhmerNumAddress implements PipeTransform {
  transform(str: string): any {
    if(!str) return;
    return toKhmerNumber(str)
  }
}

@Pipe({
  name: 'stringUpperCase'
})
export class StringUpperCase implements PipeTransform {
  transform(str: string): any {
    if(!str) return;
    var arr = str.replace(/\s+/g, ' ').trim().split(" ");
    if (Array.isArray(arr) && arr.length > 0) {
      const newString = arr?.map(i => (i?.toUpperCase())).join(" ")
      return newString
    }
    return str?.toUpperCase()
  }
}

@Pipe({
  name: 'stringDoubleSpace'
})
export class stringDoubleSpace implements PipeTransform {
  transform(str: string): any {
    if(!str) return;
    var arr = str.replace(/\s+/g, ' ').trim().split(" ")

    if (Array.isArray(arr) && arr.length > 0) {
      const newString = arr?.filter(i =>  { if(i!="") return i;}).join("&ensp;")
      return newString
    }
  }
}

@Pipe({
  name: 'moreSpaceEnAddress'
})
export class MoreSpaceEnAddress implements PipeTransform {
  transform(str: string): any {
    if(!str) return;
    var arr = str.replace(/\s+/g, ' ').trim().split(",");
    if (Array.isArray(arr) && arr.length > 0) {
      const newString = arr?.filter(i =>  { if(i!=="") return i;}).join(", <wbr>");
      return newString
    }
  }
}

@Pipe({
  name: 'formatNum3digitPipe'
})
export class FormatNum3digitPipe implements PipeTransform {
  transform(num: number): any { 
    return new Intl.NumberFormat().format(num);
  }
}

@Pipe({
  name: 'removeStringPip'
})
export class RemoveStringPip implements PipeTransform {
  transform(str: string,subStr: string): any { 
    return str ? str?.toString()?.replace(subStr, '') : ''
  }
}