import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { STATUS_LIVES } from 'src/app/dummy/appinfo';
import { toKhmerNumber, toNumber } from 'src/app/shared/services/mapping.service';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

/**
 * Read-only twin of app-criminal-record-letter-kh-print: the same bulletin layout without any of
 * the print-calibration tooling (height sliders, A-/A+ font steppers, decree editor).
 * The calibration values themselves are still applied so the page matches what gets printed.
 */
@Component({
    selector: 'app-criminal-record-letter-kh-view',
    templateUrl: './criminal-record-letter-kh-view.component.html',
    styleUrls: [
        '../criminal-record-letter-kh-print/criminal-record-letter-kh-print.component.scss',
        './criminal-record-letter-kh-view.component.scss',
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLetterKhViewComponent implements OnInit {
  @Input() Item: any;
  @Input() criminalLetterDate: any;

  docDate = new Date();
  signatureLeft = null;
  signatureRight = null;

  decreeResult: string = null;

  sizeS1 = 22;
  sizeS2 = 22;
  sizeS3 = 22;

  sizeS4 = 22;
  sizeS5 = 22;
  sizeS6 = 22;

  headHeight = 0;
  bodyHeight = 0;
  genderPositionCorrection = 0;

  STATUS_LIVES = STATUS_LIVES;

  constructor(
    public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    this.headHeight = toNumber(localStorage.getItem('headHeight')) || 0
    this.bodyHeight = toNumber(localStorage.getItem('bodyHeight')) || 0
    this.genderPositionCorrection = toNumber(localStorage.getItem('genderPositionCorrection')) || 0
    if (this.Item) {
      this.signatureLeft = this.Item?.workplaces?.find(f => f.flowNo === 4) || null
      this.signatureRight = this.Item?.workplaces?.find(f => f.flowNo === 3) || null
      this.decreeResult = this.Item?.decree_result?.name || this.defaultDecree();
      console.log("this.Item?.decree_result",this.Item?.decree_result)
    }
  }

  /** the issued number, stamped on final approval (e.g. 0012/2026), in khmer digits */
  get letterNoText(): string {
    const letter_no_text = this.Item?.letter_no_text || null;
    return letter_no_text ? toKhmerNumber(letter_no_text) : null;
  }

  /** ព្រឹត្តិបត្រថ្កោលទោសលេខ ១ / ២ / ៣ follows the type of application */
  get letterTypeNo(): string {
    return toKhmerNumber(this.Item?.application_type?.key || 3);
  }

  /** the verify system fills the QR in asynchronously, so prefer the live copy of the record */
  get verifyQr(): string {
    return this.criminalStore?.selectedCriminalPrint?.verify_qr_kh || this.Item?.verify_qr_kh || null;
  }

  /** null means the bulletin was handed to the verify system and the QR has not come back yet */
  get verifyPending(): boolean {
    return this.criminalStore?.selectedCriminalPrint?.verify_qr_kh === null;
  }

  private defaultDecree(): string {
    const fName = this.Item?.first_name || '';
    const lName = this.Item?.last_name || '';
    return `<p><span style="font-family:Fasthand, Fasthand;font-size:22px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ឈ្មោះខាងលើនេះ </span><span style="font-family:'Times New Roman';font-size:22px;">( <span style="font-family:Fasthand, Fasthand;font-size:22px; font-weight:bold;"> ${lName}  ${fName} </span> )</span><span style="font-family:Fasthand, Fasthand;font-size:22px;"> ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕</span></p>`;
  }
}
