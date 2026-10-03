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

  document_category?:any;
  owner_profile?:any;

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

  accountKeys: string[];
  peopleKeys?: string[];
  approvedByKeys: string[];
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

  cloneRef?: any;

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
}


export interface IUserPined {
  key: string;
  keyword: string[];
  date_key: number;
  page_key: number;
  created_at: any;
}


export interface INotification {
  key: string;
  created_at: any;
  created_by: any;
  updated_by?: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_at?: any;
  date_key?: any;
  page_key?: any;
  keyword: string[];

  notifyTo: string[];
  title: string;
  title_en: string;
  title_fr: string;
  body: string;
  body_en: string;
  body_fr: string;
  file?: any;
  parentKey: any;
  transactionKey: any;
  notifyBy: any;
  type?: any;

  profile?:any;
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
  adminOffice: boolean;
  workplacePath?: any[];
  completedDuration?: number;
  total_notify?: any;
  total_inbox_notify?: any;
  workplaceLevel?: string;
  headerOfficerKeys?: string[];
  headerOfficer: any[];
  topManagementKeys?: string[];
  topManagement: any[];
  //remove stop use
  headPosition?: any[];
  workplaceAssistants?: any[];

  isWorkplace?: any[];
  userBlockNoteDirection?: any[];
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
  order: number;
  displayName: string;
  file?: any;
  name_en: string;
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

  fromForm: boolean;

  phoneNumber: string;
  officerIdNo: number;
  officerId: string;
  first_name: string;
  last_name: string;
  first_name_en: string;
  last_name_en: string;

  currentTitle: string;

  displayName: string;
  nameKey: string;
  full_name:string;
  files?:any[];
  file?: any;
  photo: any | null;
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

  approvedBy: any | null;

  company: any;
  isAdmin: boolean;
  stampFile: any;
  signatureFile: any;
  total_notify?: any;
  total_inbox_notify?: any;
  total_notify_read?: any;
  total_inbox_notify_read?: any;

  policeCardFiles:any[];
  nationalCardIdFiles:any[];

  rankHistory:any[];
  generalEducation:any[];
  occupationHistory:any[];
  trainingLevel:any[]
  positionHistory:any[]
  commendation:any[]

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
  created_at: Date;
  page_key: number
}


export interface IUserPermission {
  key: string;
  created_at: any;
  created_by: any;
  updated_by?: any;
  isDelete: boolean;

  accountKey: string;
  permission: any;
  documentKey: string;
  workplaceKey: string;

  completedTask: boolean;
  approvedAt: any;
  approvedBy: string;
  ranking: any;
  doc_status: any;
  head: boolean;
  assistant: boolean;
}


export interface IHeaderMovement {
  key: string;
  created_at: any;
  created_by: string;

  documentKey: string;
  workplaceKey: string;
  profile: any;
  workplace: any;
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



export interface IOfficerV2 {
  // first_name: string;
  // last_name: string;
  // first_name_en: string;
  // last_name_en: string;
  // gender: any | null;
  // dataOfBirth: any | null;
  // nationality: any | null;
  // birthAddress: IObjectAddress | null;
  // permanentAddress: IObjectAddress | null;
  // contactNumber: any | null;
  // policeCardID: any | null;
  // policeCardFiles: any | null;
  // nationalCardId: any | null;
  // nationalCardIdFiles: any | null;
  // photo: any | null;
  // dateOfEntryPoliceWork: any | null;
  // dateOfEntryStateWork: any | null;
  // rank: IObjectRankAndPosition[] | null;
  // position: IObjectRankAndPosition[] | null;
  // foreignLanguageLevel: any | null;
  // generalEducation: IObjectGeneralEducation[] | null;
  // trainingLevel: IObjectTrainingLevel[] | null;
  // occupationHistory: IObjectOccupationHistory[] | null;
  // commendation: IObjectCommendation[] | null;
  // punishment: IObjectPunishment[] | null;

  // // family info
  // spouse: IObjectParent | null;
  // childrenNumber: any | null;
  // childrenInfo: IObjectChild[] | null;
  // fatherInfo: IObjectParent | null;
  // motherInfo: IObjectParent | null;

  // // created_user info
  // key: string;
  // created_at: any | null;
  // created_by: any;
  // date_key: any | null;
  // displayName: string | null;
  // email: string | null;
  // fromForm: boolean;
  // full_name: string | null;
  // isAdmin: boolean | null;
  // isDelete: boolean | null;
  // keyword: string[] | null;
  // page_key: any | null;
  // status: any | null;
  // updated_at: any | null;
  // updated_by: string | null;
  // deleted_by?: any;
  // deleted_at?: any;
  // officerIdNo: number;
  // officerId: string;
  // currentTitle: string;
  // nameKey: string;
  // file?: any;
  // title: any;
  // generalDepartment: any;
  // department: any;
  // workingOffices: any[];
  // positionKeys: string[];
  // officeKeys: string[];
  // company: any;
  // role: any;
  // stampFile: any;
  // signatureFile: any;
  // workplace: any[];
  // workplaceKeys: string[];
  // currentDepartment?: any;
};

export interface IFolder {
  key: string;
  status: any;
  isFavorite: boolean;
  isParentDelete: boolean;
  created_at: any;
  created_by: any;
  updated_by: any;
  updated_at: any;
  deleted_by?: any;
  deleted_at?: any;
  isDelete: boolean;

  date_key: any;
  page_key: any;
  keyword: any;
  keywords: Array<any>;
  tag?: any;
  path: any;
  pathString: any;
  currentPath: any;


  name: string;
  fileTag?: any;
  // folderSize: any;
  groupKey?: any[];
  companyKey: any;
  type: any;
  allowUpload?: any;
  yearFolder?: any;
  folderRef?: any;
  companyData?: any;
  rootLevel: any;

  hashtag?: string[];
  organization?: any;

  sharedWith?: any[];
  announcement?: any;
  shareStatus?: any;
  permission?: any;
  userAccount?: any;

  remark?: string;
  createWithKey?: string;
  category?: any;
  sector?: any;
  issueDate?: any;
  issueDateKey?: any;
  refNo?: string;
  signer?: any;

  workplace?: any;
  parentOwner?: any[];
  file_type?:any;
}