import { APPS, WORKPLACE_GEO_MAP_LOCATION } from '../dummy/config';
import { Injectable } from "@angular/core";
import { action, observable } from "mobx";
import { Subscription } from "rxjs";
import { ATTENDANCE_STATUS, WEEKDAY } from "src/app/dummy/status";
import { IAttendance, IWorkingHour, IWorkingShift, IAttendanceCheckIn, IAttendanceStatus } from "src/app/interfaces/attendance";
import { ConvertService, dateTimeToSeconds, pushToArray, pushToObject } from "src/app/shared/services/convert.service";
import { DatabaseService } from "src/app/shared/services/database.service";
import { AuthStore } from "src/app/stores/auth.store";
import { OfficerStore } from "src/app/stores/document/officer.store";
import firebase from 'firebase/compat/app';

@Injectable({ providedIn: 'root' })
export class AttendanceStore {
    @observable lat = 0;
    @observable lng = 0;
    @observable data: IAttendance[] = [];

    @observable attendance: IAttendance;
    @observable attendanceRef: firebase.firestore.DocumentReference;

    @observable fetchCheckInRef: Subscription = null;
    @observable fetchDataRef: Subscription = null;

    @observable toggleMainL: boolean = false;

    @observable empty: boolean = false;
    @observable loading: boolean = false;
    @observable done: boolean = false;
    @observable fetching: boolean = false;
    @observable process: boolean = false;
    @observable searching: boolean = false;

    @observable lastVisible: IAttendance;
    @observable fetchingAttendances: boolean = false;
    @observable emptyAttendances: boolean = false;

    constructor(
        private ds: DatabaseService,
        private auth: AuthStore,
        private officerStore: OfficerStore,
    ) {
    }

    @action
    async unsubscribe(): Promise<void> {
        this.fetchCheckInRef?.unsubscribe();
        this.fetchDataRef?.unsubscribe();
        this.attendance = null;
        this.attendanceRef = null;
    }

    @action
    async fetchAttendances() {
        try {
            this.fetchingAttendances = true;
            this.fetchDataRef =
                this.ds
                    .officerAttendanceListRef(this.auth.User.key)
                    .valueChanges()
                    .subscribe((docs) => {
                        this.data = docs.map((f, index) => ({
                            ...f,
                            rowIndex: index + 1,
                        }));
                        if (docs?.length >= APPS.size) {
                            this.lastVisible = this.data[this.data.length - 1];
                        } else {
                            this.lastVisible = null;
                        }

                        this.emptyAttendances = this.data?.length === 0;
                        this.fetchingAttendances = false;
                    });
        } catch (err) {
            console.log(err);
            console.log('failed to fetch attendances');
            this.fetchingAttendances = false;
        }
    }

    @action
    async fetchMoreAttendances() {
        try {
            if (!this.lastVisible) return;
            this.fetchDataRef?.unsubscribe();
            this.fetchingAttendances = true;
            this.fetchDataRef = this.ds
                .officerAttendanceListRef(this.auth.User.key, this.lastVisible).valueChanges().subscribe(docs => {
                    const lastIndex = this.lastVisible['rowIndex'];
                    const items = docs.map((f, index) => ({
                        ...f,
                        rowIndex: index + 1 + lastIndex,
                    }));
                    this.data = this.data.concat(items);
                    if (docs?.length >= APPS.size) {
                        this.lastVisible = this.data[this.data.length - 1];
                    } else {
                        this.lastVisible = null;
                    }
                    this.fetchingAttendances = false;
                })
        } catch (err) {
            console.log(err);
            console.log('failed to fetch more attendances');
            this.fetchingAttendances = false;
        }
    }

    @action
    async fetchCheckIns() {
        try {
            this.loading = true;
            let today = new Date();
            let dateKey = ConvertService.toDateKey(today);

            this.fetchCheckInRef =
                this.ds.officerAttendancesRef(this.auth.User.key)
                    .doc(dateKey.toString())
                    .snapshotChanges().subscribe((att) => {
                        this.attendanceRef = (att.payload as any).ref;
                        this.attendance = pushToObject(att.payload);
                    })

        } catch (err) {
            console.log(err);
            console.log('failed to fetch check in');
            this.loading = false;
        }
    }

    @action
    async officerCheckIn(callback: (status: boolean, error: string) => void) {
        try {
            this.loading = true;
            let officer = this.officerStore.currentData;

            let presentTime = new Date();
            let presentTimeSecond = dateTimeToSeconds(presentTime);
            let weekDay = WEEKDAY[presentTime.getDay()];
            let dateKeyNum = ConvertService.toDateKey(presentTime);
            let dateKeyStr = dateKeyNum.toString();

            let workingHour: IWorkingHour;
            let workingShift: IWorkingShift;
            let isLate = false;

            let distance = getDistanceFromLatLonInKm(WORKPLACE_GEO_MAP_LOCATION.lat, WORKPLACE_GEO_MAP_LOCATION.lng, this.lat, this.lng);

            if (!this.lat && !this.lng) {
                this.loading = false;
                callback(false, "សូមមេត្តាបើកបង្ហាញទីតាំងរបស់អ្នកជាមុនសិន។");
                return;
            }

            // get workinghour
            if (distance < 0.5) {
                workingHour = pushToObject(
                    await this.ds.workingHoursRef((ref) => ref
                        .where('status.key', '==', 1)
                        .where('isDeleted', '==', false)
                        .where('workingDayObj.' + weekDay, '==', true)
                    )
                        .doc(officer?.workingHourKey).get().toPromise());
                if (!workingHour) {
                    this.loading = false;
                    callback(false, "មន្ត្រីពុំទាន់មានម៉ោងធ្វើការទេ។");
                    return;
                }
            } else {
                this.loading = false;
                callback(false, "សូមអភ័យទោស អ្នកត្រូវតែនៅកន្លែងធ្វើការដើម្បីធ្វើប្រតិបត្តិការនេះ។");
                return;
            }

            // check working shift
            for (let index = 0; index < workingHour.workingShiftArr.length; index++) {
                let shift = workingHour.workingShiftArr[index];

                let _beforeStartTimeSecond = shift.startTime + workingHour.durationMinuteBeforeStartTime * 60;
                let _afterStartTimeSecond = shift.startTime + workingHour.durationMinuteAfterStartTime * 60;

                if (presentTimeSecond >= _beforeStartTimeSecond && presentTimeSecond <= shift.endTime) {
                    workingShift = shift;
                    if (presentTimeSecond > _afterStartTimeSecond) {
                        isLate = true;
                        break;
                    }
                }
            }

            if (!workingShift) {
                this.loading = false;
                callback(false, "លោកអ្នកពុំមានវេណទេក្នុងពេលនេះ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។");
            } else {
                // check if there is any checkedIns that haven't checkout
                let checkInsAttSnap = await this.ds.officerAttendanceCICOsRef(this.auth.uid,
                    dateKeyStr, (ref) => ref
                        .where('isDeleted', '==', false)
                        .where('workingShift.name.key', '==', workingShift.name.key)
                )
                    .get().toPromise();

                let checkedInAttendances: IAttendanceCheckIn[] = pushToArray(checkInsAttSnap);
                let uncheckedOutAtt = checkedInAttendances.find(({ checkedOutTime }) => !checkedOutTime);

                let isFirstCheckIn = checkedInAttendances.length === 0;

                if (uncheckedOutAtt) {
                    this.loading = false;
                    callback(false, "សូមអធ្យាស្រ័យ ម៉ោងធ្វើការត្រូវបានចាប់ផ្ដើមម្ដងរួចហើយ\nសូមមេត្តាបិទបញ្ចប់ម៉ោងធ្វើការរបស់អ្នកជាមុនសិន សូមអរគុណ។");
                }
                else {
                    // valid to checkin
                    let checkedInStatus: IAttendanceStatus = isLate
                        ? ATTENDANCE_STATUS.PRESENT_COMELATE
                        : ATTENDANCE_STATUS.PRESENT;

                    let checkedInObj: IAttendanceCheckIn = {
                        key: this.ds.createId(),
                        isDeleted: false,
                        createdBy: this.auth.User,
                        createdAt: presentTime,
                        checkedInTime: presentTimeSecond,
                        checkedOutTime: null,
                        workingShift,
                        checkedInStatus,
                        totalWorkingHour: 0,
                    };

                    let officerAttObj: Partial<IAttendance> = {
                        isCheckedIn: true,
                        updatedBy: this.auth.User,
                        updatedAt: presentTime,
                    };

                    if (isFirstCheckIn) {
                        officerAttObj.shiftStatusArr = [{
                            workingShift,
                            checkedInStatus,
                        }];

                        officerAttObj.dayStatus = checkedInStatus;
                    }

                    let setCICOsRef = this.ds.officerAttendanceCICOsRef(
                        this.auth.uid,
                        dateKeyStr
                    )
                        .doc(checkedInObj.key)
                        .set(checkedInObj);

                    let setAttRef = this.attendanceRef
                        .set(officerAttObj, { merge: true, });

                    await Promise.all([
                        setCICOsRef,
                        setAttRef,
                    ]);

                    this.loading = false;
                    callback(true, null);
                }
            }
        } catch (err) {
            console.log(err);
            console.log('failed to check in');
            this.loading = false;
        }
    }

    @action
    async officerCheckOut(callback: (status: boolean, error: string) => void) {
        try {
            this.loading = true;

            let presentTime = new Date();
            let dateKeyNum = ConvertService.toDateKey(presentTime);
            let dateKeyStr = dateKeyNum.toString();


            if (!this.attendance.isCheckedIn) {
                this.loading = false;
                callback(false, 'អ្នកមិនទាន់បានដាក់ចាប់ផ្ដើមម៉ោងធ្វើការទេ\nសូមមេត្តាដាក់ចាប់ផ្ដើមម៉ោងធ្វើការរបស់អ្នកជាមុនសិន\nទើបអ្នកអាចបញ្ចប់ម៉ោងធ្វើការរបស់អ្នកបាន\nសូមអធ្យាស្រ័យ។');
            } else {
                let checkInsAttArrSnap = await this.ds.officerAttendanceCICOsRef(this.auth.uid,
                    dateKeyStr, (ref) => ref
                        .where('isDeleted', '==', false)
                        .where('checkedOutTime', '==', null)
                        .limit(1)
                )
                    .get().toPromise();
                let resultArr: IAttendanceCheckIn[] = pushToArray(checkInsAttArrSnap);
                let attendanceCheckIn = resultArr[0];

                let checkedOutTime = dateTimeToSeconds(presentTime);

                let totalWorkingHour = checkedOutTime > attendanceCheckIn.workingShift.endTime ? (attendanceCheckIn.workingShift.endTime - attendanceCheckIn.checkedInTime) : (checkedOutTime - attendanceCheckIn.checkedInTime);

                let _favorEndTime = attendanceCheckIn.workingShift.endTime + this.attendance.durationMinuteBeforeEndTime * 60;
                let checkedOutStatus = checkedOutTime > _favorEndTime ? ATTENDANCE_STATUS.PRESENT : ATTENDANCE_STATUS.PRESENT_LEAVEEARLY;

                // attendance
                let attTotalWorkingHour = this.attendance.totalWorkingHour + totalWorkingHour;
                let attDayStatus = this.attendance.dayStatus;
                let attShiftStatusArr = this.attendance.shiftStatusArr;

                if (attDayStatus?.key === ATTENDANCE_STATUS.PRESENT_COMELATE.key && checkedOutStatus.key === ATTENDANCE_STATUS.PRESENT_LEAVEEARLY.key) {
                    attDayStatus = ATTENDANCE_STATUS.PRESENT_LATE;
                }

                let checkedOutShiftIndex = attShiftStatusArr.findIndex(({ workingShift }) => workingShift.name.key === attendanceCheckIn.workingShift.name.key);
                if (checkedOutShiftIndex !== -1) {
                    attShiftStatusArr[checkedOutShiftIndex].checkedOutStatus = checkedOutStatus;
                }

                let checkOutRef = this.ds.officerAttendanceCICOsRef(this.auth.uid, dateKeyStr)
                    .doc(attendanceCheckIn.key)
                    .update({
                        checkedOutTime,
                        totalWorkingHour,
                        checkedOutStatus,
                        updatedAt: presentTime,
                        updatedBy: this.auth.User,
                    });

                let updateFields: Partial<IAttendance> = {
                    updatedBy: this.auth.User,
                    updatedAt: presentTime,
                    isCheckedIn: false,
                    totalWorkingHour: attTotalWorkingHour,
                    dayStatus: attDayStatus,
                    shiftStatusArr: attShiftStatusArr,
                };

                await Promise.all([checkOutRef, this.attendanceRef.update(updateFields)]);

                this.loading = false;
                callback(true, null);
            }
        } catch (err) {
            console.log(err);
            console.log('failed to check out');
            this.loading = false;
        }
    }

    @action
    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                if (position) {
                    console.log("Latitude: " + position.coords.latitude +
                        "Longitude: " + position.coords.longitude);
                    this.lat = position.coords.latitude;
                    this.lng = position.coords.longitude;
                }
            },
                (error) => console.log('geolocation error:', error));
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

}

export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180)
    }
}
