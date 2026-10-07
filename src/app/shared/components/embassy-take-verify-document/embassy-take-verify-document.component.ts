import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { AnimationOptions } from 'ngx-lottie';
import { APPLY_OBJECT, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import FileSaver from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-embassy-take-verify-document',
    templateUrl: './embassy-take-verify-document.component.html',
    styleUrls: ['./embassy-take-verify-document.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class EmbassyTakeVerifyDocumentComponent implements OnInit {
  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/digitization-documents.json',
  };
  process: boolean = false;
  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {}

  async withdrawCriminalRecord(){
    if(this.process || (this.criminalStore?.selectedCriminalRecord?.status?.key !== STATUS_OBJ?.RECEIVED?.key)) {
      this.process = false;
      return
    }
    this.process = true;
    const data = {
      ...this.criminalStore?.selectedCriminalRecord,
      key: this.criminalStore?.selectedCriminalRecord.key,
      status: STATUS_OBJ.DONE,

      updated_by: this.criminalStore?.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),

      done_at: this.criminalStore?.selectedCriminalRecord?.done_at || this.ds.serverTimestamp(),
      done_by: this.criminalStore?.selectedCriminalRecord?.done_by || this.criminalStore?.getMappedProfile(),

      tran_at: this.ds.serverTimestamp(),
      tran_by: this.criminalStore?.getMappedProfile(),

      withdraw_location: APPLY_OBJECT.oversea,
    }
    this.criminalStore.saveWithdrawCriminalRecord(data).then(async ()=>{
      await this.download()
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ.`, "ជោគជ័យ", { duration: 6000 });
      this.process = false;
    })
  }

  async download() {
    await FileSaver.saveAs(
      this.criminalStore?.selectedCriminalRecord?.attachment_pdf?.downloadUrl,
      this.criminalStore?.selectedCriminalRecord?.attachment_pdf?.name
    );
  }
}
