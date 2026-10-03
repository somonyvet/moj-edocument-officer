import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileNameRef'
})
export class FileNameRefPipe implements PipeTransform {

  transform(item: any, ...args: any[]): any {
    if(item){
      const {name}=item;
      if(name) return name;
      
    }
    return null;
  }

}
