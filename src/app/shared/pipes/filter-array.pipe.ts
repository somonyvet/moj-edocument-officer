import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterArrayWithFieldIndex',
    standalone: false
})
export class FilterArrayWithFieldIndex implements PipeTransform {
  transform(array:any[],index, ...args: any[]): any {
    return array.find(f => f.index === index)?.file?.name;
  }
}
