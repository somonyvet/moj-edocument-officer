import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
// import 'rxjs/add/operator/toPromise';

@Injectable({providedIn:'root'})
export class ApiServiceNew {

    baseUri = 'http://www.apiOwner.immigration.gov.kh/public/api/';
    // baseUri = 'http://muypiapp-001-site1.gtempurl.com/public/api/';
    // baseUri = 'http://192.168.0.107:81/ZandBookapi/public/api/';

    // baseUriConfig = 'http://192.168.100.102:81/ZandBookapi/public/api/config?token=MWY5MzBlZTktODNhMC00NzhkLWFkYzQtMDE3ZGYyOTMxMzk077';
    baseUriConfig = 'http://96.9.80.25:8487/zandbooks/api/V2/public/api/config?token=MWY5MzBlZTktODNhMC00NzhkLWFkYzQtMDE3ZGYyOTMxMzk077';

    discountContent = {
        disVoucher: 'Discount {{value}} AND {{code}}',
        extraDisVoucher: 'ZANDO City Mall soft opening promotion, get an extra {{value}} off with your promotion code {{code}}. Apply at Zando City Mall only. Expire on {{end_date}}. Call us 081 999 716/092 328 352.',
        cashVoucher: 'Cash Voucher {{value}} AND {{code}}',
        SMSTimer: 1200
    }

    constructor(private http: Http) {

    }

    login(uri: string = this.baseUri, data: any = {}, options: RequestOptions = this.getOption()): Promise<any> {
        return this.http.post(uri, data, options)
            .toPromise()
            .then(this.handlSuccess)
            .catch(this.handleError);
    }

    get(uri: string = this.baseUri, data: any = false, options: RequestOptions = this.getOption()): Promise<any> {
        if (data)
            options = this.getOption(data, 'get');
        return this.http.get(uri, options)
            .toPromise()
            .then(this.handlSuccess)
            .catch(this.handleError);
    }

    post(uri: string = this.baseUri, data: any = {}, options: RequestOptions = this.getOption()): Promise<any> {
        return this.http.post(uri, data, options)
            .toPromise()
            .then(this.handlSuccess)
            .catch(this.handleError);
    }

    put(uri: string = this.baseUri, data: any = {}, options: RequestOptions = this.getOption()): Promise<any> {
        return this.http.put(uri, data, options)
            .toPromise()
            .then(this.handlSuccess)
            .catch(this.handleError);
    }

    delete(uri: string = this.baseUri, data: any = false, options: RequestOptions = this.getOption()): Promise<any> {
        if (data)
            options = this.getOption(data);
        return this.http.delete(uri, options)
            .toPromise()
            .then(this.handlSuccess)
            .catch(this.handleError);
    }

    deleteWithBody(uri: string = this.baseUri, data: any = {}, options: RequestOptions = this.getOption()): Promise<any> {
        if (data)
            options = this.getOption(data, 'deleteWithBody');
        return this.http.delete(uri, options)
            .toPromise()
            .then(this.handlSuccess)
            .catch(this.handleError);
    }

    private getOption(data: any = false, method: any = false): RequestOptions {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        // var access_token = Utils.getLocalstorageItem('id_token');
        // if(access_token){
        //     headers.append('Authorization', 'Bearer ' + access_token);
        // }
        if (method == 'deleteWithBody') {
            return new RequestOptions({ headers: headers, body: data })
        }
        if (data)
            return new RequestOptions({ headers: headers, search: data })
        return new RequestOptions({ headers: headers });
    }

    private handlSuccess(res) {
        return res.json();
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }

}

@Injectable()
export class Utils {
    public data: any;

    public static setLocalstorageItem(itemName: string, itemValue: any) {
        localStorage.setItem(itemName, JSON.stringify(itemValue));
    }

    public static getLocalstorageItem(itemKey: string): any {
        let value = localStorage.getItem(itemKey);
        if (this.IsJsonString(value)) {
            return JSON.parse(value)
        }
        return value;
    }

    public static IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    public static setDataOption(data: Object, options: RequestOptions): RequestOptions {
        // let params: URLSearchParams = new URLSearchParams();
        Object.keys(data).some(prob => {
            options.search.set(prob, data[prob]);
            return false;
        });
        return options;
    }

    public static objToURLSearchParams(data: Object): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();
        Object.keys(data).some(prob => {
            params.set(prob, data[prob]);
            return false;
        });
        return params;
    }

    public static objToFormData(data: Object): FormData {
        let body = new FormData();
        Object.keys(data).some(prob => {
            body.append(prob, data[prob]);
            return false;
        });
        return body;
    }
}