import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MOJReportStore } from '../../../stores/moj-report.store';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-daily-folder-report',
    templateUrl: './daily-folder-report.component.html',
    styleUrls: ['./daily-folder-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class DailyFolderReportComponent implements OnInit {
  @ViewChild('table') table: ElementRef;
  
  loading: boolean = true;
  currentDate : any = null;
  folders : any = [];
  constructor(
    public store : MOJReportStore,
    public auth: AuthStore,
    private activatedRoute : ActivatedRoute,
    private ps: PrintService,
  ) { }

  ngOnInit(): void {
    this.currentDate = this.auth.serverDateTime;
    this.activatedRoute.queryParams.subscribe(async queryParams=>{
      this.loading = true;
      await this.store.getDaily014(queryParams)
      this.loading = false;
    })
  }

  print() {
    this.ps.print('#print-print', 'a4-print-all');
  }

  print2(){
    this.ps.print('#print', 'a4-2');
  }
  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement, { raw: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'បញ្ជី.xlsx');
  }
}
