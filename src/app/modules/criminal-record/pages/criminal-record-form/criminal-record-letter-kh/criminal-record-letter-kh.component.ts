import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-letter-kh',
  templateUrl: './criminal-record-letter-kh.component.html',
  styleUrls: ['./criminal-record-letter-kh.component.scss']
})
export class CriminalRecordLetterKhComponent implements OnInit, OnDestroy {
  docDate = null;
  signatureLeft= null;
  signatureRight= null;
  subscribeApplication: any = null;
  constructor(
    public store : CriminalApplicationStore,
    private auth : AuthStore,
  ) { }

  ngOnInit(): void {
    this.subscribeApplication = this.store.subscribeStatus?.subscribe(res => {
      this.signatureLeft = this.store.selectedCriminalRecord?.workplaces?.find(f=>f.flowNo === 4) || null
      this.signatureRight = this.store.selectedCriminalRecord?.workplaces?.find(f=>f.flowNo === 3) || null
      this.docDate = this.store.selectedCriminalRecord?.workplaces?.find(f=>f?.department?.key === this.auth?.currentDepartment?.key).approved_at?.toDate() || new Date();
    })
  }

  ngOnDestroy(){
    this.subscribeApplication?.unsubscribe();
  }

}
