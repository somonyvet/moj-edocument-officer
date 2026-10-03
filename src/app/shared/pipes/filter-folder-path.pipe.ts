import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterFolderPath'
})
export class FilterFolderPathPipe implements PipeTransform {

  transform(path: any[]): any {
    return path.filter(m => m.folder_path_button === true);
  }

}
