import { observable, action, } from "mobx";
import { Injectable } from "@angular/core";
import { CriminalService } from "../services/criminal.service";
import { Subscription } from "rxjs";
import { APPS } from "src/app/dummy/config";
import { transformImageSameTokenNo } from "src/app/shared/services/fireStorage.service";
import { PHOTO_LIB, STATUS_OBJ } from "src/app/dummy/appinfo";
import { pushToArray, pushToObject } from "src/app/shared/services/convert.service";
// import { pushToArray } from "functions/src/services/mapping";
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AuthStore } from "src/app/stores/auth.store";


@Injectable({ providedIn: 'root' })
export class CitizenStore {
  @observable lastVisible: any = null;
  @observable empty: boolean = false;
  @observable process: boolean = false;
  @observable data: any[] = [];

  searching: boolean = false;
  constructor(
    private ds: CriminalService,
    private auth: AuthStore,
  ) { }

  async fetchDoc(ref: any) {
    this.process = true;
    const doc = await ref.get().toPromise();
    const data = pushToObject(doc)
    this.process = false;
    return data;
  }

  @action
  async fetchList(ref: AngularFirestoreCollection) {
    const docs = await ref.get().toPromise();
    return pushToArray(docs);
  }

  @action
  async getNational() {
    const docs = await this.ds.countriesRef().get().toPromise()
    let countries = pushToArray(docs)
    return countries;
  }

  @action
  async unsubscribe() {
    this.fetchCitizensRef?.unsubscribe()
    this.data = []
    this.lastVisible = null;
    Promise.resolve()
  }

  fetchCitizensRef: Subscription = null;
  @action
  async fetchCitizens(nationalKhmerKey: any, callback?: (items: any) => void) {
    await this.unsubscribe()
    this.lastVisible = null;
    this.fetchCitizensRef = this.ds.citizensListingRef(nationalKhmerKey, null).valueChanges().subscribe(docs => {
      this.data = docs?.map((m: any) => ({ ...m, photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
      this.empty = this.data.length === 0;
      this.lastVisible = null;
      if (docs.length >= APPS.size) {
        this.lastVisible = this.data[this.data.length - 1];
      }
      callback?.(this.data)
    })
  }


  @action
  fetchMoreCitizens(nationalKhmerKey: any, callback?: (items: any) => void) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetchCitizensRef?.unsubscribe()
        this.fetchCitizensRef = this.ds.citizensListingRef(nationalKhmerKey, this.lastVisible).valueChanges().subscribe(data => {
          const docs = data?.map((m: any) => ({ ...m, photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
          this.data = this.data.concat(docs)
          if (docs.length >= APPS.size) {
            this.lastVisible = this.data[this.data.length - 1]
          } else {
            this.lastVisible = null
          }
          callback?.(this.data)
        })
      }
    } catch (e) {
      alert(e)
    }
  }

  @action
  async save(item: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const citizenRef = this.ds.citizensRef()
    citizenRef.doc(item?.key).set( item, { merge: true }).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @action
  async saveCriminalRecord(criminal: any, citizen: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const batch = this.ds.batch();
    const { publicApplication } = this.auth;
    if (publicApplication) {
      batch.set(this.ds.usersRef().doc(citizen?.key).ref, {
        criminal_record: {
          key: criminal?.key,
          nationalKey: criminal?.national_application?.key,
          application_type_key: criminal?.application_type?.route,
        },
      }, { merge: true })
    }
    if (citizen && criminal?.citizen_ref) {
      batch.set(this.ds.citizensRef().doc(citizen?.key).ref, citizen, { merge: true })
      batch.set(this.ds.criminalRecordRef().doc(criminal?.key).collection('citizen').doc(citizen?.key).ref, citizen, { merge: true })
    }
    batch.set(this.ds.criminalRecordRef().doc(criminal?.key).ref, criminal, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @action
  saveCitizenInCriminalRecord(citizen: any, criminal: any, callback: (status: boolean, error: string) => void) {
    this.process = true;
    const batch = this.ds.batch();
    if (criminal) {
      batch.set(this.ds.criminalRecordRef().doc(criminal?.key).ref, criminal, { merge: true })
      batch.set(this.ds.criminalRecordRef().doc(criminal?.key).collection('citizen').doc(citizen?.key).ref, citizen, { merge: true })
    }
    batch.set(this.ds.citizensRef().doc(citizen?.key).ref, citizen, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
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

  async searchPeople(first_name:string, last_name: string, str: string){
    if(this.searching || !str) return;
    this.searching = true
    const ref = this.ds.criminalRecordRef(ref=>ref.where('keyword','array-contains-any',[last_name+first_name,str]).orderBy('created_at','desc').limit(6))
    let data = pushToArray(await ref.get().toPromise())
    data = data?.map(m=>({...m,photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR}))
    this.searching = false;
    return data;
  }

  async searchPeopleMol(first_name:string, last_name: string, str: string){
    const { config } = this.auth;
    const MOL_workplace_key = config.department_labor?.key
    if(this.searching || !str) return;
    this.searching = true
    const ref = this.ds.criminalRecordRef(ref=>ref.where('keyword','array-contains-any',[last_name+first_name,str]).where('workplace_entry.key','==',MOL_workplace_key).where('isDelete','==',false).limit(5))
    let data = pushToArray(await ref.get().toPromise())
    data = data?.map(m=>({...m,photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR}))
    this.searching = false;
    return data;
  }

}
