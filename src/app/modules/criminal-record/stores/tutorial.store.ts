import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { TUTORIAL_TYPE } from "src/app/dummy/appinfo";
import { APPS } from "src/app/dummy/config";
import { DataService } from "src/app/shared/services/data.service";
import { AuthStore } from "src/app/stores/auth.store";

@Injectable({ providedIn: 'root' })

export class TutorialStore{

  @observable data : any = [];

  @observable empty: boolean = false;
  @observable selectedType: any = null
  @observable selectedItem: any = null


  constructor(
    private ds : DataService,
    private auth : AuthStore,
  ){}


  fetchDataRef = null;
  @action
  fetchData(type: any, callback:(status,data)=>void){
    this.fetchDataRef?.unsubscribe()
    this.fetchDataRef = this.ds.tutorialRef(ref=>ref.where('type.key','==',type.key)).valueChanges().subscribe(res=>{
      this.data = res;
      this.empty =  res?.length === 0;
      callback(true,this.data)
    })
  }

  @action
  save(data,callback:(error)=>void){
    this.ds.tutorialRef().doc(data.key).set(data,{merge:true}).then(res=>{
      callback(null)
    }).catch(e=>{
      callback(e)
    })
  }

  @action
  delete(key,callback:(error)=>void){
    this.ds.tutorialRef().doc(key).delete().then(res=>{
      callback(null)
      }).catch(e=>{
      alert(e)
    })
  }

  getMappedProfile() {
    const { profile } = this.auth;
    return {
      display_name: profile?.full_name || null,
      photoUrl: profile?.photo?.downloadUrl || null,
      key: profile?.key,
    }
  }

}
