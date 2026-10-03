import { observable, action } from "mobx";
import { Injectable } from "@angular/core";

import { ConvertService, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { IProvince } from "../../mme/interfaces/document.interface";
import { IDistrict, ICommunes, IVillage, IGeo, INationality } from "../../organization/geo-data/interfaces/geo";
import { GeoService } from "../../organization/geo-data/services/geo.service";
import { Subscription } from "rxjs";
import { STATUS_OBJ } from "src/app/dummy/appinfo";

@Injectable({ providedIn: 'root' })
export class GeoStore {
  @observable data = [];
  @observable provinces: Array<IProvince> = [];
  @observable districts: Array<IDistrict> = [];
  @observable communes: Array<ICommunes> = [];
  @observable villages: Array<IVillage> = [];
  @observable groups = [];
  @observable positions = [];
  @observable titles = [];
  @observable loading = false;
  @observable empty = false;
  @observable process = false;
  @observable selectedItem = null;
  @observable nationalities: Array<INationality> = [];

  @observable geoPath: any[] = [];


  @observable selectedProvince = null;
  @observable selectedDistrict = null;
  @observable selectedCommune = null;
  @observable selectedVillage = null;
  @observable selectedNationality = null;


  dispose() {
    this.data = [];
    this.provinces = [];
    this.districts = [];
    this.communes = [];
    this.villages = [];
    this.positions = [];
    this.nationalities = [];
    this.titles = [];
    this.selectedDistrict = null;
    this.selectedDistrict = null;
    this.selectedCommune = null;
    this.loading = false;
    this.empty = false;
    this.process = false;
  }

  constructor(private ds: GeoService) { }

  @action
  displayDistrict(item): string {
    return item ? `${item.name}` : item;
  }

  @action
  async subscribeProvinces() {
    this.fetchProvinceRef?.unsubscribe()
    this.provinces = []
    Promise.resolve()
  }

  @observable fetchProvinceRef: Subscription = null;
  @action
  fetchProvince(callback?: (provinces: Array<IProvince>) => void) {
    this.loading = true;
    this.fetchProvinceRef?.unsubscribe()
    this.fetchProvinceRef = this.ds.provincesRef()
      .valueChanges()
      .subscribe(docs => {
        const list = docs.map(m => ({ ...m, orderBy: ConvertService.toNumber(m.id) }))
        this.provinces = MappingService.orderBy(list, "id");
        this.empty = docs.length === 0;
        this.loading = false;
        if (callback) callback(this.provinces)
      });

  }

    @action
    async subscribeNatinalities() {
        this.fetchNatinalitiesRef?.unsubscribe()
        this.nationalities = []
        Promise.resolve()
    }

    @observable fetchNatinalitiesRef: Subscription = null;
    @action
    fetchNatinalities(callback?: (nationalities: Array<INationality>) => void) {
        this.loading = true;
        this.fetchNatinalitiesRef?.unsubscribe()
        this.fetchNatinalitiesRef = this.ds.nationalityRef()
            .valueChanges()
            .subscribe(docs => {
                const list = docs.map(m => ({ ...m, orderBy: ConvertService.toNumber(m.id) }))
                this.nationalities = MappingService.orderBy(list, "num_code");
                this.empty = docs.length === 0;
                this.loading = false;
                if (callback) callback(this.nationalities)
            });

    }


    @action
    fetchProvinceCallback(callback: { (docs: any): void; (arg0: any[]): void; }) {
      this.fetchProvinceRef?.unsubscribe()
      this.fetchProvinceRef = this.ds.provincesRef().valueChanges().subscribe(docs => {
        const list = docs.map(m => ({ ...m, orderBy: ConvertService.toNumber(m.id) }))
        this.provinces = MappingService.orderBy(list, "orderBy");
        this.empty = docs.length === 0;
        this.loading = false;
        callback(this.provinces)
      });
    }

  @action
  async fetchInspection() {
    this.process = true;
    const envDoc = await this.ds.sys_environmentRef().get().toPromise();
    const envData = pushToObject(envDoc);

    const inspectionsDoc = await this.ds.inspectionsRef().get().toPromise();
    const inspectionsData = pushToArray(inspectionsDoc);
    this.process = false;
    return {
      envData: envData,
      inspectionsData: inspectionsData,
    }
  }

  // @action
  // fetchPositionToArray(callback) {
  //     this.process = true;
  //     this.ds.positionsRef().valueChanges().subscribe(docs => {
  //         callback(docs);
  //         this.process = false;
  //     });
  // }

  // @action
  // fetchTitleToArray(callback) {
  //     this.process = true;
  //     this.ds.titlesRef().valueChanges().subscribe(docs => {
  //         this.process = false;
  //         callback(docs);
  //     });
  // }

  // @action
  // fetchUsersToArray(provinceKey, callback) {
  //     this.process = true;
  //     this.ds.userByProvinceRef(provinceKey).valueChanges().subscribe(docs => {
  //         if (docs.length > 0) {
  //             const list = docs.filter(m => m.role.key === roleObj.readWrite.key);
  //             this.process = false;
  //             callback(list)
  //         } else {
  //             this.process = false;
  //             callback(null)
  //         }
  //     });
  // }

  @action
  fetchProvinceToArray(callback: (arg0: IGeo[]) => void) {
    this.fetchProvinceRef = this.ds.provincesRef().valueChanges().subscribe(docs => {
      callback(docs);
    });
  }

  @action
  fetchDistrictsToArray(provinceKey: any, callback: (arg0: IDistrict[]) => void) {
    this.ds.districtRef(provinceKey).valueChanges().subscribe(docs => {
      callback(docs)
    });
  }

  @action
  fetchCommunesToArray(districtKey: any, callback: (arg0: IDistrict[]) => void) {
    this.ds.communeRef(districtKey).valueChanges().subscribe(docs => {
      callback(docs)
    });
  }

  @action
  fetchVillagesToArray(communeKey: any, callback: (arg0: IVillage[]) => void) {
    this.ds.villageRef(communeKey).valueChanges().subscribe(docs => {
      callback(docs)
    });
  }

  // @action
  // fetchOffenceToArray(callback) {
  //     this.ds.offenceRef().valueChanges().subscribe(docs => {
  //         callback(docs)
  //     });
  // }

  // @action
  // fetchCaseToArray(offenceKey, callback) {
  //     this.ds.caseByOffenceRef(offenceKey).valueChanges().subscribe(docs => {
  //         callback(docs)
  //     });
  // }


  @action
  async subscribeDistrict() {
    this.fetchDistrictsRef?.unsubscribe()
    this.districts = []
    this.selectedItem = null;
    Promise.resolve()
  }

  @observable fetchDistrictsRef: Subscription = null;
  @action
  async fetchDistricts(provinceKey: string, callback?: (districts: Array<IDistrict>) => void) {
    this.loading = true;
    this.fetchDistrictsRef?.unsubscribe()
    const item = await this.ds.provincesRef().doc(provinceKey).get().toPromise()
    this.selectedItem = pushToObject(item);
    this.geoPath = [];
    this.geoPath = [
      { key: `goe_province`, name: `${this.selectedItem?.name}`, path: null },
    ]
    this.fetchDistrictsRef = this.ds.districtRef(provinceKey).valueChanges().subscribe(data => {
      this.districts = MappingService.orderBy(data?.filter(m => m?.status?.key > STATUS_OBJ.DELETED.key), "id");
      this.empty = data.length === 0;
      this.loading = false;
      if (callback) return callback(this.districts);
    });
  }

  @action
  fetchDistrictsCallback(key: string, callback: { (docs: any): void; (arg0: any[]): void; }) {
    // const access_token = Utils.getLocalstorageItem('token');
    // this.api.get(`${this.api.baseUri}districtByProvince?id=${key}&token=${access_token}`).then((docs) => {
    //     this.districts = docs.data.length > 0 ? docs.data : [];
    //     callback(this.districts)
    // });

    this.ds.districtRef(key).valueChanges().subscribe(data => {
      this.districts = MappingService.orderBy(data, "id");
      this.empty = data.length === 0;
      this.loading = false;
      callback(this.districts)
    });
  }

  @observable fetchVillageRef: any = null;
  @action
  fetchVillages(communeKey: string, callback?: (villages: Array<IVillage>) => void) {
    this.loading = true;
    this.fetchVillageRef = this.ds.villageRef(communeKey)
      .valueChanges()
      .subscribe(data => {
        this.villages = MappingService.orderBy(data, 'id');
        this.empty = data.length === 0;
        this.loading = false;
        if (callback) callback(this.villages);
      });
  }


  @observable fetchGroupRef: any = null;
  @action
  fetchGroups(villageKey: string, callback?: (villages: Array<IVillage>) => void) {
    this.loading = true;
    this.fetchGroupRef = this.ds.groupRef()
      .valueChanges()
      .subscribe(data => {
        this.groups = data.length > 0 ? data : [];
        this.empty = data.length === 0;
        this.loading = false;
        if (callback) callback(this.groups);
      });
  }

  @observable fetchCommunesRef: Subscription = null;
  @action
  async fetchCommunes(districtKey: string, callback?: (communes: Array<ICommunes>) => void) {
    this.loading = true;
    this.fetchCommunesRef?.unsubscribe();
    const item = await this.ds.districtRef().doc(districtKey).get().toPromise()
    this.selectedItem = pushToObject(item);
    this.geoPath = [];
    this.geoPath = [
      { key: `goe_province`, name: `${this.selectedItem?.province?.name}`, path: `/criminal-record/applications/geo/${this.selectedItem?.province?.key}/districts` },
      { key: `goe_province`, name: `${this.selectedItem?.name}`, path: null },
    ]
    this.fetchCommunesRef = this.ds.communeRef(districtKey)
      .valueChanges().subscribe(data => {
        this.communes = MappingService.orderBy(data?.filter(m => m?.status?.key > STATUS_OBJ.DELETED.key), "id");
        this.empty = data.length === 0;
        this.loading = false;
        if (callback) return callback(this.communes)
      });
  }

  @action
  fetchCommunesCallback(key: string, callback: { (docs: any): void; (arg0: any[]): void; }) {
    this.ds.communeRef(key).valueChanges().subscribe(data => {
      this.communes = MappingService.orderBy(data, 'id');
      this.empty = data.length === 0;
      this.loading = false;
      callback(this.communes)

    });
  }

  @action
  async subscribeVillage() {
    this.fetchVillageCallbackRef?.unsubscribe()
    this.villages = []
    this.selectedItem = null;
    Promise.resolve()
  }

  @observable fetchVillageCallbackRef: Subscription = null;
  @action
  async fetchVillageCallback(key: string, callback: { (docs: any): void; (arg0: any[]): void; }) {
    this.fetchVillageCallbackRef?.unsubscribe()
    const item = await this.ds.communeRef().doc(key).get().toPromise()
    this.selectedItem = pushToObject(item);
    this.geoPath = [];
    this.geoPath = [
      { key: `goe_province`, name: `${this.selectedItem?.province?.name}`, path: `/criminal-record/applications/geo/${this.selectedItem?.province?.key}/districts` },
      { key: `goe_province`, name: `${this.selectedItem?.district?.name}`, path: `/criminal-record/applications/geo/${this.selectedItem?.district?.key}/communes` },
      { key: `goe_province`, name: `${this.selectedItem?.name}`, path: null },
    ]
    this.fetchVillageCallbackRef = this.ds.villageRef(key).valueChanges().subscribe(data => {
      this.villages = MappingService.orderBy(data?.filter(m => m?.status?.key > STATUS_OBJ.DELETED.key), 'id');
      this.empty = data.length === 0;
      this.loading = false;
      callback(this.villages)
    });
  }
  @observable fetchDistrictRef: any = null;
  @action
  fetchSelectedDistrict(key: string, callback: (arg0: any) => void) {
    this.loading = true;
    this.fetchDistrictRef = this.ds.districtRef().doc<any>(key).valueChanges().subscribe(doc => {
      this.selectedDistrict = MappingService.districtObj(doc);
      if (doc) {
        this.selectedProvince = doc.province;
      }
      callback(doc);
      this.loading = false;
    })
  }


  @observable fetchSelectedProvinceRef: any = null;
  @action
  fetchSelectedProvince(provinceKey: string) {
    this.fetchSelectedProvinceRef = this.ds.provincesRef().doc(provinceKey)
      .valueChanges().subscribe(doc => {
        this.selectedProvince = MappingService.provinceObj(doc);
      })
  }

  @observable fetchCommuneRef: any = null;
  @action
  fetchSelectedCommune(key: string, callback: (arg0: any) => void) {
    this.loading = true;
    this.fetchCommuneRef = this.ds.communeRef().doc<any>(key).valueChanges().subscribe(doc => {
      this.selectedCommune = MappingService.communeObj(doc);
      if (doc) {
        this.selectedProvince = doc.province;
        this.selectedDistrict = doc.district;
      }
      callback(doc);
      this.loading = false;
    })
  }

  @action
  addProvince(form: IGeo, callback: (arg0: boolean, arg1: any) => void) {
    this.process = true;
    this.ds.provincesRef().doc(form.key).set(form).then(() => {
      this.process = false;
      callback(true, null)
    }).catch(error => {
      this.process = false;
      callback(false, error)

    })
  }

    @action
    addNationality(form: INationality, callback: (arg0: boolean, arg1: any) => void) {
        this.process = true;
        this.ds.nationalityRef().doc(form.key).set(form).then(() => {
            this.process = false;
            callback(true, null)
        }).catch(error => {
            this.process = false;
            callback(false, error)

        })
    }

    @action
    UpdateProvince(form: IGeo, callback: (arg0: boolean, arg1: any) => void) {
      this.process = true;
      this.ds.provincesRef().doc(form.key).update(form).then(() => {
        this.process = false;
        callback(true, null)
      }).catch(error => {
        this.process = false;
        callback(false, error)

      })
    }

  @action
  deleteDistrict(key: string, callback: { (success: any, error: any): void; (arg0: boolean, arg1: any): void; }) {
    this.process = true;
    this.ds.districtRef().doc(key).delete().then(() => {
      this.process = false;
      callback(true, null)
    }).catch(error => {
      this.process = false;
      callback(false, error)

    })
  }
  @action
  deleteProvince(key: string, callback: (arg0: boolean, arg1: any) => void) {
    this.process = true;
    this.ds.provincesRef().doc(key).delete().then(() => {
      this.process = false;
      callback(true, null)
    }).catch(error => {
      this.process = false;
      callback(false, error)

    })
  }

    @action
    deleteNationality(key: string, callback: (arg0: boolean, arg1: any) => void) {
        this.process = true;
        this.ds.nationalityRef().doc(key).delete().then(() => {
            this.process = false;
            callback(true, null)
        }).catch(error => {
            this.process = false;
            callback(false, error)

        })
    }


  @action
  addDistrict(form: IDistrict, callback: (arg0: boolean, arg1: any) => void) {
    this.ds.districtRef().doc(form.key).set(form).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }


  @action
  updateDistrict(form: IDistrict, callback: (arg0: boolean, arg1: any) => void) {
    this.ds.districtRef().doc(form.key).update(form).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }

  @action
  addCommune(form: ICommunes, callback: (arg0: boolean, arg1: any) => void) {
    this.ds.communeRef().doc(form.key).set(form).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }

  @action
  updateCommune(form: ICommunes, callback: (arg0: boolean, arg1: any) => void) {
    this.ds.communeRef().doc(form.key).update(form).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }

  @action
  addVillage(form: IVillage, callback: (arg0: boolean, arg1: any) => void) {
    this.ds.villageRef().doc(form.key).set(form).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }


  @action
  addGroup(form: any, callback: (arg0: boolean, arg1: any) => void) {
    this.ds.groupRef().doc(form.key).set(form).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }


  @action
  updateVillage(form: IVillage, callback: (arg0: boolean, arg1: any) => void) {
    this.ds.villageRef().doc(form.key).update(form).then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    })
  }

  @action
  deleteCommune(key: string, callback: { (success: any, error: any): void; (arg0: boolean, arg1: any): void; }) {
    this.process = true;
    this.ds.communeRef().doc(key).delete().then(() => {
      this.process = false;
      callback(true, null)
    }).catch(error => {
      this.process = false;
      callback(false, error)

    })
  }
  @action
  deleteVillage(key: string, callback: { (success: any, error: any): void; (arg0: boolean, arg1: any): void; }) {
    this.process = true;
    this.ds.villageRef().doc(key).delete().then(() => {
      this.process = false;
      callback(true, null)
    }).catch(error => {
      this.process = false;
      callback(false, error)

    })
  }

}
