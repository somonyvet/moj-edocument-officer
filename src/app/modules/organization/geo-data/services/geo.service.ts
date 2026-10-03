
import { Injectable } from "@angular/core";
import { ICommunes, IDistrict, IGeo, INationality, IVillage } from '../interfaces/geo';
import { AngularFirestore, QueryFn } from "@angular/fire/compat/firestore";
import { STATUS_OBJ } from "src/app/dummy/appinfo";
@Injectable({
  providedIn: "root"
})
export class GeoService {
  constructor(private db: AngularFirestore) { }

  sys_environmentRef(){
    return this.db.collection("sys_environment").doc('general');
  }

  inspectionsRef(){
    return this.db.collection("inspections", ref=> ref.where("status.key","==",1));
  }

  checkExistRegisterRef(refNo, collection, feild) {
    return this.db.collection(collection, ref => ref
      .where("status.key", ">", STATUS_OBJ.DELETED.key)
      .where(feild, "==", refNo)
      .limit(1)
    )
  }
  provincesRef() {
    return this.db.collection<IGeo>("geo_provinces", ref => ref.where("status.key", ">", STATUS_OBJ.DELETED.key).orderBy("status.key"));
  }

  userByProvinceRef(provinceKey: string) {
    return this.db.collection<any>("users", ref => ref.where("province.key", "==", provinceKey));
  }


  districtRef(provinceKey?) {
    if (provinceKey)
      return this.db.collection<IDistrict>("geo_districts", ref =>
        ref.where("province.key", "==", provinceKey)
      );
    else return this.db.collection<IDistrict>("geo_districts");
  }

  communeRef(districtKey?) {
    if (districtKey)
      return this.db.collection<ICommunes>("geo_communes", ref =>
        ref.where("district.key", "==", districtKey)
      );
    else return this.db.collection<ICommunes>("geo_communes");
  }

  villageRef(communeKey?) {
    if (communeKey)
      return this.db.collection<IVillage>("geo_villages", ref =>
        ref.where("commune.key", "==", communeKey)
      );
    else return this.db.collection<IVillage>("geo_villages");
  }

  groupRef(villageKey?) {
    if (villageKey)
      return this.db.collection("geo_groups", ref =>
        ref.where("village.key", "==", villageKey).where("status.key", ">", STATUS_OBJ.DELETED.key).orderBy("status.key")
      );
    else return this.db.collection("geo_groups" ,ref=>ref.orderBy('code'));
  }


  provinceByIDRef(id) {
    return this.db.collection<IGeo>("geo_provinces", ref => ref.where("id", "==", id));
  }

  nationalityRef() {
    return this.db.collection<any>("countries", ref => ref.where("status.key", ">", STATUS_OBJ.DELETED.key).orderBy("status.key"));
  }
  crimRecCateRef() {
    return this.db.collection<any>("criminal_record_categories", ref => ref.where("status.key", ">", STATUS_OBJ.DELETED.key).orderBy("status.key"));
  }
  addcrimRecCateRef() {
    return this.db.collection<any>("criminal_record_categories");
  }
  addCrimeNoteRef() {
    return this.db.collection<any>("criminal_notes");
  }
  addNationalityRef() {
    return this.db.collection<any>("countries");
  }

  countryRef(ref?:QueryFn){
    return this.db.collection<any>("countries",ref);
  }
}

