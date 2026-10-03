export interface IUser {
    key?: string;
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
    keyword: any;

    full_name: string;
    displayName: string;
    email: string;
    password?: string;
    confirm_password?: string;
    phone?: number;
    position?: any;
    photo?: any;
    isAdmin: boolean;
    role?: any;
    fromForm?: boolean;
    //workplace
    company?: any;
    department?: any;
    generalDepartment?: any;

    signatureFile?: any;
    stampFile?: any;
    isPublicAccount?: boolean;
    account_type?: any;
    phoneNumber?: number;
    criminal_record?: any;

    criminal_application?: any;
    total_criminal_notify?: any;
    total_criminal_notify_read?: any;
    total_notify_read?: any;
    total_criminal_apply_read?: any;
    total_notify_criminal?:any;
    total_notify_criminal_read?:any;
    officer_counter?: any;
    admin_mol?: boolean;
}

export interface ICompany {
    key?: string;
    status: any;
    isDelete: boolean;
    created_at: Date;
    created_by: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword: any;

    name: string;
    displayName: string;
    email: string;
    phone?: number;
    name_en: string;
    order: number;
    index: number;
    node: string;
    subOfDepartment?: any;

    headPosition: any[];
    headerOfficerKeys: string[];
    headerOfficer: any[];

    ranking: any;
}

export interface IOfficerPersonalInfo {
    photo: any | null;
    first_name: string;
    last_name: string;
    first_name_en: string;
    last_name_en: string;
    gender: any | null;

    // dataOfBirth: any | null;
    dateOfBirthDay: any | null;
    dateOfBirthMonth: any | null;
    dateOfBirthYear: any | null;

    nationality: any | null;
    birthAddress: IObjectAddress | null;

    // dateOfEntryPoliceWork: any | null;
    dateOfEntryPoliceWorkDay: any | null;
    dateOfEntryPoliceWorkMonth: any | null;
    dateOfEntryPoliceWorkYear: any | null;

    documentNumber: any | null;

    // dateOfPostOn: any | null;
    dateOfPostOnDay: any | null;
    dateOfPostOnMonth: any | null;
    dateOfPostOnYear: any | null;

    rank: any | null;
    positionForm: any | null;
    permanentAddress: IObjectAddress | null;
    phoneNumber: any | null;

    officerIdNo: number;
    officerId: string;
    nameKey: string;

    policeCardID: any | null;
    policeCardFiles: any | null;
    nationalCardId: any | null;
    nationalCardIdFiles: any | null;

    // created_user info
    key: string;
    created_at: any | null;
    created_by: any;
    date_key: any | null;
    isDelete: boolean | null;
    keyword: string[] | null;
    page_key: any | null;
    status: any | null;
    updated_at: any | null;
    updated_by: string | null;
    deleted_by?: any;
    deleted_at?: any;

};


export interface IOfficerV2 {
    photo: any | null;
    first_name: string;
    last_name: string;
    first_name_en: string;
    last_name_en: string;
    gender: any | null;
    dataOfBirth: any | null;
    nationality: any | null;
    birthAddress: IObjectAddress | null;
    dateOfEntryPoliceWork: any | null;
    documentNumber: any | null;
    dateOfPostOn: any | null;
    rank: any | null;
    position: any | null;
    permanentAddress: IObjectAddress | null;
    phoneNumber: any | null;

    officerIdNo: number;
    officerId: string;
    nameKey: string;

    policeCardID: any | null;
    policeCardFiles: any | null;
    nationalCardId: any | null;
    nationalCardIdFiles: any | null;

    foreignLanguageLevel: any | null;
    latestGeneralEducation: any | null;
    generalEducation: IObjectGeneralEducation[] | null;
    trainingLevel: IObjectTrainingLevel[] | null;

    dateOfEntryStateWork: any | null;
    occupationHistory: IObjectOccupationHistory[] | null;
    commendation: IObjectCommendation[] | null;
    punishment: IObjectPunishment[] | null;
    // family info
    spouse: IObjectParent | null;
    childrenNumber: any | null;
    childrenInfo: IObjectChild[] | null;
    fatherInfo: IObjectParent | null;
    motherInfo: IObjectParent | null;


    // created_user info
    key: string;
    created_at: any | null;
    created_by: any;
    date_key: any | null;
    displayName: string | null;
    email: string | null;
    fromForm: boolean;
    full_name: string | null;
    isAdmin: boolean | null;
    isDelete: boolean | null;
    keyword: string[] | null;
    page_key: any | null;
    status: any | null;
    updated_at: any | null;
    updated_by: string | null;
    deleted_by?: any;
    deleted_at?: any;

    currentTitle: string;
    file?: any;
    title: any;
    generalDepartment: any;
    department: any;
    workingOffices: any[];
    positionKeys: string[];
    officeKeys: string[];
    company: any;
    role: any;
    stampFile: any;
    signatureFile: any;
    workplace: any[];
    workplaceKeys: string[];
    currentDepartment?: any;
};

export interface IObjectRankAndPosition {
    date: any | null;
    files: any[]
    order: any | null;
    name: any | null;
    numDoc: any | null;
}

export interface IObjectAddress {
    village: any | null;
    commune: any | null;
    district: any | null;
    province: any | null;
}

export interface IObjectParent {
    name: any | null;
    isDead: any | null;
    dob: any | null;
    birthAddress: any | null;
    permanentAddress: any | null;
    occupation: any | null;
}

export interface IObjectChild {
    dob: any | null;
    name: any | null;
    gender: any | null;
    occupation: any | null;
}

export interface IObjectGeneralEducation {
    date: any | null;
    files: any[] | null;
    certificate: any | null;
    skill: any | null;
}

export interface IObjectTrainingLevel {
    date: any | null;
    files: any[] | null;
    skill: any | null;
    location: any | null;
    duration: any | null;
}

export interface IObjectCommendation {
    date: any | null;
    files: any | null;
    rank: any | null;
    imageTitle: any | null;
}

export interface IObjectPunishment {
    date: any | null;
    files: any | null;
    rank: any | null;
    reason: any | null;
}
export interface IObjectFile {
    downloadUrl: any | null;
    fileName: number | null;
    fileType: any | null;
    filename: any | null;
    key: any | null;
    name: any | null;
    type: any | null;
}

export interface IObjectOccupationHistory {
    fromDate: any | null;
    toDate: any | null;
    name: any | null;
    unit: any | null;
}

export interface IGroupUser {
    key?: string;
    created_at?: any;
    created_by?: any;
    updated_at?: any;
    updated_by?: any;
    status?: any;
    date_key?: number;
    page_key?: number;
    storeKey?: any;
    storeRef?: any;
    keyword: any;
    //field
    name: string;
    isAdmin: boolean;
    isBranchManager: boolean;
    isCashier: boolean;
    programs: any[];
    programKeys: any[];
    isAllCampus: boolean;
    isCompletedApplicationOnly?: boolean;
    isEmbassy?: boolean;
    isAdminMOL?: boolean;
    isAdminMOD?: boolean;
}

export interface IGroupUserMember {
    key: string;
    created_at?: any;
    created_by?: any;
    storeKey?: any;
    //field
    groupData: any;
    email?: any;
    code: any;
    full_name: any;
    mobile_phone: any;
    department: any;
    school?: any;
    gender: any;
    job_title: any;
}

export interface IUserAccount {
    key: string;
    uid: any;
    created_at?: any;
    created_by?: any;
    date_key?: any;
    page_key?: any;
    keywords: any;
    status: any;
    //system fields
    companyData: any;
    school: any;
    schoolKey: any;
    campusKeys: any[];//allow multi campus
    campus: any;
    campusKey: any;
    apps: any[];
    appsObject: any[];
    memberOf: any;//administrator or not administrator object
    groupAccountKey: any[];//group account key
    groupAccounts: any[];//group account
    isAdmin: boolean;
    isBranchManager: any;
    role: any;
    employeeKey: any;
    //personal information
    displayName: any;
    email: any;
    first_name: any;
    last_name: any;
    full_name: any;
    name: any;
    shift: any;
    isCashier: any;
    total_read_testing?: any;//testing notification
}
