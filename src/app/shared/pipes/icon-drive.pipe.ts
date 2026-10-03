import { Pipe, PipeTransform } from '@angular/core';
import { driveObj, } from '../../dummy/status';
import { FILE_TYPE } from '../../dummy/fileType'
@Pipe({
  name: 'iconDrive'
})
export class IconDrivePipe implements PipeTransform {

  transform(value: any, selectedItem: any): any {
    if (value) {
      const { type, fileType, downloadURL, key } = value;
      switch (type.key) {
        case driveObj.folder.key:
          return selectedItem ? selectedItem.key === key ? 'folder_open' : 'folder' : 'folder'
        default:
          const icon = FILE_TYPE[fileType]
          if (icon) return icon?icon:'d' 
          return downloadURL
      }
    }
    return null;
  }

}
