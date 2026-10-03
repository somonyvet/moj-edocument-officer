import { M } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { DataService } from 'src/app/shared/services/data.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
  selector: 'app-officer-profile',
  templateUrl: './officer-profile.component.html',
  styleUrls: ['./officer-profile.component.scss']
})
export class OfficerProfileComponent implements OnInit {
  params: any = null;
  loading: boolean = true;
  process: boolean = false;

  STATUS_OBJ = STATUS_OBJ
  constructor(
    public store: OfficerStore,
    public auth: AuthStore,
    private router: Router,
    public route: ActivatedRoute,
    private dialog: MatDialog,
    private ds: DatabaseService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const { id } = params;
      this.params = params;
      this.loading = true;
      const { uid, profile } = this.auth;
      if (id !== uid && profile?.status?.key !== STATUS_OBJ.ACTIVE.key) {
        this.router.navigate([`/hr/officer-application-form/${uid}`])
      }
      this.store.fetchUserRegistrationForm(id, res => {
        this.loading = false;
      });
    })




  }

  _onSubmit() {
    const dialogRef = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'ដាក់សំណើ', memo: 'សូមត្រួតពិនិត្យព័ត៌មានឲ្យបានត្រឹមត្រូវមុនពេលដាក់ស្នើសុំ ព្រោះលោកអ្នកមិនអាចផ្លាស់ប្ដូរព័ត៌មានបានទេ៕' },
    })
    dialogRef.afterClosed().subscribe(res => {
      if (res === 'yes') {
        this.ds.registrationFormRef().doc(this.params.id).set({ status: STATUS_OBJ.SUBMITTED }, { merge: true }).then(() => {
          this.snackBar.open(`សំណើបានដាក់ស្នើសុំពិនិត្យដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        })
      }
    })
  }

  _onSubmitUpdate() {
    const dialogRef = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'ជំនួយ', memo: 'ដាក់ដំណើរការធ្វើបច្ចុប្បន្នភាព៕' },
    })
    dialogRef.afterClosed().subscribe(res => {
      if (res === 'yes') {
        this.ds.registrationFormRef().doc(this.params.id).set({ status: STATUS_OBJ.PENDING }, { merge: true }).then(() => {
          this.snackBar.open(`ប្រតិបត្តិការជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        })
      }
    })
  }

  ngOnDestroy(): void {
    const { fetchUserRegistrationFormRef } = this.store;
    this.store.registrationFormDoc = null;
    fetchUserRegistrationFormRef && fetchUserRegistrationFormRef.unsubscribe();
  }

}
