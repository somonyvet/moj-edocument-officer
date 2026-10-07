import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { HR_FUNCTION } from 'src/app/dummy/config';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { EmbassyFormComponent } from './embassy-form/embassy-form.component';
import { embassyStore } from '../../stores/embassy.store';

@Component({
    selector: 'app-embassy',
    templateUrl: './embassy.component.html',
    styleUrls: ['./embassy.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class EmbassyComponent implements OnInit {

  HR_FUNCTION = HR_FUNCTION;
  title: string = `ស្ថានទូត`;
  tabs = criminal_tabs.embassy;
  loading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: embassyStore,
    private ds: DataService,
    public auth: AuthStore,
    public criminal: CriminalStore,
  ) { }

  ngOnInit() {
    this.criminal.newButtonName = `បង្កើតស្ថានទូត`;
    this.criminal.componentDialog = EmbassyFormComponent;
    this.store.fetchData();
  }

  ngOnDestroy(): void {
    this.store.subscribe()
    this.criminal.newButtonName = null;
    this.criminal.componentDialog = null;
  }

  create(item?: any) {
    let dialogRef = this.dialog.open(EmbassyFormComponent, {
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


  onDelete(item) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Embassy', memo: 'If this Embassy is using in other list you cannot delete.', name: item.name },
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.delete(this.ds.embassyRef(), item, (success, error) => {
          if (success) {
            this.snackBar.open('Embassy has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }
}
