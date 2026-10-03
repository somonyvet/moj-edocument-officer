export interface IGeo {
  key?: string;
  code?: string;
  name?: string;
  description?: string;
  status: any;
  create_date?: Date;
  create_by?: object;
  update_date?: Date;
  update_by?: object;
}
export interface IProvince {
  key: string;
  status: any;
  id?: any;
  name?: string;
  page_key?: number;
  code?: string;

  create_date?: Date;
  create_by?: object;
  update_date?: Date;
  update_by?: object;
  //fields
  en_name?: any;
}
export interface IDistrict {
  key: string;
  status: any;
  province: any;
  id?: any;
  name?: string;
  page_key?: number;

  code?: string;
  description?: string;
  create_date?: Date;
  create_by?: object;
  update_date?: Date;
  update_by?: object;
}

export interface ICommunes {
  key: string;
  status: any;
  district: any;
  province: any;
  id?: any;
  name?: string;
  page_key?: number;
  code?: string;
  description?: string;
  create_date?: Date;
  create_by?: object;
  update_date?: Date;
  update_by?: object;
}

export interface IVillage {
  key: string;
  status: any;
  commune: any;
  district: any;
  province: any;
  id?: any;
  name?: string;
  page_key?: number;
  code?: string;
  description?: string;
  create_date?: Date;
  create_by?: object;
  update_date?: Date;
  update_by?: object;
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
  create_date_key?: number;
  create_by?: object;
  update_date?: any;
  update_date_key?: number;
  update_by?: object;
  //fields

  daika_exist_no?:any;
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