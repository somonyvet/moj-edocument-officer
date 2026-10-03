
export const tabs = {
    hr_officers: [
        { path: '', label: 'ត្រូវពិនិត្យ', key: 'all' },
        { path: '', label: 'បានអនុម័ត', key: 'confirm' },
        { path: '', label: 'កំពុងព្រៀង', key: 'draft' },
    ],
    hr_officers_listing: [
        { path: '', label: 'បញ្ជីមន្ត្រី', key: 'listing' },
    ],
    inbox: [
        { path: '', label: 'សំណើឯកភាព', key: 'all' },
        { path: '', label: 'ឯកសារបន្ទាន់', key: 'urgent' },
        { path: '', label: 'បានឯកភាព', key: 'confirm' },
    ],
    docIn: [
        { path: '', label: 'ទាំងអស់', key: 'all' },
        { path: '', label: 'ឯកសារចូលបន្ទាន់', key: 'urgent' },
        { path: '', label: 'ឯកសារឆ្លើយតប', key: 'report' },
    ],
    urgent: [
        { path: '', label: 'បញ្ជី', key: 'all' },
    ],
    pined: [
        { path: '', label: 'បញ្ជី', key: 'all' },
    ],
    inBoxed: [
        { path: '', label: 'បញ្ជី', key: 'all' },
    ],
    myFiles: [
        { path: '', label: 'បញ្ជី', key: 'all' },
        // { path: '', label: 'កំពុងត្រួតពិនិត្យ', key: 'in_progress' },
        { path: '', label: 'បានពិនិត្យ និងឯកភាព', key: 'approved' },
        // { path: '', label: 'មោឃៈ', key: 'void' },
        // { path: '', label: 'បានបិទបញ្ចប់', key: 'done' },
    ],
    archived: [
        { path: '', label: 'បញ្ជី', key: 'all' },
    ],
    rejected: [
        { path: '', label: 'បញ្ជី', key: 'all' },
    ],

    document_tabs: [
        { path: '/apps/general-department', label: 'មតិ', key: 'comments' },
        { path: '/apps/general-department', label: 'ស្ថាប័នទទួលអនុវត្ត', key: 'workplaces' },
        { path: '/apps/general-department', label: 'ឯកសារធ្វើក្នុងនាម', key: 'latter-head' },
        { path: '/apps/general-department', label: 'ព័ត៌មាន', key: 'information' },
    ],
    document_tabs_no_task: [
        { path: '/apps/general-department', label: 'មតិ', key: 'comments' },
        { path: '/apps/general-department', label: 'ឯកសារធ្វើក្នុងនាម', key: 'latter-head' },
        { path: '/apps/general-department', label: 'ព័ត៌មាន', key: 'information' },
    ],


    document_tabs_inbox: [
        { path: '/apps/general-department', label: 'មតិ', key: 'comments' },
        { path: '/apps/general-department', label: 'គណនីមានសិទ្ធិលើឯកសារ', key: 'members' },
        { path: '/apps/general-department', label: 'ព័ត៌មាន', key: 'information' },
    ],

    document_tabs_preview: [
        { path: '/apps/general-department', label: 'មតិ', key: 'comments' },
        { path: '/apps/general-department', label: 'ស្ថាប័នទទួលអនុវត្ត', key: 'workplaces' },
        { path: '/apps/general-department', label: 'ព័ត៌មាន', key: 'information' },
    ],


    generalDepartment: [
        { path: '/apps/general-department', label: 'តារាងទិន្នន័យ' },
    ],
    department: [
        { path: '/apps/department/listing', label: 'តារាងទិន្នន័យ' },
        { path: '/apps/department/hierarchy', label: 'រចនាសម្ព័ន្ធ' },
    ],
    officers: [
        { path: '/apps/officers', label: 'តារាងទិន្នន័យ' },
    ],
    user_role: [
        { path: '/apps/user-role', label: 'តួនាទី' },
    ],

    templates: [
        { path: '/apps/templates/data', label: 'តារាងទិន្នន័យ' },
        // { path: '/apps/templates/documents', label: 'ឯកសារ' },
    ],
    ranking: [
        { path: '/apps/ranking', label: 'តារាងទិន្នន័យ' },
    ],
    managementLevel: [
        { path: '/apps/management-level', label: 'តារាងទិន្នន័យ' },
    ],
    ecosystem: [
        { path: '/apps/ecosystem', label: 'តារាងទិន្នន័យ' },
    ],
    approveDoc: [
        { path: '/document-panel-lists/not_yet_approved_doc', label: 'ឯកសារមិនទាន់ឯកភាព' },
        { path: '/document-panel-lists/already_approved_doc', label: 'ឯកសារបានឯកភាព' },
    ],
    docApproval: [
        { path: '/workplace/approval-documents', label: 'មិនទាន់ឯកភាព', icon: 'edit' },
        { path: '/workplace/approved-documents', label: 'បានឯកភាព', icon: 'task_alt' },
    ],
    positions: [
        { path: '/apps/positions', label: 'តារាងទិន្នន័យ' },
    ],
    visa_types: [
        { path: '/apps/visa_types', label: 'តារាងទិន្នន័យ' },
    ],
    suppliers: [
        { path: '/apps/supplier', label: 'តារាងទិន្នន័យ' },
    ],
    posts: [
        { path: '/apps/post', label: 'តារាងទិន្នន័យ' },
    ],
    stockAdjustment: [
        { path: '/apps/stock-adjustment/all', label: 'ទិន្នន័យទាំងអស់' },
        { path: '/apps/stock-adjustment/draft', label: 'ទិន្នន័យព្រាង' },
        { path: '/apps/stock-adjustment/submitted', label: 'ទិន្នន័យបានបញ្ចប់' },
    ],
    remarks: [
        { path: '/apps/remark', label: 'តារាងទិន្នន័យ' },
    ],
    category: [
        { path: '/apps/category', label: 'តារាងទិន្នន័យ' },
    ],
    sectors: [
        { path: '/apps/sectors', label: 'តារាងទិន្នន័យ' },
    ],
    institutions: [
        { path: '/apps/institutions', label: 'ស្ថាប័ន' },
    ],
    geodata: [
        { path: '/apps/geo', label: 'តារាងបញ្ជី' },
    ],
    settings: [
        { path: '/apps/settings', label: 'ប្រព័ន្ធ' },
    ],

    documents: [
        { path: '/docs', label: 'ឯកសារទាំងអស់', label_en: 'All Documents', key: 'docs' },
        { path: '/approved', label: 'បានឯកភាព', label_en: 'Signed', key: 'approved' },
        { path: '/void', label: 'មោឃៈ', label_en: 'Rejected', key: 'void' },
        { path: '/final', label: 'ឯកសារបានបិទបញ្ចប់', label_en: 'Final', key: 'final' },
    ],
    documentNotedTab: [
        { path: '/inbox/tasks', label: 'បញ្ជីឯកសារចូល', label_en: 'Documents', key: 'docs' },
        { path: '/inbox/noted', label: 'របាយការណ៍ឯកសារចូល', label_en: 'Reports', key: 'reports' },
    ],
    mmeProgram: [
        { path: ``, label: 'ទាំងអស់', key: 'All' },
    ],
    mmeYearProgram: [
        { path: '/mme/settings/data/year-program', label: 'ទាំងអស់' },
    ],
    mmeSourceBudget: [
        { path: '/apps/source-budget', label: 'ទាំងអស់' },
    ],

    mmeSubProgram: [
        { path: ``, label: 'ទាំងអស់', key: 'All' }
    ],

    documentPreviewTab: [
        { key: 1, path: 'comments', label: 'មតិ' },
        { key: 2, path: 'workplace', label: 'ស្ថាប័នទទួលអនុវត្ត' },
        { key: 3, path: 'information', label: 'ព័ត៌មាន' },
    ],

    planingCategory: [
        { path: '/mme/settings/data/planing-category', label: 'ទាំងអស់' },
    ],
    planingAchievement: [
        { path: '/mme/settings/data/achievement-status', label: 'ទាំងអស់' },
    ],

    quarter: [
        { path: '/mme/settings/data/time-scope', label: 'តារាងទិន្នន័យ' },
    ],
    working_hour: [
        { path: '/hr/officers/working-hour', label: 'ទាំងអស់' },
    ],
    missions: [
        { path: '/hr/officers/missions', label: 'ទាំងអស់' },
    ],

    criminalApplication: [
        { path: '/workplace/approval-documents', label: 'ពាក្យស្នើសុំ', key: 'apply' },
        { path: '/workplace/approved-documents', label: 'ផ្ដល់ស្នាមម្រាមដៃ', key: 'submitted' },
    ],
    applicationPayment: [
        { path: '/criminal-record/applications/application-payment/apply', label: 'ផ្ដល់ស្នាមម្រាមដៃរួច', key: 'apply' },
        { path: '/criminal-record/applications/application-payment/paid', label: 'បង់ប្រាក់រូច', key: 'paid' },
    ],

    process_doc_online: [
      { path: '/criminal-record/applications/payment-online/paid', label: 'បង់ប្រាក់រួច', key: 'paid' },
      { path: '/criminal-record/applications/payment-online/paid-today', label: 'គិតត្រឹមម៉ោងធ្វើការថ្ងៃនេះ', key: 'paid-today' },
      { path: '/criminal-record/applications/payment-online/process', label: 'ព្រីនរួច', key: 'process' },
    ],

    applicationOversea: [
      { path: '/criminal-record/applications/application-oversea/paid', label: 'បង់ប្រាក់រួច', key: 'paid' },
    //   { path: '/criminal-record/applications/application-oversea/decree', label: 'ដាក់និទ្ទេសរួច', key: 'decree' },
      { path: '/criminal-record/applications/application-oversea/done', label: 'រៀបចំរួចរាល់', key: 'done' },
    ],

    applicationPaymentMol: [
      { path: '/criminal-record/applications/mol-payment/apply', label: 'ដាក់ស្នើ', key: 'apply' },
      { path: '/criminal-record/applications/mol-payment/paid', label: 'បង់ប្រាក់រូច', key: 'paid' },
    ],

    data_entry_input_data: [
      { path: '/criminal-record/applications/apply-direct/unfill', label: 'មិនទាន់បញ្ចូលព័ត៌មាន', key: 'unfill' },
      { path: '/criminal-record/applications/apply-direct/fill', label: 'បញ្ចូលព័ត៌មានរួច', key: 'fill' },
      { path: '/criminal-record/applications/apply-direct/fill-decree', label: 'ផ្ដល់និទ្ទេសរួច', key: 'fill-decree' },
    ],

    criminalReviewApplication: [
      { path: '/criminal-record/applications/apply-online/unverified', label: 'មិនទាន់ពិនិត្យ', key: 'unverified' },
      { path: '/criminal-record/applications/apply-online/verified', label: 'ពិនិត្យរួចរាល់', key: 'verified' },
      { path: '/criminal-record/applications/apply-online/all', label: 'ទាំងអស់', key: 'all' },

    ],

    letter3InputPrint: [
      { path: '/criminal-record/applications/letter3-input-print/fill', label: 'បំពេញរួច', key: 'fill' },
      // { path: '/criminal-record/applications/letter3-input-print/create', label: 'បំពេញ', key: 'create' },
    ],

    laborEntry: [
      { path: '/criminal-record/applications/bulletin-list/all', label: 'ទាំងអស់', key: 'all' },
      { path: '/criminal-record/applications/bulletin-list/labor', label: 'ក្រសួងការងារ', key: 'labor' },
      { path: '/criminal-record/applications/bulletin-list/assistant', label: 'ឯកឧត្តមរដ្ឋលេខាធិការ', key: 'assistant' },
    ],

    embassyUser: [
      { path: '/criminal-record/applications/bulletin-list/all', label: 'ទាំងអស់', key: 'all' },
      { path: '/criminal-record/applications/bulletin-list/embassy-withdraw', label: 'ដកព្រឹត្តិបត្រ', key: 'embassy-withdraw' },
      { path: '/criminal-record/applications/bulletin-list/embassy-done', label: 'ដករួចរាល់', key: 'embassy-done' },
    ],
    createEmbassyAccount: [
      { path: '', label: 'បញ្ជី', key: 'all' },
    ],

    decrees1: [
        { path: '/criminal-record/decree-record/application/letter1/decree', label: 'ពាក្យស្នើសុំទាំងអស់', key: 'decree' },
        { path: '/criminal-record/decree-record/application/letter1/reviewed', label: 'បានពិនិត្យរួចរាល់', key: 'reviewed' },
        { path: '/criminal-record/decree-record/application/letter1/done', label: 'ចុះនិទ្ទេសរួច', key: 'done' },
        { path: '/criminal-record/decree-record/application/letter1/rejected', label: 'បដិសេធត្រឡប់មកវិញ', key: 'rejected' },
    ],

    decrees2: [
        { path: '/criminal-record/decree-record/application/letter2/decree', label: 'ពាក្យស្នើសុំទាំងអស់', key: 'decree' },
        { path: '/criminal-record/decree-record/application/letter2/reviewed', label: 'បានពិនិត្យរួចរាល់', key: 'reviewed' },
        { path: '/criminal-record/decree-record/application/letter2/done', label: 'ចុះនិទ្ទេសរួច', key: 'done' },
        { path: '/criminal-record/decree-record/application/letter2/rejected', label: 'បដិសេធត្រឡប់មកវិញ', key: 'rejected' },
    ],

    decrees2Mod: [
        { path: '/criminal-record/decree-record/application/letter2-mod/decree', label: 'ពាក្យស្នើសុំទាំងអស់', key: 'decree' },
        { path: '/criminal-record/decree-record/application/letter2-mod/reviewed', label: 'បានពិនិត្យរួចរាល់', key: 'reviewed' },
        { path: '/criminal-record/decree-record/application/letter2-mod/done', label: 'ចុះនិទ្ទេសរួច', key: 'done' },
        { path: '/criminal-record/decree-record/application/letter2-mod/rejected', label: 'បដិសេធត្រឡប់មកវិញ', key: 'rejected' },
    ],

    decrees3: [
        { path: '/criminal-record/decree-record/application/letter3/decree', label: 'ពាក្យស្នើសុំទាំងអស់', key: 'decree' },
        { path: '/criminal-record/decree-record/application/letter3/reviewed', label: 'បានពិនិត្យរួចរាល់', key: 'reviewed' },
        { path: '/criminal-record/decree-record/application/letter3/done', label: 'ចុះនិទ្ទេសរួច', key: 'done' },
    ],

    decrees3General: [
        { label: '១២ថ្ងៃ', key: 'period12', period: 12 },
        { label: '២០ថ្ងៃ', key: 'period20', period: 20 },
    ],

    decrees3Mol: [
        { path: '/criminal-record/decree-record/application/letter3-mol/decree', label: 'ពាក្យស្នើសុំទាំងអស់', key: 'decree' },
        { path: '/criminal-record/decree-record/application/letter3-mol/reviewed', label: 'បានពិនិត្យរួចរាល់', key: 'reviewed' },
        { path: '/criminal-record/decree-record/application/letter3-mol/done', label: 'ចុះនិទ្ទេសរួច', key: 'done' },
    ]
}
