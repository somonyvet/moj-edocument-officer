import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CRIMINAL_APPLICATION_LANGUAGE, CRIMINAL_APPLICATION_LANGUAGE_ARRAY, CRIMINAL_APPLICATION_LANGUAGE_OBJECT, STATUS_LIVES, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { PrintService } from 'src/app/shared/services/print.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from 'src/app/shared/services/data.service';
import { pushToObject } from 'src/app/shared/services/convert.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-criminal-letter-print-by-language',
  templateUrl: './criminal-letter-print-by-language.component.html',
  styleUrls: ['./criminal-letter-print-by-language.component.scss']
})
export class CriminalLetterPrintByLanguageComponent implements OnInit {

  CRIMINAL_APPLICATION_LANGUAGE = CRIMINAL_APPLICATION_LANGUAGE_OBJECT
  criminalLanguage = CRIMINAL_APPLICATION_LANGUAGE_ARRAY
  loading: boolean = false;
  ARRAY = Array;

  form: FormGroup;
  criminalLetterDate: any = new Date();
  process: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CriminalLetterPrintByLanguageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ps: PrintService,
    private fb: FormBuilder,
    public criminalStore: CriminalApplicationStore,
    private ds: DataService,
    private funs: AngularFireFunctions,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,

  ) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.form = this.fb.group({
        criminal_letter_date: [this.data?.criminalRecords[0]?.criminal_letter_date?.toDate() || new Date()]
      })
      this.criminalLetterDate = this.data?.criminalRecords[0]?.criminal_letter_date
      if (!this.data?.criminalRecords[0]?.criminal_letter_date) {
        this.loading = true;
        this.criminalStore.saveCri({ key: this.data.criminalRecords[0]?.key, criminal_letter_date: new Date() }, res => {
          this.ds.criminalRecordRef().doc(this.data.criminalRecords[0]?.key).get().toPromise().then(res => {
            const value = pushToObject(res)
            this.data.criminalRecords[0].criminal_letter_date = value?.criminal_letter_date
            this.criminalLetterDate = value?.criminal_letter_date
            this.loading = false;
          })
        })
      }
      this.criminalStore?.fetchCriminalPrint(this.data?.criminalRecords[0]?.key)
    }
  }

  printDocument(id) {
    const printLang = id === '#printDkh' ? 'a4-criminal' : 'a4'
    this.ps.print(id, printLang)
  }

  orgValueChange(e) {
    this.loading = true;
    const date = new Date(Date.parse(e))
    if (this.data) {
      this.criminalStore.saveCri({ key: this.data.criminalRecords[0]?.key, criminal_letter_date: date }, res => {
        this.ds.criminalRecordRef().doc(this.data.criminalRecords[0]?.key).get().toPromise().then(res => {
          const value = pushToObject(res)
          this.data.criminalRecords[0].criminal_letter_date = value?.criminal_letter_date
          this.criminalLetterDate = value?.criminal_letter_date
          this.loading = false;
        })
      })
    }
  }

  submitToVerify(num: number) {
    this.criminalStore.createNewDocumentForVerify(this.data.criminalRecords[0], num).then(() => {
      console.log('done');
    });
  }

  onRevoke(criminal_header: any) {
    const isVerify = criminal_header?.['verify_qr_kh'];
    const isRevoke = criminal_header?.['do_revoke_by'];
    console.log('isVerify', isVerify);
    console.log('isRevoke', isRevoke);
    if (isVerify && !isRevoke) {
      const ref = this.dialog.open(ConfirmDeleteComponent, {
        data: {
          title: `មោឃៈព្រឹត្តិបត្រថ្កោលទោស`,
          memo: `តើលោកអ្នកចង់មោឃៈព្រឹត្តិបត្រថ្កោលទោសមែនទេ`
        },
        panelClass: 'cs-dialog-doc',
        width: '580px',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.process = true;
          console.log('criminal_header', criminal_header);
          const docRef = this.ds.criminalRecordRef().doc(criminal_header.key)
          const doc = {
            updated_at: this.ds.serverTimestamp(),
            updated_by: this.criminalStore?.getMappedProfile(),
            do_revoke_at: this.ds.serverTimestamp(),
            do_revoke_by: this.criminalStore?.getMappedProfile(),
          }
          const addMessage = this.funs.httpsCallable('onCallRevokeVerifyOA');
          addMessage({
            header_key: criminal_header.key,
          }).toPromise()
            .then((result) => {
              this.process = false
              docRef.update(doc).then(() => {
                this.snackBar.open(`មោឃៈដោយជោគជ័យ`, "ជោគជ័យ", { duration: 6000 });
                this.criminalStore.selectedCriminalPrint = {
                  ...this.criminalStore?.selectedCriminalPrint,
                  ...doc
                }
              })
            }).catch(() => {
              this.process = false;
              alert("Something When Wrong(onCallRevokeVerifyOA).")
            });
        }
      })

    }

  }

  ngOnDestroy() {
    this.criminalStore?.fetchCriminalPrintRef?.unsubscribe()
  }
}
