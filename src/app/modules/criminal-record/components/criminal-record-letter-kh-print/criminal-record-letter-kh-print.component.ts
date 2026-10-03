import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { STATUS_LIVES } from 'src/app/dummy/appinfo';
import { DataService } from 'src/app/shared/services/data.service';
import { toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import * as customBuild from 'src/ckeditor5/build/ckeditor';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-letter-kh-print',
  templateUrl: './criminal-record-letter-kh-print.component.html',
  styleUrls: ['./criminal-record-letter-kh-print.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class CriminalRecordLetterKhPrintComponent implements OnInit {
  @Input() Item: any;
  @Input() criminalLetterDate: any;

  docDate = new Date();
  signatureLeft = null;
  signatureRight = null;

  decreeResult;
  sizeS1 = 22
  sizeS2 = 22
  sizeS3 = 22

  sizeS4 = 22
  sizeS5 = 22
  sizeS6 = 22

  headHeight = 0;
  bodyHeight = 0;
  genderPositionCorrection = 0;

  STATUS_LIVES = STATUS_LIVES;

  Editor = customBuild;
  config = {
    toolbar: [
      'fontfamily',
      'fontsize',
      'fontColor',
      'fontBackgroundColor', '|',
      'bold',
      'italic',
      'strikethrough',
      'underline',
      'subscript',
      'superscript', '|',
      'link', '|',
      'outdent', 'indent', '|',
      'removeFormat',
      'bulletedList', 'numberedList', '|',
    ],
    fontSize: {
      options: [
        'default',
        12,
        14,
        16,
        18,
        20,
        22,
        24,
        26,
        28,
        30,
        32,
      ]
    },
    fontFamily: {
      options: [
        'Fasthand ,Fasthand',
        'Times New Roman',
        'khmer os muol, khmeros_muol',
        'khmer os muol light, khmer_os_muol_light',
        'khmer os battambang, khmeros_battambang',
        'khmer os siemreap, khmeros_siemreap'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells',
        'tableProperties', 'tableCellProperties'
      ],
      tableProperties: {},
      tableCellProperties: {}
    }
  }

  decree_result = new FormControl(null);
  constructor(
    private auth: AuthStore,
    private ds: DataService,
    public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    this.headHeight = toNumber(localStorage.getItem('headHeight')) || 0
    this.bodyHeight = toNumber(localStorage.getItem('bodyHeight')) || 0
    this.genderPositionCorrection = toNumber(localStorage.getItem('genderPositionCorrection')) || 0
    if (this.Item) {
      this.signatureLeft = this.Item?.workplaces?.find(f => f.flowNo === 4) || null
      this.signatureRight = this.Item?.workplaces?.find(f => f.flowNo === 3) || null
      // this.docDate = this.Item?.criminal_letter_date;
      if(this.Item?.decree_result?.name){
        this.decree_result.patchValue(this.Item.decree_result?.name)
      }else{
        const fName = this.Item?.first_name || '';
        const lName = this.Item?.last_name || '';
        const decree = `<p><span style="font-family:Fasthand, Fasthand;font-size:22px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ឈ្មោះខាងលើនេះ </span><span style="font-family:'Times New Roman';font-size:22px;">( <span style="font-family:Fasthand, Fasthand;font-size:22px; font-weight:bold;"> ${lName}  ${fName} </span> )</span><span style="font-family:Fasthand, Fasthand;font-size:22px;"> ពុំមានកំណត់ត្រាផ្តន្ទាទោសជាប់ពន្ធនាគារ ដែលត្រូវចុះក្នុងព្រឹត្តិបត្រលេខ​៣ នៃបញ្ជីថ្កោលទោសតម្កល់ នៅក្រសួងយុត្តិធម៌ឡើយ គិតរហូតមកដល់កាលបរិច្ឆេទនៃការចេញ ព្រឹត្តិបត្រនេះ ៕</span></p>`
        this.decree_result.patchValue(decree)
      }
    }
  }

  changeSlider(e, head) {
    if (head) {
      this.headHeight = e.value;
      localStorage.setItem('headHeight', this.headHeight.toString());
    }
    else {
      this.bodyHeight = e.value;
      localStorage.setItem('bodyHeight', this.bodyHeight.toString());
    }
  }

  changeSliderGender(e){
    this.genderPositionCorrection = e?.value;
    localStorage.setItem('genderPositionCorrection', this.genderPositionCorrection.toString());
  }

  onEditorChange() {
    if (!this.Item) {
      return;
    }
    const { decree_result, key } = this.Item;
    const data = {
      ...decree_result,
      name: this.decree_result.value,
    }
    this.Item.decree_result = data;
    const decree_updated_at = this.ds.serverTimestamp();
    const decree_updated_by = { displayName:this.auth?.user?.displayName || null, key: this.auth.user.uid || null };

    this.ds.criminalRecordRef().doc(key).update({ decree_result: data,decree_updated_at,decree_updated_by }).then(() => {
    }).catch(error => {
      console.log('error', error);
    })
  }
}
