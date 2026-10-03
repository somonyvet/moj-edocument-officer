export const criminal_tabs = {
    criminal_latter_approval_tabs: [
        { path: 'criminal-record-kh', label: 'ព្រឹត្តិបត្រភាសាខ្មែរ', key: 'criminal-record-kh' },
        { path: 'criminal-record-fr', label: 'ព្រឹត្តិបត្រភាសាបារាំង', key: 'criminal-record-fr' },
        { path: 'criminal-record-en', label: 'ព្រឹត្តិបត្រភាសាអង់គ្លេស', key: 'criminal-record-en' },
    ],

    criminal_record_approval_by_folder_tabs_input_number: [
        { path: 'group-listing-input-number', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', key: 'group-listing' },
        { path: 'group-listing-template-input-number', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', key: 'group-listing-template-input-number' },
        { path: 'group-listing-template-display-all', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោសទាំងអស់', key: 'group-listing-template-display-all' },
    ],

    public_applications: [
        { path: '/apply/pending', label: 'ដាក់សំណើ', key: 'all' },
    ],

    internal_process_applications: [
        { path: '/apply/all', label: 'ពាក្យស្នើសុំ', key: 'all' },
    ],

    verify_mol: [
      { path: '/mol/paid', label: 'ពាក្យស្នើសុំ', key: 'paid' },
      { path: '/mol/done', label: 'បានផ្ដល់និទ្ទេសរួចរាល់', key: 'done' },
    ],

    folder_criminal: [
        { path: '/criminal-record/folder/confirm/all', label: 'ពាក្យស្នើសុំ', key: 'all' },
    ],

    folder_criminal_un_classify: [
        { path: '/criminal-record/folder/out-of-folder/all', label: 'ពាក្យស្នើសុំ', key: 'all' },
    ],



    internal_group_request_form: [
        { path: '/group-listing/all', label: 'បញ្ជីក្រុម', key: 'all' },
    ],
    criminal_latter: [
        { path: '/criminal-record/criminal-latter/', label: 'មិនទាន់ចុះលេខ', key: 'incompleted' },
        { path: '/criminal-record/criminal-latter/', label: 'បានចុះលេខ', key: 'done' },
        { path: '/criminal-record/criminal-latter/', label: 'បានដករួចរាល់', key: 'released' },
    ],

    criminal_latter_input_number: [
        { path: '/criminal-record/criminal-latter/', label: 'មិនទាន់ចុះលេខ', key: 'APPROVED' },
        { path: '/criminal-record/criminal-latter/', label: 'បានចុះលេខ', key: 'RECEIVED' },
        { path: '/criminal-record/criminal-latter/', label: 'បានដករួចរាល់', key: 'DONE' },
        // { path: '/criminal-record/criminal-latter/', label: 'បានដករួចរាល់',key:'released' },
    ],


    applications: [
        { path: '/apply/officer', label: 'ពាក្យស្នើសុំផ្ទាល់', key: 'officer' },
        { path: '/apply/online', label: 'ពាក្យស្នើសុំតាម Online', key: 'online' },
    ],
    online: [
        { path: '/apply-online/all', label: 'ពាក្យស្នើសុំ', key: 'all' },
    ],
    geo_provinces: [
        { path: '/provinces', label: 'រាជធានី/ខេត្ត', key: 'provinces' },
    ],
    geo_district: [
        { path: '/provinces', label: 'ស្រុក/ខណ្ឌ', key: 'provinces' },
    ],
    geo_commune: [
        { path: '/provinces', label: 'ឃុំ/សង្កាត់', key: 'provinces' },
    ],
    geo_village: [
        { path: '/provinces', label: 'ភូមិ', key: 'provinces' },
    ],
    approval: [
        { path: '/approval/all', label: 'ទូទៅ', key: 'pending' },
        { path: '/approval/urgent', label: 'លិខិតបន្ទាន់', key: 'urgent' },
        { path: '/approval/approved', label: 'អនុម័ត', key: 'approved' },
    ],
    request_latter: [
        { path: '/approval/pending', label: 'ពាក្យស្នើសុំ', key: 'pending' },
        { path: '/approval/urgent', label: 'ពាក្យស្នើសុំបន្ទាន់', key: 'urgent' },
        { path: '/approval/approved', label: 'ដាក់អនុម័ត', key: 'approved' },
    ],
    citizen_nationality: [
        { path: '/profile/khmer', label: 'ជនជាតិខ្មែរ', key: 'khmer' },
        { path: '/profile/foreigner', label: 'ជនជាតិបរទេស', key: 'foreigner' },
    ],
    criminal_record_tabs: [
        { path: '/approval/criminal-record', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', key: 'criminal-record' },
        // { path: '/approval/profile', label: 'ប្រវត្តិរូបសង្ខេប', key: 'profile' },
        // { path: '/approval/comment-decree-guilty', label: 'កំណត់បង្ហាញ', key: 'comment-decree-guilty' },
        // { path: '/approval/letter3', label: 'ព្រឹត្តិបត្រលេខ ៣', key: 'letter3' },
        { path: '/approval/attachments', label: 'ឯកសារយោង', key: 'attachments' },
    ],

    // MOD completed records are already issued, so they also expose the printed bulletin
    criminal_record_mod_completed_tabs: [
        { path: '/approval/criminal-record', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', key: 'criminal-record' },
        { path: '/approval/attachments', label: 'ឯកសារយោង', key: 'attachments' },
        { path: '/approval/bulletin', label: 'ព្រឹត្តិបត្រ', key: 'bulletin' },
    ],

    criminal_record_verify_tabs: [
      { path: '/approval/criminal-record', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', key: 'criminal-record' },
    //   { path: '/approval/profile', label: 'ប្រវត្តិរូបសង្ខេប', key: 'profile' },
    //   { path: '/approval/comment-decree-guilty', label: 'កំណត់បង្ហាញ', key: 'comment-decree-guilty' },
      // { path: '/approval/letter3', label: 'ព្រឹត្តិបត្រលេខ ៣', key: 'letter3' },
      { path: '/approval/attachments', label: 'ឯកសារយោង', key: 'attachments' },
  ],

    criminal_record_approval_by_folder_tabs: [
        { path: '/approval/group-listing', label: 'បញ្ជីលេខរៀង', key: 'group-listing' },
        { path: '/approval/group-listing-template', label: 'កំណត់បង្ហាញ', key: 'group-listing-template' },
        // { path: '/approval/group-listing-template-display-all', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោសទាំងអស់', key: 'group-listing-template-display-all' },
    ],
    criminal_record_approval_tabs: [
        { path: 'criminal-record-kh', label: 'ព្រឹត្តិបត្រភាសាខ្មែរ', key: 'criminal-record-kh' },
        { path: 'criminal-record-fr', label: 'ព្រឹត្តិបត្រភាសាបារាំង', key: 'criminal-record-fr' },
        { path: 'criminal-record-en', label: 'ព្រឹត្តិបត្រភាសាអង់គ្លេស', key: 'criminal-record-en' },
        { path: 'application', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', key: 'application' },
        { path: 'profile', label: 'ប្រវត្តិរូបសង្ខេប', key: 'profile' },
        { path: 'attachments', label: 'ឯកសារយោង', key: 'attachments' },
    ],
    nationality: [
        { path: '/natinalities', label: 'សញ្ជាតិ', key: 'natinalities' },
    ],
    criminal_record_public_tabs: [
        { path: 'criminal-record', label: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', key: 'criminal-record' },
        { path: 'profile', label: 'ប្រវត្តិរូបសង្ខេប', key: 'profile' },
        { path: 'attachments', label: 'ឯកសារយោង', key: 'attachments' },
    ],
    add_nationality: [
        { path: '/nationalities', label: 'សញ្ជាតិ', key: 'nationalities' },
    ],

    public_holiday: [
        { path: '/criminal-record/applications/public-holidays', label: 'កាលវិភាគ', key: 'public-holidays' },
    ],

    payment_potion: [
        { path: '/criminal-record/applications/payment-option', label: 'ទាំងអស់', key: 'payment-option' },
    ],

    embassy: [
        { path: '/criminal-record/applications/embassy', label: 'ទាំងអស់', key: 'embassy' },
    ],

    
    crime_rec_cate: [
        { path: '/criminal-record-categories', label: 'ប្រភេទព្រឹត្តប័ត្រ', key: 'criminal-record-categories' },
    ],
    crime_note: [
        { path: '/document-notes', label: 'ចំណារ', key: 'document-notes' },
    ],
    crime_tutorials: [
        { path: '/', label: 'សំណួរ-ចម្លើយ', key: 'faqs' },
        { path: '/', label: 'ឯកសារ', key: 'documents' },
        { path: '/', label: 'វីដេអូ', key: 'videos' },
    ],

    receive_folder: [
      { path : '/',label : 'មិនទាន់បានទទួល',key : 'list'},
      { path : '/',label : 'ទទួលរួចរាល់',key : 'received'},
    ],

    internal_process_approval: [
      { path : 'approval',label : 'ស្នើអនុម័ត',key : 'approval'},
      { path : 'approved',label : 'អនុម័តរួចរាល់',key : 'approved'},
    ],

    internal_process_reject: [
      { path : 'rejected',label : 'បដិសេធ',key : 'rejected'},
    ],

    internal_process_issued: [
      { path : 'issued',label : 'ចេញព្រឹត្តិបត្រ',key : 'issued'},
    ],

    digital_issued_details:[
      { path : 'bulletin',label : 'ព្រឹត្តិបត្រ',key : 'bulletin'},
    ],

    digital_application_details:[
      { path : 'application',label : 'ពាក្យស្នើសុំ',key : 'application'},
      { path : 'attachments',label : 'ឯកសារភ្ជាប់',key : 'attachments'},
    ]
}


export const DOCUMENT_FLOW_CATEGORY = {
    normal:{key:1, name: "Normal"},
    digital:{key:2, name: "Digital"}
}
// each letter number counter lives in its own doc: settings/{key}
export const CRIMINAL_LATTER_NUMBER_TYPES = [
    { key: 'letter1', name: 'ព្រឹត្តិបត្រលេខ ១', application_type_key: 1 },
    { key: 'letter2', name: 'ព្រឹត្តិបត្រលេខ ២', application_type_key: 2 },
    { key: 'letter3_business', name: 'ព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច', application_type_key: 3 },
]
