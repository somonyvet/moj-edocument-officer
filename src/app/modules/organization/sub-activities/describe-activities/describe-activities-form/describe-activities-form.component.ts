  import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IDepartment, IPosition, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { IMmeProgram, IMmeSubProgram } from 'src/app/interfaces/mme';
import { ConvertService, pushObjArray, pushToArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { getYearData, MappingService, toDepartment, toRanking, toCapitalize, toEmployee, toNameKey, generateKeywords, toSubWorkplace } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { LEVEL_MME, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import * as customBuild from 'src/ckeditor5/build/ckeditor';
import { MmeSubProgramStore } from 'src/app/stores/document/mme-sub-program.store';
import {  MONTH_DATA } from 'src/app/dummy/config';
import { MmeBaseProgramStore } from 'src/app/stores/document/mme_program.store';
import { monthOfYear } from 'src/app/dummy/report';

@Component({
  selector: 'app-describe-activities-form',
  templateUrl: './describe-activities-form.component.html',
  styleUrls: ['./describe-activities-form.component.scss']
})
export class DescribeActivitiesFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('Follower') Follower: ElementRef<HTMLInputElement>;
  @ViewChild('Representative') Representative: ElementRef<HTMLInputElement>;

  title: any = "បង្កើតបរិយាយសកម្មភាព";
  form: FormGroup;
  yearProgram: AbstractControl;
  source_budget: AbstractControl;
  department: AbstractControl;
  filterYearProgram: Observable<IYearProgram[]>;

  position: AbstractControl;
  officer: AbstractControl;
  month: AbstractControl;
  representativeForm: AbstractControl;

  filterPosition: Observable<IPosition[]>;
  itemYearBudget: any[] = [];
  yearBudget: Observable<IYearProgram[]>;
  filterSourceBudget: any[] = [];
  filterDepartment: Observable<IYearProgram[]>;
  filterOfficer: Observable<any[]>;
  FilterMonth: Observable<any[]>;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  removable = true;
  idParent: string;
  MonthList = monthOfYear

  source: any[] = [];
  public Editor = customBuild;
  public config = {
    // placeholder: "",
    toolbar: [
      'fontfamily',
      'fontsize',
      'alignment',
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
      // 'code', 'codeBlock', '|',
      'insertTable', '|',
      'blockQuote', '|',
      'undo', 'redo', '|',
      'heading', '|',
    ],
    fontSize: {
      options: [
        'default',
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
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
        'default, khmeros_siemreap',
        // 'khmer_mool1, khmer_mool1regular',
        'khmer os muol, khmeros_muol',
        'khmer os muol light, khmer_os_muol_light',
        'khmer os battambang, khmeros_battambang',
        'khmer os siemreap, khmeros_siemreap',
        'tacteinga'
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

  constructor(
    public dialogRef: MatDialogRef<DescribeActivitiesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: MmeSubProgramStore,
    public ds: DataService,
    private auth: AuthStore,
    private db: DatabaseService,
    private snackbar: MatSnackBar,
    public basestore: MmeBaseProgramStore,
  ) {
  }
  filterCheckMonth: any[] = [];
  objectCheckMonth: any;
  async ngOnInit(): Promise<void> {
    const { item, parentKey, arrData } = this.data;
    this.form = this.fb.group({
      title: [null, Validators.required],
      month: [null, ([Validators.required, MappingService.validSelected.bind(this)])],
      kh_budget_mef: [null, Validators.required],
      kh_budget_mme: [null, Validators.required],
      us_budget_mme: [null, Validators.required],
    })
    this.month = this.form.controls['month']

      this.filterCheckMonth = arrData;
      for (let item of this.filterCheckMonth) {
        this.objectCheckMonth = item;
        this.MonthList = this.MonthList.filter(m => m.key !== this.objectCheckMonth?.describe_activities_month?.key)
      }

    const monthRef = this.MonthList;
    this.FilterMonth = MappingService.autoComplete(this.month, monthRef, "name");

    if (parentKey) {
      this.idParent = parentKey;
    }
    if (item) {
      this.title = "កែប្រែបរិយាយសកម្មភាព"
      const {
        title,
        describe_activities_kh_budget_mef,
        describe_activities_month,
        describe_activities_kh_budget_mme,
        describe_activities_us_budget_mme
      } = item;
      this.form.patchValue({
        title: title,
        month: describe_activities_month,
        kh_budget_mef: describe_activities_kh_budget_mef,
        kh_budget_mme: describe_activities_kh_budget_mme,
        us_budget_mme: describe_activities_us_budget_mme
      })
    }

  }

  async _onSave(f: any) {
    if(this.form.valid){
    this.form.disable();
    const parentData = this.data?.data || null;
    const data = this.data?.item || null;

    const { title, month, kh_budget_mef, kh_budget_mme, us_budget_mme } = f;
    const displayName = toCapitalize(title)
    const { uid } = this.auth;
    const key = data?.key || this.ds.createId();
      const keywords = generateKeywords([title.toLowerCase()])
      keywords.push(`${month.name}`)
    const item: any = {
      key: key,
      status: data ? (data.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
      created_at: data?.created_at || this.ds.serverTimestamp(),
      created_by: data?.created_by || uid,
      updated_by: uid,
      updated_at: this.ds.serverTimestamp(),
      page_key: data?.page_key || ConvertService.pageKey(),
      isDelete: false,
      keyword: keywords,
      parentKey: [parentData?.key],
      ranking: LEVEL_MME.desc_activities,
      subOfProgram: parentData ? toSubWorkplace(parentData) || null : null,

      file: data ? data.file : null,
      nameKey: toNameKey(title),
      displayName: displayName,
      title: title,
      describe_activities_kh_budget_mef: kh_budget_mef,
      describe_activities_month: month,
      describe_activities_kh_budget_mme: kh_budget_mme,
      describe_activities_us_budget_mme: us_budget_mme,
    }
    const parentitem = {
      key: parentData?.key,
      last_child: parentData?.last_child || true,
    }
    this.store.save(this.db.mmeProgramSaveRef(), item, (success, error) => {
      if (success) {
        this.form.reset()
        this.form.enable();
        this.dialogRef.close({ item: data })
        this.store.updateParent(this.db.mmeProgramSaveRef(), parentitem, (success, error) => {
        })
        this.snackbar.open(`ទិន្នន័យត្រូវបានបង្កើតដោយជោគជ័យ។`, "យល់ព្រម", { duration: 3000 })
      } else {
        this.snackbar.open(error, "យល់ព្រម")
      }
    })
    this.form.reset()
    this.form.enable();
    }

  }

}
