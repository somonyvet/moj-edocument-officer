export interface IPath {
  key: any;
  name: any;
  path: any;
  name_en?: any;
  isMyFile?: boolean;
  isFavorite?: boolean;
  fileTag?: any;
  isDelete?: boolean;
  type?: any;
  created_by?: any;
  folder_path_button?: any;
}

export interface IFolder {
  key: string;
  status: any;
  isDelete: boolean;
  isFavorite: boolean;
  isParentDelete: boolean;
  created_at: any;
  created_by: any;
  updated_by: any;
  updated_at: any;
  deleted_by: any;
  deleted_at: any;
  date_key: any;
  page_key: any;
  keyword: any;
  keywords: Array<any>;
  tag: any;
  path: any;
  pathString: any;
  currentPath: any;

  
  name: string;
  fileTag?: any;
  // folderSize: any;
  personalShareRef?: any[];
  personalShareKey?: any[];
  groupRef?: any[];
  groupKey?: any[];
  companyKey: any;
  companyRef: any;
  type: any;
  allowUpload?: any;
  yearFolder?: any;
  folderRef?: any;
  companyData?: any;
  rootLevel: any;

  hashtag?:string[];
  organization?:any;
  category?:any;
  sector?:any;
  issueDate?:any;
  issueDateKey?:any;
  refNo?:string;
  signer?:any;
}

export interface IGroupUser {
  key: string;
  status: any;
  isDelete: boolean;
  isFavorite: boolean;
  created_at: Date;
  created_by: any;
  updated_by: any;
  updated_at: any;
  deleted_by: any;
  deleted_at: any;
  date_key: any;
  page_key: any;
  keyword: any;
  tag: any;

  name: string;
  companyKey: any;
  companyRef: any;
}

export interface IShareFile {
  key: string;
  status: any;
  isDelete: boolean;
  isFavorite: boolean;
  created_at: Date;
  created_by: any;
  updated_by: any;
  updated_at: any;
  deleted_by: any;
  deleted_at: any;
  date_key: any;
  page_key: any;
  keyword: any;
  tag: any;
  size: any;
  companyKey: any;
  companyRef: any;
  //fields
  pin: string;
  publicShare: boolean;
  permission: any;
  user: any[];
  viewer: any[],
  fileRef: any;
  fileKey: any;
}

