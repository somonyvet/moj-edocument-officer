import { Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Pipe({
  name: 'docRef'
})
export class DocRefPipe implements PipeTransform {

  transform(ref: any, field: string): any {
    if (!ref) return null;
    return ref.get().then(doc => {
      if (doc.data() !== undefined) {
        return field ? doc.data()[field] : doc.data()
      } else {
        return null
      }
    });
  }

  // <strong>{{item?.countryRef|docRef:'name' | async}}</strong>
}
@Pipe({
  name: 'docKeyRef'
})
export class DocKeyRefPipe implements PipeTransform {
  constructor(
    private afs: AngularFirestore
  ) { }
  transform(key: string, collection: string, field: string): any {
    if (!key) return;
    const ref = this.afs.collection(collection).doc(key).ref
    return ref.get().then(doc => {
      if (doc.data() !== undefined) {
        const data = field ? doc.data()[field] : doc.data()
        return data
      } else {
        return null
      }
    });
  }
}

@Pipe({
  name: 'docKeyCompanyRef'
})
export class DocKeyCompanyRefPipe implements PipeTransform {
  constructor(
    private afs: AngularFirestore
  ) { }
  transform(key: string, collection: string, field: string, companyKey): any {
    if (!key) return;
    const ref = this.afs.collection('company').doc(companyKey).collection(collection).doc(key).ref
    return ref.get().then(doc => {
      if (doc.data() !== undefined) {
        const data = field ? doc.data()[field] : doc.data()
        return data
      } else {
        return null
      }
    });
  }
}