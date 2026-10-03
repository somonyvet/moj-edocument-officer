import { Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Pipe({
    name: 'getCompany'
})
export class getCompanyPipe implements PipeTransform {
    constructor(
        private afs: AngularFirestore,
       // private store: SetStatusStore
    ) { }
    async transform(key: any, feild: string) {
        // this.afs.collection('company').doc(key).valueChanges().subscribe(doc => {
        //     this.store.getCompany(doc);
        // })
        // if(this.store.company){
        // }
    }

    // <strong>{{item?.countryRef|docRef:'name' | async}}</strong>
}
