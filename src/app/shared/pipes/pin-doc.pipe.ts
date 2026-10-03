import { Pipe, PipeTransform } from '@angular/core';
import { IUserPined } from 'src/app/interfaces/document/document.interface';

@Pipe({
  name: 'pinDoc'
})
export class PinDocPipe implements PipeTransform {

  transform(documentKey: string, userPinDocs: IUserPined[]): boolean {
    const findPin = userPinDocs.find(m => m.key === documentKey);
    if (findPin) return true;
    return false;
  }

}
