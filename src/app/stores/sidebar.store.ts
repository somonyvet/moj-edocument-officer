import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { DataService } from '../shared/services/data.service';

@Injectable({providedIn:'root'})
export class SidebarStore {
  @observable data: Array<any> = [];
  @observable loading: boolean = true;
  @observable empty: boolean = false;

  constructor(private ds: DataService,
    public auth: AuthService,
  ) { }

}
