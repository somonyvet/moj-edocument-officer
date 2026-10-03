export const DOC_CATEGORY_ARRAY = [
  { key: 1, name: 'EDOC' },
  { key: 2, name: 'Announcement' },
  { key: 3, name: 'Meeting' },
]

export const DOC_CATEGORY_OBJ = {
  edoc: { key: 1, name: 'EDOC' },
  announcement: { key: 2, name: 'Announcement' },
  meeting: { key: 3, name: 'Meeting' },
}

export const DOC_CUSTOM_STYLE_OBJ = {
  spacing: { key: 1, name: 'Spacing', code: 'letter-spacing', },
  position: { key: 2, name: 'Position', code: 'line-height', },
}

export const VISA_SETTING = [
  { key: 1, name: 'ប្រភេទទិដ្ឋាការបង់អាករ' },
  { key: 2, name: 'ប្រភេទទិដ្ឋាការមិនបង់អាករ', },
]

export const DOC_SPACING_ARRAY = [
  { key: 1, name: 'Normal', factor: 0, ref: 1 },
  { key: 2, name: 'Expanded', factor: 1, ref: 1 },
  { key: 3, name: 'Condensed', factor: -1, ref: 1 },
]

export const DOC_POSITION_ARRAY = [
  { key: 1, name: 'Normal', factor: 0, ref: 2 },
  { key: 2, name: 'Raised', factor: 1, ref: 2 },
  { key: 3, name: 'Lowered', factor: -1, ref: 2 },
]

export const REGISTER_ITEM_STATUS = [
  { key: "draft", text: 'Draft', order: 1 },
  { key: "submitted", text: 'Submitted', order: 2 },
  { key: "deleted", text: 'Deleted', order: 3 },
]

export const GENDER_OPTIONS = [
  { key: 1, text: 'ប្រុស', en_name: 'Male' },
  { key: 0, text: 'ស្រី', en_name: 'Female' },
]

export const REGISTER_ITEM_STATUS_OBJ = {
  draft: { key: "draft", text: 'Draft', order: 1 },
  submitted: { key: "submitted", text: 'Submitted', order: 2 },
  deleted: { key: "deleted", text: 'Deleted', order: 3 },
  cancelDraft: { key: "cancel_draft", text: 'Cancel Draft', order: 4 },
  cancelSubmit: { key: "canceled", text: 'Cancel Submit', order: 4 },
  void: { key: "void", text: 'Void', order: 5 },
}


export const transactionStatusObj = {
  hold: { key: 1, text: 'Hold' },
  release: { key: 2, text: 'Released' },
  reject: { key: 3, text: 'Rejected' },
}

export const transactionStatus = [
  { key: 1, text: 'Hold', route: 'hold' },
  { key: 2, text: 'Released', route: 'released' },
  { key: 3, text: 'Rejected', route: 'rejected' },
]

export const importStockOption = [
  { key: 1, text: 'Detail Items' },
  { key: 2, text: 'Detail Materials' },
]

export const cutStockOption = [
  { key: 1, text: 'Inspection' },
  { key: 2, text: 'Cut Stock' },
]

export const reApplyOption = [
  { key: 1, text: 'Re-Apply GSP N' },
  { key: 2, text: 'Re-Apply GSP AB' },
  { key: 3, text: 'Re-Apply Asean A' },
  { key: 4, text: 'Re-Apply EU' },
]

export const duplicateOption = [
  { key: 1, text: 'Duplicate EU Under' },
  { key: 2, text: 'Duplicate EU Over' },
  { key: 3, text: 'Duplicate GSP A' },
  { key: 4, text: 'Duplicate GSP N' },
  { key: 5, text: 'Duplicate Asean A' },
  { key: 6, text: 'Duplicate Asean N' },
]

export const statusLists = [
  { key: 1, text: 'Active' },
  { key: 2, text: 'Disabled' },
]

export const userRoleLists = [
  { key: 1, text: 'Administrator' },
  { key: 2, text: 'Guess' },
  { key: 3, text: 'Sudo' },
]

export const tagTypeLists = [
  { key: 1, text: 'Color' },
  { key: 2, text: 'Name' },
]

export const fileTypes = [
  { key: 1, text: 'PDFs' },
  { key: 2, text: 'Documents' },
  { key: 3, text: 'Excels' },
  { key: 4, text: 'Power Points' },
  { key: 5, text: 'Photo & Images' },
  { key: 6, text: 'Audios' },
  { key: 6, text: 'Videos' },
]

export const fileOwner = [
  { key: 1, text: 'Anyone' },
  { key: 2, text: 'Owned by me' },
  { key: 3, text: 'Not owned by me' },
]

export const dateModified = [
  { key: 1, text: 'Anytime' },
  { key: 2, text: 'Today' },
  { key: 3, text: 'Yesterday' },
  { key: 4, text: 'This week' },
  { key: 5, text: 'This month' },
  { key: 6, text: 'This year' },
  // { key: 7, text: 'custom' },
]

export const statusObj = {
  active: { key: 1, text: 'Active' },
  disabled: { key: 2, text: 'Disabled' },
}
export const driveObj = {
  folder: { key: 'folder', name: 'Folder' },
  file: { key: 'file', text: 'File' },
}

export const trasactionTypeObj = {
  OB: { key: 1, text: 'Opening Balance' },
  ADJUSTMENT: { key: 2, text: 'Adjustment Stock' },
  IMPORT_STOCK: { key: 3, text: 'Register Import Stock' },
  CUT_STOCK: { key: 5, text: 'Register Cut Stock' },
  VOID_STOCK: { key: 6, text: 'Register Void Stock' },
}

export const submitType = [
  { key: 1, text: 'Submit Form' },
  { key: 2, text: 'Submit CRF' },
]

export const submitTypeObj = {
  submitForm: { key: 1, text: 'Submit Form' },
  submitCRF: { key: 2, text: 'Submit CRF' },
}

export const CO_STATUS = [
  { key: 1, text: 'Draft' },
  { key: 2, text: 'Register' },
]

export const CO_STATUS_OBJ = {
  draft: { key: 1, text: 'Draft' },
  register: { key: 2, text: 'Register' },
}

export const allStatusLists = [
  { key: 0, text: 'All' },
  { key: 1, text: 'Active' },
  { key: 2, text: 'Disabled' },
]

export const PRODUCT_TYPES_ARRAY = [
  { key: 1, text: 'Inventory' },
  { key: 2, text: 'Accounting' },
  { key: 3, text: 'Fixed Asset' },
]


export const SysItemType = {
  item: { key: 1, text: 'item', router: "item" },
  product: { key: 2, text: 'product', router: "product" },
}

export const PRODUCT_TYPES_ARRAY_OBJ = {
  inventory: { key: 1, text: 'Inventory', router: "inventory" },
  accounting: { key: 2, text: 'Accounting', router: "accounting" },
  fixed_asset: { key: 3, text: 'Fixed Asset', router: "fixed_asset" },
}
//STOCK MOVEMENT TYPE
export const ADJUSTMENT_OPTIONS = [
  { key: 1, text: 'ADJ+', factor: 1 },
  { key: 2, text: 'ADJ-', factor: -1 },
]

export const movementTypeObj = {
  ADJ_INCREASE: { key: 1, text: 'ADJ+', factor: 1 },
  ADJ_DECREASE: { key: 2, text: 'ADJ-', factor: -1 },
  OB: { key: 3, text: 'OB', factor: 1 },
  IMPORT_STOCK: { key: 4, text: 'IMPORT STOCK', factor: 1 },
  CUT_STOCK: { key: 5, text: 'CUT STOCK', factor: -1 },
  VOID_STOCK: { key: 6, text: 'VOID', factor: 1 },
}

export const PERMISSION_OPTIONS = [
  { key: 1, text: 'Read only' },
  { key: 2, text: 'Read/Write' },
]

export const userRoleArray = [
  { key: 1, text: 'ថ្នាក់ជាតិ', },
  { key: 2, text: 'ថ្នាក់ស្នងការ' },
  // { key: 3, text: 'ថ្នាក់អធិការ',},
  // { key: 4, text: 'ថ្នាក់ប៉ុស្តិ៍នគរបាល',},
];

export const Gender = [
  { key: 1, text: "ប្រុស" },
  { key: 2, text: "ស្រី" },
]

export const USER_PERMISSION = [
  { key: 1, text: "Read Only" },
  { key: 2, text: "Write" },
]

export const roleObj = {
  administrator: { key: 1, text: 'រដ្ឋបាលថ្នាក់ជាតិ', name: "Administrator" },
  readOnly: { key: 2, text: 'រដ្ឋបាលថ្នាក់ខេត្ត', name: "Read only" },
  readWrite: { key: 3, text: 'រដ្ឋបាលទូទៅ', name: "Read/Write" },
};

export const roleArray = [
  { key: 1, text: 'រដ្ឋបាលថ្នាក់ជាតិ', name: "Administrator" },
  { key: 2, text: 'រដ្ឋបាលថ្នាក់ខេត្ត', name: "Read only" },
  { key: 3, text: 'រដ្ឋបាលទូទៅ', name: "Read/Write" },
]

export const docStatus = {
  active: { key: 1, text: "Active" },
  disable: { key: 2, text: "Disabled" },
  delete: { key: 3, text: "Delete" },
};

export const requestEditStatus = {
  request: { key: 1, text: "Request" },
  completed: { key: 2, text: "Completed" },
};

export const docStatusObj = {
  hold: { key: 1, text: 'Hold', name: 'សេចក្តីព្រាង', color: '#f1c40f' },
  released: { key: 2, text: 'Released', name: 'ពិនិត្យឆ្លង', color: '#4bd964' },
  final: { key: 99, text: 'Final', name: 'បិទបញ្ចប់', color: '#027FFF' },
  void: { key: 98, text: 'Void', name: 'មោឃៈ', color: '#ff3a30' },
}

export const streamDocumentStatusObj = {
  approved: { key: 1, text: "Approved" },
  checkedConfirm: { key: 2, text: "Confirm" },
};


export const LIST_DOC_OBJECT = {
  received_document: { key: 1, name: "ឯកសារចូល", link: "received_document", img: "../../assets/images/icon-01.png" },
  urgent_docs: { key: 2, name: "ឯកសារបន្ទាន់", link: "urgent_docs", img: "../../assets/images/megaphone-01.png" },
  not_completed_doc: { key: 9, name: "ឯកសារមិនទាន់ចប់", link: "not_completed_doc", img: "../../assets/images/03.png" },
  searchDoc: { key: 8, name: "ស្រាវជ្រាវ", link: "search/docs", img: "../../assets/images/search-01 (3).png" },
  completed_doc: { key: 3, name: "ឯកសារបិទបញ្ចប់", link: "completed_doc", img: "../../assets/images/suitcase-03.png" },
  rejected_docs: { key: 4, name: "មោឃៈ", link: "rejected_docs", img: "../../assets/images/bin-01.png" },
  recent_docs: { key: 5, name: "ប្រវត្តិប្រើប្រាស់", link: "recent_docs", img: '../../assets/images/Recent-01.png' }, //img: "../../assets/images/06.png"
}
export const LIST_DOC_ARRAY = Object.values(LIST_DOC_OBJECT);


export const LIST_TYPE = {

  received_document: { key: "received_document", name: "Receive document", name_kh: "ឯកសារចូល" },
  urgent_docs: { key: "urgent_docs", name: "Urgent documents", name_kh: "ឯកសារបន្ទាន់" },
  not_completed_doc: { key: "not_completed_doc", name: "Not Completed document", name_kh: "ឯកសារមិនទាន់ចប់" },
  completed_doc: { key: "completed_doc", name: "Completed document", name_kh: "ឯកសារបានបិទបញ្ចប់" },
  rejected_docs: { key: "rejected_docs", name: "Rejected documents", name_kh: "មោឃៈ" },
  recent_docs: { key: "recent_docs", name: "History documents", name_kh: "ប្រវត្តិប្រើប្រាស់" },

  not_yet_approved_doc: { key: "not_yet_approved_doc", name: "Not Yet Approved documents", name_kh: "ឯកសារមិនទាន់ឯកភាព" },
  already_approved_doc: { key: "already_approved_doc", name: "Approved documents", name_kh: "ឯកសារបានឯកភាព" },

  agreed_docs: { key: "agreed_docs", name: "Agreed documents" },
  pinned_docs: { key: "pinned_docs", name: "Pinned documents" },
  signature_docs: { key: "signature_docs", name: "Signature documents" },
  request_docs: { key: "request_docs", name: "Requested documents" },
  document_note: { key: "document_note", name: "Document note" },
  follow_up: { key: "follow_up", name: "Follow up" },
  report: { key: "report", name: " Report" },


}


export const PROJECT_STATUS_OBJECT = {
  HOLD: { key: 1, name_kh: `ពុំទាន់ចាប់ផ្ដើម`, name: 'Hold', color: '#049cb7' },
  ACTIVE: { key: 2, name_kh: `ព្រាងផែនការ`, name: 'Active', color: '#f1c40f' },
  PUBLIC: { key: 3, name_kh: `អនុម័តផែនការ`, name: 'Public', color: '#027fff' },
  REPORT: { key: 4, name_kh: `របាយការណ៍`, name: 'Report', color: '#00c853' },
  COMPLETED: { key: 5, name_kh: `បិទបញ្ចប់`, name: 'Completed', color: '#cc73e1' },
}

export const LANGUAGE = [
  { key: 1, text: 'English' },
  { key: 2, text: 'French' },
  { key: 3, text: 'Spanish' },
  { key: 4, text: 'Italian' },
  { key: 5, text: 'Chinese(traditional)' },
  { key: 2, text: 'Putugueses' },
]

export const CCY = [
  { key: 1, text: 'KHR' },
  { key: 2, text: 'USD' },
  { key: 3, text: 'CYN' },
]


export const TYPEOFBUSS_OBJ = [
  { key: 0, text: 'Sole trader' },
  { key: 1, text: 'Partnership' },
  { key: 2, text: 'Private limited company' },
  { key: 3, text: 'Traded company or co-operative' },
  { key: 4, text: 'Charity or association' },
  { key: 5, text: 'Company' },
  { key: 6, text: 'Something else' },
]

export const YEAROFBUSS_OBJ = [
  { key: 0, text: 'Less than 1 year' },
  { key: 1, text: '1-2 years' },
  { key: 2, text: '3-4 years' },
  { key: 3, text: '5-9 years' },
  { key: 4, text: '10-14 years' },
  { key: 5, text: '15+ years' },
]

export const INDUSTRY_OBJ = [
  { key: 0, text: 'Accommodation and Food Services' },
  { key: 1, text: 'Administrative and Support Services' },
  { key: 2, text: 'Arts and Recreation Services' },
  { key: 3, text: 'Construction/Builder' },
  { key: 4, text: 'Education and Trading' },
  { key: 5, text: 'Farming, forestry and fishing' },
  { key: 6, text: 'Financial service & insurance' },
  { key: 7, text: 'Manufacturing' },
  { key: 8, text: 'Medical / Health Care / Community services' },
  { key: 9, text: 'Personal, Beauty, Wellbeing, and other services' },
  { key: 10, text: 'Professional Services (e.g. Legal, Accounting, Marketing, Consulting)' },
  { key: 11, text: 'Property Operators and Real Estate services' },
  { key: 12, text: 'Rental & Hiring services (non Real Estate)' },
  { key: 13, text: 'Repair and Maintenance (Automotive & Property)' },
  { key: 14, text: 'Retail Trade (Food & Beverage)' },
  { key: 15, text: 'Technology / Telecommunications services' },
  { key: 16, text: 'Trades work (e.g Plumber, Carpenter, Electrician)' },
  { key: 17, text: 'Transport, Logistics, Postal, Warehousing' },
  { key: 18, text: 'Wholesale Trade' },
  { key: 19, text: 'Other' },
]

export const ROLEOFBUSS_OBJ = [
  { key: 0, text: 'Owner' },
  { key: 1, text: 'Bookkeeper' },
  { key: 2, text: 'Accountant' },
  { key: 3, text: 'Employee' },
  { key: 4, text: 'Its something else' },
]

export const APPLICATION_TYPE = [
  { key: 1, text: 'ព្រឹត្តិបត្រថ្កោលទោស ១', route: `application-no-i` },
  { key: 2, text: 'ព្រឹត្តិបត្រថ្កោលទោស ២', route: `application-no-ii` },
  { key: 3, text: 'ព្រឹត្តិបត្រថ្កោលទោស ៣', route: `application-no-iii` },
]

export const APPLICATION_TYPE_OBJ = {
  'application-no-i': { key: 1, text: 'ព្រឹត្តិបត្រថ្កោលទោស ១', route: `application-no-i` },
  'application-no-ii': { key: 2, text: 'ព្រឹត្តិបត្រថ្កោលទោស ២', route: `application-no-ii` },
  'application-no-iii': { key: 3, text: 'ព្រឹត្តិបត្រថ្កោលទោស ៣', route: `application-no-iii` },
}

export const NATIONALITY_APPLICAITON = [
  { key: `khmer`, name: `ជនជាតិខ្មែរ`, name_en: 'Khmer', remark: ``, icon: `../../../../../assets/logo/cambodia_flag.svg` },
  { key: `foreigner`, name: `ជនជាតិបរទេស`, name_en: 'Foreigner', remark: ``, icon: `../../../../../assets/logo/global_flag.png` },
]

export const MOVEMENT_STATUS_OBJ = {
  HOLD: { key: 0, text: 'Hold' },
  RELEASED: { key: 1, text: 'Released' },
  VOID: { key: 2, text: 'Void' },
}

export const MOVEMENT_STATUS_DATA = {
  draft: { key: 0, text: 'Hold' },
  submitted: { key: 1, text: 'Released' },
}

export const RECEIVE_STATUS_DATA = {
  pending: { key: 0, text: 'Pending' },
  completed: { key: 1, text: 'Completed' },
}

export const UNIT_OPERATOR = [
  { key: 1, operator: '*', name: 'Multiply' },
  { key: 2, operator: '/', name: 'Divide' },
]

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

export const MASTER_PAGES = {
  adjustment: { key: 'adjustment', name: 'Inventory Adjustment', route: '/inventory/inventory/inventory-adjustment' },
  transfer: { key: 'transfer', name: 'Inventory Transfer', route: '/inventory/inventory/inventory-transfer' },
  bills: { key: 'bills', name: 'Bills', route: '/inventory/purchase/bills' },
  'journal_entry': { key: 'journal_entry', name: 'Journal Entry', route: '/finance-report/accounting/journal-entry' },
  'petty_cash': { key: 'petty_cash', name: 'Petty Cash', route: '/finance-report/accounting/petty-cash' },
  receiveStock: { key: 'receiveStock', name: 'Receive Stock', route: '/inventory/inventory/receive-stock' },
  transferStockIn: { key: 'transferStockIn', name: 'Transfer Stock In', route: '/inventory/inventory/transfer-stock-in-listing' },

}

export const PURCHASE_TYPE_OPTIONS = [
  { key: 0, name: 'Item' },
  { key: 1, name: 'Free' },
]

export const LINE_TYPE_OBJECT = {
  SPECIAL: { key: 0, name: 'Special' },
  ITEM: { key: 1, name: 'Item' },
}

export const Pages = {
  size: 50,
  debounceTime: 300,
  distance: 2,
  throttle: 50,
  student_id_length: 7,
};
export const ATTENDANCE_SHIFT = {
  MORNING: { key: 1, text: 'ព្រឹក' },
  AFTERNOON: { key: 2, text: 'រសៀល' },
  EVENING: { key: 3, text: 'ល្ងាច' },
  NIGHT: { key: 4, text: 'យប់' },
  FULL_DAY: { key: 5, text: 'ពេញម៉ោង' },
};

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


export const ATTENDANCE_STATUS_NO_CHECKOUT = {
  PRESENT: {
    key: 1,
    text: 'Present',
    text_kh: 'វត្តមាន',
  },
  ABSENT: {
    key: 2,
    text: 'Absent',
    text_kh: 'អវត្តមាន',
  },
  LEAVEEARLY: {
    key: 13,
    text: 'Leave_Early',
    text_kh: 'វត្តមាន(ចេញមុន)'
  },

}

export const LEAVE_REQUEST_TYPE = {
  MISSION: {
    key: 1,
    text: 'mission',
    text_kh: 'បេសកកម្ម',
  },
  PERMISSION: {
    key: 2,
    text: 'permission',
    text_kh: 'ថ្ងៃឈប់សម្រាក',
  },
  PREGENCY_BREAK: {
    key: 3,
    text: 'pregnency_break',
    text_kh: 'សម្រាកមានផ្ទៃពោះ'
  },
}

export const WEEKDAY_KH = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];
export const WEEKDAY_ENG = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];



export const DELIVERY_METHOD_ARRAY = [
  {
    key: 'pickup',
    name: 'មកយកផ្ទាល់',
    name_en: 'Pickup at Post Office',
    name_fr: 'Retrait au bureau de poste',
  },
  {
    key: 'home_delivery',
    name: 'សេវាដឹកជញ្ជូន',
    name_en: 'Delivery Service',
    name_fr: 'Service de livraison',
  },
];



export const appArray = [
  { key: 'applications', text: "សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស" },
  { key: 'decree-record', text: "បញ្ជីថ្កោលទោស" },
  { key: 'folder', text: "បញ្ជីលេខរៀង" },
  { key: 'approval', text: "អនុម័តព្រឹត្តិបត្រថ្កោលទោស" },
  { key: 'criminal-latter', text: "បោះពុម្ពព្រឹត្តិបត្រថ្កោលទោស" },
  { key: 'criticizes', text: "បញ្ជីប្រជាពលរដ្ឋ" },
  { key: 'reports', text: "របាយការណ៍" },
]

export const programArray = [
  { key: 'criminal_applications_office', text: "ការិយាល័យរដ្ឋបាលនិងទទួលពាក្យសុំព្រឹត្តិបត្រថ្កោលទោស", name: "ការិយាល័យរដ្ឋបាលនិងទទួលពាក្យសុំព្រឹត្តិបត្រថ្កោលទោស" },
  { key: 'recipient', text: 'អ្នកទទួលប្រាក់', name: 'អ្នកទទួលប្រាក់' },
  { key: 'judgment_list_office', text: "ការិយាល័យបញ្ជីថ្កោលទោស", name: "ការិយាល័យបញ្ជីថ្កោលទោស" },
  { key: 'classify_folder', text: "ចុះបញ្ជីលេខរៀង", name: "ចុះបញ្ជីលេខរៀង" },
  { key: 'approval', text: "អនុម័តព្រឹត្តិបត្រថ្កោលទោស", name: "អនុម័តព្រឹត្តិបត្រថ្កោលទោស" },
  { key: 'print_and_notify', text: "បោះពុម្ព ចុះលេខ និងជូនដំណឹង", name: "បោះពុម្ព ចុះលេខ និងជូនដំណឹង" },
  { key: 'reports', text: "របាយការណ៍", name: "របាយការណ៍" },
  { key: 'admin_mol_request', text: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការងារ", name: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការងារ" },
  { key: 'admin_mod_request', text: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការពារជាតិ", name: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការពារជាតិ" },
  { key: 'ministry_of_labor', text: "ក្រសួងការងារ", name: "ក្រសួងការងារ" },
  { key: 'ministry_of_defense', text: "ក្រសួងការពារជាតិ", name: "ក្រសួងការពារជាតិ" },
  { key: 'overseas_embassy', text: "ស្ថានទូតក្រៅប្រទេស", name: "ស្ថានទូតក្រៅប្រទេស" },
  { key: 'overseas_management', text: "គ្រប់គ្រងពាក្យស្នើសុំក្រៅប្រទេស", name: "គ្រប់គ្រងពាក្យស្នើសុំក្រៅប្រទេស" },
  { key: 'letter_1', text: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ១", name: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ១" },
  { key: 'letter_2', text: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ២", name: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ២" },
  { key: 'print_paid_online', text: "ទទួលបោះពុម្ពពាក្យស្នើសុំអនឡាញ", name: "ទទួលបោះពុម្ពពាក្យស្នើសុំអនឡាញ" },
]

export const programArrayObj = {
  criminal_applications_office: { key: 'criminal_applications_office', text: "ការិយាល័យរដ្ឋបាលនិងទទួលពាក្យសុំព្រឹត្តិបត្រថ្កោលទោស", name: "ការិយាល័យរដ្ឋបាលនិងទទួលពាក្យសុំព្រឹត្តិបត្រថ្កោលទោស" },
  recipient: { key: 'recipient', text: 'អ្នកទទួលប្រាក់', name: 'អ្នកទទួលប្រាក់' },
  judgment_list_office: { key: 'judgment_list_office', text: "ការិយាល័យបញ្ជីថ្កោលទោស", name: "ការិយាល័យបញ្ជីថ្កោលទោស" },
  classify_folder: { key: 'classify_folder', text: "ចុះបញ្ជីលេខរៀង", name: "ចុះបញ្ជីលេខរៀង" },
  approval: { key: 'approval', text: "អនុម័តព្រឹត្តិបត្រថ្កោលទោស", name: "អនុម័តព្រឹត្តិបត្រថ្កោលទោស" },
  print_and_notify: { key: 'print_and_notify', text: "បោះពុម្ព ចុះលេខ និងជូនដំណឹង", name: "បោះពុម្ព ចុះលេខ និងជូនដំណឹង" },
  reports: { key: 'reports', text: "របាយការណ៍", name: "របាយការណ៍" },
  admin_mol_request: { key: 'admin_mol_request', text: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការងារ", name: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការងារ" },
  admin_mod_request: { key: 'admin_mod_request', text: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការពារជាតិ", name: "គ្រប់គ្រងពាក្យស្នើសុំក្រសួងការពារជាតិ" },
  ministry_of_labor: { key: 'ministry_of_labor', text: "ក្រសួងការងារ", name: "ក្រសួងការងារ" },
  ministry_of_defense: { key: 'ministry_of_defense', text: "ក្រសួងការពារជាតិ", name: "ក្រសួងការពារជាតិ" },
  overseas_embassy: { key: 'overseas_embassy', text: "ស្ថានទូតក្រៅប្រទេស", name: "ស្ថានទូតក្រៅប្រទេស" },
  overseas_management: { key: 'overseas_management', text: "គ្រប់គ្រងពាក្យស្នើសុំក្រៅប្រទេស", name: "គ្រប់គ្រងពាក្យស្នើសុំក្រៅប្រទេស" },
  letter_1: { key: 'letter_1', text: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ១", name: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ១" },
  letter_2: { key: 'letter_2', text: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ២", name: "ព្រឹត្តិបត្រថ្កោលទោសលេខ ២" },
  print_paid_online: { key: 'print_paid_online', text: "ទទួលបោះពុម្ពពាក្យស្នើសុំអនឡាញ", name: "ទទួលបោះពុម្ពពាក្យស្នើសុំអនឡាញ" },
}

export const dataEntryMinistryProgramKeys = [
  programArrayObj.ministry_of_labor.key,
  programArrayObj.ministry_of_defense.key,
]
 