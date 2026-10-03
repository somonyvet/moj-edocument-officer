import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { NationalityStore } from '../../stores/nationality.store';
import { DocNotesFormComponent } from './doc-notes-form/doc-notes-form.component';

@Component({
  selector: 'app-doc-notes',
  templateUrl: './doc-notes.component.html',
  styleUrls: ['./doc-notes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DocNotesComponent implements OnInit,OnDestroy {
  tabs = criminal_tabs.crime_note;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `ប្រភេទចំណារ`;
  cri;

  constructor(private route: ActivatedRoute,
    public store: NationalityStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cri = this.criminal
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលចំណារ`;
    this.criminal.newIDName = 'criminal-record-categories';
    // this.criminal.routerCreate = `/criminal-record/applications/geo/provinces/draft`;
    this.criminal.componentDialog = DocNotesFormComponent;
    this.tabs = criminal_tabs.crime_note?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/document-notes` }))
    this.route.params.subscribe(async params => {
      this.loading = false;
      this.params = params;
      this.store.fetchCrimeNote(res => {
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.store.subscribeNationality()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {
    // if (e.endIndex !== this.store.data?.length - 1) return
    // this.loadingMore = true;
    // const { currentDepartment } = this.auth
    // await this.store.fetchMore(this.statusKey, currentDepartment?.key, res => {
    //   this.loadingMore = false;
    // })
  }

  onDelete(item: any) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Criminal Notes', memo: 'If this Criminal Notes is using in other list you cannot delete this Notes.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteCrimeNotes(item.key, (success, error) => {
          if (success) {
            this.snackBar.open('Criminal Notes has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  // create(item?: any) {
  //   const dialogRef = this.dialog.open(GeoProvinceFormComponent, {
  //     data: { item: item },
  //     panelClass: 'cs-dialog-wrapper',
  //     width: '580px',
  //     height: '96vh',
  //     disableClose: true,
  //     role: 'dialog',
  //   });
  //   dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  // }
  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    // this.loadingSearch = true;
    // const { currentDepartment } = this.auth
    // this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
    //       this.loadingSearch = false;
    // })
  }

}
