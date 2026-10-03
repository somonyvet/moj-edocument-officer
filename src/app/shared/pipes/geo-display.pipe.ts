import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'geoDisplay'
})
export class GeoDisplayPipe implements PipeTransform {

  transform(value: any, geo: string): any {
    let result = null

    switch (geo) {
      case 'P':
        result = value?.geo_prefix ? value?.geo_prefix?.name : 'ខេត្ត'
        break;
      case 'D':
        result = value?.geo_prefix ? value?.geo_prefix?.name : 'ស្រុក'
        break;
      case 'C':
        result = value?.geo_prefix ? value?.geo_prefix?.name : 'ឃុំ'
        break;
      default:
        break;
    }

    return result
  }
}
