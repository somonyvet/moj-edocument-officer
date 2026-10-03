import { observable, action, } from "mobx";
import { Injectable } from "@angular/core";
import { SwotifyService } from "../services/swotify.service";

@Injectable({ providedIn: 'root' })
export class MarketplaceStore {
    
    constructor(private ds: SwotifyService) { }

    @action
    async unsubscribe(){

    }

}
