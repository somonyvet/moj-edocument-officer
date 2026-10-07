import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { AuthStore } from 'src/app/stores/auth.store';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';

@Component({
    selector: 'app-comment-decree-guilty',
    templateUrl: './comment-decree-guilty.component.html',
    styleUrls: ['./comment-decree-guilty.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommentDecreeGuiltyComponent implements OnInit {

  tabs = tabs.officers;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  formFocus: boolean;

  isAdmin = false
  form: UntypedFormGroup

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/109279-checklist.json',
  };
  selectedFilter: any = null;
  search: AbstractControl;
  loadingSearch: boolean = false;
  isKhmerForm: boolean = false;
  printDate = new Date();
  loading: boolean = true;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: CriminalApplicationStore,
    private route: ActivatedRoute,
    public auth: AuthStore,
    private ps: PrintService,
    private router: Router,

  ) { }

  criminalRecords = []
  criminalGroupService = null
  signature2;
  signature3;
  signature4;

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      const { publicApplication, uid } = this.auth;
      this.store.fetchSelectedCriminalRecord(params?.id, res => {
        if (!res) {
          this.router.navigate(['/control/404'])
          return;
        }
        if (publicApplication && res?.citizen_ref !== uid) {
          this.router.navigate(['/control/404'])
          return;
        }
        this.loading = false;
      })
    })


    // this.signature2 = this.store?.selectedGroupDoc?.workplaces.find(m=>m?.flowNo === 2) || null
    // this.signature3 = this.store?.selectedGroupDoc?.workplaces.find(m=>m?.flowNo === 3) || null
    // this.signature4 = this.store?.selectedGroupDoc?.workplaces.find(m=>m?.flowNo === 4) || null
  }

  ngOnDestroy() {
    this.store?.fetchDataRef?.unsubscribe();
    this.store.folderItem = null;
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

  print() {
    this.ps.print('#printD', 'a4')
  }
}


