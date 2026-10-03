import { observable, action, } from "mobx";
import { Injectable } from "@angular/core";
import { SwotifyService } from "../services/swotify.service";
import { pushToArray } from "src/app/shared/services/convert.service";
import { AccountNode, IChartAccount } from "../interfaces/account.interface";
import { Subscription } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ChartOfAccountStore {
    @observable chartOfAccountsRef: Subscription = null;
    @observable data: IChartAccount[] = [];

    constructor(private ds: SwotifyService) { }

    @action
    fetchData(status: any, callback?: (treeNodes: AccountNode[]) => void) {
        this.chartOfAccountsRef?.unsubscribe()
        this.chartOfAccountsRef = this.ds.chartOfAccountsRef()?.valueChanges().subscribe(data => {
            const docs = data?.map((m, index) => {
                const isBlack = index % 2 === 0 ? true : false;
                return { ...m, isBlack }
            })
            const nest = (items: any[], key: string = undefined) => {
                return items.filter(a => a?.subOfAccount?.key === key)
                    .map(b => ({ item: { ...b }, children: nest(items, b?.key) }))
            }
            callback(nest(docs))
            this.data = docs;
        })
    }

    @action
    save(item: IChartAccount) {
        return this.ds.chartOfAccountsRef().doc(item.key).set(item, { merge: true })
    }

    @action
    async unsubscribe() {
        this.chartOfAccountsRef?.unsubscribe()
        this.data = [];
        Promise.resolve()
    }

    @action
    async fetchAccountTypes(): Promise<any[]> {
        const items = await this.ds.accountTypesRef().get().toPromise()
        return pushToArray(items)
    }

    @action
    async fetchSysDetailTypes(accountTypeKey: string): Promise<any[]> {
        const items = await this.ds.accountTypesRef().doc(accountTypeKey).collection('details', ref => ref.orderBy('name')).get().toPromise()
        return pushToArray(items)
    }

    @action
    async fetchSubAccounts(accountTypeKey: string): Promise<any[]> {
        const items = await this.ds.subAccountByAccountTypeRef(accountTypeKey).get().toPromise()
        return pushToArray(items)
    }
}
