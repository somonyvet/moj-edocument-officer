// import * as admin from "firebase-admin";
// import { Change, EventContext } from "firebase-functions";
// import { createKey, pushToObject, toDateKey, toKhCalendar } from "../services/mapping";

// export function _onMissionNotification(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
//     const doc: any = change.after.data();
//     const { key, status, inspectionKey, leaderKey, name, provinceKey } = doc;
//     const db = admin.firestore();

//     const ref = db.collection("notifications");
//     const profileRef = db.collection("users").doc(leaderKey);
//     return db.runTransaction(async transaction => {
//         const profileDoc = await transaction.get(profileRef)
//         const profileData = pushToObject(profileDoc)
//         const body = `បេសកកម្ម ${name} ក្រោមការដឹកនាំលោក ${profileData?.fullName}`;

//         let title = ""
//         switch (status.key) {
//             case 1:
//                 title = "ចុះត្រួតពិនិត្យ"
//                 break;
//             case 3:
//                 title = "ត្រួតពិនិត្យរួចរាល់"
//                 break;
//             default:
//                 return;
//                 break;
//         }
//         const data = {
//             key: createKey("missions"),
//             create_date: new Date(),
//             create_date_key: toDateKey(new Date()),
//             inspectionKey,
//             missionKey: key,
//             provinceKey,
//             ref: key,
//             title: title,
//             body: body,
//             type: NOTIFICATION_TYPE.mission,
//             photo_url: profileData?.photoURL || null
//         }

//         if (status.key === 1 || status.key === 3) {
//             transaction.set(ref.doc(data.key), data);
//             await onNotification(data);
//         }
//         else return
//     });
// }

// export function _onBusinessNotification(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
//     const doc: any = change.after.data();
//     const { key, status, provinceData, missionKey } = doc;
//     const db = admin.firestore();
//     const inspectionKey = context.params.key

//     const ref = db.collection("notifications");
//     const profileRef = db.collection("business").doc(key);
//     return db.runTransaction(async transaction => {
//         const profileDoc = await transaction.get(profileRef)
//         const profileData = pushToObject(profileDoc)
//         const body = `សហគ្រាស ${profileData?.name}, ម្ចាស់សហគ្រាសឈ្មោះ ${profileData?.ownerData?.lastName} ${profileData?.ownerData?.firstName}
//                     លេខទំនាក់ទំនង ${profileData?.contactNumber}
//                     ទីតាំង ស្រុក-ខណ្ឌ ${profileData?.districtData?.name} រាជធានី-ខេត្ត ${profileData?.provinceData?.name}`;

//         let title = ""
//         switch (status.key) {
//             case 1:
//                 title = "ចាប់ផ្ដើមត្រួតពិនិត្យ"
//                 break;
//             case 3:
//                 title = "បញ្ចប់ការត្រួតពិនិត្យ"
//                 break;
//             default:
//                 break;
//         }
//         const data = {
//             key: createKey("business"),
//             create_date: new Date(),
//             create_date_key: toDateKey(new Date()),
//             inspectionKey,
//             missionKey: missionKey,
//             provinceKey: provinceData.key,
//             ref: key,
//             title: title,
//             body: body,
//             type: NOTIFICATION_TYPE.business,
//             photo_url: profileData?.photoFile?.downloadUrl || null
//         }
//         if (status.key === 1 || status.key === 3) {
//             transaction.set(ref.doc(data.key), data);
//             await onNotification(data);
//         }
//         else return
//     });
// }

// export function _onUnderTakingNotification(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
//     const doc: any = change.after.data();
//     const { key, status, provinceData, missionKey, businessKey, underTakingDocument, workerKey, receivedDate } = doc;
//     const db = admin.firestore();
//     const inspectionKey = context.params.key

//     const ref = db.collection("notifications");
//     const profileRef = db.collection("labors").doc(workerKey);
//     const businessRef = db.collection("business").doc(businessKey);
//     return db.runTransaction(async transaction => {
//         const profileDoc = await transaction.get(profileRef)
//         const profileData = pushToObject(profileDoc)

//         const businessDoc = await transaction.get(businessRef)
//         const businessData = pushToObject(businessDoc)

//         const receivedDateData = receivedDate ? `បានផ្ដល់ឯកសារនៅ ${toKhCalendar(receivedDate?.toDate())}` : "";
//         const body = `ពលករឈ្មោះ ${profileData?.full_name}, ភេទ ${profileData?.gender?.text}, សញ្ជាតិ ${profileData?.nationality?.nationality}, លេខលិខិតឆ្លងដែន ${profileData?.passportNumber}
//         សហគ្រាសឈ្មោះ ${businessData?.name} លេខទំនាក់ទំនង ${businessData?.contactNumber}
//         ទីតាំង ស្រុក-ខណ្ឌ ${businessData?.districtData?.name} រាជធានី-ខេត្ត ${businessData?.provinceData?.name}
//         កំណត់ចំណាំ: ${underTakingDocument} ${receivedDateData}`;

//         let title = ""
//         switch (status.key) {
//             case 1:
//                 title = "ពលករជាប់កិច្ចសន្យា"
//                 break;

//             case 3:
//                 title = "ពលករបានផ្ដល់ឯកសារ"
//                 break;

//             default:
//                 break;
//         }
//         const data = {
//             key: createKey("undertaking_signees"),
//             create_date: new Date(),
//             create_date_key: toDateKey(new Date()),
//             inspectionKey,
//             missionKey: missionKey,
//             provinceKey: provinceData.key,
//             ref: key,
//             title: title,
//             body: body,
//             type: NOTIFICATION_TYPE.under_taking,
//             photo_url: profileData?.photoFile?.downloadUrl || null
//         }
//         if (status.key === 1 || status.key === 3) {
//             transaction.set(ref.doc(data.key), data);
//             await onNotification(data);
//         }
//         else return
//     });
// }

// export async function onNotification(data: any) {
//     const { title, body, key, provinceKey } = data
//     const messageData = {
//         title,
//         body,
//         key,
//     }
//     const message: admin.messaging.Message = {
//         data: messageData,
//         notification: {
//             title: title,
//             body: body,
//         },
//         apns: {
//             payload: {
//                 aps: {
//                     mutableContent: true
//                 },
//                 fcmOptions: {
//                     // imageUrl: imageUrl,
//                 }
//             },
//         },
//         android: {
//             notification: {
//                 title: title,
//                 body: body,
//                 priority: 'high',
//                 sound: 'default',
//             },
//         },
//         condition: `'role_nation' in topics || '${provinceKey}' in topics`,
//     }

//     await admin.messaging().send(message)
//         .then(response => {
//             console.log("Successfully sent message", message.condition);
//         })
//         .catch(error => {
//             console.log("Error sending message", message.condition);
//         });
// }
