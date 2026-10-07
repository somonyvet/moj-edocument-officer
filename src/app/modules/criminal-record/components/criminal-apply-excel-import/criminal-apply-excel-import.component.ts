import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as XLSXStyle from 'xlsx-js-style';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, GENDER_DATA, STATUS_LIVES, STATUS_LIVES_ARRAY, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { APPLICATION_TYPE_OBJ } from 'src/app/dummy/status';
import { days, monthOfYear } from 'src/app/dummy/report';
import { ConvertService, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { generateKeywords, getYearsList, todayDate, toDepartmentNoWorkplace } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CitizenStore } from '../../stores/citizen.store';
import { DOCUMENT_FLOW_CATEGORY } from '../../dummy/criminal.dummy';

const PHONE_PATTERN = /^[0-9]{9,}$/;
const MAX_IMPORT_ROWS = 500;

interface ColumnDef {
  key: string;
  label: string;
  width: number;
  sample: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'last_name_kh', label: 'នាមត្រកូល (ខ្មែរ)', width: 20, sample: 'សុខ' },
  { key: 'first_name_kh', label: 'នាមខ្លួន (ខ្មែរ)', width: 20, sample: 'សំណាង' },
  { key: 'last_name_en', label: 'នាមត្រកូល (ឡាតាំង)', width: 20, sample: 'SOK' },
  { key: 'first_name_en', label: 'នាមខ្លួន (ឡាតាំង)', width: 20, sample: 'SAMNANG' },
  { key: 'gender', label: 'ភេទ (ប្រុស/ស្រី)', width: 16, sample: 'ប្រុស' },
  { key: 'dob', label: 'ថ្ងៃខែឆ្នាំកំណើត', width: 24, sample: '01/01/1990' },
  { key: 'current_nationality', label: 'សញ្ជាតិបច្ចុប្បន្ន', width: 18, sample: 'ខ្មែរ' },
  { key: 'before_nationality', label: 'សញ្ជាតិដើម (មិនបំពេញបាន)', width: 32, sample: '' },
  { key: 'occupation_kh', label: 'មុខរបរ', width: 18, sample: 'អ្នកជំនួញ' },
  { key: 'foreignerPlaceOfBirth', label: 'ទីកន្លែងកំណើត', width: 65, sample: 'ភូមិព្រែកតាកូវ ឃុំព្រែកតាកូវ ស្រុកកណ្តាលស្ទឹង ខេត្តកណ្តាល' },
  { key: 'permanentAddressText', label: 'អាសយដ្ឋានបច្ចុប្បន្ន', width: 65, sample: 'ផ្ទះលេខ១២ ផ្លូវ១៨៦ ភូមិទួលគោក សង្កាត់ទួលគោក ខណ្ឌទួលគោក រាជធានីភ្នំពេញ' },
  { key: 'phone', label: 'លេខទូរស័ព្ទ', width: 18, sample: '012345678' },
  { key: 'father_name', label: 'ឈ្មោះឪពុក (មិនបំពេញបាន)', width: 22, sample: 'សុខ សារឿន' },
  { key: 'father_current_nationality', label: 'សញ្ជាតិបច្ចុប្បន្នឪពុក (មិនបំពេញបាន)', width: 35, sample: 'ខ្មែរ' },
  { key: 'father_before_nationality', label: 'សញ្ជាតិដើមឪពុក (មិនបំពេញបាន)', width: 35, sample: 'ខ្មែរ' },
  { key: 'father_occupation', label: 'មុខរបរឪពុក (មិនបំពេញបាន)', width: 35, sample: 'កសិករ' },
  { key: 'father_dob', label: 'ថ្ងៃខែឆ្នាំកំណើតឪពុក (មិនបំពេញបាន)', width: 35, sample: '01/01/1960' },
  { key: 'father_status', label: 'ស្ថានភាពឪពុក រស់/ស្លាប់ (មិនបំពេញបាន)', width: 35, sample: 'រស់' },
  { key: 'mother_name', label: 'ឈ្មោះម្តាយ (មិនបំពេញបាន)', width: 22, sample: 'នួន សុភា' },
  { key: 'mother_current_nationality', label: 'សញ្ជាតិបច្ចុប្បន្នម្តាយ (មិនបំពេញបាន)', width: 35, sample: 'ខ្មែរ' },
  { key: 'mother_before_nationality', label: 'សញ្ជាតិដើមម្តាយ (មិនបំពេញបាន)', width: 35, sample: 'ខ្មែរ' },
  { key: 'mother_occupation', label: 'មុខរបរម្តាយ (មិនបំពេញបាន)', width: 35, sample: 'អ្នកលក់ដូរ' },
  { key: 'mother_dob', label: 'ថ្ងៃខែឆ្នាំកំណើតម្តាយ (មិនបំពេញបាន)', width: 35, sample: '05/05/1962' },
  { key: 'mother_status', label: 'ស្ថានភាពម្តាយ រស់/ស្លាប់ (មិនបំពេញបាន)', width: 35, sample: 'រស់' },
  { key: 'spouse_name', label: 'ឈ្មោះប្តី/ប្រពន្ធ (មិនបំពេញបាន)', width: 35, sample: 'ចាន់ ដារ៉ា' },
  { key: 'spouse_current_nationality', label: 'សញ្ជាតិបច្ចុប្បន្នប្តី/ប្រពន្ធ (មិនបំពេញបាន)', width: 35, sample: 'ខ្មែរ' },
  { key: 'spouse_before_nationality', label: 'សញ្ជាតិដើមប្តី/ប្រពន្ធ (មិនបំពេញបាន)', width: 35, sample: 'ខ្មែរ' },
  { key: 'spouse_occupation', label: 'មុខរបរប្តី/ប្រពន្ធ (មិនបំពេញបាន)', width: 35, sample: 'គ្រូបង្រៀន' },
  { key: 'spouse_dob', label: 'ថ្ងៃខែឆ្នាំកំណើតប្តី/ប្រពន្ធ (មិនបំពេញបាន)', width: 35, sample: '15/03/1992' },
  { key: 'spouse_status', label: 'ស្ថានភាពប្តី/ប្រពន្ធ រស់/ស្លាប់ (មិនបំពេញបាន)', width: 35, sample: 'រស់' },
];

@Component({
    selector: 'app-criminal-apply-excel-import',
    templateUrl: './criminal-apply-excel-import.component.html',
    styleUrls: ['./criminal-apply-excel-import.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalApplyExcelImportComponent implements OnInit {
  COLUMNS = COLUMNS;
  form: UntypedFormGroup;
  duration = URGENT_OBJ_ARRAY?.slice(0, 1);
  applicationType: any;
  DAYS: any[] = [];
  MONTHS: any[] = [];
  years: any[] = [];

  nationals: any[] = [];
  khmerNationality: any = null;

  fileName: string = null;
  loadingFile: boolean = false;
  rows: any[] = [];
  maxImportRows: number = MAX_IMPORT_ROWS;
  importLimitCount: number = null;

  submitting: boolean = false;
  submitProgress: number = 0;
  result: { success: number; failed: number; failedRows: any[] } = null;

  constructor(
    public dialogRef: MatDialogRef<CriminalApplyExcelImportComponent>,
    @Inject(MAT_DIALOG_DATA) public formData: any,
    public auth: AuthStore,
    public ds: DataService,
    public store: CitizenStore,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
  ) {
    this.applicationType = APPLICATION_TYPE_OBJ[formData?.tabKey] || APPLICATION_TYPE_OBJ['application-no-ii'];
  }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      duration: [this.duration[0], Validators.required],
      khmer_form: [{ value: true, disabled: true }],
      khmer_amount: [1, [Validators.required, Validators.min(1)]],
      france_form: [false],
      france_amount: [null, [Validators.required, Validators.min(1)]],
      english_form: [false],
      english_amount: [null, [Validators.required, Validators.min(1)]],
    });
    this.form.controls['france_amount'].disable();
    this.form.controls['english_amount'].disable();
    const { config } = this.auth;
    this.DAYS = days;
    this.MONTHS = monthOfYear;
    this.years = getYearsList(100).map(m => ({ key: `${m}`, name: toLocaleNumber(m, 4), name_en: `${m}` }));
    this.nationals = await this.store.getNational();
    this.khmerNationality = this.nationals?.find(m => m?.key === config?.country_khmer_key) || null;
  }

  downloadTemplateExcelImport() {
    const header = this.COLUMNS.map(c => c.label);
    const sample = this.COLUMNS.map(c => c.sample);
    const ws = XLSXStyle.utils.aoa_to_sheet([header, sample]);
    ws['!cols'] = this.COLUMNS.map(c => ({ wch: c.width }));
    ws['!rows'] = [{ hpt: 26 }, { hpt: 22 }];

    const thinBorder = { style: 'thin', color: { rgb: '000000' } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const headerStyle = {
      font: { name: 'Khmer OS Battambang', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: '1F7244' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border,
    };
    const sampleStyle = {
      font: { name: 'Khmer OS Battambang', sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border,
    };

    this.COLUMNS.forEach((_, i) => {
      const headerCellRef = XLSXStyle.utils.encode_cell({ r: 0, c: i });
      const sampleCellRef = XLSXStyle.utils.encode_cell({ r: 1, c: i });
      if (ws[headerCellRef]) ws[headerCellRef].s = headerStyle;
      if (ws[sampleCellRef]) ws[sampleCellRef].s = sampleStyle;
    });

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, 'Template');
    XLSXStyle.writeFile(wb, 'ទម្រង់គំរូបញ្ចូលបញ្ជីស្នើសុំ.xlsx');
  }

  convertDob(value: any): { day: any; month: any; year: any; errors: string[] } {
    const errors: string[] = [];
    let dd: string, mm: string, yyyy: string;
    if (value instanceof Date && !isNaN(value.getTime())) {
      dd = `${value.getDate()}`.padStart(2, '0');
      mm = `${value.getMonth() + 1}`.padStart(2, '0');
      yyyy = `${value.getFullYear()}`;
    } else {
      const str = `${value ?? ''}`.trim();
      const parts = str.split(/[\/\-\.]/).map(p => p.trim()).filter(p => p);
      if (parts.length !== 3) {
        errors.push(`ថ្ងៃខែឆ្នាំកំណើត "${str}" មិនត្រូវទម្រង់ 1/1/1990 ឬ 01-01-1990 ឬ 01.01.1990`);
        return { day: null, month: null, year: null, errors };
      }
      if (parts[0].length === 4) {
        [yyyy, mm, dd] = parts;
      } else {
        [dd, mm, yyyy] = parts;
      }
      dd = dd.padStart(2, '0');
      mm = mm.padStart(2, '0');
    }
    const day = this.DAYS?.find(r => r.key === dd);
    const month = this.MONTHS?.find(r => r.key === mm);
    const year = this.years?.find(r => r.key === yyyy);
    if (!day || !month || !year) {
      errors.push(`ថ្ងៃខែឆ្នាំកំណើត "${value}" មិនត្រឹមត្រូវ`);
    }
    return { day, month, year, errors };
  }

  validateMatchGender(value: any) {
    const n = `${value ?? ''}`.trim().toLowerCase();
    if (!n) return null;
    if (['ប្រុស', 'male', 'm', '1'].includes(n)) return GENDER_DATA.find(g => g.key === 1);
    if (['ស្រី', 'female', 'f', '0'].includes(n)) return GENDER_DATA.find(g => g.key === 0);
    return null;
  }

   validateMatchNationality(value: any) {
    const n = `${value ?? ''}`.trim().toLowerCase();
    if (!n) return null;
    if (['ខ្មែរ', 'khmer', 'cambodian', 'cambodia'].includes(n)) return this.khmerNationality;
    return this.nationals?.find(m => `${m?.kh_nationality || ''}`.trim().toLowerCase() === n || `${m?.nationality || ''}`.trim().toLowerCase() === n) || null;
  }

  validateMatchLiveStatus(value: any) {
    const n = `${value ?? ''}`.trim().toLowerCase();
    if (!n) return STATUS_LIVES_ARRAY.find(s => s.key === STATUS_LIVES.LIVING.key);
    if (['ស្លាប់', 'dead', 'died', 'deceased'].includes(n)) return STATUS_LIVES_ARRAY.find(s => s.key === STATUS_LIVES.DEAD.key);
    if (['រស់', 'living', 'alive'].includes(n)) return STATUS_LIVES_ARRAY.find(s => s.key === STATUS_LIVES.LIVING.key);
    return null;
  }

  validateParseOptionalDob(value: any, label: string): { dob: any; errors: string[] } {
    const str = `${value ?? ''}`.trim();
    if (!str) return { dob: null, errors: [] };
    const parsed = this.convertDob(value);
    if (parsed.errors.length) return { dob: null, errors: parsed.errors.map(e => `${label}: ${e}`) };
    return { dob: { day: parsed.day, month: parsed.month, year: parsed.year }, errors: [] };
  }

  onSelectedFile(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (!target.files?.length) return;
    const file: File = target.files[0];
    this.fileName = file.name;
    this.result = null;
    this.rows = [];
    this.importLimitCount = null;

    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      this.loadingFile = true;
      const binaryData = e.target.result;
      const workbook: XLSXStyle.WorkBook = XLSXStyle.read(binaryData, { type: 'binary', cellDates: true });
      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSXStyle.WorkSheet = workbook.Sheets[sheetName];
      const labelToKey = new Map(this.COLUMNS.map(c => [c.label, c.key]));
      const json = XLSXStyle.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
      if (json.length > this.maxImportRows) {
        this.importLimitCount = json.length;
        this.loadingFile = false;
        event.target.value = '';
        return;
      }
      const rawRows = json.map((row: any) => {
        const mapped: any = {};
        Object.keys(row).forEach(label => {
          const key = labelToKey.get(label.trim());
          if (key) mapped[key] = row[label];
        });
        return mapped;
      });
      this.rows = this.validateRows(rawRows);
      this.loadingFile = false;
      event.target.value = '';
    };
    reader.readAsBinaryString(file);
  }

  validateRows(rawRows: any[]) {
    return rawRows.map((raw, i) => this.validateRow(raw, i + 2));
  }

  validateRow(raw: any, excelRowNumber: number) {
    const errors: string[] = [];

    const last_name_kh = `${raw.last_name_kh || ''}`.trim();
    const first_name_kh = `${raw.first_name_kh || ''}`.trim();
    const last_name_en = `${raw.last_name_en || ''}`.trim();
    const first_name_en = `${raw.first_name_en || ''}`.trim();
    if (!last_name_kh) errors.push('សូមបញ្ចូលនាមត្រកូល (ខ្មែរ)');
    if (!first_name_kh) errors.push('សូមបញ្ចូលនាមខ្លួន (ខ្មែរ)');
    if (!last_name_en) errors.push('សូមបញ្ចូលនាមត្រកូល (ឡាតាំង)');
    if (!first_name_en) errors.push('សូមបញ្ចូលនាមខ្លួន (ឡាតាំង)');

    const gender = this.validateMatchGender(raw.gender);
    if (!gender) errors.push(`ភេទ "${raw.gender}" មិនត្រឹមត្រូវ (ត្រូវសរសេរ ប្រុស ឬ ស្រី)`);

    const dob = this.convertDob(raw.dob);
    errors.push(...dob.errors);

    const current_nationality = this.validateMatchNationality(raw.current_nationality);
    if (!current_nationality) errors.push(`សញ្ជាតិបច្ចុប្បន្ន "${raw.current_nationality}" រកមិនឃើញ`);
    let before_nationality = current_nationality;
    if (`${raw.before_nationality || ''}`.trim()) {
      before_nationality = this.validateMatchNationality(raw.before_nationality);
      if (!before_nationality) errors.push(`សញ្ជាតិមុន "${raw.before_nationality}" រកមិនឃើញ`);
    }

    const occupation_kh = `${raw.occupation_kh || ''}`.trim();
    if (!occupation_kh) errors.push('សូមបញ្ចូលមុខរបរ');

    const permanentAddressText = `${raw.permanentAddressText || ''}`.trim();
    if (!permanentAddressText) errors.push('សូមបញ្ចូលអាសយដ្ឋានបច្ចុប្បន្ន');

    const foreignerPlaceOfBirth = `${raw.foreignerPlaceOfBirth || ''}`.trim();
    if (!foreignerPlaceOfBirth) errors.push('សូមបញ្ចូលទីកន្លែងកំណើត');

    const phone = `${raw.phone || ''}`.trim();
    if (phone && !PHONE_PATTERN.test(phone)) errors.push(`លេខទូរស័ព្ទ "${phone}" មិនត្រឹមត្រូវ`);

    const father_name = `${raw.father_name || ''}`.trim();
    let father_current_nationality = null;
    if (`${raw.father_current_nationality || ''}`.trim()) {
      father_current_nationality = this.validateMatchNationality(raw.father_current_nationality);
      if (!father_current_nationality) errors.push(`សញ្ជាតិបច្ចុប្បន្នឪពុក "${raw.father_current_nationality}" រកមិនឃើញ`);
    }
    let father_before_nationality = father_current_nationality;
    if (`${raw.father_before_nationality || ''}`.trim()) {
      father_before_nationality = this.validateMatchNationality(raw.father_before_nationality);
      if (!father_before_nationality) errors.push(`សញ្ជាតិដើមឪពុក "${raw.father_before_nationality}" រកមិនឃើញ`);
    }
    const father_occupation = `${raw.father_occupation || ''}`.trim();
    const fatherIsDead = this.validateMatchLiveStatus(raw.father_status);
    if (!fatherIsDead) errors.push(`ស្ថានភាពឪពុក "${raw.father_status}" មិនត្រឹមត្រូវ (ត្រូវសរសេរ រស់ ឬ ស្លាប់)`);
    let fatherDob = null;
    if (fatherIsDead?.key !== STATUS_LIVES.DEAD.key) {
      const parsedFatherDob = this.validateParseOptionalDob(raw.father_dob, 'ថ្ងៃខែឆ្នាំកំណើតឪពុក');
      fatherDob = parsedFatherDob.dob;
      errors.push(...parsedFatherDob.errors);
    }

    const mother_name = `${raw.mother_name || ''}`.trim();
    let mother_current_nationality = null;
    if (`${raw.mother_current_nationality || ''}`.trim()) {
      mother_current_nationality = this.validateMatchNationality(raw.mother_current_nationality);
      if (!mother_current_nationality) errors.push(`សញ្ជាតិបច្ចុប្បន្នម្តាយ "${raw.mother_current_nationality}" រកមិនឃើញ`);
    }
    let mother_before_nationality = mother_current_nationality;
    if (`${raw.mother_before_nationality || ''}`.trim()) {
      mother_before_nationality = this.validateMatchNationality(raw.mother_before_nationality);
      if (!mother_before_nationality) errors.push(`សញ្ជាតិដើមម្តាយ "${raw.mother_before_nationality}" រកមិនឃើញ`);
    }
    const mother_occupation = `${raw.mother_occupation || ''}`.trim();
    const motherIsDead = this.validateMatchLiveStatus(raw.mother_status);
    if (!motherIsDead) errors.push(`ស្ថានភាពម្តាយ "${raw.mother_status}" មិនត្រឹមត្រូវ (ត្រូវសរសេរ រស់ ឬ ស្លាប់)`);
    let motherDob = null;
    if (motherIsDead?.key !== STATUS_LIVES.DEAD.key) {
      const parsedMotherDob = this.validateParseOptionalDob(raw.mother_dob, 'ថ្ងៃខែឆ្នាំកំណើតម្តាយ');
      motherDob = parsedMotherDob.dob;
      errors.push(...parsedMotherDob.errors);
    }

    const spouse_name = `${raw.spouse_name || ''}`.trim();
    let spouse_current_nationality = null;
    if (`${raw.spouse_current_nationality || ''}`.trim()) {
      spouse_current_nationality = this.validateMatchNationality(raw.spouse_current_nationality);
      if (!spouse_current_nationality) errors.push(`សញ្ជាតិបច្ចុប្បន្នប្តី/ប្រពន្ធ "${raw.spouse_current_nationality}" រកមិនឃើញ`);
    }
    let spouse_before_nationality = spouse_current_nationality;
    if (`${raw.spouse_before_nationality || ''}`.trim()) {
      spouse_before_nationality = this.validateMatchNationality(raw.spouse_before_nationality);
      if (!spouse_before_nationality) errors.push(`សញ្ជាតិដើមប្តី/ប្រពន្ធ "${raw.spouse_before_nationality}" រកមិនឃើញ`);
    }
    const spouse_occupation = `${raw.spouse_occupation || ''}`.trim();
    const spouseIsDead = this.validateMatchLiveStatus(raw.spouse_status);
    if (!spouseIsDead) errors.push(`ស្ថានភាពប្តី/ប្រពន្ធ "${raw.spouse_status}" មិនត្រឹមត្រូវ (ត្រូវសរសេរ រស់ ឬ ស្លាប់)`);
    let spouseDob = null;
    if (spouseIsDead?.key !== STATUS_LIVES.DEAD.key) {
      const parsedSpouseDob = this.validateParseOptionalDob(raw.spouse_dob, 'ថ្ងៃខែឆ្នាំកំណើតប្តី/ប្រពន្ធ');
      spouseDob = parsedSpouseDob.dob;
      errors.push(...parsedSpouseDob.errors);
    }

    return {
      excelRowNumber,
      raw,
      valid: errors.length === 0,
      errors,
      resolved: {
        last_name_kh,
        first_name_kh,
        last_name_en,
        first_name_en,
        gender,
        dob,
        current_nationality,
        before_nationality,
        occupation_kh,
        foreignerPlaceOfBirth,
        permanentAddressText,
        phone,
        father_name,
        father_current_nationality,
        father_before_nationality,
        father_occupation,
        fatherIsDead, fatherDob,
        mother_name,
        mother_current_nationality,
        mother_before_nationality,
        mother_occupation,
        motherIsDead, motherDob,
        spouse_name,
        spouse_current_nationality,
        spouse_before_nationality,
        spouse_occupation,
        spouseIsDead,
        spouseDob,
      }
    };
  }

  get validRows() {
    return this.rows?.filter(r => r.valid) || [];
  }

  get invalidRows() {
    return this.rows?.filter(r => !r.valid) || [];
  }

  get submitPercent(): number {
    return this.validRows?.length ? Math.round((this.submitProgress / this.validRows.length) * 100) : 0;
  }

  get successRate(): number {
    const total = (this.result?.success || 0) + (this.result?.failed || 0);
    return total ? Math.round((this.result.success / total) * 100) : 0;
  }

  exportFailedRows() {
    const rows = this.result?.failedRows || [];
    if (!rows.length) return;
    const header = ['ល.រ', 'នាមត្រកូល (ខ្មែរ)', 'នាមខ្លួន (ខ្មែរ)', 'នាមត្រកូល (ឡាតាំង)', 'នាមខ្លួន (ឡាតាំង)', 'លេខទូរស័ព្ទ', 'មូលហេតុបរាជ័យ'];
    const data = rows.map(r => [
      r.excelRowNumber,
      r.resolved?.last_name_kh || '',
      r.resolved?.first_name_kh || '',
      r.resolved?.last_name_en || '',
      r.resolved?.first_name_en || '',
      r.resolved?.phone || '',
      r.saveError || '',
    ]);
    const ws = XLSXStyle.utils.aoa_to_sheet([header, ...data]);
    ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 50 }];
    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, 'Failed');
    XLSXStyle.writeFile(wb, 'បញ្ជីស្នើសុំបរាជ័យ.xlsx');
  }

  confirmSubmit(asDraft: boolean = false) {
    if (!this.validRows.length || this.submitting) return;
    this.dialog.open(ConfirmDeleteComponent, {
      data: {
        title: asDraft ? 'រក្សាទុកសេចក្តីព្រាង' : 'បញ្ជូនបញ្ជីស្នើសុំ',
        memo: asDraft
          ? `លោកអ្នកកំពុងនឹងរក្សាទុកសេចក្តីព្រាងចំនួន ${this.validRows.length} នាក់។ តើលោកអ្នកចង់បន្តទេ?`
          : `លោកអ្នកកំពុងនឹងដាក់ស្នើសុំចំនួន ${this.validRows.length} នាក់។ តើលោកអ្នកចង់បន្តទេ?`,
      },
      panelClass: 'cs-dialog-doc',
      width: '580px',
      disableClose: true,
      role: 'dialog',
    }).afterClosed().subscribe(res => {
      if (res === 'yes') this.submitBatch(asDraft);
    });
  }

  buildLanguages(): any[] {
    const f = this.form.value;
    const selected = [{ ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[0], amount: f.khmer_amount }];
    if (f.france_form) selected.push({ ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[1], amount: f.france_amount });
    if (f.english_form) selected.push({ ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[2], amount: f.english_amount });
    return selected;
  }

  computeSpacialKey(r: any): string {
    const { last_name_en, first_name_en, gender, dob, current_nationality } = r.resolved;
    const dobKey = `${dob?.year?.key}${dob?.month?.key}${dob?.day?.key}`;
    return `${last_name_en}_${first_name_en}_${gender?.name_en}_${dobKey}_${current_nationality?.key}`;
  }

  createImport(r: any, urgent_obj: any, selectedLanguages: any[], sharedDate: any, asDraft: boolean = false, existing?: any) {
    const { dataEntryOnly, assistantUser, currentDepartment, officerType, config } = this.auth;
    const res = r.resolved;
    const khmerFullName = `${res.last_name_kh} ${res.first_name_kh}`;
    const fullNameEn = `${res.last_name_en} ${res.first_name_en}`;
    const phoneNumber = res.phone || null;
    const key = existing?.criminal_record_ref || this.ds.createId();
    const citizenKey = existing?.key || this.ds.createId();
    const spacialKey = this.computeSpacialKey(r);

    const criminal: any = {
      key,
      status: existing?.status || (asDraft ? STATUS_OBJ.DRAFT : STATUS_OBJ.APPLY),
      created_at: existing?.created_at || this.ds.serverTimestamp(),
      created_by: existing?.created_by || this.store.getMappedProfile(),
      date_key: existing?.date_key || ConvertService.dateKey(),
      page_key: existing?.page_key || ConvertService.pageKey(),
      isDelete: false,
      apply: existing?.apply || false,
      updated_by: this.store.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
      tran_at: this.ds.serverTimestamp(),
      tran_date_key: ConvertService.dateKey(),
      keyword: generateKeywords([khmerFullName, fullNameEn]).concat([`${phoneNumber}`, spacialKey]),
      application_type: this.applicationType,
      photo: existing?.photo || null,
      criminal_record_category: config?.criminal_record_category || null,
      day_header: sharedDate?.day,
      month_header: sharedDate?.month,
      year_header: sharedDate?.year,
      entry_officer_type: officerType || null,
      workplace_entry: dataEntryOnly ? toDepartmentNoWorkplace(currentDepartment) : null,
      labor_form: dataEntryOnly || false,
      nick_name: res.nick_name_kh || null,
      nick_name_en: null,
      before_nationality: res.before_nationality,
      current_nationality: res.current_nationality,
      first_name: res.first_name_kh,
      last_name: res.last_name_kh,
      first_name_en: res.first_name_en,
      last_name_en: res.last_name_en,
      gender: res.gender,
      occupation: res.occupation_kh,
      occupation_en: null,
      occupation_fr: null,
      dateOfBirthDay: res.dob.day,
      dateOfBirthMonth: res.dob.month,
      dateOfBirthYear: res.dob.year,
      birthAddress: null,
      permanentAddress: null,
      permanentAddressText: res.permanentAddressText,
      permanentAddressText_en: null,
      permanentAddressText_fr: null,
      phoneNumber,
      spacialKey,
      storyboard: existing?.storyboard || null,
      hashtags: existing?.hashtags || [],
      attachments: existing?.attachments || [],
      citizen_ref: citizenKey,
      foreignerPlaceOfBirth: res.foreignerPlaceOfBirth || null,
      foreignerPlaceOfBirth_en: null,
      foreignerPlaceOfBirth_fr: null,
      father_name: res.father_name || null,
      father_name_en: null,
      fatherIsDead: res.fatherIsDead || null,
      father_before_nationality: res.father_before_nationality || null,
      father_current_nationality: res.father_current_nationality || null,
      fatherDob: res.fatherDob || null,
      fatherBirthAddress: null,
      fatherCurrentOccupation: res.father_occupation || null,
      fatherCurrentOccupation_en: null,
      fatherCurrentOccupation_fr: null,
      mother_name: res.mother_name || null,
      mother_name_en: null,
      motherIsDead: res.motherIsDead || null,
      mother_before_nationality: res.mother_before_nationality || null,
      mother_current_nationality: res.mother_current_nationality || null,
      motherDob: res.motherDob || null,
      motherBirthAddress: null,
      motherCurrentOccupation: res.mother_occupation || null,
      motherCurrentOccupation_en: null,
      motherCurrentOccupation_fr: null,
      spouse: res.spouse_name || null,
      spouse_en: null,
      spouseIsDead: res.spouseIsDead || null,
      spouse_before_nationality: res.spouse_before_nationality || null,
      spouse_current_nationality: res.spouse_current_nationality || null,
      spouseDob: res.spouseDob || null,
      spouseCurrentOccupation: res.spouse_occupation || null,
      spouseCurrentOccupation_en: null,
      spouseCurrentOccupation_fr: null,
      criminal_language: selectedLanguages,
      national_application: null,
      urgent: false,
      urgent_obj,
      urgentStatus: false,
      entry_by: this.store.getMappedProfile(),
      assistantEntry: assistantUser || false,
      isTextAddress: true,
      attachment_status: { name: 'បញ្ជូនឯកសារដើមមកទីកន្លែងផ្ទាល់', key: 2 },

      document_flow_category: currentDepartment?.key == config.department_defense?.key ? DOCUMENT_FLOW_CATEGORY.digital : null
    };

    const citizen: any = {
      ...criminal,
      criminal_record_ref: criminal.key,
      key: citizenKey,
      status: STATUS_OBJ.ACTIVE,
    };

    return { criminal, citizen };
  }

  async submitBatch(asDraft: boolean = false) {
    if (this.submitting) return;
    this.submitting = true;
    this.submitProgress = 0;
    const urgent_obj = this.form.value.duration;
    const selectedLanguages = this.buildLanguages();
    const sharedDate = todayDate(this.auth.serverDateTime, this.DAYS, this.MONTHS, this.years);

    const failedRows = [];
    let success = 0;
    for (const r of this.validRows) {
      const { criminal, citizen } = this.createImport(r, urgent_obj, selectedLanguages, sharedDate, asDraft);
      const ok = await new Promise<boolean>(resolve => {
        this.store.saveCriminalRecord(criminal, citizen, (status, error) => {
          if (!status) {
            failedRows.push({ ...r, saveError: error });
          }
          resolve(status);
        });
      });
      if (ok) success++;
      this.submitProgress++;
    }

    this.result = { success, failed: failedRows.length, failedRows };
    this.submitting = false;
  }

  close(refresh: boolean) {
    this.dialogRef.close(refresh ? 'refresh' : null);
  }
}
