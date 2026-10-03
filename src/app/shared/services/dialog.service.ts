import { Injectable } from '@angular/core';
import { Observable, of} from 'rxjs';
import 'rxjs/add/observable/of';

@Injectable()
export class DialogService {
  confirm(message?: string): Observable<boolean> {
    const confirmation = window.confirm(message || 'Are you sure?');

    return of(confirmation);
  };
} 