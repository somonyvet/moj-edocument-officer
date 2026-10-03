export const SYS_MODULES = {
  SWOTIFY: [
    {
      key: 'marketplace', name: 'Marketplace', module_name: `swotify`, icon: `storefront`, router: `marketplace`,
      modules: [
        { key: 'listing', name: 'Listing', icon: `basket`, router: `listing` },
        { key: 'menu', name: 'Menu', icon: `grid`, router: `menu` },
        { key: 'features', name: 'Features', icon: `flower`, router: `features` },
        { key: 'departments', name: 'Departments', icon: `file-tray-full`, router: `departments` },
        { key: 'categories', name: 'Categories', icon: `color-palette`, router: `categories` },
        { key: 'variations', name: 'Variations', icon: `color-fill`, router: `variation` },
      ]
    },
    {
      key: 'sales', name: 'Sales', module_name: `swotify`, icon: `receipt`, router: `sales`,
      modules: [
        { key: 'marketplace', name: 'Marketplace', icon: `git-merge`, router: `chart_of_accounts` },
        { key: 'chart_of_accounts', name: 'Chart of Accounts', icon: `git-merge`, router: `chart_of_accounts` },
      ]
    },
    {
      key: 'purchases', name: 'Purchases', module_name: `swotify`, icon: `cart`, router: `purchases`,
      modules: [
        { key: 'marketplace', name: 'Marketplace', icon: `git-merge`, router: `chart_of_accounts` },
        { key: 'chart_of_accounts', name: 'Chart of Accounts', icon: `git-merge`, router: `chart_of_accounts` },
      ]
    },
    {
      key: 'inventory', name: 'Inventory', module_name: `swotify`, icon: `file-tray-stacked`, router: `inventory`,
      modules: [
        { key: 'marketplace', name: 'Marketplace', icon: `git-merge`, router: `chart_of_accounts` },
        { key: 'chart_of_accounts', name: 'Chart of Accounts', icon: `git-merge`, router: `chart_of_accounts` },
      ]
    },
    {
      key: 'accountant', name: 'Accountants', module_name: `swotify`, icon: `briefcase`, router: `accountants`,
      modules: [
        { key: 'petty-cash', name: 'Petty Cash', icon: `document-text`, router: `petty-cash` },
        { key: 'noncurrent-assets', name: 'Noncurrent Assets', icon: `desktop`, router: `noncurrent-assets` },
        { key: 'journal-entry', name: 'Journal Entry', icon: `duplicate`, router: `journal-entry` },
        { key: 'account-list', name: 'Account List', icon: `keypad`, router: `account-list` },
        { key: 'general-journal', name: 'General Journal', icon: `reader`, router: `general-journal` },
        { key: 'general-ledger', name: 'General Ledger', icon: `podium`, router: `general-ledger` },
        { key: 'chart-of-accounts', name: 'Chart of Accounts', icon: `extension-puzzle`, router: `chart-of-accounts` },
      ]
    },

  ],

  CRIMINAL: [
    {
      key: 'public_applications', name: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', module_name: `ecosystem`, icon: `cloudy`, router: `criminal-record`,
      modules: [
        { key: 'criminal-record', name: 'សំណើសុំព្រឹត្តិបត្រ', icon: `reader`, router: `criminal-record` },
        { key: 'profile', name: 'ព័ត៌មានផ្ទាល់ខ្លួន', icon: `person`, router: `profile` },
        { key: 'support', name: 'ជំនួយ', icon: `help-circle`, router: `support` },
      ]
    },
    {
      key: 'applications', name: 'សំណើរសុំព្រឹត្តិបត្រថ្កោលទោស', module_name: `criminal-record`, icon: `cloudy`, router: `applications`, permission_key: ['criminal_applications_office', 'recipient', 'judgment_list_office', 'classify_folder', 'print_and_notify', 'approval', 'overseas_embassy', 'overseas_management', 'letter_1', 'letter_2'],
      modules: [
        { key: 'bulletin-list', name: 'បញ្ជីសំណើរសុំព្រឹត្តិបត្រ', icon: `file-tray-stacked`, router: `bulletin-list`, dataEntry: true },
        { key: 'criminal-record-apply', name: 'ស្នើអនុម័ត', icon: `document-text`, router: `apply`, dataEntry: true },
        { key: 'criminal-record-confirm', name: 'ផ្ដល់ស្នាមម្រាមដៃនិងបង់ប្រាក់', icon: `finger-print`, router: `confirm`, dataEntry: true },
        { key: 'approved', name: 'អនុម័តលើព្រឹត្តិបត្រ', icon: `shield-checkmark`, router: `approved`, dataEntry: true },
        { key: 'criminal-record-rejected', name: 'បដិសេធ', icon: `close-circle`, router: `rejected`, dataEntry: true },
        { key: 'criminal-record-completed', name: 'ចេញព្រឹត្តិបត្រ', icon: `checkmark-done-circle`, router: `completed`, dataEntry: true },

        { key: 'bulletin-list', name: 'បញ្ជីសំណើរសុំព្រឹត្តិបត្រ', icon: `file-tray-stacked`, router: `bulletin-list`, permission_key: ['criminal_applications_office', 'recipient', 'judgment_list_office', 'classify_folder', 'print_and_notify', 'approval', 'overseas_embassy', 'overseas_management', 'admin_mol_request', 'admin_mod_request'] },
        { key: 'letter1', name: 'ព្រឹត្តិបត្រថ្កោលទោសលេខ ១', icon: `bookmark`, router: `letter1`, permission_key: ['letter_2'] },
        { key: 'letter2', name: 'ព្រឹត្តិបត្រថ្កោលទោសលេខ ២', icon: `ribbon`, router: `letter2`, permission_key: ['letter_2'] },
        { key: 'letter3-business', name: 'ព្រឹត្តិបត្រថ្កោលទោសលេខ ៣ ធុរកិច្ច', icon: `briefcase`, router: `letter3-business`, permission_key: ['letter_2'] },
        { key: 'application-payment', name: 'បង់ប្រាក់', icon: `cash`, router: `application-payment`, permission_key: ['recipient'] },
        { key: 'mol-payment', name: 'បង់ប្រាក់ពលករ', icon: `wallet`, router: `mol-payment`, permission_key: ['recipient'] },
        { key: 'assistant-payment', name: 'ឯកឧត្តមរដ្ឋលេខាធិការ', icon: `medal`, router: `assistant-payment`, permission_key: ['recipient'] },
        { key: 'payment-online', name: 'បង់ប្រាក់ Online', icon: `globe`, router: `payment-online`, permission_key: ['recipient', 'criminal_applications_office_online'] },
        { key: 'letter3-input-print', name: 'បញ្ចូលបោះពុម្ព', icon: `print`, router: `letter3-input-print`, permission_key: ['criminal_applications_office'] },

        // { key: 'apply-direct', name: 'បញ្ចូលព្រឹត្តិបត្រលេខ ៣', icon: `documents`, router: `apply-direct`, permission_key: ['criminal_applications_office_online'] },
        { key: 'print-verify', name: 'ចុះថ្ងៃផុតកំណត់', icon: `barcode`, router: `print-verify`, permission_key: ['print_and_notify'] },
        { key: 'apply-in-place', name: 'ផ្ដល់ស្នាមម្រាមដៃ', icon: `hand-left`, router: `apply-in-place`, permission_key: ['criminal_applications_office_online'] },
        { key: 'apply-online', name: 'ពិនិត្យពាក្យ', icon: `newspaper`, router: `apply-online`, permission_key: ['criminal_applications_office_online'] },
        { key: 'draft', name: 'កំពុងព្រៀងសំណើរសុំ', icon: `create`, router: `draft`, path: `list`, permission_key: ['criminal_applications_office_online'] },

        { key: 'group-users', name: 'សិទ្ធិប្រើប្រាស់', icon: `key`, router: `group-users`, admin: true },
        { key: 'public-holidays', name: 'ថ្ងៃឈប់​សំរាក', icon: `calendar-number`, router: `public-holidays`, permission_key: [] },
        { key: 'geo', name: 'រាជធានី/ខេត្ត', icon: `map`, router: `geo`, permission_key: ['criminal_applications_office_online'] },
        { key: 'nationalities', name: 'សញ្ជាតិ', icon: `flag`, router: `nationalities`, permission_key: ['criminal_applications_office_online'] },
        { key: 'criminal-record-categories', name: 'ប្រភេទព្រឹត្តប័ត្រ', icon: `extension-puzzle`, router: `criminal-record-categories`, permission_key: ['criminal_applications_office_online'] },
        { key: 'document-notes', name: 'ចំណារ', icon: `text`, router: `document-notes`, permission_key: [] },
        { key: 'settings', name: 'ការកំណត់', icon: `settings`, router: `settings`, admin: true },
        { key: 'tutorial', name: 'របៀបប្រើប្រាស់', icon: `information-circle`, router: `tutorial`, permission_key: ['criminal_applications_office_online'] },

        { key: 'payment-option', name: 'ជម្រើសបង់ប្រាក់', icon: `bag-add`, router: `payment-option`, permission_key: [] },
        { key: 'oversea-report', name: 'របាយការណ៍ដកព្រឹត្តិបត្រ', icon: `airplane`, router: `oversea-report`, permission_key: ['overseas_embassy'] },
        { key: 'applications-oversea', name: 'បញ្ជីស្នើសុំក្រៅប្រទេស', icon: `earth`, router: `applications-oversea`, permission_key: ['overseas_management'] },
        { key: 'oversea-user', name: 'គណនីស្ថានទូក', icon: `people`, router: `oversea-user`, permission_key: ['overseas_management'] },
        { key: 'embassy', name: 'ស្ថានទូត', icon: `business`, router: `embassy`, permission_key: ['criminal_applications_office_online', 'overseas_management'] },
        { key: 'payment-online-draft', name: 'កំពុងព្រៀង', icon: `hourglass`, router: `payment-online-draft`, permission_key: ['recipient', 'criminal_applications_office_online'] },
      ]
    },
    {
      key: 'decree', name: 'បញ្ជីថ្កោលទោស', module_name: `criminal-record`, icon: `duplicate`, router: `decree-record`, permission_key: ['judgment_list_office', 'admin_mod_request'],
      modules: [
        // { key: 'review', name: 'ពាក្យសំណើរសុំព្រឹត្តិបត្រ', icon: `reader`, router: `review` },
        // { key: 'mol', name: 'ពាក្យសំណើរពលករ', icon: `people-circle`, router: `mol` },
        // { key: 'assistant', name: 'ឯកឧត្តមរដ្ឋលេខាធិការ', icon: `flash`, router: `assistant` },
        // { key: 'approved', name: 'បានផ្ដល់និទ្ទេសរួចរាល់', icon: `sparkles`, router: `processing` },
        {
          key: 'application/letter1', name: 'ព្រឹត្តិបត្រលេខ ១', icon: `bookmark`, router: `application/letter1`, permission_key: ['judgment_list_office'],
          children: [
            { key: 'decree', name: 'ពាក្យស្នើសុំទាំងអស់', icon: `reader`, router: `application/letter1/decree` },
            { key: 'reviewed', name: 'បានពិនិត្យរួចរាល់', icon: `eye`, router: `application/letter1/reviewed` },
            { key: 'done', name: 'ចុះនិទ្ទេសរួច', icon: `checkmark-circle`, router: `application/letter1/done` },
            { key: 'rejected', name: 'បដិសេធត្រឡប់មកវិញ', icon: `close-circle`, router: `application/letter1/rejected` },
          ]
        },
        {
          key: 'application/letter2', name: 'ព្រឹត្តិបត្រលេខ ២', icon: `ribbon`, router: `application/letter2`, permission_key: ['judgment_list_office'],
          children: [
            { key: 'decree', name: 'ពាក្យស្នើសុំទាំងអស់', icon: `reader`, router: `application/letter2/decree` },
            { key: 'reviewed', name: 'បានពិនិត្យរួចរាល់', icon: `eye`, router: `application/letter2/reviewed` },
            { key: 'done', name: 'ចុះនិទ្ទេសរួច', icon: `checkmark-circle`, router: `application/letter2/done` },
            { key: 'rejected', name: 'បដិសេធត្រឡប់មកវិញ', icon: `close-circle`, router: `application/letter2/rejected` },
          ]
        },
        // {
        //   key: 'application/letter2-mod', name: 'ព្រឹត្តិបត្រលេខ ២ (ក្រសួងការពារជាតិ)', icon: `ribbon`, router: `application/letter2-mod`, permission_key: ['judgment_list_office', 'admin_mod_request'],
        //   children: [
        //     { key: 'decree', name: 'ពាក្យស្នើសុំទាំងអស់', icon: `reader`, router: `application/letter2-mod/decree` },
        //     { key: 'reviewed', name: 'បានពិនិត្យរួចរាល់', icon: `eye`, router: `application/letter2-mod/reviewed` },
        //     { key: 'done', name: 'ចុះនិទ្ទេសរួច', icon: `checkmark-circle`, router: `application/letter2-mod/done` },
        //     { key: 'rejected', name: 'បដិសេធត្រឡប់មកវិញ', icon: `close-circle`, router: `application/letter2-mod/rejected` },
        //   ]
        // },
        {
          key: 'application/letter3-business', name: 'ព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច', icon: `briefcase`, router: `application/letter3-business`, permission_key: ['judgment_list_office'],
          children: [
            { key: 'listing', name: 'ពាក្យស្នើសុំទាំងអស់', icon: `reader`, router: `application/letter3-business/listing` },
            { key: 'reviewed', name: 'បានពិនិត្យរួចរាល់', icon: `eye`, router: `application/letter3-business/reviewed` },
            { key: 'done', name: 'ចុះនិទ្ទេសរួច', icon: `checkmark-circle`, router: `application/letter3-business/done` },
            { key: 'rejected', name: 'បដិសេធត្រឡប់មកវិញ', icon: `close-circle`, router: `application/letter3-business/rejected` },
          ]
        },
        {
          key: 'application/letter3-mol', name: 'ព្រឹត្តិបត្រលេខ ៣ ពលករ', icon: `people`, router: `application/letter3-mol`, permission_key: ['judgment_list_office'],
          children: [
            { key: 'decree', name: 'ពាក្យស្នើសុំទាំងអស់', icon: `reader`, router: `application/letter3-mol/decree` },
            { key: 'reviewed', name: 'បានពិនិត្យរួចរាល់', icon: `eye`, router: `application/letter3-mol/reviewed` },
            { key: 'done', name: 'ចុះនិទ្ទេសរួច', icon: `checkmark-circle`, router: `application/letter3-mol/done` },
          ]
        },
        {
          key: 'application/letter3-general', name: 'ព្រឹត្តិបត្រលេខ ៣ ទូទៅ', icon: `earth`, router: `application/letter3-general`, permission_key: ['judgment_list_office'],
          children: [
            { key: 'decree', name: 'ពាក្យស្នើសុំទាំងអស់', icon: `reader`, router: `application/letter3-general/decree` },
            { key: 'reviewed', name: 'បានពិនិត្យរួចរាល់', icon: `eye`, router: `application/letter3-general/reviewed` },
            { key: 'done', name: 'ចុះនិទ្ទេសរួច', icon: `checkmark-circle`, router: `application/letter3-general/done` },
          ]
        },
      ]
    },
    {
      key: 'folder', name: 'បញ្ជីលេខរៀង', module_name: `criminal-record`, icon: `folder-open`, router: `folder`, permission_key: ['classify_folder'],
      modules: [
        { key: 'all', name: 'រៀបបញ្ជីលេខរៀង', icon: `folder`, router: `confirm` },
        { key: 'pending', name: 'មិនទាន់បញ្ចូលក្នុងបញ្ជី', icon: `file-tray`, router: `out-of-folder` },
      ]
    },
    {
      key: 'approval_folder', name: 'អនុម័តព្រឹត្តិបត្រថ្កោលទោស', module_name: `criminal-record`, icon: `receipt`, router: `approval`, permission_key: ['approval'],
      modules: [
        // { key: 'receive_folder', name: 'ទទួលបញ្ជីលេខរៀង', icon: `folder`, router: `receive-folder`, admin:false },
        // { key: '12Day', name: '១២ ថ្ងៃ', icon: `globe`, router: `12Day`, admin: false },
        // { key: '20Day', name: '២០ ថ្ងៃ', icon: `server`, router: `20Day`, admin: false },
        // { key: 'urgent', name: 'បន្ទាន់', icon: `alarm`, router: `urgent`, admin: true },
        // { key: 'workers', name: 'ពលករ', icon: `document-text`, router: `workers`, admin: true },
        // { key: 'approved', name: 'បានអនុម័ត', icon: `cube`, router: `approved`, admin: false },
        {
          key: 'digital_letter1', name: 'ព្រឹត្តិបត្រលេខ ១', icon: `bookmark`, router: `digital_letter1`, admin: false,
          children: [
            { key: 'approval', name: 'ស្នើអនុម័ត', icon: `reader`, router: `digital_letter1/approval` },
            { key: 'approved', name: 'អនុម័តរួចរាល់', icon: `checkmark-circle`, router: `digital_letter1/approved` },
            { key: 'rejected', name: 'បដិសេធ', icon: `close-circle`, router: `digital_letter1/rejected` },
            { key: 'issued', name: 'ចេញព្រឹត្តិបត្រ', icon: `print`, router: `digital_letter1/issued` },
          ]
        },
        {
          key: 'digital_letter2', name: 'ព្រឹត្តិបត្រលេខ ២', icon: `ribbon`, router: `digital_letter2`, admin: false,
          children: [
            { key: 'approval', name: 'ស្នើអនុម័ត', icon: `reader`, router: `digital_letter2/approval` },
            { key: 'approved', name: 'អនុម័តរួចរាល់', icon: `checkmark-circle`, router: `digital_letter2/approved` },
            { key: 'rejected', name: 'បដិសេធ', icon: `close-circle`, router: `digital_letter2/rejected` },
            { key: 'issued', name: 'ចេញព្រឹត្តិបត្រ', icon: `print`, router: `digital_letter2/issued` },
          ]
        },
        {
          key: 'digital_letter3', name: 'ព្រឹត្តិបត្រលេខ ៣ ធុរកិច្ច', icon: `briefcase`, router: `digital_letter3`, admin: false,
          children: [
            { key: 'approval', name: 'ស្នើអនុម័ត', icon: `reader`, router: `digital_letter3/approval` },
            { key: 'approved', name: 'អនុម័តរួចរាល់', icon: `checkmark-circle`, router: `digital_letter3/approved` },
            { key: 'rejected', name: 'បដិសេធ', icon: `close-circle`, router: `digital_letter3/rejected` },
            { key: 'issued', name: 'ចេញព្រឹត្តិបត្រ', icon: `print`, router: `digital_letter3/issued` },
          ]
        },

      ]
    },
    {
      key: 'reports',
      name: 'របាយការណ៍',
      module_name: `criminal-record`,
      icon: `print`,
      router: `reports`,
      permission_key: [
        'criminal_applications_office_online',
        'recipient',
        'judgment_list_office',
        'classify_folder',
        'mol_admin',
        'print_and_notify',
        'overseas_management',
        'admin_mol_request',
        'admin_mod_request',
        'ministry_of_defense'
      ],
      modules: [
        { key: 'confirm-form', name: 'ពិនិត្យពាក្យស្នើសុំ', icon: `reader`, router: `confirm-form`, permission_key: ['criminal_applications_office_online'] },
        { key: 'provide-fingerprint', name: 'ផ្ដល់ស្នាមមេដៃ', icon: `finger-print`, router: `provide-fingerprint`, permission_key: ['criminal_applications_office_online'] },
        { key: 'paid-form', name: 'បង់ប្រាក់រូច', icon: `card`, router: `paid-form`, permission_key: ['recipient'] },
        { key: 'paid-form-delivery', name: 'បង់ប្រាក់រូច និងមានដឹកជញ្ជួន', icon: `bicycle`, router: `paid-form-delivery`, permission_key: ['recipient'] },
        { key: 'paid-monthly-report', name: 'របាយការណ៍បង់ប្រាក់រូចប្រចាំខែ', icon: `wallet`, router: `paid-monthly-report`, permission_key: ['recipient'] },
        // { key: 'paid-form', name: 'ដាក់ស្នើតាមអនឡាញ បង់ប្រាក់រូច', icon: `card`, router: `apply-paid-form`, permission_key: ['recipient'] },
        { key: 'paid-online', name: 'បង់ប្រាក់តាមអនឡាញ', icon: `globe`, router: `paid-online`, permission_key: ['recipient', 'criminal_applications_office_online'] },
        { key: 'paid-online-process', name: 'បង់ប្រាក់តាមអនឡាញ និងបានបោះពុម្ពពាក្យស្នើសុំ', icon: `cloud-done`, router: `paid-online-process`, permission_key: ['recipient', 'criminal_applications_office_online'] },
        { key: 'verify-online-report', name: 'ផ្ទៀងផ្ទាត់របាយការណ៍', icon: `search`, router: `verify-online-report`, permission_key: ['recipient', 'criminal_applications_office_online'] },
        { key: 'decree-report-mol', name: 'ផ្ដល់និទ្ទេស + ពលករ', icon: `people`, router: `decree-report-mol`, permission_key: ['judgment_list_office', 'classify_folder'] },
        { key: 'decree-form', name: 'ផ្ដល់និទ្ទេស', icon: `create`, router: `decree-form`, permission_key: ['judgment_list_office', 'classify_folder'] },
        { key: 'decree-form-already-paid', name: 'រាយនាមបង់ប្រាក់រូច', icon: `book`, router: `decree-form-already-paid`, permission_key: ['judgment_list_office'] },
        { key: 'folder-done', name: 'បានដាក់ក្នុងបញ្ជីលេខរៀង', icon: `folder`, router: `folder-done`, permission_key: ['classify_folder'] },
        { key: 'daily-folder-report', name: 'របាយការណ៍ប្រចាំថ្ងៃ', icon: `calendar`, router: `daily-folder-report`, permission_key: ['classify_folder'] },
        { key: 'mol-submit-report', name: 'ពាក្យស្នើសុំពលករ', icon: `people-circle`, router: `mol-submit-report`, permission_key: ['mol_admin', 'admin_mol_request'] },
        { key: 'mod-submit-report', name: 'របាយការណ៍ពាក្យស្នើសុំ', icon: `people-circle`, router: `mod-submit-report`, permission_key: ['ministry_of_defense', 'admin_mod_request'] },
        { key: 'mol-paid-report', name: 'ពាក្យស្នើសុំពលករបង់ប្រាក់រូច', icon: `cash`, router: `mol-paid-report`, permission_key: ['admin_mol_request'] },
        { key: 'report-withdraw', name: 'របាយការណ៍ដក', icon: `download`, router: `report-withdraw`, permission_key: ['print_and_notify'] },
        { key: 'report-do-expire', name: 'របាយការណ៍ចុះថ្ងៃផុតកំណត់', icon: `barcode`, router: `report-do-expire`, permission_key: ['print_and_notify'] },
        { key: 'oversea-paid', name: 'បញ្ជីបានបង់លុយក្រៅប្រទេស', icon: `airplane`, router: `oversea-paid`, permission_key: ['overseas_management'] },
        { key: 'oversea-complete', name: 'បញ្ជីរៀបចំរួចរាល់', icon: `checkmark-done`, router: `oversea-complete`, permission_key: ['overseas_management'] },
        { key: 'oversea-withdraw', name: 'របាយការណ៍ដកក្រៅប្រទេស', icon: `earth`, router: `oversea-withdraw`, permission_key: ['overseas_management'] },
      ]
    },
    // {
    //   key: 'statistics', name: 'ស្ថិតិ', module_name: `criminal-record`, icon: `bar-chart`, router: `statistics`,
    //   modules: [
    //   ]
    // },
  ]
}
export const APPS = {
  size: 50,
  settingSize: 100,
  smallsize: 15,
  limitSD: 2,
  limitSD5: 4,
}
export const APP_CONFIG = {
  SIZE: 30,
  DEBOUNCE_TIME: 300,
}
export const APPS_SIZE = [
  { key: 10, text: '10' },
  { key: 30, text: '30' },
  { key: 60, text: '60' },
  { key: 100, text: '100' },
  { key: 1000, text: '1000' },
  { key: 5000, text: '5000' },
]

export const TEMPLATE_TYPES = {
  HS_CODE_TEMPLATE: { key: 'HS_CODE_TEMPLATE', name: "HS Code Template" }
}

export const MONTH_DATA = [
  { key: 91, kh: 'ត្រីមាស ទី១', name: 'Quarter', id: '91', order: 16 },
  { key: 92, kh: 'ឆមាស ទី១', name: 'Semester', id: '92', order: 15 },
  { key: 93, kh: 'រ.ប.ក ៩ខែ', name: 'Year', id: '93', order: 14 },
  { key: 94, kh: 'ឆ្នាំ', name: 'Year', id: '94', order: 13 },
  { key: 1, kh: 'មករា', name: 'January', id: '01', order: 12 },
  { key: 2, kh: 'កុម្ភះ', name: 'February', id: '02', order: 11 },
  { key: 3, kh: 'មិនា', name: 'March', id: '03', order: 10 },
  { key: 4, kh: 'មេសា', name: 'April', id: '04', order: 9 },
  { key: 5, kh: 'ឧសភា', name: 'May', id: '05', order: 8 },
  { key: 6, kh: 'មិថុនា', name: 'June', id: '06', order: 7 },
  { key: 7, kh: 'កក្កដា', name: 'July', id: '07', order: 6 },
  { key: 8, kh: 'សីហា', name: 'August', id: '08', order: 5 },
  { key: 9, kh: 'កញ្ញា', name: 'September', id: '09', order: 4 },
  { key: 10, kh: 'តុលា', name: 'October', id: '10', order: 3 },
  { key: 11, kh: 'វិច្ឆិកា', name: 'November', id: '11', order: 2 },
  { key: 12, kh: 'ធ្នូ', name: 'December', id: '12', order: 1 },
]

export const PARENT_PATH = [
  {
    key: 'my_files',
    name: 'បណ្ណសារដ្ឋាន',
    name_en: 'My Files',
    path: '/my_files'
  },
  {
    key: 'folders',
    name: 'បណ្ណសារដ្ឋាន',
    name_en: 'Folders',
    path: '/folders'
  }
]

export const FLOW_TYPE_OBJECT = {
  INCOMING: { key: 1, name_en: 'Incoming', name: 'ចរន្តឯកសារចូល' },
  INTERNAL: { key: 2, name_en: 'Internal', name: 'ចរន្តឯកសារផ្ទៃក្នុង' },
  OUTGOING: { key: 3, name_en: 'Outgoing', name: 'ចរន្តឯកសារចេញ' },
}

export const OFFICE_OR_OFFICER_OBJECT = {
  OFFICE: { key: 1, name_en: 'Office', name: 'ស្ថាប័នទទួលបន្ទុក' },
  OFFICER: { key: 2, name_en: 'Officer', name: 'មន្ត្រីរាជការ' },
}

export const PRIORITY_OBJECT = {
  NORMAL: { key: 1, name: 'ធម្មតា', name_en: 'Normal', icon: 'info' },
  URGENT: { key: 2, name: 'បន្ទាន់', name_en: 'Urgent', icon: 'warning' },
}
export const PRIORITY_OBJECT_ARR = Object.values(PRIORITY_OBJECT);


export const REPORT_PERIOD_OBJECT = {
  all: { key: 0.5, name: 'បង្ហាញទាំងអស់', name_en: 'all', route: 'all' },
  this_month: { key: 1, name: 'ខែនេះ', name_en: 'This month', route: 'this_month' },
  this_week: { key: 2, name: 'សប្តាហ៍នេះ', name_en: 'This week', route: 'this_week' },
  yesterday: { key: 3, name: 'ម្សិលមិញ', name_en: 'Yesterday', route: 'yesterday' },
  today: { key: 4, name: 'ថ្ងៃនេះ', name_en: 'Today', route: 'today' },
}

export const REPORT_PERIOD_OBJECT_ARRAY = Object.values(REPORT_PERIOD_OBJECT);

export const DOCUMENT_FEATURE = {
  signature: { key: 'signature', text: 'បានចុះហត្ថលេខា' },
  reject: { key: 'reject', text: 'មិនឯកភាព' },
  recent_documents: { key: 'recent_documents', text: 'ប្រវត្តិប្រើប្រាស់' },
  pinned_document: { key: 'pinned_document', text: 'ឯកសារទុកចំណាំ' },
}
export const DOCUMENT_FEATURE_ARRAY = Object.values(DOCUMENT_FEATURE)



export const DOCUMENT_NOTED_OBJECT = {
  all: { key: 0.5, name: 'កំណត់បង្ហាញទាំងអស់', name_en: 'All', route: 'all', color: '#fff' },
  hold: { key: 1, name: 'សេចក្តីព្រាង', name_en: 'Hold', route: 'hold', color: '#ffcc02' },
  released: { key: 2, name: 'ដាក់សំណើឯកភាព', name_en: 'Released', route: 'released', color: '#cc73e1' },
  approved: { key: 3, name: 'បានឯកភាព', name_en: 'Approved', route: 'approved', color: '#4bd964' },
  rejected: { key: 4, name: 'មិនឯកភាព', name_en: 'Rejected', route: 'rejected', color: '#ff3a30' },
  final: { key: 5, name: 'បិទបញ្ចប់', name_en: 'Final', route: 'final', color: '#007aff' },
}

export const DOCUMENT_NOTED_OBJECT_ARRAY = Object.values(DOCUMENT_NOTED_OBJECT);


export const DOCUMENT_ACTION_TYPE_OBJ = {
  REQUEST_FOR_APPROVAL: { key: 1, text: 'Request for approval', name: 'បានពិនិត្យ និងឯកភាព' },
  APPROVED: { key: 2, text: 'Approved', name: 'ចុះហត្ថលេខាឯកភាព' },
  REJECTED: { key: 3, text: 'Rejected', name: 'មិនឯកភាព' },
}


export const ACCOUNT_PERMISSION_OBJECT = {
  readOnly: { key: 1, name: 'បានតែមើលឯកសារ', name_en: 'Read Only', route: 'read-only', color: '#ffcc02' },
  canApproved: { key: 2, name: 'តម្រូវឲ្យចុះហត្ថលេខាឯកភាព', name_en: 'Approve', route: 'approve', color: '#4bd964' },
  canConfirm: { key: 3, name: 'ត្រួតពិនិត្យព័ត៌មានតែប៉ុណ្ណោះ', name_en: 'Confirm', route: 'confirm', color: '#007aff' },
}
export const ACCOUNT_PERMISSION_OBJECT_ARRAY = Object.values(ACCOUNT_PERMISSION_OBJECT);



export const WORKPLACE_FEATURES_OBJ = {
  all: { key: 'all', name: 'បង្ហាញទាំងអស់' },
  in_progress: { key: 'in_progress', name: 'កំពុងពិនិត្យនិងឯកភាព' },
  approved: { key: 'approved', name: 'បានឯកភាព' },
  void: { key: 'void', name: 'មោឃៈ' },
  done: { key: 'done', name: 'ឯកសារបានបិទបញ្ចប់' },
}
export const WORKPLACE_FEATURES_ARRAY = Object.values(WORKPLACE_FEATURES_OBJ)


export const DOCUMENT_TYPE_OBJECT = {
  MEMO: { key: 1, name: 'កំណត់បង្ហាញ', name_en: 'Memo', route: 'read-only', color: '#ffcc02' },
  RECEIVED_MEMO: { key: 2, name: 'យោងឯកសារចូល', name_en: 'Received Memo', route: 'approve', color: '#4bd964' },
}
export const DOCUMENT_TYPE_OBJECT_ARRAY = Object.values(DOCUMENT_TYPE_OBJECT);


export const config = {
  // placeholder: "",
  toolbar: [
    'fontfamily',
    'fontsize',
    'alignment',
    'fontColor',
    'fontBackgroundColor', '|',
    'bold',
    'italic',
    'strikethrough',
    'underline',
    'subscript',
    'superscript', '|',
    'link', '|',
    'outdent', 'indent', '|',
    'removeFormat',
    'bulletedList', 'numberedList', '|',
    // 'code', 'codeBlock', '|',
    'insertTable', '|',
    'blockQuote', '|',
    'undo', 'redo', '|',
    'heading', '|',
  ],
  fontSize: {
    options: [
      'default',
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      22,
      24,
      26,
      28,
      30,
      32,
    ]
  },
  fontFamily: {
    options: [
      'default, khmeros_siemreap',
      // 'khmer_mool1, khmer_mool1regular',
      'khmer os muol, khmeros_muol',
      'khmer os muol light, khmer_os_muol_light',
      'khmer os battambang, khmeros_battambang',
      'khmer os siemreap, khmeros_siemreap',
      'tacteinga'
    ]
  },
  table: {
    contentToolbar: [
      'tableColumn', 'tableRow', 'mergeTableCells',
      'tableProperties', 'tableCellProperties'
    ],
    tableProperties: {},
    tableCellProperties: {}
  }
}
export const months: any = {
  "01": { key: '01', name: "មករា", name_en: 'January', id: 1, },
  "02": { key: '02', name: "កុម្ភៈ", name_en: 'February', id: 2, },
  "03": { key: '03', name: "មីនា", name_en: 'March', id: 3, },
  "04": { key: '04', name: "មេសា", name_en: 'April', id: 4, },
  "05": { key: '05', name: "ឧសភា", name_en: 'May', id: 5, },
  "06": { key: '06', name: "មិថុនា", name_en: 'June', id: 6, },
  "07": { key: '07', name: "កក្កដា", name_en: 'July', id: 7, },
  "08": { key: '08', name: "សីហា", name_en: 'August', id: 8, },
  "09": { key: '09', name: "កញ្ញា", name_en: 'September', id: 9, },
  "10": { key: '10', name: "តុលា", name_en: 'October', id: 10, },
  "11": { key: '11', name: "វិច្ឆិកា", name_en: 'November', id: 11, },
  "12": { key: '12', name: "ធ្នូ", name_en: 'December', id: 12, },
}
export const MONTHS_ARRAY = Object.values(months);
export const SEMESTER_OBJECT = {
  SEMESTER_ONE: { key: 1, name: 'ឆមាសទី I', name_en: 'Semester I', id: 1 },
  SEMESTER_TWO: { key: 2, name: 'ឆមាសទី II', name_en: 'Semester II', id: 2 },
}
export const SEMESTER_ARRAY = Object.values(SEMESTER_OBJECT);

// AUXSWOT
export const WORKPLACE_GEO_MAP_LOCATION = {
  lat: 11.546267,
  lng: 104.911458,
}

export const HR_FUNCTION = {
  policy_remark: {
    add: "add_policy_remark",
    edit: "edit_policy_remark",
    delete: "delete_policy_remark",
  },
  shift: {
    add: "add_shift",
    edit: "edit_shift",
    delete: "delete_shift",
  },
  policy: {
    add: "add_policy",
    edit: "edit_policy",
    delete: "delete_policy",
  },
  //Resource
  add_employee: { key: "add_employee", name: "Add Employee" },
  edit_employee: { name: "Edit Employee", key: "edit_employee" },
  resign_employee: { name: "Resign Employee", key: "resign_employee" },
  terminate_employee: { name: "Terminate Employee", key: "terminate_employee" },
  add_contract: { name: "Add Contract", key: "add_contract" },
  edit_contract: { name: "Edit Contract", key: "edit_contract" },
  delete_contract: { name: "Delete Contract", key: "delete_contract" },
  add_salary: { name: "Add Salary", key: "add_salary" },
  edit_salary: { name: "Edit Salary", key: "edit_salary" },
  delete_salary: { key: "delete_salary", name: "Delete Salary" },
  add_contact: { name: "Add Contact", key: "add_contact" },
  edit_contact: { name: "Edit Contact", key: "edit_contact" },
  delete_contact: { key: "delete_contact", name: "Delete Contact" },
  add_education: { key: "add_education", name: "Add Education" },
  edit_education: { key: "edit_education", name: "Edit Education" },
  delete_education: { key: "delete_education", name: "Delete Education" },
  add_experience: { name: "Add Experience", key: "add_experience" },
  edit_experience: { key: "edit_experience", name: "Edit Experience" },
  delete_experience: { name: "Delete Experience", key: "delete_experience" },

  //cashier
  add_cashier: { key: "add_cashier", name: "Add Cashier" },
  edit_cashier: { name: "Edit Cashier", key: "edit_cashier" },
  reset_cashier_password: { key: "reset_cashier_password", name: "Reset Cashier Password" },

  //user
  add_user: { key: "add_user", name: "Add User" },
  edit_user: { name: "Edit User", key: "edit_user" },
  delete_user: { key: "delete_user", name: "Delete User" },
  reset_user_password: { name: "Reset User Password", key: "reset_user_password" },

  //Group Acc
  group: {
    add: "add_group",
    edit: "edit_group",
    delete: "delete_group",
    add_member: "add_group_member",
    remove_member: "remove_group_member",

  },
  app_module: {
    add: "add_module",
    edit: "edit_module",
    delete: "delete_module",
    add_function: "add_function",
    edit_function: "edit_function",
    delete_function: "delete_function",
  },
  //App Module


  //Company Profile
  edit_company: { key: "edit_company", name: "Edit Company" },

  //Building

  add_building: { name: "Add Building", key: "add_building" },
  edit_building: { key: "edit_building", name: "Edit Building" },
  delet_building: { name: "Delet Building", key: "delet_building" },
  add_campus: { key: "add_campus", name: "Add Campus" },
  edit_campus: { name: "Edit Campus", key: "edit_campus" },
  delete_campus: { name: "Delete Campus", key: "delete_campus" },
  add_room: { key: "add_room", name: "Add Room" },
  edit_room: { name: "Edit Room", key: "edit_room" },
  delete_room: { name: "Delete Room", key: "delete_room" },
  //Department
  add_department: { key: "add_department", name: "Add Department" },
  edit_department: { name: "Edit Department", key: "edit_department" },
  delete_department: { key: "delete_department", name: "Delete Department" },

  //Holiday
  add_holiday: { name: "Add Holiday", key: "add_holiday" },
  edit_holiday: { name: "Edit Holiday", key: "edit_holiday" },
  delete_holiday: { key: "delete_holiday", name: "Delete Holiday" },
  //Position
  add_position: { key: "add_position", name: "Add Position" },
  edit_position: { key: "edit_position", name: "Edit Position" },
  delete_position: { name: "Delete Position", key: "delete_position" },
  //Title
  add_title: { name: "Add Title", key: "add_title" },
  edit_title: { name: "Edit Title", key: "edit_title" },
  delete_title: { key: "delete_title", name: "Delete Title" },
  //report
  print_employee_listing: { key: "print_employee_listing", name: "Print" },
  download_employee_listing: { name: "Download", key: "download_employee_listing" },
}

export const appArray = [
  { key: 'testing_center', text: "Testing Center" },
  { key: 'cashier', text: "Cashier" },
  // { key: 'class_manager', text: "Class Manager" },
  { key: 'enrollment', text: "Class Manager" },
  { key: 'human_resource', text: "Human Resource" },
  { key: 'scholarship', text: "Scholarship" },
  { key: 'registrar', text: "Registrar" },
  { key: 'finance', text: "Finance" },
  { key: 'payroll', text: "Payrolls" },
  { key: 'inventory', text: "Inventory" },
  { key: 'analytics', text: "Analytics" },
  { key: 'reporting_app', text: "Reporting App" },
  { key: 'admin', text: "Administrator" },
  { key: 'marketplace', text: 'Marketplace' },

]

export const FILTER_USER_ACCOUNT = [
  { key: "keyword", text: "User", name: 'គណនី' },
];
