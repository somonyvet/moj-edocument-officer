import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { isValidUrl, momentObjectToDate } from 'src/app/shared/services/mapping.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { CriminalService } from '../../services/criminal.service';


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY', // Format for parsing dates from the input
  },
  display: {
    dateInput: 'DD/MM/YYYY', // Format for displaying dates in the input
    monthYearLabel: 'MMMM YYYY', // Format for the month-year label
    dateA11yLabel: 'LL', // Accessibility label format
    monthYearA11yLabel: 'MMMM YYYY' // Accessibility label format for month-year
  }
};

@Component({
    selector: 'app-scan-expire-date',
    templateUrl: './scan-expire-date.component.html',
    styleUrls: ['./scan-expire-date.component.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-gb' },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ScanExpireDateComponent implements OnInit {

  form: UntypedFormGroup;
  process: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private authStore: AuthStore,
    private criminalStore: CriminalApplicationStore,
    private funs: AngularFireFunctions,
    public store: CriminalApplicationStore,
    private db: CriminalService,
    
  ) { }

  ngOnInit(): void {
    const { serverDateTime } = this.authStore
    let currentDate = new Date(serverDateTime);
    currentDate.setMonth(currentDate.getMonth() + 3);
    this.form = this.fb.group({
      expired_date: [currentDate, Validators.required]
    })
  }

  async onScanQrCode(value) {
    if (!isValidUrl(value)) {
      return;
    }
    const url = new URL(value);
    const verify_key = url.searchParams.get('key')
    if (verify_key) {
      const doc = await this.store?.getDocumentVerify(verify_key)
      if (doc?.criminal_header_key) {
        this.store.emptySearch = false
        this.save(doc?.criminal_header_key);
      }
    } else {
    }
  }

  save(criminal_header_key: string) {
    this.process = true;
    const { expired_date } = this.form.value
    const docRef = this.ds.criminalRecordRef().doc(criminal_header_key)
    const doc = {
      updated_at: this.ds.serverTimestamp(),
      updated_by: this.criminalStore?.getMappedProfile(),
      expired_date: momentObjectToDate(expired_date),
      do_expire_at: this.ds.serverTimestamp(),
      do_expire_by: this.criminalStore?.getMappedProfile(),
    }
    const movementDoc = {
      key: this.ds.createId(),
      criminalRecordKeyRef: criminal_header_key,
      created_at: this.ds.serverTimestamp(),
      created_by: this.criminalStore?.getMappedProfile(),
      expired_date: momentObjectToDate(expired_date),
      do_expire_at: this.ds.serverTimestamp(),
      do_expire_by: this.criminalStore?.getMappedProfile(),
    }
    const movementRef = this.db.criminalRecordsMovementRef().doc(movementDoc.key);

    const addMessage = this.funs.httpsCallable('onCallSignVerifyOA');
    addMessage({
      header_key: criminal_header_key,
      expire_at: momentObjectToDate(expired_date),
    })
      .toPromise()
      .then((result) => {
        this.process = false;
        const batch = this.ds.batch();
        batch.set(movementRef.ref,movementDoc);
        batch.update(docRef.ref,doc);
        batch.commit().then(() => {
          this.snackBar.open(`រក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 6000 });
        })
      }).catch(() => {
        this.process = false;
        alert("Something When Wrong(onCallSignVerifyOA).")
      });
  }
}
