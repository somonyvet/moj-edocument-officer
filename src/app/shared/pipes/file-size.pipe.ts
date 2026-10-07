import { Pipe, PipeTransform } from '@angular/core';
import { driveObj } from '../../dummy/status';

@Pipe({
    name: 'fileSize',
    standalone: false
})
export class FileSizePipe implements PipeTransform {

  transform(item: any, ...args: any[]): any {
    if (!item) return null;
    let { size, type } = item;
    if (type && type.key === driveObj.folder.key) return '-'
    if (size) {
      const fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
      let j = 0;
      while (size > 900) { size /= 1024; j++; };
      const exactSize = (Math.round(size * 100) / 100) + ' ' + fSExt[j];
      return exactSize
    }
    return null;
  }

}


@Pipe({
    name: 'fileLength',
    standalone: false
})
export class fileLengthPipe implements PipeTransform {
  transform(item: any, type): any {
    const data = item.filter(f => f.type === type)
    return data && data.length > 1 ? true : false;
  }
}

