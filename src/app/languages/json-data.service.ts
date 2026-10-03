import { Injectable, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonDataService {

  constructor(private http: HttpClient) {
    this.getLanguage();
  }

  async getLanguage() {
    const language = localStorage.getItem('auxswot_ecosystem_language')
    return language ? JSON.parse(language) : null;
  }

  async setLanguage(key) {
    localStorage.setItem("auxswot_ecosystem_language", JSON.stringify(key))
  }

  englishJSON(): Observable<any> {
    return this.http.get("./../../assets/en.json");
  }

  khmerJSON(): Observable<any> {
    return this.http.get("./../../assets/kh.json");
  }

}
