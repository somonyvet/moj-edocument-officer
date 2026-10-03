
export interface IWorkingHour {
    key?: string;
    name?: string;
    workingShiftArr?: IWorkingShift[];
    workingDayObj?: IWeekDay;
    startTime?: number;
    endTime?: number;

    durationMinuteBeforeStartTime?: number;
    durationMinuteAfterStartTime?: number;
    durationMinuteBeforeEndTime?: number;
    missingCheckoutStatus?: any;

    keyword?: string[];
    status?: any;
    isDeleted?: boolean;
    createdBy?: any;
    createdAt?: Date;
    updatedBy?: any;
    updatedAt?: Date;
    deletedBy?: any;
    deletedAt?: Date;
}

export interface FileInfo {
    key: string;
    file: FileDetailInfo;
    docType: any
}

export interface FileDetailInfo {
    downloadUrl: string,
    fileSize: string,
    fileType: string,
    filename: string,
    key: string,
    name: string,
    type: string,
}

export interface IWeekDay {
    Monday: boolean,
    Tuesday: boolean,
    Wednesday: boolean,
    Thursday: boolean,
    Friday: boolean,
    Saturday: boolean,
    Sunday: boolean,
};

export interface IWorkingShift {
    name: { key: number, text: string };
    startTime: number;
    endTime: number;
}

export interface IAttendance {
    key?: string;
    isDeleted?: boolean;
    createdBy?: any;
    createdAt?: Date;
    updatedBy?: any;
    updatedAt?: Date;
    deletedBy?: any;
    deletedAt?: Date;

    officer?: any;
    totalWorkingHour?: number;
    dayStatus?: IAttendanceStatus;
    shiftStatusArr?: IAttendanceShiftStatus[];

    durationMinuteBeforeStartTime?: number;
    durationMinuteAfterStartTime?: number;
    durationMinuteBeforeEndTime?: number;
    missingCheckoutStatus?: any;
    workingShiftArr?: IWorkingShift[];

    isCheckedIn?: boolean;
}


export interface IAttendanceShiftStatus {
    workingShift?: IWorkingShift;
    checkedInStatus?: IAttendanceStatus;
    checkedOutStatus?: IAttendanceStatus;
}

export interface IAttendanceStatus {
    key: number,
    text: string,
    text_kh: string,
}

export interface IAttendanceCheckIn {
    key?: string;
    isDeleted?: boolean;
    createdBy?: any;
    createdAt?: Date;
    updatedBy?: any;
    updatedAt?: Date;
    deletedBy?: any;
    deletedAt?: Date;

    checkedInTime?: number;
    checkedOutTime?: number;

    totalWorkingHour?: number;
    workingShift?: IWorkingShift;

    checkedInStatus?: IAttendanceStatus;
    checkedOutStatus?: IAttendanceStatus;
}

export interface IHoliday {
    key?: string;
    isDeleted?: boolean;
    createdBy?: any;
    createdAt?: Date;
    updatedBy?: any;
    updatedAt?: Date;
    deletedBy?: any;
    deletedAt?: Date;
    keyword?: any;
    nameKh?: string;
    nameEng?: string;
    startDate?: Date | firebase.default.firestore.Timestamp;
    endDate?: Date | firebase.default.firestore.Timestamp;
    duration?: number;
}

export interface ILeaveRequest {
    key?: string;
    isDeleted?: boolean;
    createdBy?: any;
    createdAt?: Date;
    updatedBy?: any;
    updatedAt?: Date;
    deletedBy?: any;
    deletedAt?: Date;
    keyword?: any;

    officerKeys?: string[];
    status?: any;
    duration?: number;
    description?: string;
    startDate?: Date | firebase.default.firestore.Timestamp;
    endDate?: Date | firebase.default.firestore.Timestamp;
    type?: ILeaveRequestType;
}

export interface ILeaveRequestType {
    key: number,
    text: string,
    text_kh: string,
}