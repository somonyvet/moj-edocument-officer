import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { HR_FUNCTION } from 'src/app/dummy/config';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { getOnlyYear } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { HolidayStore } from '../../stores/holiday.store';
import { AddPublicHolidayComponent } from './add-public-holiday/add-public-holiday.component';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-public-holiday',
  templateUrl: './public-holiday.component.html',
  styleUrls: ['./public-holiday.component.scss']
})
export class PublicHolidayComponent implements OnInit, OnDestroy {
  HR_FUNCTION = HR_FUNCTION;
  title: string = `ថ្ងៃឈប់​សំរាក`;
  tabs = criminal_tabs.public_holiday;
  loading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: HolidayStore,
    private ds: DataService,
    public auth: AuthStore,
    public criminal: CriminalStore,
    private afs: AngularFirestore,
  ) { }

  ngOnInit() {
    this.criminal.newButtonName = `បង្កើតថ្ងៃឈប់​សំរាក`;
    this.criminal.componentDialog = AddPublicHolidayComponent;
    const year = getOnlyYear(this.auth.serverDateTime)
    this.store.fetchData(year);
  }

  ngOnDestroy(): void {
    this.store.subscribe()
    this.criminal.newButtonName = null;
    this.criminal.componentDialog = null;
  }

  create(item?: any) {
    let dialogRef = this.dialog.open(AddPublicHolidayComponent, {
      data: { item: item || null },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }


  delete(item) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Public Holiday', memo: 'If this Public Holiday is using in other list you cannot delete shift.', name: item.name },
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.delete(this.ds.publicHolidayRef(), item, (success, error) => {
          if (success) {
            this.snackBar.open('Public Holiday has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  generateHoliday(){
    const Holiday = holiday2026?.map(m=>({date: new Date(m?.date), name: m?.str}))
    console.log('Holiday',Holiday)
    Holiday?.map(m=>{
      const formData: any = {
        key: this.afs.createId(),
        year: { key: 2026, text: "2026" },
        name: m?.name ,
        khName: m?.name,
        description: null,
        from_date: m?.date,
        from_date_key: ConvertService.toDateKey(m?.date),
        date: m?.date,
        date_key: ConvertService.toDateKey(m?.date),
        status: STATUS_OBJ.ACTIVE,
        create_date: this.auth.serverDateTime,
        create_by: this.auth.getMappedProfile(),
        update_by: this.auth.getMappedProfile(),
        update_date: this.ds.serverTimestamp(),
      }
      this.store.addNew(this.ds.publicHolidayRef(), formData, (success, error) => {
        if (success) {
          this.snackBar.open('Public Holiday has been created.', 'done', { duration: 2000 });
        }
        else {
          this.snackBar.open(error, 'Error')
        }
      })
    })
  }
}

const holiday2026 = [
  ,{ date:'01 Jan 2026', str:'International New Year Day'}
  ,{ date:'07 Jan 2026', str:'Day of Victory over the Genocidal Regime'}
  ,{ date:'08 Mar 2026', str: "International Women's Rights Day"}
  ,{ date:'14 Apr 2026', str:"Khmer New Year's  Day"}
  ,{ date:'15 Apr 2026', str:"Khmer New Year's  Day"}
  ,{ date:'16 Apr 2026', str:"Khmer New Year's  Day"}
  ,{ date:'01 May 2026', str:'International Labor Day'}
  ,{ date:'11 May 2026', str:'Visaka Bochea Day'}
  ,{ date:'14 May 2026', str:' Birthday of  His Majesty Preah Bat Samdech Preah Boromneath NORODOM SIHAMONI, King of Cambodia'}
  ,{ date:'15 May 2026', str:'Royal Ploughing Ceremony'}
  ,{ date:'18 Jun 2026', str:'Birthday of Her Majesty the Queen-Mother NORODOM MONINEATH SIHANOUK of Cambodia '}
  ,{ date:'21 Sep 2026', str:'Pchum Ben Day'}
  ,{ date:'22 Sep 2026', str:'Pchum Ben Day'}
  ,{ date:'23 Sep 2026', str:'Pchum Ben Day'}
  ,{ date:'24 Sep 2026', str:'Constitution Day'}
  ,{ date:'15 Oct 2026', str:'Mourning Day of the Late King-Father NORODOM SIHANOUK of Cambodia'}
  ,{ date:'29 Oct 2026', str:'Coronation Day of His Majesty Preah Bat Samdech Preah Boromneath NORODOM SIHAMONI, King of Cambodia  '}
  ,{ date:'04 Nov 2026', str:'Water Festival'}
  ,{ date:'05 Nov 2026', str:'Water Festival'}
  ,{ date:'06 Nov 2026', str:'Water Festival'}
  ,{ date:'09 Nov 2026', str:'National Independence Day'}
  ,{ date:'29 Dec 2026', str:'Peace Day in Cambodia'}		
]

			
