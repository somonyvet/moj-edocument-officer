import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
@Injectable()
export class SetStatusStore {
    @observable status: boolean = false;
    @observable process: boolean = false;
    @observable isUsed: boolean = false;
    @observable totalInvoice: number = 0;
    @observable company = null;


    constructor(
    ) { }
    @action
    getStatus(status) {
        this.status = status
    }
    @action
    isStatusUsed(status) {
        this.isUsed = status
    }

    @action
    getInvoiceTotal(inv) {
        this.totalInvoice = inv
    }

    @action
    getCompany(company) {
        this.company = company
    }
}

