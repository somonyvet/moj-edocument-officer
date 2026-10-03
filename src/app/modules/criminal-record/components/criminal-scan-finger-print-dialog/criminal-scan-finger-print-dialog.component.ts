import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

declare function load(): any;
declare function onSelectScan(): any;
declare function selectScanObject(): any;
declare function captureFP(result: any): any;

@Component({
  selector: 'app-criminal-scan-finger-print-dialog',
  templateUrl: './criminal-scan-finger-print-dialog.component.html',
  styleUrls: ['./criminal-scan-finger-print-dialog.component.scss']
})
export class CriminalScanFingerPrintDialogComponent implements OnInit {
  shift_name: any = null;
  form: FormGroup;
  process: boolean = false;
  date: any = null;

  imgBase64 = null
  dataImg = null

  constructor(
    public dialogRef: MatDialogRef<CriminalScanFingerPrintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: CriminalApplicationStore,
    private auth: AuthStore,
    private fb: FormBuilder,
    private ds: DataService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    load();
  }

  onSelectScanChange() {
    onSelectScan()
  }

  selectScanObjectChange() {
    selectScanObject()
  }

  onCaptureFP() {
    captureFP(result => {
      if (result && result.length > 0) {
        const imgItem = result[0]?.Outputs[0]
        this.imgBase64 = imgItem?.Base64Data
        this.dataImg = `data:image/bmp;base64,${this.imgBase64}`
        const fileName = 'fingerprint.bmp'
        const type = 'image'
        // this.auth.uploadBase64(fileName,type,this.dataImg)
      }

    })
  }

  async _onSubmit() {
    // const { selectedCriminalRecord, selectedCitizenProfile } = this.store;
    // this.process = true;
   
    // const item = {
    //   key: selectedCriminalRecord.key,
    //   review_at: this.ds.serverTimestamp(),
    //   review_by: this.store?.getMappedProfile(),
    //   status: STATUS_OBJ.REVIEW,
    //   tran_at: this.ds.serverTimestamp(),
    //   tran_date_key: toDateKey(this.auth.serverDateTime || new Date()),
    // }

    // this.store.approvedCriminalScanFingerPrint(item, selectedCriminalRecord, selectedCitizenProfile, this.dataImg).then(() => {
    //   this.snackBar.open(`ប្រតិបត្តិការបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    //   this.process = false;
    // })

    this.dialogRef.close({dataImg: this.dataImg})

  }

}
