import { Injectable } from '@angular/core';
import { computed, action } from 'mobx';

@Injectable()

export class totalStore {
  public totalComControl:any;
  public totalControl:any;
  public totalPermit:any;
  public totalInvoice:any;
  constructor() { }

  @action settotalComControl(val:any){
    this.totalComControl = val;
  }
  @action settotalControl(val:any){
    this.totalControl = val;
  }
  @action settotalPermit(val:any){
    this.totalPermit = val;
  }
  @action settotalInvoice(val:any){
    this.totalInvoice = val;
  }

}