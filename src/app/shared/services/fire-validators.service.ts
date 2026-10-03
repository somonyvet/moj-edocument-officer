import { AbstractControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import { map, take, debounceTime } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthStore } from 'src/app/stores/auth.store';
import { statusObj, REGISTER_ITEM_STATUS_OBJ } from 'src/app/dummy/status';

@Injectable({
  providedIn: 'root'
})
export class FireValidatorsService {
  company;
  constructor(
    public auth: AuthStore
  ) {
  }
  static checkExistTwoObjectKey(afs: AngularFirestore, collection: string, field1: string, field2?: string, key?: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        let val = value.key;
        if (val === undefined) {
          val = null;
        }
        return afs
          .collection(collection, ref => ref.where(field1, '==', val).where(field2, '==', key).limit(1))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistObjectKey(afs: AngularFirestore, collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        let val = value.key;
        if (val === undefined) {
          val = null;
        }
        return afs
          .collection(collection, ref => ref.where(field, '==', val).limit(1))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistPrerequisite(afs: AngularFirestore, curriculumSubject: any, collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        const key = value.subject ? value.subject.key : null;
        return afs
          .collection(collection, ref => ref.where(field, '==', key)
            .where('subject.curriculum.key', '==', curriculumSubject.curriculum.key))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              if (!key) {
                return { validKey: true };
              }
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }
  static checkExistKeyValue(afs: AngularFirestore, collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        const key = value.key ? value.key : null;
        return afs
          .collection(collection, ref => ref.where(field, '==', key))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExist(afs: AngularFirestore, collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref.where(field, '==', value.trim()).where('isDelete', '==', false))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistCO(afs: AngularFirestore, auth:any ,collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref.where(field, '==', value.trim())
            .where('isDelete', '==', false)
            .where('status.key', '==', statusObj.active.key)
            .where('companyKey', '==', auth.selectedCompany.key)
            .where('register_status.order', '<', REGISTER_ITEM_STATUS_OBJ.deleted.order)
            .orderBy('register_status.order')
          )
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistMaterial(afs: AngularFirestore, auth:any, collection: string, field: string) {
    // await auth.fetchProfile();
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref.where(field, '==', value.trim())
            .where('isDelete', '==', false)
            .where('status.key', '==', statusObj.active.key)
            .where('companyKey', '==', auth.selectedCompany.key)
            .where('register_material_status.order', '<', REGISTER_ITEM_STATUS_OBJ.deleted.order)
            .orderBy('register_material_status.order')
          )
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistMaterialUpdate(afs: AngularFirestore, auth:any, collection: string, field: string, value:string) {
    // await auth.fetchProfile();
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref.where(field, '==', value.trim())
            .where('isDelete', '==', false)
            .where('status.key', '==', statusObj.active.key)
            .where('companyKey', '==', auth.selectedCompany.key)
            .where('register_material_status.order', '<', REGISTER_ITEM_STATUS_OBJ.deleted.order)
            .orderBy('register_material_status.order')
          )
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkItem(afs: AngularFirestore, company: any) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined && company) {
        return afs
          .collection("register_co", ref => ref.where("register_item.key", '==', value.key)
            .where('isDelete', '==', false)
            .where('status.key', '==', statusObj.active.key)
            .where('company.key', '==', company.key)
            .where('register_item_status.order', '<', REGISTER_ITEM_STATUS_OBJ.deleted.order)
            .orderBy('register_item_status.order')
          )
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { validItem: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistDataByCompany(afs: AngularFirestore, companyKey,collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref
          .where(field, '==', value.trim())
          .where('isDelete','==',false)
          .where('companyKey', '==', companyKey))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkEditExistDataByCompany(afs: AngularFirestore, companyKey,collection: string, field: string,oldValue) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref
          .where(field, '==', value.trim())
          .where('isDelete','==',false)
          .where('companyKey', '==', companyKey))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              if(arr.length > 0){
                const row=arr[0];
                if(row[field]===oldValue){
                  return null;
                }
              }
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistByCompany(afs: AngularFirestore, companyKey,folderkey, collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref
          .where(field, '==', value.trim())
          .where('isDelete','==',false)
          .where('companyKey', '==', companyKey)
          .where('currentPath.key', '==', folderkey))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  static checkExistOnEdit(afs: AngularFirestore, collection: string, field: string, oldValue: string) {

    return (control: AbstractControl) => {
      const value = control.value;
      if (value === oldValue) {
        const val = null;
        return val
      }
      if (value !== null && value !== '' && value !== undefined && value !== oldValue) {
        afs
          .collection(collection, ref => ref.where(field, '==', value.trim()))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }

    };
  }
  static checkValid(afs: AngularFirestore, collection: string, field: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref.where(field, '==', value))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length === 1 ? null : { nameAvailable: true };
              return val;
            })
          );
      }
    };
  }
  static checkValidSelect(afs: AngularFirestore, collection: string) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== '' && value !== undefined) {
        return afs
          .collection(collection, ref => ref.where('key', '==', value.key))
          .valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr:any) => {
              const val = arr.length === 1 ? null : { nameAvailable: true };
              return val;
            })
          );
      }
    };
  }
}
