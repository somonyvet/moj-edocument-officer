import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DOCUMENT_NOTE_TYPE_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { DataService } from 'src/app/shared/services/data.service';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { Router } from '@angular/router';
import * as customBuild from 'src/ckeditor5/build/ckeditor';
import { DOCUMENT_FLOW_CATEGORY } from '../../dummy/criminal.dummy';
@Component({
  selector: 'app-decree-input-form',
  templateUrl: './decree-input-form.component.html',
  styleUrls: ['./decree-input-form.component.scss']
})
export class DecreeInputFormComponent implements OnInit {
  @ViewChild("focusInput") inputEl: ElementRef;
  form: FormGroup
  process: boolean = false;
  note_type = DOCUMENT_NOTE_TYPE_ARRAY;

  khmer: boolean = false;
  english: boolean = false;
  french: boolean = false;


  public Editor = customBuild;
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

  configDecree;
  configDecreeEn;
  configDecreeFr;

  constructor(
    public dialogRef: MatDialogRef<DecreeInputFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public ds: DataService,
    public store: CriminalApplicationStore,
    private router: Router,
  ) { }

  buildForm(): void {
    const { item } = this.data;
    this.form = this.fb.group({
      decree: [item && item?.decree_result?.name ? item?.decree_result?.name : null, [Validators.required]],
      decree_en: [item && item?.decree_result?.name_en ? item?.decree_result?.name_en : null, [Validators.required]],
      decree_fr: [item && item?.decree_result?.name_fr ? item?.decree_result?.name_fr : null, [Validators.required]],

      comment_officer: [item && item.comment_officer ? item.comment_officer : null, [Validators.required]],

    })

    this.form.get('decree').disable();
    this.form.get('decree_en').disable();
    this.form.get('decree_fr').disable();
  }

  buildEditorConfig(placeholder: string) {
    return { ...this.config, placeholder };
  }

  ngOnInit() {
    console.log("this.data",this.data)

    this.buildForm();

    this.configDecree = this.buildEditorConfig('សូមបញ្ចូលកំណត់ត្រាផ្ដន្ទាទោសនៅទីនេះ');
    this.configDecreeEn = this.buildEditorConfig('សូមបញ្ចូលកំណត់ត្រាផ្ដន្ទាទោសនៅទីនេះ (English)');
    this.configDecreeFr = this.buildEditorConfig('សូមបញ្ចូលកំណត់ត្រាផ្ដន្ទាទោសនៅទីនេះ (French)');

    if(this.data?.item?.document_flow_category?.key == DOCUMENT_FLOW_CATEGORY.digital.key){
      this.form.get('decree').enable();
      this.form.get('decree_en').enable();
    }else{
      for(let item of this.data?.item?.criminal_language){
        if(item.key === 1){
          this.form.get('decree').enable();
          this.khmer = true;
        }else if(item.key === 2){
          this.form.get('decree_fr').enable();
          this.french = true;
        }else{
          this.form.get('decree_en').enable();
          this.english = true;
        }
      }
    }
  }

  async create(f){
    if(!this.form.valid) return
    const { decree , decree_en, decree_fr, comment_officer } = f;
    const { selectedCriminalRecord, selectedCitizenProfile } = this.store;
    this.process = true;
    const { statusCR } = this.data
    const data = {
      ...selectedCriminalRecord,
      decree_by: this.store?.getMappedProfile(),
      decree_at: this.ds.serverTimestamp(),
      status: STATUS_OBJ.DECREE,
      internal_status: statusCR ? statusCR : STATUS_OBJ.DECREE,
      decree_status: statusCR ? statusCR : this.data?.status,
      decree_result: {
        name: decree||null,
        name_en: decree_en||null,
        name_fr: decree_fr||null,
      },
      comment_officer,
      updated_by: this.store?.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
    }

    if(data?.document_flow_category?.key == DOCUMENT_FLOW_CATEGORY.digital.key){
      const { currentDepartment, employee, config, serverDateTime } = this.auth;
      let digitalFlow = await this.store.getDigitalFlowFirst();
      const currentFlowIndex = digitalFlow?.findIndex((f: any)=>f?.department?.key == currentDepartment.key) ?? -1;
      const currentFlow = currentFlowIndex > -1 ? digitalFlow[currentFlowIndex] : null;
      digitalFlow = digitalFlow?.map((m: any)=>{
        if(m?.department?.key == currentDepartment.key){
          return{
            ...currentFlow,
            approved_at: serverDateTime,
            approved_by: this.auth.getMappedApprover(),
            default_stampFile: employee?.stampFile || null,
            default_remarkFile: employee?.signatureFile || null,
            default_signatureFile: employee?.signatureFile || null,
            comment: comment_officer,
          }
        }
        return {
          flowNo: m?.flowNo,
          department: m?.department,
          key: m?.key,
          category: m?.category,
        }
      })

      const workplaceKeys = digitalFlow?.map((m: any) => m?.department?.key)
      if(!currentFlow){
        alert('ពុំមានចរន្តលំហូរអនុម័តឯកសារ! សូមធ្វើការរៀបចំជាមុនសិន');
        return;
      }else{
        const nextFlow = digitalFlow?.[currentFlowIndex + 1];
        const nextDepartmentKey = nextFlow?.department?.key;
        data.request_approval_workplace_keys = nextDepartmentKey ? [nextDepartmentKey] : [];
        data.approved_officerKey= [this.auth.uid];
        data.approved_officers= [this.auth.getMappedApprover()];
        data.approved_workplaceKeys= [this.auth.currentDepartment.key];
        data.workplaces = digitalFlow;
        data.workplaceKeys = workplaceKeys;
        data.last_approved_at = this.ds.serverTimestamp();
        data.internal_status = STATUS_OBJ.PROCESSING;
      }
    }

    this.store.approvedCriminal(data, selectedCitizenProfile,false).then(() => {
      this.snackBar.open(`ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសបានផ្ដល់និទ្ទេសដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.process = false;
      this.dialogRef.close();
      const segments = this.router.url.split('?')[0].split('/').filter(f => f);
      this.router.navigate(['/', ...segments.slice(0, Math.max(segments.length - 2, 0))]);
    })
  }


}
