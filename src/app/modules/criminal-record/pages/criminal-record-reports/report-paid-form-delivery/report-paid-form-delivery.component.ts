import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import * as XLSX from 'xlsx';
import { ReportPaidForm } from 'src/app/stores/report-paid-form.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { toNumber } from 'src/app/shared/services/mapping.service';
import { DELIVERY_METHOD_ARRAY } from 'src/app/dummy/status';

@Component({
  selector: 'app-report-paid-form-delivery',
  templateUrl: './report-paid-form-delivery.component.html',
  styleUrls: ['./report-paid-form-delivery.component.scss']
})
export class ReportPaidFormDeliveryComponent implements OnInit {
  @ViewChild('table') table: ElementRef;

  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public store: ReportPaidForm,
    public auth: AuthStore,
    private ps: PrintService,
    private criminalStore: CriminalApplicationStore,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async queryParams => {
      const homeDeliveryKey = DELIVERY_METHOD_ARRAY.find(m => m.key === 'home_delivery')?.key;
      await this.store.fetchData(queryParams, homeDeliveryKey)
      this.loading = false;
    })

    console.log('this.store.data', this.store.data);
  }

  async ngOnDestroy(): Promise<void> {

  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {}

  trackByIdx(i) {
    return i;
  }

  print() {
    this.ps.print('#print', 'a4-2');
  }

  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement, { raw: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'បញ្ជី.xlsx');
  }

  onSetToApply(item){
    const sub = this.dialogRef.open(ConfirmDeleteComponent,{
      data: {
        memo:'តើលោកអ្នកពិតជាចង់ប្ដូរស្ថានភាពឯកសារទៅដាក់ស្នើមែនដែរឬទេ?',
        title: 'ប្ដូរស្ថានភាពឯកសារទៅដាក់ស្នើ'
      }
    }).afterClosed().subscribe((res)=>{
      sub?.unsubscribe();
      if(res==="yes"){
        const data = {
          key: item?.key,
          status: STATUS_OBJ.APPLY,
          updated_at: this.auth.serverDateTime,
          updated_by: this.criminalStore?.getMappedProfile(),
          paid_at: null,
        }
        this.criminalStore.updateCriminalRecord(data).then(()=>{
          this.snackBar.open(`បានប្ដូរពាក្យស្នើសុំទៅដាក់ស្នើរួចរាល់`, "យល់ព្រម", { duration: 10000 });
        })
      }
    })
  }

  get totalDeliveryAmount(): number {
    return (this.store?.data || []).reduce((sum, item) => sum + (toNumber(item?.delivery_fee) || 0), 0);
  }

  get totalPaidAmount(): number {
    return (this.store?.data || []).reduce((sum, item) => sum + (toNumber(item?.paid_amount) || 0), 0);
  }
  //short name for delivery service
  mailObjectShortName(enName: string): string {
    if (!enName) return '';
    if (/ems/i.test(enName)) return 'លឿន';
    if (/parcel/i.test(enName)) return 'ធម្មតា';
    return enName;
  }
}
