import { observable, action } from "mobx";
import { Injectable } from "@angular/core";
import { JsonDataService } from "./json-data.service";

@Injectable({ providedIn: 'root' })
export class LanguageStore {
    @observable strings: any = {};
    @observable language: string = "kh";

    constructor(private json: JsonDataService) {
        json.getLanguage().then(doc => {
            this.language = doc || 'kh';
            if (this.language === 'en') {
                json.englishJSON().subscribe(items => {
                    this.strings = items;
                })
            } else {
                json.khmerJSON().subscribe(items => {
                    this.strings = items;
                })
            }
        })
    }

    @action
    chooseLanguage(key: string) {
        this.json.setLanguage(key)
        this.language = key;
        if (this.language === 'en') {
            this.json.englishJSON().subscribe(items => {
                this.strings = items;
            })
        } else {
            this.json.khmerJSON().subscribe(items => {
                this.strings = items;
            })
        }
    }
}
