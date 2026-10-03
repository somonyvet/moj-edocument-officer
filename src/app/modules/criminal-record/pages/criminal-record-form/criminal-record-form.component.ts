import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-form',
  templateUrl: './criminal-record-form.component.html',
  styleUrls: ['./criminal-record-form.component.scss']
})
export class CriminalRecordFormComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  process: boolean = false;
  params: any = null;
  PENDING = STATUS_OBJ.PENDING;
  applicationType: string = null;
  STATUS_OBJ = STATUS_OBJ;
  disableChangeNationality: boolean = false;
  canApply: boolean = false;

  hideSidebar:boolean=false;
  constructor(
    public criminal: CriminalStore,
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private auth: AuthStore,
  ) { }

  ngOnInit(): void {
    this.store?.isKhmerForm ? this.applicationType = 'khmer' : this.applicationType = 'foreigner';
    this.route.firstChild?.params.subscribe(params => {
      this.hideSidebar=params?.pageType==='direct'
    })
    this.route.params.subscribe(async params => {
      this.loading = true;
      this.params = params;
      const { citizenKey, id } = this.params;
      const { publicApplication, uid } = this.auth;
      this.store.selectedCriminalRecord = null;
      this.store.selectedCitizenProfile = null;
      this.store.attachment_files = [];
      if (id && id !== "draft") {
        this.store.fetchSelectedCriminalRecord(params?.id, res => {
          if (!res) {
            this.router.navigate(['/control/404'])
            return;
          }
          if (res?.status?.key > STATUS_OBJ.APPLY) {
            this.canApply = false;
            this.disableChangeNationality = true;
          } else {
            this.canApply = true;
          }
          if (publicApplication && res?.citizen_ref !== uid) {
            this.router.navigate(['/control/404'])
            return;
          }
          this.loading = false;
        })
      } else if (citizenKey && citizenKey !== 'na') {
        this.store.fetchSelectedCitizen(citizenKey, res => {
          if (publicApplication && citizenKey !== uid) {
            this.router.navigate(['/control/404'])
            return;
          }
          this.loading = false;
        })
      } else {
        this.store.unsubscribe();
        this.canApply = true;
        this.loading = false;
      }
    })
  }


  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async ngOnDestroy() {
    await this.store.unsubscribeForm();
    this.criminal.params = null;
  }

  _onSubmit() {
    const { selectedCitizenProfile, selectedCriminalRecord } = this.store;
    if (!selectedCitizenProfile || !selectedCriminalRecord) {
      alert('Sorry. Please fill criminal record form and user profile');
      return;
    }
    let dialogRef = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'ដាក់ស្នើសុំពិនិត្យ', memo: `សូមពិនិត្យព័ត៌មានរបស់លោកអ្នកអោយបានត្រឹមត្រូវព្រោះបន្ទាប់ពីដាក់សំណើរួចព័ត៌មានមិនអាចកែប្រែបានទេ៕` },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    })

    dialogRef.afterClosed().subscribe(res => {
      if (res === "yes") {
        this.store.saveCri({ ...this.store?.selectedCriminalRecord, status: STATUS_OBJ.APPLY }, res => {
          this.snackBar.open(`ដាក់ស្នើសុំពិនិត្យរួចរាល់។`, "ជោគជ័យ", { duration: 3000 });
          this.store.disableForm = true;
        })
      }
    })

  }

  changeApplicationType(type: string) {
    this.router.navigateByUrl(`/criminal-record`, { skipLocationChange: true }).then(() => {
      this.router.navigate([`/criminal-record/form/${type}/application-no-iii`]);
    });
  }
}
