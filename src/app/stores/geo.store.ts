import { IGeo, IDistrict, ICommunes, IVillage } from './../interfaces/geo';
import { observable, action } from "mobx";
import { Injectable } from "@angular/core";
import { roleObj } from '../dummy/status';
import { pushToArray, ConvertService } from '../shared/services/convert.service';
import { DataService } from '../shared/services/data.service';
import { MappingService } from '../shared/services/mapping.service';

@Injectable()
export class Geo {
    @observable data = [];
    @observable provinces = [];
    @observable districts = [];
    @observable communes = [];
    @observable villages = [];
    @observable positions = [];
    @observable titles = [];
    @observable loading = false;
    @observable empty = false;
    @observable process = false;

    @observable selectedProvince = null;
    @observable selectedDistrict = null;
    @observable selectedCommune = null;


    constructor(private ds: DataService) { }

    @action
    async fetchDistrict(provinceKey: string) {
        const docs = await this.ds.districtRef(provinceKey).get().toPromise();
        const data = pushToArray(docs)
        return data;
    }

    @action
    async moveCommuneByDistrict(district: any, commune: any, callback) {

        this.process = true;
        const batch = this.ds.batch();
        const communeRef = this.ds.communeFireRef().doc(commune.key);
        const villageRef = this.ds.villageFireRef();

        const villageDocs = await this.ds.villageRef(commune.key).get().toPromise()
        const villageData = pushToArray(villageDocs)

        const districtData = {
            key: district.key,
            id: district.id,
            name: district.name,
        }

        const communeData = {
            key: commune.key,
            id: commune.id,
            name: commune.name,
        }
        batch.update(communeRef, {
            district: districtData
        })

        villageData.forEach(m => {
            batch.update(villageRef.doc(m.key), {
                district: districtData,
                commune: communeData,
            })
        })
        batch.commit().then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        })
    }

    @action
    fetchProvince() {
        this.loading = true;
        this.ds.provincesRef().valueChanges().subscribe(docs => {
            const list = docs.map(m => ({ ...m, orderBy: ConvertService.toNumber(m.code) }))
            this.provinces = MappingService.orderBy(list, "orderBy");
            this.empty = docs.length === 0;
            this.loading = false;
        });

        // const access_token = Utils.getLocalstorageItem('token');
        // this.api.get(`${this.api.baseUri}province?token=${access_token}`).then((docs) => {
        //     this.provinces = docs.data.length > 0 ? docs.data : [];
        //     this.empty = docs.data.length === 0;
        //     this.loading = false;
        // });
    }

    @action
    fetchProvinceCallback(callback) {

        this.ds.provincesRef().valueChanges().subscribe(docs => {
            const list = docs.map(m => ({ ...m, orderBy: ConvertService.toNumber(m.code) }))
            this.provinces = MappingService.orderBy(list, "orderBy");
            this.empty = docs.length === 0;
            this.loading = false;
            callback(this.provinces)
        });
        // const access_token = Utils.getLocalstorageItem('token');
        // this.api.get(`${this.api.baseUri}province?token=${access_token}`).then(docs => {
        //     this.provinces = docs.data.length > 0 ? docs.data : [];
        //     callback(this.provinces)
        // })
    }

    @action
    fetchPositionToArray(callback) {
        this.process = true;
        this.ds.positionsRef().valueChanges().subscribe(docs => {
            callback(docs);
            this.process = false;
        });
    }

    @action
    fetchTitleToArray(callback) {
        this.process = true;
        this.ds.titlesRef().valueChanges().subscribe(docs => {
            this.process = false;
            callback(docs);
        });
    }

    @action
    fetchUsersToArray(provinceKey, callback) {
        this.process = true;
        this.ds.userByProvinceRef(provinceKey).valueChanges().subscribe(docs => {
            if (docs.length > 0) {
                const list = docs.filter(m => m.role.key === roleObj.readWrite.key);
                this.process = false;
                callback(list)
            } else {
                this.process = false;
                callback(null)
            }
        });
    }

    @action
    fetchProvinceToArray(callback) {
        this.ds.provincesRef().valueChanges().subscribe(docs => {
            callback(docs);
        });
    }

    @action
    fetchDistrictsToArray(provinceKey, callback) {
        this.ds.districtRef(provinceKey).valueChanges().subscribe(docs => {
            callback(docs)
        });
    }

    @action
    fetchCommunesToArray(districtKey, callback) {
        this.ds.communeRef(districtKey).valueChanges().subscribe(docs => {
            callback(docs)
        });
    }

    @action
    fetchVillagesToArray(communeKey, callback) {
        this.ds.villageRef(communeKey).valueChanges().subscribe(docs => {
            callback(docs)
        });
    }

    @action
    fetchDistricts(key) {
        this.loading = true;

        this.ds.districtRef(key).valueChanges().subscribe(data => {
            this.districts = data.length > 0 ? data : [];
            this.empty = data.length === 0;
            this.loading = false;
        });
        // const access_token = Utils.getLocalstorageItem('token');
        // this.api.get(`${this.api.baseUri}districtByProvince?id=${key}&token=${access_token}`).then((docs) => {
        //     this.districts = docs.data.length > 0 ? docs.data : [];
        //     this.empty = docs.data.length === 0;
        //     this.loading = false;
        // });
    }

    @action
    fetchDistrictsCallback(key, callback) {
        // const access_token = Utils.getLocalstorageItem('token');
        // this.api.get(`${this.api.baseUri}districtByProvince?id=${key}&token=${access_token}`).then((docs) => {
        //     this.districts = docs.data.length > 0 ? docs.data : [];
        //     callback(this.districts)
        // });

        this.ds.districtRef(key).valueChanges().subscribe(data => {
            this.districts = data.length > 0 ? data : [];
            this.empty = data.length === 0;
            this.loading = false;
            callback(this.districts)
        });
    }

    @action
    fetchVillages(key) {
        this.loading = true;
        // const access_token = Utils.getLocalstorageItem('token');
        // this.api.get(`${this.api.baseUri}villageByCommune?id=${key}&token=${access_token}`).then((docs) => {
        //     this.villages = docs.data.length > 0 ? docs.data : [];
        //     this.empty = docs.data.length === 0;
        //     this.loading = false;
        // });
        this.ds.villageRef(key).valueChanges().subscribe(data => {
            this.villages = data.length > 0 ? data : [];
            this.empty = data.length === 0;
            this.loading = false;
        });
    }

    @action
    fetchCommunes(key) {
        this.loading = true;
        // const access_token = Utils.getLocalstorageItem('token');
        // this.api.get(`${this.api.baseUri}communeByDistrict?id=${key}&token=${access_token}`).then((docs) => {
        //     this.communes = docs.data.length > 0 ? docs.data : [];
        //     this.empty = docs.data.length === 0;
        //     this.loading = false;
        // });
        this.ds.communeRef(key).valueChanges().subscribe(data => {
            this.communes = data.length > 0 ? data : [];
            this.empty = data.length === 0;
            this.loading = false;
        });
    }

    @action
    fetchCommunesCallback(key, callback) {
        // const access_token = Utils.getLocalstorageItem('token');
        // this.api.get(`${this.api.baseUri}communeByDistrict?id=${key}&token=${access_token}`).then((docs) => {
        //     this.communes = docs.data.length > 0 ? docs.data : [];
        //     callback(this.communes)
        // });

        this.ds.communeRef(key).valueChanges().subscribe(data => {
            this.communes = data.length > 0 ? data : [];
            this.empty = data.length === 0;
            this.loading = false;
            callback(this.communes)

        });
    }

    @action
    fetchSelectedDistrict(key, callback) {
        this.loading = true;
        this.ds.districtRef().doc<any>(key).valueChanges().subscribe(doc => {
            this.selectedDistrict = doc;
            if (doc) {
                this.selectedProvince = doc.province;
            }
            callback(doc);
            this.loading = false;
        })
    }


    @action
    fetchSelectedProvince(provinceKey) {
        this.ds.provincesRef().doc(provinceKey).valueChanges().subscribe(doc => {
            this.selectedProvince = doc;
        })
    }

    @action
    fetchSelectedCommune(key, callback) {
        this.loading = true;
        this.ds.communeRef().doc<any>(key).valueChanges().subscribe(doc => {
            this.selectedCommune = doc;
            if (doc) {
                this.selectedProvince = doc.province;
                this.selectedDistrict = doc.district;
            }
            callback(doc);
            this.loading = false;
        })
    }

    @action
    addProvince(form: IGeo, callback) {
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
    UpdateProvince(form: IGeo, callback) {
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
    deleteDistrict(key, callback) {
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
    deleteProvince(key, callback) {
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
    addDistrict(form: IDistrict, callback) {
        this.ds.districtRef().doc(form.key).set(form).then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        })
    }


    @action
    updateDistrict(form: IDistrict, callback) {
        this.ds.districtRef().doc(form.key).update(form).then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        })
    }

    @action
    addCommune(form: ICommunes, callback) {
        this.ds.communeRef().doc(form.key).set(form).then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        })
    }

    @action
    updateCommune(form: ICommunes, callback) {
        this.ds.communeRef().doc(form.key).update(form).then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        })
    }

    @action
    addVillage(form: IVillage, callback) {
        this.ds.villageRef().doc(form.key).set(form).then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        })
    }


    @action
    updateVillage(form: IVillage, callback) {
        this.ds.villageRef().doc(form.key).update(form).then(() => {
            callback(true, null)
        }).catch(error => {
            callback(false, error)
        })
    }

    @action
    deleteCommune(key, callback) {
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
    deleteVillage(key, callback) {
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
