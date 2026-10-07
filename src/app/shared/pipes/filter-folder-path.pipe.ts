import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterFolderPath',
    standalone: false
})
export class FilterFolderPathPipe implements PipeTransform {

  transform(path: any[]): any {
    return path.filter(m => m.folder_path_button === true);
  }

}
