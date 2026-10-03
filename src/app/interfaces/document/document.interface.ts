export interface IDocument {
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
  name: string;
  displayName: string;
  title?: string;
  files?: any[];
  docFile?: any;
  objective: string;
  reference: string;
  description: string;
  documentNo: string;
  header: any[];
  footer: any[];

  doc_parent: any;

  headerInformationRef?: string;

  number_ref?: any;
  childKey?: any;
  numberRefData?: any;

  hashtag?: string[];

  document_category?: any;
}

export interface IHeaderInformation {
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

  owner_profile?: any | null;

  documentType: any;
  documentTitle: string;//name in IDocument
  documentNo: string;
  refNo: string;
  organizationRef?: any;
  duration: number;
  category?: any;

  workplaceAssistants?: any[];
  workplace: any;//workplace do document
  workplaces: any[];//allow access only from creator tick
  workplaceKeys: string[];
  workplacePath?: string[];//key for fill by workplace access currently not effect

  peopleKeys?: any;
  approvedByKeys: any;
  readOnlyKeys: any;
  accountKeys?: any;
  completedByKeys: string[];
  completedWorkplaceKeys: string[];

  documentNoKey: string;
  hashtag: string[];
  priority: any;
  documentKey: string;
  receivedDate?: any;
  receiveTime?: any;
  receiveTimePicker?: any;

  deadline?: any;
  deadlineKey?: number;
  doc_status: any;
  doc_status_level: any;
  doc_parent_workplace?: any;
  doc_parent: any;
  doc_parentData: string[];
  final: boolean;

  //for drag drop flow
  incomingFlowOffice?: string[];
  internalFlowOffice?: string[];
  outgoingFlowOffice?: string[];
  //office
  company: any;

  doc_type: any;


  //=============receive for sent to inbox of department or office
  receivedBlockNoteWorkPlaceKeys?: string[];
  receivedWorkplaceKeys: string[];
  receivedWorkplace: any;
  receivedWorkplaceCompletedByDocKeys: any[];

  verifyFromAssistantGeneral?: boolean;
  verifyFromAssistantDepartment?: boolean;
  verifyFromAssistantMinistry?: boolean;

  files?: any[];
  coverFile?: any;

  //for view only
  canPublish?: boolean;
  workplaceApproved?: any[];

  completed_date?: any;
  completed_date_key?: any;
  completed_note?: any;
  completed_by?: any;
  completed_files?: any[];

  void_date?: any;
  void_date_key?: any;
  void_note?: any;
  void_by?: any;
  workplaceOptions?: any;
  is_request_edit?: boolean;
  request_edit_status?: any;
  request_edit_at?: any;
  request_edit_by?: any;

  //for display only not for form
  rowIndex?: number;
  visitor_keys?: string[];
  photoUrl?: string;
  amTimeAgo?: string;
  isChecked?: boolean;

  document_category?: any;
  isMoreReport?: boolean;
  more_report_isHeader?: boolean;
  more_report_headerRef?: any;

  calendar_date?: any;
  calendar_date_key?: any;
}

export interface IStreamDocument {
  key: string;
  created_at: any;
  created_by: any;
  date_key?: any;
  page_key?: any;

  profile: any;
  workplace: any;
  streamStatus: any;
  documentHeaderKey: string;
  isOfficer: boolean;
}


export interface IUserPined {
  key: string;
  keyword: string[];
  date_key: number;
  page_key: number;
  created_at: any;
}

export interface IUserPermission {
  key: string;
  created_at: any;
  created_by: any;
  updated_by?: any;
  isDelete: boolean;

  accountKey: string;
  profile: any;
  permission: any;
  documentKey: string;
  workplaceKey: string;

  officerWorkplaces?: string[];
  completedTask?: boolean;
  approvedAt?: any;
  isApproved_date?: boolean;
  approvedBy?: string;
  ranking?: any;

  head: boolean;
  assistant: boolean;
  isActive: boolean;

  approval_order: number;
}

export interface IReplyDocument {
  key: string;
  created_at: any;
  created_by: any;
  parentDocumentKey: string;
  workplace: any;
  documentKey: string;
  keyword: string[];
  documentNo: string;
}

export interface INotification {
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

  title: string;
  body: string;
  file?: any;
}

export interface IDocumentWorkplacePath {
  key: string;
  code: string;
  name: string;
  name_en: string;
  isActive: boolean;
}
export interface IDepartment {
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

  code: string;
  name: string;
  nameKey: string;
  displayName: string;
  file?: any;
  name_en: string;
  index: number;
  level: any;
  node: any;
  order: any;
  parent: any;
  totalChild: any;
  path: any;
  subOfDepartment: any;

  workplace: any[];
  company: any;

  ranking: any;
  isWorkplace?: boolean;
  showInHeader?: boolean;
  verifyFromAssistant?: boolean;

  adminOffice: boolean;
  workplacePath?: any[];
  completedDuration?: number;
  total_notify?: any;
  total_inbox_notify?: any;
  workplaceLevel?: string;
  headerOfficerKeys?: string[];
  headerOfficer?: any[];
  topManagementKeys?: string[];
  topManagement?: any[];
  workplaceDisplayPath?: any;

  allowUsed?: boolean;
  approveOfficerForm?: boolean;
  userBlockNoteDirection?: boolean;
  //remove stop use
  headPosition?: any[];

  total_hr_notify?: any | null;
  total_doc_notify?: any | null;
  total_criminal_apply?: any | null;
  total_criminal_message_notify?: any | null;
  total_criminal_notify?: any;
  total_notify_read?: any;
}

export interface IStockVisa {
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

  code: string;
  name: string;
  displayName: string;
  province: any;
  index: number;
  level: any;
  node: any;
  order: any;
  parent: any;
  totalChild: any;
  path: any;
  subOfDepartment: any;
  adminOffice: boolean;
}

export interface IRanking {
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

  name: string;
  nameKey: string;
  displayName: string;
  file?: any;
  name_en: string;
  order: any;
}
export interface IProgram {
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

  code: string;
  name: string;
  nameKey: string;
  displayName: string;
  file?: any;
  name_en: string;
  index: number;
  level: any;
  node: any;
  order: any;
  parent: any;
  totalChild: any;
  path: any;
  subOfDepartment: any;

  workplace: any[];
  company: any;

  ranking: any;
  isWorkplace?: boolean;
  showInHeader?: boolean;
  verifyFromAssistant?: boolean;

  adminOffice: boolean;
  workplacePath?: any[];
  completedDuration?: number;
  total_notify?: any;
  total_inbox_notify?: any;
  workplaceLevel?: string;
  headerOfficerKeys?: string[];
  headerOfficer?: any[];
  topManagementKeys?: string[];
  topManagement?: any[];
  workplaceDisplayPath?: any;

  allowUsed?: boolean;
  //remove stop use
  headPosition?: any[];
}

export interface IPosition {
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

  name: string;
  nameKey: string;
  displayName: string;
  name_en: string;
  order: number;
}

export interface IVisaType {
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

  name: string;
  short_name: string;
  order: number;
  category: number;
  price: number;
}

export interface ISupplier {
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

  name: string;
}

export interface IPost {
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

  name: string;
  province: any;
}

export interface IBlockNote {
  key: string;
  status: any;
  isDelete: boolean;
  created_at: any;
  created_by: any;
  updated_by?: any;
  updated_at?: any;
  date_key?: any;
  page_key?: any;
  keyword?: string[];

  description: string;
  departmentKey: string;
  transactionKey: string;
  receivedWorkplaceKeys?: string[];

}

export interface IInstitution {
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

  file?: any;
  name: string;
  nameKey: string;
  displayName: string;
  name_en: string;
  email: string;
  website: string;
}

export interface IProvince {
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

  file?: any;
  name: string;
  en_name?: string;
  fr_name?: string;
  description?: string;
  nameKey: string;
  displayName: string;
  name_en: string;

}
export interface ISettings {
  key: string;
  general_department_order: number;
  administrationOffice: any;
  headOfficerPosition: any;
  generalDepartmentLevel: any;
  assistantGeneralPosition: any;
  departmentLevel: any;
  assistantDepartmentPosition: any;
  verifyFromAssistantGeneral: boolean;
  verifyFromAssistantDepartment: boolean;

  assistantMinistryPosition?: any;
  verifyFromAssistantMinistry?: boolean;

  secretaryOfStatePosition?: any;
  secretaryOfStateAssistantPosition?: any;
  verifyFromAssistantSecretaryOfState?: boolean;
  secretaryOfStateOfficePosition?: any;
  googleSMS?: boolean;
  loginWithOTP?: boolean;
  loginWithUsername?: boolean;
  contactSupports?: string[];
  startFromLevel?: any;

  country_khmer_key?: string;
  criminal_application_type?: any;
  criminal_record_category?: any;
  criminal_record_category_labor?: any;

  criminal_record_latter_id?: any;
  criminal_storyboard_office?: any;
  criminal_decree_noted?: any;
  criminal_record_support?: any;
  criminal_confirm_noted?: any;

  criminal_working_hours?: any;
  period_can_receive_day?: any;
  period_renew_month?: any;
  disableApply?:any;
  announcement?:any;
  enableCanCome?:any;
  enable_before_canCome?:any;

  criminalOfficerOptions?:any[];
  criminal_payment?:any;
  officerVerifyCriminalApplication?:any;

  criminal_folder_copy?:number;
  department_labor: any;
  department_defense: any;
  retrieve_document_address?: string;
  payment_receipt_number: number;
  payment_receipt_month_key?: any;
  criminal_record_category_business?: any;
}

export interface IOfficer {
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

  defaultApp: any[];

  phoneNumber: string;
  officerIdNo: number;
  officerId: string;
  first_name: string;
  last_name: string;
  first_name_en: string;
  last_name_en: string;

  // New Field
  gender?: any;
  dataOfBirth?: any;
  nationality?: any;
  birthAddress?: any;
  dateOfEntryPoliceWork?: any;
  documentNumber?: any;
  dateOfPostOn?: any;
  rank?: any;
  organization?: any;
  permanentAddress?: any;
  policeCardID?: any;

  currentTitle: string;
  currentPosition: string;

  displayName: string;
  nameKey: string;
  file?: any;
  title: any;

  workingOffices: any[];
  officeKeys: string[];
  workplace: any[];
  workplaceKeys: string[];
  currentDepartment?: any;
  workplaceKey: string;

  positions: any[];
  position: any;
  positionKeys: string[];
  positionWorkplaceKeys: string[];

  company: any;
  isAdmin: boolean;
  stampFile: any;
  remarkFile?: any;
  signatureFile: any;

  total_doc_notify?: number | null;
  total_doc_notify_read?: number | null;

  total_hr_notify?: number | null;
  total_hr_notify_read?: number | null;

  total_inbox_notify?: number;
  total_inbox_notify_read?: number;
  total_approval_notify?: number;
  total_approval_notify_read?: number;


  rowIndex?: number;
  photo?: any;
  stock_visa?: any;
  workingHourKey?: string;

  total_criminal_notify?: any;
  total_criminal_notify_read?: any;
  total_criminal_apply_read?: any;
}


export interface IDocumentComment {
  key: string;
  status: any;
  created_at: any;
  created_by: any;
  updated_by: any;
  updated_at: any;
  deleted_by: any;
  deleted_at: any;
  date_key: any;
  page_key: any;
  keyword: any;
  businessData: any;
  ownerData: any;
  displayName: any;
  ownerKey: any;
  files: any;
  comment: any;
  photoComment: any;
  voice: any;
}

export interface IViewer {
  key: string;
  full_name: string;
  file: any;
  created_at: any;
  page_key: number
}

export interface IComment {
  key: string
  created_at: any
  updated_at: any
  date_key?: any
  page_key?: any
  created_by: any
  isHeader: boolean
  headerKey: string | null
  text: string | null
  files: any[]
  hasSent: boolean
  displayName: string | null
  status: any
}
export interface IDelete {
  status: any;
}
export interface IUpdate {
  key: string
  updated_at: any
  isHeader: boolean
  headerKey: string | null
  text: string | null
  files: any[]
  hasSent: boolean
  displayName: string | null
  status: any
}

export interface ICategory {
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

  name: string;
  nameKey: string;
  displayName: string;
  name_en: string;
  order: number;

}

export interface IManagementLevel {
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

  name: string;
  nameKey: string;
  displayName: string;
  file?: any;
  name_en: string;
  positionAssistant: any[];
  positionManager: any[];
  verifyFromAssistant: boolean;
  isWorkplace: boolean;

  index: number;
  level: any;
  node: any;
  order: any;
  parent: any;
  totalChild: any;
  path: any;
  subOfWorkplace: any;
}


export interface IEcosystem {
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

  name: string;
  nameKey: string;
  name_en: string;
  icon_app: string;
  icon_web: string;
  route_app: string;
  route_web: boolean;
  app_no: number;
  file: any;
  isDefault: boolean;
  isPrimary: boolean;
  defaultApp: any;
  defaultAppKey: string[]

  index: number;
  level: any;
  node: any;
  order: any;
  parent: any;
  totalChild: any;
  path: any;
  subOfWorkplace: any;
}


export interface IHeaderMovement {
  key: string;
  created_at: any;
  created_by: string;

  documentKey: string;
  workplaceKey: string;
  profile: any;
  workplace: any;

  is_request_edit?: boolean
}

export interface IReportDocument {
  key: string;
  created_at: any;
  created_by: string;
  workplaceKey: string;
  files?: any[];
  received_by: string;
  received_date: any;
  completed_date: any;
  completed_note: any;
}

export interface IRemarkOfficer {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at: any;
  created_by?: any;
  updated_by?: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword?: string[];

  name?: string;
  officer?: any;

}

export interface IRemarkOfficer {
  key: string;
  // status: any;
  // isDelete: boolean;
  created_at: any;
  // created_by: any;
  // updated_by?: any;
  // updated_at?: any;
  // deleted_by?: any;
  // deleted_at?: any;
  // date_key?: any;
  // page_key?: any;
  // keyword: string[];

  // name: string;
  // officer: any;
  remarkText?: string

}

export interface IFileComment {
  key: string;
  // created_date: any;
  fileName: string;
  fileSize: any;
  downloadUrl?: any;
  detail_images?: any;
  name: string;
  type: string;
}

export interface IYearProgram {
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

  name: string;
  yearKey: any;
  year: string;

}
