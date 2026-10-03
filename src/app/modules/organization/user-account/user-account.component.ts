import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPageInfo } from 'ngx-virtual-scroller';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { tabs } from 'src/app/dummy/tabs';
import { MatDialog } from '@angular/material/dialog';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { AddEditUserAccountComponent } from './add-edit-user-account/add-edit-user-account.component';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { APP_CONFIG } from 'src/app/dummy/config';
@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})

export class UserAccountComponent implements OnInit, OnDestroy {
  tabs = tabs.officers;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  formFocus: boolean;

  isAdmin = false
  form: FormGroup
  filterBy = [
    { key: "id_number", text: "គណនីមន្រ្តី", placeholder: 'ស្វែងរកគណនីមន្រ្តី', ref: 'id_number' },
  ];
  selectedFilter: any = null;
  search: AbstractControl;
  loadingSearch: boolean = false;
  searchType: AbstractControl;

  constructor(
    private dialog: MatDialog,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public store: OfficerStore,
    private fb: FormBuilder,

  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      searchType: [this.filterBy[0], [Validators.required]],
      search: [null]
    });
    this.search = this.form.controls["search"];
    this.searchType = this.form.controls["searchType"];

    const { searchType } = this.form.value;
    this.selectedFilter = searchType;
    this.search.valueChanges
      .pipe(
        debounceTime(APP_CONFIG.DEBOUNCE_TIME),
        tap(() => (this.loadingSearch = true)),
        switchMap(async (value) => this.store.fetchSearchData(value, data => { }))
      ).subscribe(results => {
        this.loadingSearch = false;
      })

    this.store.fetchData();
    if (this.auth.profile.isAdmin) {
      this.isAdmin = true
    }
  }

  async ngOnDestroy() {
    await this.store.unsubscribe()
  }

  compareObjects(o1: any, o2: any): boolean {
    if (o2) {
      return o1.key === o2.key;
    }
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  _selectionChange(event) {

  }

  _onFocus(yes) {
    this.formFocus = yes;
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(AddEditUserAccountComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    this.store.fetchMore()
  }

  delete(item: IOfficer) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.displayName, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.store.save({ ...item, isDelete: true, deleted_at: this.ds.serverTimestamp(), deleted_by: this.auth.uid }, (success, res) => {
          if (success) {
            this.snackBar.open(`ទិន្នន័យត្រូវបានលុបចេញពីប្រព័ន្ធ.`, "ជោគជ័យ", { duration: 3000 });
          } else {
            alert(res);
          }
        })
      }
    })
  }

  resetPassword(item) {
    let dialogRef = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ', strong: `${item.last_name} ${item.first_name}`, memo: "ប្រសិនបើអ្នកកំណត់ពាក្យសម្ងាត់អ្នកប្រើឡើងវិញ ពាក្យសម្ងាត់នឹងផ្លាស់ប្តូរទៅជាលំនាំដើម 016555392" },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        const { profile } = this.auth
        this.store.resetUserPassword(item, profile, (success, error) => {
          if (success) {
            this.snackBar.open(`កំណត់ពាក្យសម្ងាត់ឡើងវិញដោយជោគជ័យ`, "ជោគជ័យ", { duration: 1000 });
          } else {
            this.snackBar.open(`កំណត់ពាក្យសម្ងាត់ឡើងវិញតបរាជ័យ`, "Error", { duration: 1000 });
          }
        })
      }
    });
  }

}
