import { observable, action, } from "mobx";
import { Injectable } from "@angular/core";
import { CriminalService } from "../services/criminal.service";

@Injectable({ providedIn: 'root' })
export class CriminalVerifyStore {

    constructor(private ds: CriminalService) { }

    @action
    async unsubscribe() {

    }

}
