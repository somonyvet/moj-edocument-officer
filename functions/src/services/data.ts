
export const  months: any = {
  "01": { key: '01', name: "មករា", id: 1, },
  "02": { key: '02', name: "កុម្ភៈ", id: 2, },
  "03": { key: '03', name: "មីនា", id: 3, },
  "04": { key: '04', name: "មេសា", id: 4, },
  "05": { key: '05', name: "ឧសភា", id: 5, },
  "06": { key: '06', name: "មិថុនា", id: 6, },
  "07": { key: '07', name: "កក្កដា", id: 7, },
  "08": { key: '08', name: "សីហា", id: 8, },
  "09": { key: '09', name: "កញ្ញា", id: 9, },
  "10": { key: '10', name: "តុលា", id: 10, },
  "11": { key: '11', name: "វិច្ឆិកា", id: 11, },
  "12": { key: '12', name: "ធ្នូ", id: 12, },
}

export const docStatusObj = {
  hold: { key: 1, text: 'Hold', name: 'សេចក្តីព្រាង', color: '#f1c40f' },
  released: { key: 2, text: 'Released', name: 'ពិនិត្យឆ្លង', color: '#4bd964' },
  final: { key: 99, text: 'Final', name: 'បិទបញ្ចប់', color: '#027FFF' },
  void: { key: 98, text: 'Void', name: 'មោឃៈ', color: '#ff3a30' },
}


export const DOCUMENT_TYPE_OBJECT = {
  MEMO: { key: 1, name: 'កំណត់បង្ហាញ', name_en: 'Memo', route: 'read-only', color: '#ffcc02' },
  RECEIVED_MEMO: { key: 2, name: 'យោងឯកសារចូល', name_en: 'Received Memo', route: 'approve', color: '#4bd964' },
}
export const DOCUMENT_TYPE_OBJECT_ARRAY = Object.values(DOCUMENT_TYPE_OBJECT);


export const ACCOUNT_PERMISSION_OBJECT = {
  readOnly: { key: 1, name: 'បានតែមើលឯកសារ', name_en: 'Read Only', route: 'read-only', color: '#ffcc02' },
  canApproved: { key: 2, name: 'តម្រូវឲ្យចុះហត្ថលេខាឯកភាព', name_en: 'Approve', route: 'approve', color: '#4bd964' },
  canConfirm: { key: 3, name: 'ត្រួតពិនិត្យព័ត៌មានតែប៉ុណ្ណោះ', name_en: 'Confirm', route: 'confirm', color: '#007aff' },
}
export const ACCOUNT_PERMISSION_OBJECT_ARRAY = Object.values(ACCOUNT_PERMISSION_OBJECT);

export const DOC_CATEGORY_OBJ = {
  edoc: { key: 1, name: 'EDOC' },
  announcement: { key: 2, name: 'Announcement' },
  meeting: { key: 3, name: 'Meeting' },
}
export const DOC_CATEGORY_ARR=Object.values(DOC_CATEGORY_OBJ)

export const DOCUMENT_FLOW_CATEGORY = {
  normal: { key: 1, name: 'Normal' },
  digital: { key: 2, name: 'Digital' },
}

export const NOTIFICATION_TYPE_OBJ = {
  doc: { key: 101, name: 'Document' },
  inbox: { key: 102, name: 'Inbox' },
}

export const STATUS_OBJ = {
  DISABLED: { key: -2, text: 'Disabled' },
  DELETED: { key: -1, text: 'Deleted' },
  ACTIVE: { key: 1, text: 'Active' },
  PENDING: { key: 2, text: 'Pending' },
  COMPLETED: { key: 3, text: 'Completed' },
  SUBMITTED: { key: 4, text: 'Submitted' },


  DRAFT: {  key: 5, text: 'Draft', name: 'កំពុងព្រៀង', name_en: 'Draft' },
  APPLY: { key: 6, text: 'Apply', name: 'ដាក់ពាក្យស្នើសុំ', name_en: 'Apply' },
  CONFIRM_APPLICATION: { key: 6.1, text: 'Confirm', name: 'ព័ត៌មានត្រឹមត្រូវ', name_en: 'Confirm' },
  REVIEW: { key: 6.2, text: 'Review', name: 'ផ្ដល់ស្នាមម្រាមដៃនិងឯកសារ', name_en: 'Review' },

  PAID_UN_FILLED: { key: 6.3, text: 'Paid with Application', name: 'បានបង់ប្រាក់', name_en: 'Paid with Application' },
  PAID: { key: 7, text: 'Paid', name: 'បង់ប្រាក់រូច', name_en: 'Paid' },
  RECEIPT_APPLICATION: { key: 7.1, text: 'Receipt', name: 'ចេញបង្កាន់ដៃមកទទួលឯកសារ', name_en: 'Receipt' },
  DECREE: { key: 7.2, text: 'Decree', name: 'ផ្ដល់និទ្ទេស', name_en: 'Decree' },
  CLASSIFY: { key: 7.3, text: 'Classify', name: 'បញ្ជីលេខរៀង', name_en: 'Classify' },

  PROCESSING: { key: 8, text: 'Processing', name: 'កំពុងរៀបចំព្រឹត្តិបត្រ', name_en: 'Processing' },
  APPROVED: { key: 10, text: 'Approved', name: 'អនុម័ត', name_en: 'Approved' },
  RECEIVED: { key: 11, text: 'Received', name: 'អាចមកដកព្រឹត្តិបត្រ', name_end: 'Received' },
  DONE: { key: 12, text: 'Done', name: 'បិទបញ្ចប់', name_end: 'Done' },

  VOID: { key: 90, text: 'Void', name: 'មោឃៈ', name_en: 'Void' },
  EXPIRED: { key: 99, text: 'Expired', name: 'ផុតកំណត់', name_en: 'Expired' },
}

export const notificationType = {
  CHAT_ROOM: { key: 1, text: 'CHAT_ROOM' },
  DOC_NOTIFY: { key: 2, text: 'DOC_NOTIFY' },
  DOC_COMMENT: { key: 3, text: 'DOC_COMMENT' },
  HR: { key: 4, text: 'HR' },

  CRIMINAL: { key: 5, text: 'Criminal' },
  CRIMINAL_FOLDER: { key: 6, text: 'Criminal Folder' },
}

export const khmerMonthsArray = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា',
  'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']

export const ADJUSTMENT_TYPES = [
  { key: 1, IR: 'I', name: 'Opening Balance', factor: 1, short: 'OB' },
  { key: 2, IR: 'I', name: 'Increase Stock', short: 'ADJ+', factor: 1 },
  // { key: 3, IR: 'I', name: 'Transfer+', factor: 1 },
  { key: 4, IR: 'R', name: 'Reduce Stock', short: 'ADJ-', factor: -1 },
  // { key: 5, IR: 'R', name: 'Transfer-', factor: -1 },
  // { key: 6, IR: 'I', name: 'Bill', short: 'BILL', factor: 1 },
  { key: 6, IR: 'R', name: 'Sale', factor: -1 },
  { key: 7, IR: 'R', name: 'Void', factor: 1 },
]

export const ADJUSTMENT_TYPES_OBJ = {
  ob: { key: 1, IR: 'I', name: 'Opening Balance', factor: 1, short: 'OB' },
  adjI: { key: 2, IR: 'I', name: 'Increase Stock', short: 'ADJ+', factor: 1 },
  // { key: 3, IR: 'I', name: 'Transfer+', factor: 1 },
  adjR: { key: 4, IR: 'R', name: 'Reduce Stock', short: 'ADJ-', factor: -1 },
  // { key: 5, IR: 'R', name: 'Transfer-', factor: -1 },
  // { key: 6, IR: 'I', name: 'Bill', short: 'BILL', factor: 1 },
  sale: { key: 6, IR: 'R', name: 'Sale', factor: -1 },
  void: { key: 7, IR: 'I', name: 'Void', factor: 1 },
}

export const MOVEMENT_STATUS_OBJ = {
  HOLD: { key: 0, text: 'Hold' },
  RELEASED: { key: 1, text: 'Released' },
  VOID: { key: 2, text: 'Void' },
}
export const LINE_TYPE_OBJECT = {
  SPECIAL: { key: 0, name: 'Special' },
  ITEM: { key: 1, name: 'Item' },
}
export const ATTENDANCE_STATUS = {
  PRESENT: { key: 1, text: 'Present', text_kh: 'វត្តមាន', },
  PRESENT_COMELATE: { key: 12, text: 'Come_Late', text_kh: 'វត្តមាន(មកយឺត)' },
  PRESENT_LEAVEEARLY: { key: 13, text: 'Leave_Early', text_kh: 'វត្តមាន(ចេញមុន)' },
  PRESENT_LATE: { key: 14, text: 'Come_Late_Leave_Early', text_kh: 'វត្តមាន(មកយឺតហើយចេញមុន)' },

  ABSENT: { key: 2, text: 'Absent', text_kh: 'អវត្តមាន' },
  ABSENT_WITHOUTPERMISSION: { key: 21, text: 'Without_Permission', text_kh: 'អវត្តមាន(គ្មានច្បាប់)' },
  ABSENT_WITHPERMISSION: { key: 22, text: 'With_Permission', text_kh: 'អវត្តមាន(មានច្បាប់)' },
  ABSENT_ONMISSION: { key: 23, text: 'On_Mission', text_kh: 'អវត្តមាន(មានភារកិច្ច)' },
  ABSENT_PREGNENCYREST: { key: 24, text: 'Pregnency_Rest', text_kh: 'អវត្តមាន(សម្រាលកូន)' },
}

export const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];



export const driveObj = {
  folder: { key: 'folder', name: 'Folder' },
  file: { key: 'file', text: 'File' },
}

export const CRIMINAL_APPLICATION_LANGUAGE = {
  KHMER: { key: 1, name: 'ខ្មែរ', name_en: 'Khmer' },
  FRENCH: { key: 2, name: 'បារាំង', name_en: 'French' },
  ENGLISH: { key: 3, name: 'អង់គ្លេស', name_en: 'English' },
}

export const APPLICATION_TYPE_OBJ = {
  'application-no-i': { key: 1, text: 'ព្រឹត្តិបត្រថ្កោលទោស ១' },
  'application-no-ii': { key: 2, text: 'ព្រឹត្តិបត្រថ្កោលទោស ២' },
  'application-no-iii': { key: 3, text: 'ព្រឹត្តិបត្រថ្កោលទោស ៣' },
}

// one settings doc per letter type: `settings/letter1`, `settings/letter2` and `settings/letter3_business`
export const CRIMINAL_LETTER_SETTING = {
  letter1: { key: 'letter1', name: 'ព្រឹត្តិបត្រលេខ ១', application_type_key: 1 },
  letter2: { key: 'letter2', name: 'ព្រឹត្តិបត្រលេខ ២', application_type_key: 2 },
  letter3_business: { key: 'letter3_business', name: 'ព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច', application_type_key: 3 },
}

export const STATUS_LIVES = {
  LIVING: { key: 1, text: 'រស់' },
  DEAD: { key: 3, text: 'ស្លាប់' },
}

export const GENDER_DATA = [
  { key: 1, name: 'ប្រុស', name_en: 'Male', name_fr: 'Masculin' },
  { key: 0, name: 'ស្រី', name_en: 'Female', name_fr: 'féminin' },
]

export const MONTH_OF_YEAR = [
  { key: '01', name: 'មករា', name_en: 'January', name_fr: 'Janvier' },
  { key: '02', name: 'កុម្ភៈ', name_en: 'February', name_fr: 'Février' },
  { key: '03', name: 'មីនា', name_en: 'March', name_fr: 'Mars' },
  { key: '04', name: 'មេសា', name_en: 'April', name_fr: 'Avril' },
  { key: '05', name: 'ឧសភា', name_en: 'May', name_fr: 'Mai' },
  { key: '06', name: 'មិថុនា', name_en: 'June', name_fr: 'Juin' },
  { key: '07', name: 'កក្កដា', name_en: 'July', name_fr: 'Juillet' },
  { key: '08', name: 'សីហា', name_en: 'August', name_fr: 'Août' },
  { key: '09', name: 'កញ្ញា', name_en: 'September', name_fr: 'Septembre' },
  { key: '10', name: 'តុលា', name_en: 'October', name_fr: 'Octobre' },
  { key: '11', name: 'វិច្ឆិកា', name_en: 'November', name_fr: 'Novembre' },
  { key: '12', name: 'ធ្នូ', name_en: 'December', name_fr: 'Décembre' },
]
