import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { STATUS_LIVES } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-criminal-record-letter-en-print-fullview',
    templateUrl: './criminal-record-letter-en-print-fullview.component.html',
    styleUrls: ['./criminal-record-letter-en-print-fullview.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLetterEnPrintFullviewComponent implements OnInit, OnChanges {
  @Input() Item:any;

  docDate = new Date();
  signatureLeft = null;
  signatureRight = null;

  STATUS_LIVES = STATUS_LIVES

  constructor(
    private auth : AuthStore,
  ) { }

  ngOnInit(): void {
    if(this.Item){
      this.signatureLeft = this.Item?.workplaces?.find(f=>f.flowNo === 4) || null
      this.signatureRight = this.Item?.workplaces?.find(f=>f.flowNo === 3) || null
      this.docDate = this.Item?.workplaces?.find(f=>f?.department?.key === this.auth?.currentDepartment?.key)?.approved_at?.toDate() || new Date();
    }
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes?.Item?.currentValue !== changes?.Item?.previousValue){
      this.Item = changes?.Item?.currentValue;
    }
  }

}
