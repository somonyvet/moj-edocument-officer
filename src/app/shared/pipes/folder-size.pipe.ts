import { Pipe, PipeTransform } from '@angular/core';
import { ImageSizeType, PHOTO_LIB } from 'src/app/dummy/appinfo';
import { transformImageSameTokenNo } from '../services/fireStorage.service';

@Pipe({
    name: 'folderSize',
    standalone: false
})
export class FolderSizePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (!value) return '-'
    if (value) {
      const fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
      let j = 0;
      while (value > 900) { value /= 1024; j++; };
      const exactSize = (Math.round(value * 100) / 100) + ' ' + fSExt[j];
      return exactSize
    }
    return null;
  }


}


@Pipe({
    name: 'imageSize',
    standalone: false
})
export class imageSizePipe implements PipeTransform {

  transform(url: string, size: ImageSizeType): any {
    if (!url) return PHOTO_LIB.EMPTY_AVATAR;
    return transformImageSameTokenNo(url, size || '200')?.uri;
  }


}
