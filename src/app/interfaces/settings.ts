export interface IDepartment {
    key: string;
    name_en: string;
    name_kh?: string;
    status: any;
    isDelete: boolean;
    created_at?: Date;
    created_by?: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword:any;
    tag:any;
}

export interface IRoute {
    key: string;
    name: string;
    name_kh?: string;
    status: any;
    isDelete: boolean;
    created_at?: Date;
    created_by?: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword:any;
    tag:any;

}


export interface ICOForm {
    key: string;
    code: string;
    name: string;
    status: any;
    isDelete: boolean;
    created_at?: Date;
    created_by?: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword:any;
    tag:any;
}


export interface ICountry {
    key: string;
    code: string;
    name: string;
    department: any;
    departmentKey: string,
    departmentRef: any,
    co_form: any;
    status: any;
    isDelete: boolean;
    created_at?: Date;
    created_by?: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword:any;
    tag:any;
}
export interface ICountryPort {
    key: string;
    code: string;
    name: string;
    country: any;
    status: any;
    isDelete: boolean;
    created_at?: Date;
    created_by?: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword:any;
    tag:any;

}

export interface IForwarder {
    key: string;
    name_en:string;
    name_kh:string;
    short_name_en:string;
    short_name_kh:string;
    email:string;
    address:string;
    country:any;
    tin_no:string;
    postal_code:string;
    link_address:string;
    telephone_number:string;
    fax_number:string;
    status: any;
    isDelete: boolean;
    created_at?: Date;
    created_by?: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword:any;
    tag:any;

}

export interface IHSCODE {
    key: string;
    code: string;
    description_en: string;
    description_kh: string;
    cd: number;
    st: number;
    vat: number;
    et: number;
    total?:number;
    level?:number;
    node?: string;
    parent?:string;
    index?:number;
    uom?: any;
    status: any;
    company:any;
    subItem:any;
    isDelete: boolean;
    created_at: Date;
    created_by: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword:any;
    tag:any;

  }

  export interface ISearchDocument {
    page?: number;
    limit?: number;
    word1: string;
    word2?: string;
    word3?: string;
    word4?: string;
    word5?: string;
  }