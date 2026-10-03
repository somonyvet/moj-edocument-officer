import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";
import { APPS } from "src/app/dummy/config";
import { DataService } from "src/app/shared/services/data.service";
import { AuthStore } from "src/app/stores/auth.store";

@Injectable({ providedIn: 'root' })
export class UserStore {

  lastVisible: any = null;
  data: any = null;

  constructor(
    private auth: AuthStore,
    private ds : DataService,
  ){}

  subscribeOverseaOfficer: Subscription;
  fetchOverseaOfficer(){
    this.lastVisible = null;
    this.data = null;
    this.subscribeOverseaOfficer = null;
    this.subscribeOverseaOfficer = this.ds.officerCollectionRef(ref=>{
      let condition = ref.where('isEmbassy','==',true).orderBy('updated_at','desc').limit(APPS.size)
      return condition;
    }).valueChanges().subscribe(res=>{
      this.data = res;
      if(res?.length && res?.length>=APPS.size){
        this.lastVisible = res[res?.length - 1]
      }else{
        this.lastVisible = null
      }
    })
  }

  fetchMoreOverseaOfficer(){

  }

}
