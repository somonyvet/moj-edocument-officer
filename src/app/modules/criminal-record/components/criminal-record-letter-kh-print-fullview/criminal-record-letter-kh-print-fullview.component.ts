import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { toKhmerNumber } from 'src/app/shared/services/mapping.service';
import { STATUS_LIVES, STATUS_LIVES_ARRAY } from 'src/app/dummy/appinfo';
import { reportImg } from 'src/app/dummy/report';

@Component({
    selector: 'app-criminal-record-letter-kh-print-fullview',
    templateUrl: './criminal-record-letter-kh-print-fullview.component.html',
    styleUrls: ['./criminal-record-letter-kh-print-fullview.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLetterKhPrintFullviewComponent implements OnInit {

  @Input() Item: any;
  docDate = new Date();
  signatureLeft = null;
  signatureRight = null;

  // decreeResult
  // sizeS1 = 22
  // sizeS2 = 22
  // sizeS3 = 22

  STATUS_LIVES = STATUS_LIVES
  reportImg = reportImg
  constructor(
    private auth: AuthStore,
    public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    if (this.Item) {
      this.signatureLeft = this.Item?.workplaces?.find(f => f.flowNo === 4) || null
      this.signatureRight = this.Item?.workplaces?.find(f => f.flowNo === 3) || null
      this.docDate = this.Item?.workplaces?.find(f => f?.department?.key === this.auth?.currentDepartment?.key)?.approved_at?.toDate() || new Date();
      const { selectedCriminalRecord } = this.criminalStore;

      // const pdfDocGenerator = pdfMake.createPdf(mapReportContent(this.reportImg, selectedCriminalRecord, 10, null, null));
      // pdfDocGenerator.getDataUrl((dataUrl) => {
      //   const targetElement = document.querySelector('#iframeContainer');
      //   if (targetElement) {
      //     targetElement.setAttribute('src', dataUrl)
      //   }
      // });
    }
  }



  generatePDF() {
    // const { selectedCriminalRecord } = this.criminalStore;
    // const docDefinition = mapReportContent(this.reportImg, selectedCriminalRecord, 10, null, null);
    // pdfMake.createPdf(docDefinition).print();
    // if (action === 'download') {
    //   pdfMake.createPdf(docDefinition).download();
    // } else if (action === 'print') {
    //   pdfMake.createPdf(docDefinition).print();
    // } else {
    //   pdfMake.createPdf(docDefinition).open();
    // }

  }
}
