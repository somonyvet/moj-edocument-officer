import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/compat/firestore";
import { AuthStore } from "src/app/stores/auth.store";
import { IChartAccount } from "../interfaces/account.interface";
import firebase from 'firebase/compat/app';

@Injectable({
    providedIn: 'root'
})
export class SwotifyService {

    constructor(private db: AngularFirestore,
        private auth: AuthStore) { }


    subAccountByAccountTypeRef(accountTypeKey: string) {
        return this.storeRef().collection('chart_of_accounts', ref => {
            if (accountTypeKey) {
                return ref.where('accountType.key', '==', accountTypeKey).orderBy("node").orderBy("order")
            }
            return ref.orderBy("node").orderBy("order")
        })
    }

    accountTypesRef() {
        return this.db.collection('sys_account_types', ref => ref.orderBy('order'))
    }

    chartOfAccountsRef(queryFn?: QueryFn) {
        return this.storeRef().collection<IChartAccount>('chart_of_accounts', queryFn || (ref => ref.orderBy("node").orderBy("order")));
    }

    storesRef(ref?: QueryFn) {
        return this.db.collection('company', ref)
    }

    storeRef() {
        return this.db.collection('company').doc(this.auth?.selectedCompany?.key)
    }

    displayNameFn(user: any): string {
        return user?.name || null;
    }

    serverTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp()
    }

    firestore() {
        return this.db.firestore
    }

    dbRef() {
        return this.db
    }

    createId() {
        return this.db.createId()
    }

    batch() {
        return this.db.firestore.batch()
    }



}