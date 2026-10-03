import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AnimationOptions } from 'ngx-lottie';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import FileSaver from 'file-saver';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService, addDay } from '../../services/convert.service';
@Component({
  selector: 'app-attach-file-oversea',
  templateUrl: './attach-file-oversea.component.html',
  styleUrls: ['./attach-file-oversea.component.scss']
})
export class AttachFileOverseaComponent implements OnInit {
  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/digitization-documents.json',
  };
  process: boolean = false
  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private fb: FormBuilder,
    public storage: FireStorageService,
    private snackBar: MatSnackBar,
  ) { }
  ngOnInit(): void {}

  async attachFile(event){
    console.log('select file')

    // if(this.criminalStore?.selectedCriminalRecord?.status?.key < STATUS_OBJ.DECREE.key){
    //   alert('ព្រឹត្តិបត្រថ្កោលទោសនេះមិនទាន់ចុះនិទ្ទេស !')
    //   return
    // }

    if(this.process){
      return;
    }

    if (event && (event.target.files.length > 0)) {
      this.process = true
      const file = event.target.files[0];
      const file_ref = await this.storage.upload([file])
      const file_uploaded  = file_ref[0];
      if(!file_uploaded){
        alert('File upload failed.')
        this.process = false
        return
      }
      const { period_can_receive_day } = this.auth?.config
      const canReceivedExpiredAtPlus = addDay(this.criminalStore?.selectedCriminalRecord?.can_received_at? this.criminalStore?.selectedCriminalRecord?.can_received_at?.toDate() : this.auth?.serverDateTime, period_can_receive_day)
      const totalD = ConvertService.calcCRDays(this.criminalStore?.selectedCriminalRecord?.can_received_at? this.criminalStore?.selectedCriminalRecord?.can_received_at?.toDate() : this.auth?.serverDateTime, canReceivedExpiredAtPlus.toDate())
      const canReceivedExpiredAt = addDay(this.criminalStore?.selectedCriminalRecord?.can_received_at? this.criminalStore?.selectedCriminalRecord?.can_received_at?.toDate() : this.auth?.serverDateTime, totalD)

      console.log('canReceivedExpiredAt',canReceivedExpiredAt?.toDate())

      const data = {
        key: this.criminalStore?.selectedCriminalRecord.key,
        status: (this.criminalStore?.selectedCriminalRecord?.status?.key ===  STATUS_OBJ.DONE?.key) ? STATUS_OBJ.DONE : STATUS_OBJ.RECEIVED,

        updated_by: this.criminalStore?.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),

        tran_at: this.ds.serverTimestamp(),
        tran_by: this.criminalStore?.getMappedProfile(),

        criminal_record_category: this.criminalStore?.selectedCriminalRecord?.criminal_record_category || null,
        attachment_pdf: file_uploaded,
        decree_status: this.criminalStore?.selectedCriminalRecord?.decree_status || null,
        decree_result: this.criminalStore?.selectedCriminalRecord?.decree_result || null,
        internal_status:  this.criminalStore?.selectedCriminalRecord?.internal_status || null,

        can_received_at: this.criminalStore?.selectedCriminalRecord?.can_received_at || this.ds.serverTimestamp(),
        can_received_by: this.criminalStore?.selectedCriminalRecord?.can_received_by || this.criminalStore?.getMappedProfile(),

        can_received_expired_at: this.criminalStore?.selectedCriminalRecord?.can_received_expired_at || canReceivedExpiredAt?.toDate()
      }
      this.criminalStore.saveCriminalOverseaAttachPDF(data).then(()=>{
        console.log('done')
        this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ.`, "ជោគជ័យ", { duration: 6000 });
        this.process = false
      })
    }
    // this.download()
  }

  download() {
    FileSaver.saveAs(
      this.criminalStore?.selectedCriminalRecord?.attachment_pdf?.downloadUrl,
      this.criminalStore?.selectedCriminalRecord?.attachment_pdf?.name
    );
  }

}
