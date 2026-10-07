import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import * as XLSXStyle from 'xlsx-js-style';
import { DataService } from 'src/app/shared/services/data.service';
import { ReportModSubmitStore } from 'src/app/stores/report-mod-submit.store';
import { KHMER_MONTH_ARRAY } from 'src/app/dummy/report';
import { toLocaleNumber } from 'src/app/shared/services/convert.service';

@Component({
    selector: 'app-mod-submit-report',
    templateUrl: './mod-submit-report.component.html',
    styleUrls: ['./mod-submit-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ModSubmitReportComponent implements OnInit {
  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;
  MOD_workplace_key: string = null

  constructor(
    private route: ActivatedRoute,
    public store: ReportModSubmitStore,
    public auth: AuthStore,
    private ps: PrintService,
    private ds: DataService
  ) {
  }

  ngOnInit(): void {
    this.MOD_workplace_key = this.auth?.config?.department_defense?.key
    this.route.queryParams.subscribe(async queryParams => {
      await this.store.fetchData(queryParams)
      this.loading = false;
    })
  }

  async ngOnDestroy(): Promise<void> {

  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {

  }

  trackByIdx(i) {
    return i;
  }

  print() {
    this.ps.print('#print', 'a4-2');
  }

  formatDob(item: any): string {
    return [item?.dateOfBirthDay?.name, item?.dateOfBirthMonth?.name, item?.dateOfBirthYear?.name].filter(v => v).join('/');
  }

  formatCreatedAt(ts: any): string {
    const date = ts?.toDate ? ts.toDate() : ts;
    if (!date) return '';
    return `${toLocaleNumber(date.getDate(), 2)}-${KHMER_MONTH_ARRAY[date.getMonth()]}-${toLocaleNumber(date.getFullYear())}`;
  }

  exportExcel() {
    const header = ['ល.រ', 'ឈ្មោះអ្នកស្នើសុំ', 'ភេទ', 'ថ្ងៃខែឆ្នាំកំណើត', 'ថ្ងៃធ្វើឯកសារ', 'ស្ថានភាពឯកសារ', 'អ្នកធ្វើឯកសារ'];
    const lastCol = header.length - 1;
    const data = (this.store?.data || []).map((item: any, i: number) => [
      toLocaleNumber(i + 1),
      `${item?.last_name || ''} ${item?.first_name || ''}`.trim(),
      item?.gender?.name || '',
      this.formatDob(item),
      this.formatCreatedAt(item?.created_at),
      item?.status?.name || '',
      item?.workplace_entry?.key === this.MOD_workplace_key ? '' : (item?.created_by?.display_name || ''),
    ]);

    const total = this.store?.statistic?.total || 0;
    const totalF = this.store?.statistic?.totalF || 0;
    const totalPaid = this.store?.statistic?.totalPaid || 0;
    const totalPaidF = this.store?.statistic?.totalPaidF || 0;

    const titleRow = 0;
    const periodRow = 1;
    const headerRow = 3;
    const dataStartRow = headerRow + 1;
    const summaryRow1 = dataStartRow + data.length + 1;
    const summaryRow2 = summaryRow1 + 1;
    const signRow1 = summaryRow2 + 2;
    const signRow2 = signRow1 + 1;
    const signRow3 = signRow2 + 1;

    const aoa: any[][] = [];
    aoa[titleRow] = ['បញ្ជីពាក្យស្នើសុំ'];
    aoa[periodRow] = [this.store?.periodText || ''];
    aoa[2] = [];
    aoa[headerRow] = header;
    data.forEach((row, i) => aoa[dataStartRow + i] = row);
    aoa[dataStartRow + data.length] = [];
    aoa[summaryRow1] = [`សរុបពាក្យស្នើសុំ ${toLocaleNumber(total)} នាក់ (ប្រុស ${toLocaleNumber(total - totalF)} នាក់ / ស្រី ${toLocaleNumber(totalF)} នាក់)`];
    aoa[summaryRow2] = [`បង់ប្រាក់រូច ${toLocaleNumber(totalPaid)} នាក់ (ប្រុស ${toLocaleNumber(totalPaid - totalPaidF)} នាក់ / ស្រី ${toLocaleNumber(totalPaidF)} នាក់)`];
    aoa[signRow1 - 1] = [];
    aoa[signRow1] = [null, null, null, null, 'ថ្ងៃ.......... ខែ.......... ឆ្នាំ.......... ព.ស..........'];
    aoa[signRow2] = [null, null, null, null, ', ថ្ងៃទី.......... ខែ.......... ឆ្នាំ..........'];
    aoa[signRow3] = [null, null, null, null, 'មន្ត្រីទទួលបន្ទុក'];

    const ws = XLSXStyle.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 24 }];
    ws['!rows'] = [{ hpt: 32 }, { hpt: 24 }];
    ws['!merges'] = [
      { s: { r: titleRow, c: 0 }, e: { r: titleRow, c: lastCol } },
      { s: { r: periodRow, c: 0 }, e: { r: periodRow, c: lastCol } },
      { s: { r: summaryRow1, c: 0 }, e: { r: summaryRow1, c: lastCol } },
      { s: { r: summaryRow2, c: 0 }, e: { r: summaryRow2, c: lastCol } },
      { s: { r: signRow1, c: 4 }, e: { r: signRow1, c: lastCol } },
      { s: { r: signRow2, c: 4 }, e: { r: signRow2, c: lastCol } },
      { s: { r: signRow3, c: 4 }, e: { r: signRow3, c: lastCol } },
    ];

    const thinBorder = { style: 'thin', color: { rgb: '000000' } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const font = (opts: any = {}) => ({ name: 'Khmer OS Battambang', sz: 10, ...opts });
    const titleStyle = { font: font({ sz: 10 }), alignment: { horizontal: 'center', vertical: 'center' }, border };
    const periodStyle = { font: font({ sz: 10 }), alignment: { horizontal: 'center', vertical: 'center' }, border };
    const headerStyle = {
      font: font({ bold: true, color: { rgb: 'FFFFFF' } }),
      fill: { patternType: 'solid', fgColor: { rgb: '1F7244' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border,
    };
    const cellStyle = {
      font: font(),
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border,
    };
    const summaryStyle = { font: font({ bold: true }), alignment: { horizontal: 'left', vertical: 'center' } };
    const signStyle = { font: font(), alignment: { horizontal: 'right', vertical: 'center' } };

    const setStyle = (r: number, c: number, s: any) => {
      const ref = XLSXStyle.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = s;
    };
    const setStyleRange = (r: number, c1: number, c2: number, s: any) => {
      for (let c = c1; c <= c2; c++) setStyle(r, c, s);
    };
    setStyleRange(titleRow, 0, lastCol, titleStyle);
    setStyleRange(periodRow, 0, lastCol, periodStyle);
    header.forEach((_, c) => setStyle(headerRow, c, headerStyle));
    data.forEach((row, r) => row.forEach((_, c) => setStyle(dataStartRow + r, c, cellStyle)));
    setStyle(summaryRow1, 0, summaryStyle);
    setStyle(summaryRow2, 0, summaryStyle);
    setStyle(signRow1, 4, signStyle);
    setStyle(signRow2, 4, signStyle);
    setStyle(signRow3, 4, signStyle);

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSXStyle.writeFile(wb, `បញ្ជីពាក្យស្នើសុំ ${this.store?.periodText || ''}.xlsx`);
  }
}
