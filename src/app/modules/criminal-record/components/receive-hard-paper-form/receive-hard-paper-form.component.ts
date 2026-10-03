import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { debounceTime, map, take } from 'rxjs/operators';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, DOCUMENT_ATTACHMENT_TYPES, monthOfYear } from 'src/app/dummy/report';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { ConvertService, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { getYearsList, toCodeKey, todayDate } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-receive-hard-paper-form',
  templateUrl: './receive-hard-paper-form.component.html',
  styleUrls: ['./receive-hard-paper-form.component.scss']
})
export class ReceiveHardPaperFormComponent implements OnInit {
  process: boolean = false;

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  _onSubmit() {
    const { selectedCriminalRecord, selectedCitizenProfile } = this.criminalStore;
    const ref = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'ដកឯកសារ', memo: `តើលោកអ្នកពិតជាចង់ដកឯកសារព្រឹត្តិបត្តថ្កោលទោសមែនទេ?` },
      panelClass: 'cs-dialog-doc',
      width: '580px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.process = true;
        const keyword = (selectedCriminalRecord?.keyword || [])
        const item = {
          ...selectedCriminalRecord,
          updated_by: this.criminalStore?.getMappedProfile(),
          updated_at: this.ds.serverTimestamp(),
          done_at: this.ds.serverTimestamp(),
          done_by: this.criminalStore?.getMappedProfile(),
          status: STATUS_OBJ.DONE,
          internal_status: STATUS_OBJ.DONE,
          keyword: keyword,
          expired_date: ConvertService.addMonth(3),
        }
        this.criminalStore.approvedCriminal(item, selectedCitizenProfile, true).then(() => {
          this.snackBar.open(`ប្រតិបត្តិការជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.router.navigate([`/criminal-record/criminal-latter/criminal-iii/done`])
          this.ds.userRef().doc(selectedCriminalRecord?.citizen_ref).set({criminal_record:null},{merge:true}).catch(err=>console.log(err))
          this.process = false;
        })
      }
    })
  }

}
