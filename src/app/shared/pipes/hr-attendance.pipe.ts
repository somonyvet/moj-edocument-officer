import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { IAttendance } from './../../interfaces/attendance';
import { Pipe, PipeTransform } from '@angular/core';
import { ATTENDANCE_STATUS } from 'src/app/dummy/status';
import { toLatinNumber, toLocaleNumber } from '../services/convert.service';
import { toNumber } from '../services/mapping.service';

@Pipe({
    name: 'totalPresent'
})
export class TotalPresentPipe implements PipeTransform {
    transform(attendanceArr: IAttendance[]): any {
        let totalPresentCount = 0;
        attendanceArr.forEach((attendance) => {
            if (attendance.dayStatus.key === ATTENDANCE_STATUS.PRESENT.key
                || attendance.dayStatus.key === ATTENDANCE_STATUS.PRESENT_COMELATE.key
                || attendance.dayStatus.key === ATTENDANCE_STATUS.PRESENT_LEAVEEARLY.key
                || attendance.dayStatus.key === ATTENDANCE_STATUS.PRESENT_LATE.key) {
                totalPresentCount += 1;
            }
        })
        return toLocaleNumber(totalPresentCount);
    }

}

@Pipe({
    name: 'totalAbsent'
})
export class TotalAbsentPipe implements PipeTransform {
    transform(attendanceArr: IAttendance[]): any {
        let totalAbsentCount = 0;
        attendanceArr.forEach((attendance) => {
            if (attendance.dayStatus.key === ATTENDANCE_STATUS.ABSENT.key
                || attendance.dayStatus.key === ATTENDANCE_STATUS.ABSENT_ONMISSION.key
                || attendance.dayStatus.key === ATTENDANCE_STATUS.ABSENT_PREGNENCYREST.key
                || attendance.dayStatus.key === ATTENDANCE_STATUS.ABSENT_WITHPERMISSION.key
                || attendance.dayStatus.key === ATTENDANCE_STATUS.ABSENT_WITHOUTPERMISSION.key
            ) {
                totalAbsentCount += 1;
            }
        })
        return toLocaleNumber(totalAbsentCount);
    }

}

@Pipe({
    name: 'displayAttendance'
})
export class DisplayAttendancePipe implements PipeTransform {
    transform(attendanceArr: IAttendance[], day: number): any {
        let isPresent = false;
        attendanceArr.forEach((attendance) => {
            let dateKey = attendance.key;
            let _day = parseInt(dateKey.substring(6, 8));
            if (_day === day) {
                isPresent = true;
            }
        });
        return isPresent;
    }
}

