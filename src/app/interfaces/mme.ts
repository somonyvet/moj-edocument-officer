import { DocumentReference } from "@angular/fire/compat/firestore";

export interface IMmeProgram {
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

  // phoneNumber: string;
  program_id: string;
  title: any;
  displayName: string;
  nameKey: string;
  file?: any;
  year_of_program: any;
  budget_for_year: string;
  budget_for_yearKey: number;
  source_budget: any[];
  array_responsible_people?: string[];
  array_checker?: string[];

  department: any;
  checker: any[];
  responsible_people: any[];
  base_indicators: string;
  goal_text: string;
  level: any;
}

export interface IMmeMainProgram {
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

  // phoneNumber: string;
  code: string;
  name: string;
  name_en?: string;
  order?: number;
  node?: string;
  index?: number;
  totalChild: any;
  path: string[];
  subOfProgram?: any;
  parentData?: any[];

  displayName: string;
  nameKey: string;
  file?: any;
  year_of_program: any;
  budget_for_year: string;
  budget_for_yearKey: number;
  source_budget: any[];
  array_source_budget_key: string[];
  array_responsible_people?: string[];
  array_checker?: string[];
  workplaceKeys?: string[];
  departmentKeys?: string[];
  key_department?: string[];
  adminOffice?: boolean;
  department?: any[];

  parent?: string;
  checker: any[];
  responsible_people: any[];
  base_indicators: string;
  goal_text?: string;
  level: number;
  last_level?: boolean;
  level_text?: string;

  workplace: any[];
  company: any;
  ranking?: any;
  isWorkplace?: boolean;
  showInHeader?: boolean;
  verifyFromAssistant?: boolean;

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



export interface IMmeSubProgram {
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

  // phoneNumber: string;
  program_id: string;
  title: any;
  displayName: string;
  nameKey: string;
  file?: any;
  year_of_program?: any;
  source_budget: any[];
  parentKey: string;
  array_responsible_people?: string[];
  array_checker?: string[];

  department: any;
  checker: any[];
  responsible_people: any[];
  base_indicators: string;
  level: any;
  mfe_budget?: number;
}
