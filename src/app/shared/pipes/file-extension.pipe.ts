import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileExtension',
    standalone: false
})
export class FileExtensionPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if(value){
      const dots=`${value}`.split('.');
      return dots[dots.length-1]
    }
    return null;
  }

}
