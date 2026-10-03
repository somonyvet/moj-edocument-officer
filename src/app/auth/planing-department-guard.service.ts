import { Injectable } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

@Injectable({
  providedIn: 'root'
})
export class PlaningDepartmentGuardService {

  constructor(
    private authStore : AuthStore
  ) { }

  isPlaningDepartment(){

  }

}
