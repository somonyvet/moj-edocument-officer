import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { STATUS_LIVES } from 'src/app/dummy/appinfo';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import CustomEditor from 'src/app/shared/ckeditor/custom-editor';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { toNumber } from 'src/app/shared/services/mapping.service';

@Component({
    selector: 'app-criminal-record-letter-en-print',
    templateUrl: './criminal-record-letter-en-print.component.html',
    styleUrls: ['./criminal-record-letter-en-print.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLetterEnPrintComponent implements OnInit {
  @Input() Item:any;
  @Input() criminalLetterDate:any;

  docDate = new Date();
  signatureLeft = null;
  signatureRight = null;
  STATUS_LIVES = STATUS_LIVES

  sizeS1 = 24
  sizeS2 = 24
  sizeS3 = 24
  sizeS4 = 24

  sizeNation1 = 26
  sizeNation2 = 26
  sizeNation3 = 26
  sizeNation4 = 26
  sizeNation5 = 26
  sizeNation6 = 26
  sizeNation7 = 26
  sizeNation8 = 26

  public Editor = CustomEditor;
  public config = {
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

  decree_result = new UntypedFormControl(null);
  minister_name_eng = '';
  director_name_eng = '';

  headHeight = 0;

  constructor(
    private auth : AuthStore,
    private ds: DataService,
    public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    this.headHeight = toNumber(localStorage.getItem('headHeightEn')) || 0
    if(this.Item){
      this.signatureLeft = this.Item?.workplaces?.find(f=>f.flowNo === 4) || null
      this.signatureRight = this.Item?.workplaces?.find(f=>f.flowNo === 3) || null
      this.docDate = this.Item?.workplaces?.find(f=>f?.department?.key === this.auth?.currentDepartment?.key)?.approved_at?.toDate() || new Date();
      if(this.Item?.decree_result?.name_en){
        this.decree_result.patchValue(this.Item.decree_result?.name_en)
      }else{
        const first_name_en = this.Item?.first_name_en || '';
        const last_name_en = this.Item?.last_name_en || '';
        const decree_en = `<p><span style="font-family:'Times New Roman';font-size:26px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The above-mentioned person (<strong>${last_name_en||''} ${first_name_en||''}</strong>) does not have any imprisonment record that shall be registered in Bulletin Number 3 of criminal record held by the Ministry of Justice until &nbsp;the date of issuance of this Bulletin.</span></p>`
        this.decree_result.patchValue(decree_en)
      }
    }
    this.minister_name_eng = localStorage.getItem('minister_name_eng');
    this.director_name_eng = localStorage.getItem('director_name_eng');
  }

  onEditorChange() {
    if (!this.Item) {
      return;
    }
    const { decree_result, key } = this.Item;
    const data = {
      ...decree_result,
      name_en: this.decree_result.value,
    }
    this.Item.decree_result = data;
    const decree_updated_at = this.ds.serverTimestamp();
    const decree_updated_by = { displayName:this.auth?.user?.displayName || null, key: this.auth.user.uid || null };

    this.ds.criminalRecordRef().doc(key).update({ decree_result: data,decree_updated_at,decree_updated_by }).then(() => {
    }).catch(error => {
      console.log('error', error);
    })

  }

  onChangeMinisterName(event){
    this.minister_name_eng = event.target.value;
    localStorage.setItem("minister_name_eng", this.minister_name_eng);
  }

  onChangeDirectorName(event){
    this.director_name_eng = event.target.value;
    localStorage.setItem("director_name_eng", this.director_name_eng);
  }

  changeSlider(e) {
    this.headHeight = e.value;
    localStorage.setItem('headHeightEn', this.headHeight.toString());
  }
}
