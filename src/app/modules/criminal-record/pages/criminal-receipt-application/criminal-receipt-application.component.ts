import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SYS_MODULES } from 'src/app/dummy/config';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { GeoProvinceFormComponent } from '../geo-data/geo-province-form/geo-province-form.component';

@Component({
    selector: 'app-criminal-receipt-application',
    templateUrl: './criminal-receipt-application.component.html',
    styleUrls: ['./criminal-receipt-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalReceiptApplicationComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'receipts')?.modules || [];

  constructor(
    public criminal: CriminalStore,
    public store: CriminalApplicationStore,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'receipts');
  }

  onCreate(item?: any) {
    let idName = '', idComponent: any = '';
    idName = this.criminal.newIDName;
    if (idName == 'province') { idComponent = GeoProvinceFormComponent };
    const dialogRef = this.dialog.open(idComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _onSelectedCalendar(event) {
  }

  setToggle() {
    if (this.criminal?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }
}
