import * as fn from 'firebase-functions';
import * as admin from "firebase-admin";
const functions = fn.region('asia-east2')  // asia for school link only
admin.initializeApp();
const fdb = admin.firestore();
fdb.settings({ timestampsInSnapshots: true });

import { _onCreateUserAccount, _onResetCreateUserAccount, } from './officer/user';
import { _onWriteOfficeMember, _onWriteOfficer } from './officer/officer.module';
import { addBlockNoteReceiveWorkPlaceFN, documents_reply_reportsRef, onWriteMovementHeaderDocumentRef, _onDepartmentDocumentMovementNotifyToAdminOffice, _onDocumentStatusChanged } from './document/document.module';
import { _onDocumentCommentStatisticChanged, _onDocumentViewStatisticChanged } from './document/view.module';
import { _onCommentCriminalRecordRef, _onCriminalRecordApplyByCitizenRef, _onCriminalRecordMovementRef } from './criminal/criminal.module';
import { _onCriminalRecordFinalApprovalRef } from './criminal/criminal-approval.module';
import { _onCallSetVerifyExpireRef, _onCallVerifyDocumentStatusRef } from './criminal/criminal-verify-expire.module';
import { WEEKDAY, ATTENDANCE_STATUS } from './services/data';
import { toDateKey, pushToArray, pushToObject } from './services/mapping';

//==============================================================Criminal Record Latter
export const onCommentCriminalRecord = functions.firestore
  .document("documents_header/{criminalRecordKey}/documentCommentsPublic/{key}")
  .onWrite((event, context) => {
    return _onCommentCriminalRecordRef(event, context);
  });

export const onCriminalRecordMovement = functions.firestore
  .document("criminal_record_movements/{key}")
  .onWrite((event, context) => {
    return _onCriminalRecordMovementRef(event, context);
  });

export const onCriminalRecordApplyByCitizen = functions.firestore
.document("criminal_record/{key}")
.onWrite((event, context) => {
  return _onCriminalRecordApplyByCitizenRef(event, context);
});

// issues the bulletin at the verify system inline: three OA calls per language, so it needs more
// than the 60s default
export const onCriminalRecordFinalApproval = functions
.runWith({ timeoutSeconds: 300, memory: '512MB' })
.firestore
.document("criminal_record/{key}")
.onWrite((event, context) => {
  return _onCriminalRecordFinalApprovalRef(event, context);
});

// debug: what the verify system knows about the documents of one record, next to what we recorded
export const onCallVerifyDocumentStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new fn.https.HttpsError('unauthenticated', 'not auth');
  if (!data?.header_key && !data?.document_id) throw new fn.https.HttpsError('invalid-argument', 'invalid request');
  return _onCallVerifyDocumentStatusRef(data);
});

// debug: post the expiry date of one record's documents to the verify system now
export const onCallSetVerifyExpire = functions
.runWith({ timeoutSeconds: 300 })
.https.onCall(async (data, context) => {
  if (!context.auth) throw new fn.https.HttpsError('unauthenticated', 'not auth');
  if (!data?.header_key && !data?.document_id) throw new fn.https.HttpsError('invalid-argument', 'invalid request');
  return _onCallSetVerifyExpireRef(data);
});

//==============================================================Document Process
export const onWriteMovementHeaderDocument = functions.firestore
  .document("documents_header_movement/{key}")
  .onWrite((event, context) => {
    return onWriteMovementHeaderDocumentRef(event, context);
  });

export const departmentDocumentMovementNotifyToAdminOffice = functions.firestore
  .document("department_document_movement/{key}")
  .onWrite((event, context) => {
    return _onDepartmentDocumentMovementNotifyToAdminOffice(event, context);
  });

export const addBlockNoteReceiveWorkPlace = functions.firestore
  .document("documents_header/{key}/block_notes/{id}")
  .onWrite((event, context) => {
    return addBlockNoteReceiveWorkPlaceFN(event, context);
  });

export const documentReportMovement = functions.firestore
  .document("documents_reply_reports/{key}")
  .onWrite((event, context) => {
    return documents_reply_reportsRef(event, context);
  });

export const documentStatusChanged = functions.firestore
  .document("documents_header/{key}")
  .onWrite((event, context) => {
    return _onDocumentStatusChanged(event, context);
  });
//============statistic document
export const documentViewStatisticChanged = functions.firestore
  .document("documents_header/{headerKey}/viewers/{key}")
  .onWrite((event, context) => {
    return _onDocumentViewStatisticChanged(event, context);
  });
export const documentCommentStatisticChanged = functions.firestore
  .document("documents_header/{headerKey}/documentComments/{key}")
  .onWrite((event, context) => {
    return _onDocumentCommentStatisticChanged(event, context);
  });
//==============================================================End Document Process
export const createUserAccount = functions.firestore
  .document("users/{key}")
  .onWrite((event, context) => {
    return _onCreateUserAccount(event, context);
  });

export const resetUserAccount = functions.firestore
  .document("users/{key}")
  .onWrite((event, context) => {
    return _onResetCreateUserAccount(event, context);
  });

export const writeOfficerProfile = functions.firestore
  .document("officers/{key}")
  .onWrite((event, context) => {
    return _onWriteOfficer(event, context);
  });

export const writeDepartmentOfficerMember = functions.firestore
  .document("department/{departmentKey}/department_members/{key}")
  .onWrite((event, context) => {
    return _onWriteOfficeMember(event, context);
  });

export const createOfficerAttendanceOnInterval = functions
  .pubsub.schedule('0 0 * * *')
  // .pubsub.schedule('* * * * *')
  .timeZone('Asia/Phnom_Penh')
  .onRun(async (context): Promise<void> => {
    try {
      const db = admin.firestore();

      let today = new Date();
      today = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));

      let dateKey = toDateKey(today);
      let weekDay = WEEKDAY[today.getDay()];

      let officersRef = db
        .collection('officers')
        .select(
          'key',
          'title',
          'displayName', //displayName = title[0]['name'] +...+ displayName
          'officerId',
          'phoneNumber',
          'workingHourKey',
          'photo',// photoUrl = photo.downloadUrl
        )
        .where('isDelete', '==', false)
        .where('key', '==', 'Z81BAdfE0fxx37KJYARk');

      let workingHourRef = db.
        collection('working_hours')
        .select(
          'key',
          'workingShiftArr',
          'missingCheckoutStatus',
          'durationMinuteBeforeStartTime',
          'durationMinuteBeforeEndTime',
          'durationMinuteAfterStartTime',
        )
        .where('status.key', '==', 1)
        .where('isDeleted', '==', false)
        .where('workingDayObj.' + weekDay, '==', true);

      return db.runTransaction(async transaction => {
        let workingHours = pushToArray(await transaction.get(workingHourRef));
        // if there is any workinghour for today
        if (workingHours.length !== 0) {
          let officers = pushToArray(await transaction.get(officersRef));

          for (let index = 0; index < officers.length; index++) {
            const _officer = officers[index];
            if (_officer.workingHourKey) {

              let workingHour = workingHours.find(({ key }) => key === _officer.workingHourKey);

              // if officer has workinghour
              if (workingHour) {
                let displayName = _officer.displayName;
                let title = '';
                _officer.title?.forEach((value: any) => {
                  title = title + value['name'] + ' ';
                });
                displayName = title + displayName;
                let photoUrl = _officer.photo?.downloadUrl;
                // ================
                let officer = {
                  displayName,
                  photoUrl,
                  key: _officer.key,
                  officerId: _officer.officerId,
                  phoneNumber: _officer.phoneNumber,
                };
                // ==================
                let dayStatus = ATTENDANCE_STATUS.ABSENT_WITHOUTPERMISSION;
                let totalWorkingHour = 0;
                let officerAttPath = 'officers/' + _officer.key + '/officer-attendances/' + dateKey;
                let ytdOfficerAttPath = 'officers/' + _officer.key + '/officer-attendances/' + (dateKey - 1);

                delete workingHour['key'];
                delete workingHour['id'];


                // don't for get to add selected field
                let uncheckedOutAttArr = await transaction
                  .get(db
                    .collection(ytdOfficerAttPath + '/officer-attendance-cicos')
                    .where('checkedOutTime', '==', null)
                    .where('isDeleted', '==', false)
                  );

                if (uncheckedOutAttArr.size !== 0) {
                  let attSnap = await transaction.get(db.doc(ytdOfficerAttPath));

                  let attDoc = pushToObject(attSnap);
                  // =======================================================
                  // need to verify later (status of uncheckedout attendance)
                  // =======================================================
                  for (let index = 0; index < uncheckedOutAttArr.size; index++) {
                    const uncheckedOutAtt = uncheckedOutAttArr.docs[index];
                    let data = uncheckedOutAtt.data();
                    let missingCheckoutStatus = attDoc.missingCheckoutStatus;

                    // ==========================
                    let _totalWorkingHour = data.workingShift.endTime - data.checkedInTime;
                    let attDayStatus = attDoc.dayStatus;
                    let attShiftStatusArr = attDoc.shiftStatusArr;

                    if (attDayStatus?.key === ATTENDANCE_STATUS.PRESENT_COMELATE.key && missingCheckoutStatus.key === ATTENDANCE_STATUS.PRESENT_LEAVEEARLY.key) {
                      attDayStatus = ATTENDANCE_STATUS.PRESENT_LATE;
                    }

                    let attOfficer: any = {
                      totalWorkingHour: attDoc.totalWorkingHour + _totalWorkingHour,
                      isCheckedIn: false,
                      updatedAt: today,
                      updatedBy: 'cloudFunction',
                      dayStatus: attDayStatus,
                    };

                    let checkedOutShiftIndex = attShiftStatusArr?.findIndex(({ workingShift }: { workingShift: any }) => workingShift.name.key === data.workingShift.name.key);

                    if (checkedOutShiftIndex !== -1 && checkedOutShiftIndex !== undefined) {
                      attShiftStatusArr[checkedOutShiftIndex].checkedOutStatus = missingCheckoutStatus;
                    }

                    if (attShiftStatusArr) {
                      attOfficer.shiftStatusArr = attShiftStatusArr;
                    }

                    // ==========================

                    transaction.update(uncheckedOutAtt.ref, {
                      checkedOutTime: data.workingShift.endTime,
                      totalWorkingHour: _totalWorkingHour,
                      checkedOutStatus: missingCheckoutStatus,
                      updatedAt: today,
                      updatedBy: 'cloudFunction',
                    });

                    transaction.update(db.doc(ytdOfficerAttPath), attOfficer);
                  }
                }

                transaction
                  .set(
                    db.doc(officerAttPath),
                    {
                      key: dateKey.toString(),
                      officer,
                      dayStatus,
                      totalWorkingHour,
                      isCheckedIn: false,
                      isDeleted: false,
                      createdAt: today,
                      createdBy: 'cloudFunction',
                      ...workingHour,
                    },
                  );
              }
            }
          }
        }
      });
    } catch (err) {
      console.log('Something went wrong! ==> ', err);
    }
  });

export const subscribeToTopic = functions
.runWith({ memory: '256MB', timeoutSeconds: 300 })
.https.onCall(async (data, context) => {
  const res = await admin.messaging().subscribeToTopic(data.token, data.topic);
  console.log(res)
  return `subscribe to topic ${data.topic}`;
});
export const unsubscribeToTopic = functions
  .runWith({ memory: '256MB', timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    await admin.messaging().unsubscribeFromTopic(data.token, data.topic);
    return `unsubscribe to topic ${data.topic}`;
  });
