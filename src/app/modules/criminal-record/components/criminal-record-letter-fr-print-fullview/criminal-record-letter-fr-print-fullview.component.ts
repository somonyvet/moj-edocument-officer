import { Component, Input, OnChanges, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-criminal-record-letter-fr-print-fullview',
    templateUrl: './criminal-record-letter-fr-print-fullview.component.html',
    styleUrls: ['./criminal-record-letter-fr-print-fullview.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLetterFrPrintFullviewComponent implements OnInit, OnChanges {
  @Input() Item:any;

  docDate = new Date();
  signatureLeft = null;
  signatureRight = null;

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
