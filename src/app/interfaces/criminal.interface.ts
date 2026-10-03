export interface ICriminalRecord{
  key: string;
  status: any;
  isDelete: boolean;
  created_at: any;
  created_by: any;
  updated_by?: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: string[];

  apply?: boolean;
  application_type: any;
  photo: any;
  national_application: any;
  criminal_record_category: any;
  day_header: any;
  month_header: any;
  year_header: any;
  nick_name: any;
  nick_name_en: any;
  before_nationality: any;
  current_nationality: any;
  first_name: string;
  last_name: string;

  first_name_en: string;
  last_name_en:  string;

  gender: any;
  occupation: string;
  occupation_en: string;
  occupation_fr: string;

  dateOfBirthDay: any;
  dateOfBirthMonth: any;
  dateOfBirthYear: any;

  birthAddress: any;
  permanentAddress: any;
  permanentAddressText: string;
  permanentAddressText_en: string;
  permanentAddressText_fr : string;

  phoneNumber: any;
  spacialKey: string;

  father_name: string;
  father_name_en: string;

  fatherIsDead: any;
  father_before_nationality: any;
  father_current_nationality: any;
  fatherDob: any;
  fatherBirthAddress: any;

  fatherCurrentOccupation: string;
  fatherCurrentOccupation_en: string;
  fatherCurrentOccupation_fr: string;

  mother_name:  string;
  mother_name_en: string;

  motherIsDead: any;
  mother_before_nationality:  any;
  mother_current_nationality:  any;
  motherDob: any;
  motherBirthAddress:  any;

  motherCurrentOccupation:  any;
  motherCurrentOccupation_en:  any;
  motherCurrentOccupation_fr:  any;

  spouse: any;
  spouse_en: any;

  spouseIsDead: any;
  spouse_before_nationality: any;
  spouse_current_nationality: any;

  spouseCurrentOccupation: any;
  spouseCurrentOccupation_en: any;
  spouseCurrentOccupation_fr: any;

  spouseDob: any;

  storyboard: any;
  hashtags: any;

  attachments: any;
  citizen_ref?: any;

  foreignerPlaceOfBirth: any;
  foreignerPlaceOfBirth_en: any;
  foreignerPlaceOfBirth_fr: any;

  foreignerFatherBirthAddress: any;
  foreignerFatherBirthAddress_en: any;
  foreignerFatherBirthAddress_fr: any;

  foreignerMotherBirthAddress: any;
  foreignerMotherBirthAddress_en: any;
  foreignerMotherBirthAddress_fr: any;

  criminal_language: any;
  workplace_entry?: any;
  urgent?:  any;
  urgent_obj?:  any;
  urgentStatus?:  any;
  isTextAddress?:  any;
  apply_from?: any;
  application_country?: any;
  application_embassy?: any;
  payment_option?: any;
  paid_online?: boolean;

  document_flow_category?: any;
  
  decree_result?: any;
  decree_status?: any;
  decree_by?: any;
  decree_at?: any;
  comment_officer?: any;

  //approval fields
  approved_officerKey?: string[] | any;
  approved_officers?:any;
  approved_workplaceKeys?: string[]| any;
  workplaces?: any[]| any;
  workplaceKeys?: any[]| any;
  request_approval_workplace_keys?: string[]| any;
  last_approved_at?: any| any;

  //internal process reject fields
  rejected_workplaceKeys?: string[]| any;
  rejected_officerKey?: string[]| any;
  rejected_officers?: any;
  rejected_at?: any;
  rejected_by?: any;
  reject_reason?: string| any;
  reject_to_workplace?: any;

  internal_status: any;
  tran_at?: any;
  tran_by?: any;
}

export interface IApplicationConfig{
  nationalKey: string,
  duration: any,
  apply_from: any,
  application_country: any,
  application_embassy: any,
  khmer_amount: number,
  france_amount: number,
  english_amount: number,
  isStudent: boolean,
}


export interface IPaymentOption{
  key: string;
  status: any;
  isDelete: boolean;
  created_at: any;
  created_by: any;
  updated_by?: any;
  updated_at?: any;

  nationality: any,
  duration: any,
  apply_from: any,
  isStudent: boolean,
  khmer_price: number,
  france_price: number,
  english_price: number,
  tran_fee: number,
}
