export interface IGeo {
  key?: string;
  status?: any;
  created_at?: Date;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: any;
  //
  id: string;
  name: string;
  en_name: string;
  description?: string;
  fr_name?: string;
  location?: any,
  color?: string,

  geo_prefix?: any;

}
export interface IProvince {
  key?: string;
  status?: any;
  created_at?: Date;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: any;
  //fields
  id: string;
  name: string;
  en_name: string;
  description?: string;
}
export interface IDistrict {

  key?: string;
  status?: any;
  created_at?: Date;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: any;

  province: any;
  province_id: number;
  id?: string;
  name?: string;
  en_name: string;
  description?: string;
  location?: any;
  color?: string;
  fr_name?: string;

  geo_prefix?: any;
}

export interface ICommunes {

  key?: string;
  status?: any;
  created_at?: Date;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: any;

  province: any;
  province_id: number;
  district: any;
  district_id: number;
  id?: string;
  name?: string;
  en_name: string;
  fr_name?: string;
  description?: string;
  location?: any;
  color?: string;

  geo_prefix?: any;


}

export interface IVillage {
  key?: string;
  status?: any;
  created_at?: Date;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: any;


  location?: any;
  color?: string;
  commune: any;
  commune_id: number;
  province: any;
  province_id: number;
  district: any;
  district_id: number;
  id?: string;
  name?: string;
  en_name: string;
  fr_name?: string;
  description?: string;
}


export interface ISubCategory {
  key?: string;
  name?: string;
  category: any;
  description?: string;
  status: any;
  create_date?: Date;
  create_by?: object;
  update_date?: Date;
  update_by?: object;
}


export interface IData {
  key?: string;
  name?: string;
  description?: string;
  status: any;
  create_date?: Date;
  create_by?: object;
  update_date?: Date;
  update_by?: object;
}

export interface ICourt {
  key: string;
  status: any;
  page_key: number;
  create_date?: any;
  create_by?: object;
  update_date?: any;
  update_by?: object;
  //fields
  name: string;
  en_name?: any;
}

export interface IJudgment {
  key: string;
  status: any;
  page_key: number;
  create_date?: any;
  create_by?: object;
  update_date?: any;
  update_by?: object;
  //fields
  DaikaNo: any;
  Institution: any;
  InstitutionKey: any;
  InstitutionRef: any;
  DaikaStatus: any;
  ExpireDate?: any;
  ExpireDateKey?: any;
  NoExpireDate?: any;
  ApplicationDate?: any;
  ApplicationDateKey?: any;
  Summary?: any;
  ProvinceId?: any;
  DistrictId?: any;
  CommuneId?: any;
  VillageId?: any;
  CaseId?: any;
  OffenceId?: any;

  province?: any;
  district?: any;
  commune?: any;
  village?: any;
  case?: any;
  offence?: any;

  CrimeId?: any;
  CrimeKey?: any;
  CrimeRef?: any;
  SuspectId?: any;
  SuspectKey?: any;
  SuspectRef?: any;
  isHaveCase?: boolean;
  files?: any;
  isImplementCrime: any
}
export interface INationality {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at: any;
  created_by: any;
  updated_by?: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: string[];
  created_byRef?:any;
  updated_byRef: any;

  id: string;
  en_nationality?: string;
  fr_nationality?: string;
  kh_nationality?: string;
  nationality: string;
  num_code: string;
}
