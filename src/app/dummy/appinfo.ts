export const APP_NAME = {
  MOJ: {
    key: 'moj',
    name: 'ប្រព័ន្ធព្រឹត្តិបត្រថ្កោលទោសឌីជីថល',
    logo: './assets/images/moj.png',
    report_logo: './assets/images/moj.jpeg',
    system_logo: './assets/images/moj_2.jpg',
    name_en: 'Criminal Record Latter',
    copy_right: 'ដោយក្រសួងយុត្តិធម៌ នៃព្រះរាជាណាចក្រកម្ពុជា'
  },
  GDI: {
    key: 'gdi',
    name: 'អគ្គនាយកដ្ឋានអន្តោប្រវេសន៍',
    logo: './assets/images/GDI_Logo.png',
    system_logo: './assets/images/GDI_Logo.png',
    name_en: 'General Department of Immigration',
    copy_right: 'អគ្គនាយកដ្ឋានអន្តោប្រវេសន៍'
  },
  K85: {
    key: 'gdi',
    name: 'យុវជនគណបក្សប្រជាជនកម្ពុជាថ្នាក់កណ្តាល',
    logo: './assets/images/CYCPP.png',
    name_en: 'Central Youth CPP',
    copy_right: 'យុវជនគណបក្សប្រជាជនកម្ពុជាថ្នាក់កណ្តាល'
  },
  CYCPP: {
    key: 'cycpp',
    name: 'យុវជនគណបក្សប្រជាជនកម្ពុជាថ្នាក់កណ្តាល',
    logo: './assets/images/CYCPP.png',
    name_en: 'Central Youth CPP',
    copy_right: 'យុវជនគណបក្សប្រជាជនកម្ពុជាថ្នាក់កណ្តាល'
  },
}

export const PHOTO_LIB = {
  EMPTY: 'https://firebasestorage.googleapis.com/v0/b/sysanotta.appspot.com/o/no_image.svg?alt=media&token=f25af902-6c62-47e6-bdf3-48e3b0c6fe8c',
  EMPTY_PHOTO: 'https://firebasestorage.googleapis.com/v0/b/ecpp-auxswot.appspot.com/o/photo%2Fempty_image.jpeg?alt=media&token=53a1095a-e2f4-48e7-930f-ded6be1eecc8',
  EMPTY_AVATAR: 'https://firebasestorage.googleapis.com/v0/b/school-link-bb0e9.appspot.com/o/avatar_chat%2Fno_avatar.jpeg?alt=media&token=d1254692-33c5-41d4-80a1-d1f6040c217c',
  EMPTY_COVER: '/src/assets/images/GDI-Doc-Cover-2.jpg',
  PDF: 'https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fpdf.svg?alt=media&token=d7a5750b-410d-43e1-8bdc-17a698bfa3b8'
}


export const DECREE_STATUS_OBJ = {
  invalid_decree_record: { key: 'invalid_decree_record', name: 'ពុំមានកំណត់ត្រាផ្ដន្ទាទោសជាប់ពន្ធនាគារ', name_en: 'No prison sentence', id: 1 },
  valid_decree_record: { key: 'valid_decree_record', name: 'មានកំណត់ត្រាផ្ដន្ទាទោសជាប់ពន្ធនាគារ', name_en: 'Imprisonment record', id: 2 },
}
export const DECREE_STATUS_ARRAY = Object.values(DECREE_STATUS_OBJ);

export const STATUS_OBJ = {
  DISABLED: { key: -2, text: 'Disabled' },
  DELETED: { key: -1, text: 'Deleted' },
  ACTIVE: { key: 1, text: 'Active' },
  PENDING: { key: 2, text: 'Pending' },
  COMPLETED: { key: 3, text: 'Completed' },
  SUBMITTED: { key: 4, text: 'Submitted' },

  DRAFT: { key: 5, text: 'Draft', name: 'កំពុងព្រៀង', name_en: 'Draft' },
  APPLY: { key: 6, text: 'Apply', name: 'ដាក់ពាក្យស្នើសុំ', name_en: 'Apply' },
  REJECTED: { key: 6.09, text: 'Rejected', name: 'បដិសេធ', name_en: 'Rejected' },
  CONFIRM_APPLICATION: { key: 6.1, text: 'Confirm', name: 'ព័ត៌មានត្រឹមត្រូវ', name_en: 'Confirm' },
  REVIEW: { key: 6.2, text: 'Review', name: 'ផ្ដល់ស្នាមម្រាមដៃនិងឯកសារ', name_en: 'Review' },

  PAID_UN_FILLED: { key: 6.3, text: 'Paid with Application', name: 'បានបង់ប្រាក់', name_en: 'Paid with Application' },
  PAID: { key: 7, text: 'Paid', name: 'បង់ប្រាក់រូច', name_en: 'Paid' },
  START_PROCESS: { key: 7.01, text: 'Start process document', name: 'ចាប់ផ្ដើមធ្វើឯកសារ', name_en: 'Start process document' },
  DECREE: { key: 7.2, text: 'Decree', name: 'ផ្ដល់និទ្ទេស', name_en: 'Decree' },
  CLASSIFY: { key: 7.3, text: 'Classify', name: 'បញ្ជីលេខរៀង', name_en: 'Classify' },
  PROCESSING: { key: 8, text: 'Processing', name: 'កំពុងរៀបចំព្រឹត្តិបត្រ', name_en: 'Processing' },

  RECEIVE_FOLDER: { key: 8.1, text: 'Receive Folder', name: 'ទទួលបានបញ្ជីឯកសារ', name_en: 'Receive Folder' },
  INTERNAL_PROCESS_REJECT: { key: 9, text: 'Internal Process Reject', name: 'Internal Process Reject', name_en: 'Internal Process Reject' },
  APPROVED: { key: 10, text: 'Approved', name: 'អនុម័ត', name_en: 'Approved' },
  RECEIVED: { key: 11, text: 'Received', name: 'អាចមកដកព្រឹត្តិបត្រ', name_en: 'Received' },
  DONE: { key: 12, text: 'Done', name: 'បិទបញ្ចប់', name_en: 'Done' },

  VOID: { key: 90, text: 'Void', name: 'មោឃៈ', name_en: 'Void' },
  EXPIRED: { key: 99, text: 'Expired', name: 'ផុតកំណត់', name_en: 'Expired' },
}
export const STATUS_OBJ_ARRAY = Object.values(STATUS_OBJ);

export const STATUS_COLOR_OBJ: Record<number, string> = {
  [STATUS_OBJ.DISABLED.key]: '#757575',
  [STATUS_OBJ.DELETED.key]: '#d32f2f',
  [STATUS_OBJ.ACTIVE.key]: '#2e7d32',
  [STATUS_OBJ.PENDING.key]: '#ef6c00',
  [STATUS_OBJ.COMPLETED.key]: '#2e7d32',
  [STATUS_OBJ.SUBMITTED.key]: '#027fff',
  [STATUS_OBJ.DRAFT.key]: '#757575',
  [STATUS_OBJ.APPLY.key]: '#027fff',
  [STATUS_OBJ.REJECTED.key]: '#d32f2f',
  [STATUS_OBJ.CONFIRM_APPLICATION.key]: '#027fff',
  [STATUS_OBJ.REVIEW.key]: '#ef6c00',
  [STATUS_OBJ.PAID_UN_FILLED.key]: '#00897b',
  [STATUS_OBJ.PAID.key]: '#2e7d32',
  [STATUS_OBJ.START_PROCESS.key]: '#027fff',
  [STATUS_OBJ.DECREE.key]: '#7b1fa2',
  [STATUS_OBJ.CLASSIFY.key]: '#027fff',
  [STATUS_OBJ.PROCESSING.key]: '#ef6c00',
  [STATUS_OBJ.RECEIVE_FOLDER.key]: '#027fff',
  [STATUS_OBJ.INTERNAL_PROCESS_REJECT.key]: '#d32f2f',
  [STATUS_OBJ.APPROVED.key]: '#2e7d32',
  [STATUS_OBJ.RECEIVED.key]: '#2e7d32',
  [STATUS_OBJ.DONE.key]: '#2e7d32',
  [STATUS_OBJ.VOID.key]: '#9e9e9e',
  [STATUS_OBJ.EXPIRED.key]: '#9e9e9e',
}

export const DOC_CATEGORY_OBJ = {
  edoc: { key: 1, name: 'EDOC' },
  announcement: { key: 2, name: 'Announcement' },
  meeting: { key: 3, name: 'Meeting' },
  criminal_record: { key: 4, name: 'Criminal Record' }
}
export const DOC_CATEGORY_ARRAY = Object.values(DOC_CATEGORY_OBJ);

export const DOC_CATEGORY_APP_OBJ = {
  edoc: { key: 1, name: 'EDOC' },
  criminal_record: { key: 4, name: 'Criminal Record' },
  all: { key: 5, name: 'All' },
}
export const DOC_CATEGORY_APP_ARRAY = Object.values(DOC_CATEGORY_APP_OBJ);

export const STATUS_LIVES = {
  LIVING: { key: 1, text: 'រស់', kh_text: 'រស់' },
  DEAD: { key: 3, text: 'ស្លាប់', kh_text: "ស្លាប់" },
}


export const STATUS_LIVES_ARRAY = [
  { key: 1, name: 'រស់', name_en: 'Living' },
  { key: 3, name: 'ស្លាប់', name_en: "Dead" },
]


export const PROVINCE_ARRAY_PREFIX = [
  { key: 1, name: 'រាជធានី' },
  { key: 2, name: 'ខេត្ត' },
]

export const DISTRICT_ARRAY_PREFIX = [
  { key: 1, name: 'ស្រុក' },
  { key: 2, name: 'ក្រុង' },
  { key: 3, name: 'ខណ្ឌ' },
]

export const COMMUNE_ARRAY_PREFIX = [
  { key: 1, name: 'ឃុំ' },
  { key: 2, name: 'សង្កាត់' },
]


export const DEPARTMENT_STATUS_OBJ = {
  GENERAL_DEPARTMENT: { key: 1, name: 'General Department' },
  DEPARTMENT: { key: 2, name: 'Department' },
}


export const HEADER_INFORMATION_TYPE_OBJ = {
  SEND_TO: { key: 1, name: 'Send To', color: '#007aff' },
  SEND_FROM: { key: 2, name: 'Send From', color: '#cc73e1' },
  CARBON_COPY: { key: 3, name: 'Carbon Copy', color: '#00c853' },
  BLIND_CARBON_COPY: { key: 4, name: 'Blind Carbon Copy', color: '#f1c40f' },
}

export const header = {
  ContentSummary: { key: 1, name: 'សង្ខេបខ្លឹមសារ', nameEn: 'Content Summary' },
  OfInstitution: { key: 2, name: 'របស់ស្ថាប័ន', nameEn: 'Of the Institution' },
  ReferenceLetter: { key: 3, name: 'យោងលិខិត', nameEn: 'Reference letter' },
  References: { key: 4, name: 'យោង', nameEn: 'References' },
  Subject: { key: 5, name: 'កម្មវត្ថុ', nameEn: 'Subject' },
}

export const DocType = {
  header: { key: 1, name: 'ក្បាលឯកសារ', nameEn: 'Header' },
  body: { key: 2, name: 'ខ្លឹមសារឯកសារ', nameEn: 'Body' },
  footer: { key: 3, name: 'បាតកថាឯកសារ', nameEn: 'Footer' },
}
export const headerDocItem = [
  { key: 0, type: 'Header', name: ' មាតិកា', nameEn: 'Content', placeholder: 'បញ្ចូលមាតិកា.....', icon: 'list_alt' },
  // { key: 1, type: 'Header', name: "សង្ខេបខ្លឹមសារ", nameEn: 'Content Summary', icon: 'app_registration', placeholder: 'បញ្ចូលសង្ខេបខ្លឹមសារ.....' },
  { key: 1, type: 'Header', name: "សង្ខេបខ្លឹមសារ", nameEn: 'Content Summary', icon: 'app_registration', placeholder: 'បញ្ចូលសង្ខេបខ្លឹមសារ.....', ct: "<p><span style=\"font-family:'khmer os siemreap', khmeros_siemreap;font-size:18px;\">សង្ខេបខ្លឹមសារ</span></p>", c: "<p><span style=\"font-family:'khmer os siemreap', khmeros_siemreap;font-size:18px;\"></span></p>" },
  { key: 2, type: 'Header', name: 'យោងលិខិត', nameEn: 'Reference letter', icon: 'drive_file_rename_outline', placeholder: 'បញ្ចូលយោងលិខិត.....' },
  { key: 3, type: 'Header', name: 'យោង', nameEn: 'References', icon: 'design_services', placeholder: 'បញ្ចូលយោង.....' },
  { key: 4, type: 'Header', name: 'កម្មវត្ថុ', nameEn: 'Subject', icon: 'plumbing', placeholder: 'បញ្ចូលកម្មវត្ថុ.....' },
  { key: 5, type: 'Header', name: 'ករណី', nameEn: 'Case', icon: 'brush', placeholder: 'បញ្ចូលករណី.....' },
  { key: 6, type: 'Header', name: 'របស់ស្ថាប័ន', nameEn: 'Of the Institution', icon: 'spoke', placeholder: 'បញ្ចូលរបស់ស្ថាប័ន.....' },
  { key: 18, type: 'Header', name: 'កំណត់ចំណាំ', nameEn: 'Note', placeholder: 'បញ្ចូលកំណត់ចំណាំ.....', icon: 'note_add', symbol: '✹' },

]

export const bodyDocItem = [
  // { key: 7, type: 'Body', name: 'ប្រអប់ស្នើសុំមតិ', nameEn: 'Opinion of the Deputy Director of the Office', icon: 'auto_fix_high', placeholder: 'បញ្ចូលមតិនាយករងការិយាល័យ.....' },
  { key: 8, type: 'Body', name: 'មតិ និងកន្លែងទទួលអនុវត្ត', nameEn: 'Departmental opinion', icon: 'auto_awesome', placeholder: 'បញ្ចូលមតិនាយកដ្ឋាន.....', disabled: true },
  // { key: 9, type: 'Body', name: 'ស្ថាប័នស្នើសុំ', nameEn: 'Requesting Institution', icon: 'edit_road', placeholder: 'បញ្ចូលស្ថាប័នស្នើសុំ.....' },
  // { key: 10, type: 'Body', name: 'ប្រអប់ស្នើសុំមតិ', nameEn: 'Section', placeholder: 'បញ្ចូលស្នើសុំមាតិតាមផ្នែក.....', icon: 'grid_view' },
  { key: 11, type: 'Body', name: 'មាតិកា', nameEn: 'Content', placeholder: 'បញ្ចូលមាតិកា.....', icon: 'list_alt' },
  // { key: 12, type: 'Body', name: 'ជូនដំណឹងទៅ', nameEn: 'Content', placeholder: 'បញ្ចូលសំណើទៅ.....', icon: 'info' },
]

export const footerDocItem = [
  { key: 13, type: 'Footer', name: 'ហត្ថលេខា', nameEn: 'Signature Box', placeholder: 'បញ្ចូលហត្ថលេខា.....', icon: 'gesture' },
  { key: 17, type: 'Footer', name: 'ហត្ថលេខាបី', nameEn: 'Signature Three Box', placeholder: 'បញ្ចូលហត្ថលេខាបី.....', icon: 'settings_ethernet' },
  { key: 14, type: 'Footer', name: 'ប្រអប់ហត្ថលេខា', nameEn: 'Signature', placeholder: 'បញ្ចូលប្រអប់ហត្ថលេខា.....', icon: 'draw' },
  { key: 20, type: 'Footer', name: 'ប្រអប់ហត្ថលេខា MOJ', nameEn: 'Signature', placeholder: 'បញ្ចូលប្រអប់ហត្ថលេខា.....', icon: 'draw' },
  { key: 15, type: 'Footer', name: 'ប្រអប់កាលបរិឆ្ឆេទ', nameEn: 'Date Box', placeholder: 'បញ្ចូលប្រអប់កាលបរិឆ្ឆេទ.....', icon: 'date_range' },
  { key: 16, type: 'Footer', name: 'មាតិកា', nameEn: 'Content', placeholder: 'បញ្ចូលមាតិកា.....', icon: 'list_alt' },
]

export type ImageSizeType = '200' | '400' | '680' | '720' | '1024' | '1280' | '1920'

export const Application = [
  { path: '/apps/program', title: 'appication', title_kh: 'កម្មវិធី', icon: 'groups' },
  { path: '/apps/user-program', title: 'appication', title_kh: 'កម្មវិធីតាមអ្នកប្រើប្រាស់', icon: 'accessibility_new' },
  { path: `/apps/mme-program`, title: 'appication', title_kh: 'បង្កើតកម្មវិធី', icon: 'groups' },
  { path: '/apps/year-program', title: 'Year for Program', title_kh: 'កម្មវិធីសម្រាប់ឆ្នាំ', icon: 'calendar_today' },
  { path: '/apps/source-budget', title: 'Source Budge', title_kh: 'ប្រភពថវិកា', icon: 'paid' }
]

export const LEVEL_MME = {
  main_program: { key: 1, name: 'កម្មវិធី', nameEn: 'Main Program', keyPath: 'main-program' },
  sub_program: { key: 2, name: 'អនុកម្មវិធី', nameEn: 'Sub Program', keyPath: 'sub-program' },
  cluster_of_activities: { key: 3, name: 'ចង្កោមសកម្មភាព', nameEn: 'Cluster of Activities', keyPath: 'cluster-of-activities' },
  main_activities: { key: 4, name: 'សកម្មភាព', nameEn: 'Main Activities', keyPath: 'main-activities' },
  sub_activities: { key: 5, name: 'អនុសកម្មភាព', nameEn: 'Sub Activities', keyPath: 'sub-activities' },
  desc_activities: { key: 6, name: 'បរិយាយសកម្មភាព', nameEn: 'Describe Activities', keyPath: 'describe-activities' },
}
export const ARRAY_LEVEL_MME = [
  { key: 1, name: 'កម្មវិធី', name_en: 'Main Program', keyPath: 'main-program' },
  { key: 2, name: 'អនុកម្មវិធី', name_en: 'Sub Program', keyPath: 'sub-program' },
  { key: 3, name: 'ចង្កោមសកម្មភាព', name_en: 'Cluster of Activities', keyPath: 'cluster-of-activities' },
  { key: 4, name: 'សកម្មភាព', name_en: 'Main Activities', keyPath: 'main-activities' },
  { key: 5, name: 'អនុសកម្មភាព', name_en: 'Sub Activities', keyPath: 'sub-activities' },
  // { key: 6, name: 'បរិយាយសកម្មភាព', name_en: 'Describe Activities', keyPath: 'describe-activities'},
]
export const GENDER_DATA = [
  { key: 1, name: 'ប្រុស', name_en: 'Male', name_fr: 'Masculin' },
  { key: 0, name: 'ស្រី', name_en: 'Female', name_fr: 'féminin' },
]

export const FAMILY_STATUS = [
  { key: 1, text: 'ប្រពន្ធ', name: 'ប្រពន្ធ', en_name: 'Wife' },
  { key: 0, text: 'ប្ដី', name: 'ប្ដី', en_name: 'Husband' },
  { key: 0, text: 'នៅលីវ', name: 'នៅលីវ', en_name: 'Singal' },
]


export const chatBoxColor = {
  //first color top, second color bottom
  a: ['#ffcd6a', '#ffa85c'],

  b: ['#ff885e', '#ff516a'],
  ព: ['#ff885e', '#ff516a'],
  ប: ['#ff885e', '#ff516a'],

  c: ['#82b1ff', '#665fff'],
  ច: ['#82b1ff', '#665fff'],
  ជ: ['#82b1ff', '#665fff'],

  d: ['#a0de7e', '#54cb68'],
  ដ: ['#a0de7e', '#54cb68'],
  ឌ: ['#a0de7e', '#54cb68'],

  e: ['#72d5fd', '#2a9ef1'],

  f: ['#53edd6', '#28c9b7'],
  ថ: ['#53edd6', '#28c9b7'],
  ធ: ['#53edd6', '#28c9b7'],

  g: ['#e0a2f3', '#d669ed'],
  ង: ['#e0a2f3', '#d669ed'],
  អ: ['#e0a2f3', '#d669ed'],

  h: ['#ffcd6a', '#ffa85c'],
  ហ: ['#ffcd6a', '#ffa85c'],

  i: ['#ff885e', '#ff516a'],

  j: ['#82b1ff', '#665fff'],
  ញ: ['#82b1ff', '#665fff'],

  k: ['#a0de7e', '#54cb68'],
  ក: ['#a0de7e', '#54cb68'],
  គ: ['#a0de7e', '#54cb68'],

  l: ['#72d5fd', '#2a9ef1'],
  ល: ['#72d5fd', '#2a9ef1'],
  ឡ: ['#72d5fd', '#2a9ef1'],

  m: ['#53edd6', '#28c9b7'],
  ម: ['#53edd6', '#28c9b7'],

  n: ['#e0a2f3', '#d669ed'],
  ន: ['#e0a2f3', '#d669ed'],
  ណ: ['#e0a2f3', '#d669ed'],

  o: ['#ffcd6a', '#ffa85c'],

  p: ['#ff885e', '#ff516a'],
  ផ: ['#ff885e', '#ff516a'],
  ភ: ['#ff885e', '#ff516a'],

  q: ['#82b1ff', '#665fff'],
  ឆ: ['#82b1ff', '#665fff'],
  ឈ: ['#82b1ff', '#665fff'],

  r: ['#a0de7e', '#54cb68'],
  រ: ['#a0de7e', '#54cb68'],
  ឬ: ['#a0de7e', '#54cb68'],

  s: ['#72d5fd', '#2a9ef1'],
  ស: ['#72d5fd', '#2a9ef1'],

  t: ['#53edd6', '#28c9b7'],
  ទ: ['#53edd6', '#28c9b7'],
  ត: ['#53edd6', '#28c9b7'],

  u: ['#e0a2f3', '#d669ed'],

  v: ['#ffcd6a', '#ffa85c'],
  វ: ['#ffcd6a', '#ffa85c'],

  w: ['#ff885e', '#ff516a'],

  x: ['#82b1ff', '#665fff'],
  ខ: ['#82b1ff', '#665fff'],
  ឃ: ['#82b1ff', '#665fff'],

  y: ['#a0de7e', '#54cb68'],
  យ: ['#a0de7e', '#54cb68'],

  z: ['#72d5fd', '#2a9ef1'],
  ឋ: ['#72d5fd', '#2a9ef1'],
  ឍ: ['#72d5fd', '#2a9ef1'],
  ឯ: ['#72d5fd', '#2a9ef1'],
}

export const URGENT_STATUS_ARRAY = [
  { key: 1, text: 'ធម្មតា', name: 'ធម្មតា', name_en: 'normal' },
  { key: 2, text: 'បន្ទាន់', name: 'បន្ទាន់', name_en: 'urgen' },
]

export const TUTORIAL_TYPE_ARRAY = [
  { key: 1, name: 'សំណួរ-ចម្លើយ', name_en: 'Frequently Asked Questions', background: 'linear-gradient(130deg, hsl(145deg 70% 50%) 30%, hsl(0deg 0% 100%))' },
  { key: 2, name: 'ឯកសារជំនួយ', name_en: 'Document', background: 'linear-gradient(130deg, hsl(206deg 96% 90%) 30%, hsl(0deg 0% 100%))' },
  { key: 3, name: 'វីដេអូ', name_en: 'Video', background: 'linear-gradient(130deg, hsl(27deg 95% 90%) 30%, hsl(0deg 0% 100%))' },
]


export const TUTORIAL_TYPE = {
  FAQS: { key: 1, name: 'សំណួរ-ចម្លើយ', name_en: 'Frequently Asked Questions', background: 'linear-gradient(130deg, hsl(145deg 70% 50%) 30%, hsl(0deg 0% 100%))' },
  DOCUMENTS: { key: 2, name: 'ឯកសារជំនួយ', name_en: 'Document', background: 'linear-gradient(130deg, hsl(206deg 96% 90%) 30%, hsl(0deg 0% 100%))' },
  VIDEOS: { key: 3, name: 'វីដេអូ', name_en: 'Video', background: 'linear-gradient(130deg, hsl(27deg 95% 90%) 30%, hsl(0deg 0% 100%))' },
}

export const CONTENT_TYPE_ARRAY = [
  { key: 1, name: 'ចំណងជើងជំហាន', name_en: 'Header', placeholder: 'ចំណងជើងជំហាន', placeholder_en: 'Header' },
  { key: 2, name: 'អត្ថបទ', name_en: 'Text', placeholder: 'សូមបញ្ចូលអត្ថបទនៅទីនេះ', placeholder_en: 'Please enter text here' },
  { key: 3, name: 'រូបភាព', name_en: 'Image', placeholder: 'ជ្រើសរើសរូបភាព', placeholder_en: 'Select image' },
  { key: 4, name: 'វីដេអូ', name_en: 'Video', placeholder: 'សូមបញ្ចូលតំណរបស់វីដេអូនៅទីនេះ(Youtube video URL)', placeholder_en: 'Please enter the URL of the video here (Youtube video URL)' },
]

export const CONTENT_TYPE = {
  HEADER: { key: 1, name: 'ចំណងជើងជំហាន', name_en: 'Header', placeholder: 'ចំណងជើងជំហាន', placeholder_en: 'Header' },
  TEXT: { key: 2, name: 'អត្ថបទ', name_en: 'Text', placeholder: 'សូមបញ្ចូលអត្ថបទនៅទីនេះ', placeholder_en: 'Please enter text here' },
  IMAGE: { key: 3, name: 'រូបភាព', name_en: 'Image', placeholder: 'សូមបញ្ចូលអត្ថបទនៅទីនេះ', placeholder_en: 'Please enter text here' },
  VIDEO: { key: 4, name: 'វីដេអូ', name_en: 'Video', placeholder: 'សូមបញ្ចូលតំណរបស់វីដេអូនៅទីនេះ(Youtube video URL)', placeholder_en: 'Please enter the URL of the video here (Youtube video URL)' },
}

export const CRIMINAL_APPLICATION_LANGUAGE_OBJECT = {
  khmer: { key: 1, name: 'ខ្មែរ', name_en: 'Khmer', name_fr: 'khmir' },
  france: { key: 2, name: 'បារាំង', name_en: 'French', name_fr: 'Français' },
  english: { key: 3, name: 'អង់គ្លេស', name_en: 'English', name_fr: 'Anglais' },
}

export const CRIMINAL_APPLICATION_LANGUAGE_ARRAY = [
  { key: 1, name: 'ខ្មែរ', name_en: 'Khmer', name_fr: 'khmir' },
  { key: 2, name: 'បារាំង', name_en: 'French', name_fr: 'Français' },
  { key: 3, name: 'អង់គ្លេស', name_en: 'English', name_fr: 'Anglais' },
]

export const CRIMINAL_APPLICATION_LANGUAGE = {
  KHMER: { key: 1, name: 'ខ្មែរ', name_en: 'Khmer' },
  FRENCH: { key: 2, name: 'បារាំង', name_en: 'French' },
  ENGLISH: { key: 3, name: 'អង់គ្លេស', name_en: 'English' },
}


export const DOCUMENT_NOTE_TYPE = {
  DECREE: { key: 1, name: 'ចំណារនិទ្ទេស', name_en: 'Decree Result Note' },
  CONFIRM: { key: 2, name: 'ចំណារពាក្យស្នើសុំត្រឹមត្រូវ', name_en: 'Confirm Application Note' },
}

export const DOCUMENT_NOTE_TYPE_ARRAY = [
  { key: 1, name: 'ចំណារនិទ្ទេស', name_en: 'Decree Result Note' },
  { key: 2, name: 'ចំណារពាក្យស្នើសុំត្រឹមត្រូវ', name_en: 'Confirm Application Note' },
]

export const URGENT_OBJ = {
  12: { key: 12, name: '១២ ថ្ងៃ', name_en: '12 days', name_fr: '12 jours' },
  20: { key: 20, name: '២០ ថ្ងៃ', name_en: '20 days', name_fr: '20 jours' },
}

export const URGENT_OBJ_ARRAY = [
  { key: 12, name: '១២ ថ្ងៃ', name_en: '12 days', name_fr: '12 jours' },
  { key: 20, name: '២០ ថ្ងៃ', name_en: '20 days', name_fr: '20 jours' },
]

export const URGENT_OBJ_OBR = {
  key: 1, name: 'ប្រព័ន្ធចុះបញ្ជីអាជីវកម្មតាមប្រព័ន្ធបច្ចេកវិទ្យាព័ត៌មាន', name_en: 'Online Business Registration', name_fr: 'Online Business Registration' 
}

export const YEAR_CALENDER_LIST = [
  { key: 2019, text: "2019" },
  { key: 2020, text: "2020" },
  { key: 2021, text: "2021" },
  { key: 2022, text: "2022" },
  { key: 2023, text: "2023" },
  { key: 2024, text: "2024" },
  { key: 2025, text: "2025" },
  { key: 2026, text: "2026" },
  { key: 2027, text: "2027" },
  { key: 2028, text: "2028" },
  { key: 2029, text: "2029" },
  { key: 2030, text: "2030" },
  { key: 2031, text: "2031" },
  { key: 2032, text: "2032" },
  { key: 2033, text: "2033" },
  { key: 2034, text: "2034" },
  { key: 2035, text: "2035" },
  { key: 2036, text: "2036" },
  { key: 2037, text: "2037" },
  { key: 2038, text: "2038" },
  { key: 2039, text: "2039" },
  { key: 2040, text: "2040" },
];

export const APPLY_OBJECT_ARRAY = [
  { key: 'local', name: 'ក្នុងប្រទេស', name_en: 'Local' },
  { key: 'oversea', name: 'ក្រៅប្រទេស', name_en: 'Oversea' },
]

export const APPLY_OBJECT = {
  local: { key: 'local', name: 'ក្នុងប្រទេស', name_en: 'Local' },
  oversea: { key: 'oversea', name: 'ក្រៅប្រទេស', name_en: 'Oversea' },
}

export const MANUAL_PAID = {
  name : 'Manual paid by officer'
}
