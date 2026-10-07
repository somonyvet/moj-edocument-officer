import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, monthOfYear } from 'src/app/dummy/report';
import { DataService } from 'src/app/shared/services/data.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { HrStore } from '../../stores/hr.store';
import { HumanResourceApprovalComponent } from '../human-resource-approval/human-resource-approval.component';

@Component({
    selector: 'app-officer-application-form-preview',
    templateUrl: './officer-application-form-preview.component.html',
    styleUrls: ['./officer-application-form-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerApplicationFormPreviewComponent implements OnInit {

  form: UntypedFormGroup;
  params: any;
  parentParams: any;
  GENDER_KH = GENDER_DATA;
  FAMILY_STATUS = FAMILY_STATUS;
  STATUS_OBJ = STATUS_OBJ;

  NATIONALITY = [
    { key: 1, name: 'ខ្មែរ' },
    { key: 2, name: 'បរទេស' },
    { key: 3, name: 'វៀតណាម' },
    { key: 4, name: 'ថៃ' },
  ]

  DAYS = days;
  KHDAYS = KHdays;
  MONTHS = monthOfYear;

  liveProvince: Observable<Array<any>>;
  liveDistrict: Observable<Array<any>>;
  liveCommune: Observable<Array<any>>;
  liveVillage: Observable<Array<any>>;

  live_province: AbstractControl;
  live_district: AbstractControl;
  live_commune: AbstractControl;
  live_village: AbstractControl;

  bdProvince: Observable<Array<any>>;
  bdDistrict: Observable<Array<any>>;
  bdCommune: Observable<Array<any>>;
  bdVillage: Observable<Array<any>>;

  bd_province: AbstractControl;
  bd_district: AbstractControl;
  bd_commune: AbstractControl;
  bd_village: AbstractControl;

  selectedPraiseFileArray = {};
  selectedPenaltyFileArray = [];

  @ViewChild('praiseFile') praiseFile: ElementRef;
  @ViewChild('penaltyFile') penaltyFile: ElementRef;
  generalEducationArray = [];
  trainingLevelArray = [];

  positionHistoryArray = [];
  rankHistoryArray = [];
  constructor(
    private fb: UntypedFormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public store: HrStore,
    private dialog: MatDialog,
    private ps: PrintService,

  ) { }

  async ngOnInit() {
    this.route?.parent?.params.subscribe(params => {
      this.params = params;
      let docKey = params?.docKey;
      if (params?.docKey === 'officer') {
        docKey = this.auth?.uid
      }
      this.store.fetchSelectedOfficer(docKey, doc => {
        const { generalEducation, positionHistory, rankHistory, trainingLevel } = this.store?.selectedOfficer || {} as any
        this.generalEducationArray = generalEducation || [];
        const b = 5 - this.generalEducationArray.length;
        if (this.generalEducationArray.length <= 5) {
          for (let i = 0; i < b; i++) {
            this.generalEducationArray.push({
              name: null,
              specialization: null,
              education: null,
              date: null
            })
          }
        } else {
          this.generalEducationArray = generalEducation || [];
        }
        this.trainingLevelArray = trainingLevel || [];
        const c = 17 - this.trainingLevelArray.length;
        if (this.trainingLevelArray.length <= 17) {
          for (let i = 0; i < c; i++) {
            this.trainingLevelArray.push({
              name: null,
              specialization: null,
              education: null,
              date: null,
              skill: null,
              location: null,
              duration: null,
            })
          }
        } else {
          this.trainingLevelArray = trainingLevel || [];
        }

        this.positionHistoryArray = positionHistory || [];
        const d = 9 - this.positionHistoryArray.length;
        if (this.positionHistoryArray.length <= 9) {
          for (let i = 0; i < d; i++) {
            this.positionHistoryArray.push({
              name: null,
              specialization: null,
              education: null,
              date: null,
              skill: null,
              location: null,
              duration: null,
              order: null,
              numDoc: null,
            })
          }
        } else {
          this.positionHistoryArray = positionHistory || [];
        }

        this.rankHistoryArray = rankHistory || [];
        const e = 15 - this.rankHistoryArray.length;
        if (this.rankHistoryArray.length <= 15) {
          for (let i = 0; i < e; i++) {
            this.rankHistoryArray.push({
              name: null,
              specialization: null,
              education: null,
              date: null,
              skill: null,
              location: null,
              duration: null,
            })
          }
        } else {
          this.rankHistoryArray = rankHistory || [];
        }
      })
    })
  }

  selectedPraiseFile(event, index) {
    const files = event.target.files[0];
    this.selectedPraiseFileArray[index] = files;
    this.praiseFile.nativeElement.value = "";
  }
  removePraiseFile(index) {
    this.selectedPraiseFileArray[index] = null
    // this.selectedPraiseFileArray.splice(index, 1);
  }


  selectedPenaltyFile(event, index) {
    const files = event.target.files[0]
    this.selectedPenaltyFileArray[index] = files;
    this.penaltyFile.nativeElement.value = "";
  }

  removePenaltyFile(index) {
    // this.selectedPenaltyFileArray.splice(index, 1);
    this.selectedPenaltyFileArray[index] = null

  }

  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
  }
  //multiform
  removeFormArrayWithField(name: string, index?: number) {
    const formArray = this.form.get(name) as UntypedFormArray;

    if (formArray?.controls?.length === 1) return;
    formArray.removeAt(formArray?.controls?.length - 1);
    if (name === 'praiseHistory') {
      this.selectedPraiseFileArray[index] = null
    }
    if (name === 'penaltyHistory') {
      this.selectedPenaltyFileArray[index] = null
      // this.selectedPenaltyFileArray.splice(index, 1);
    }

  }

  addFormArrayWithFields(name: string, fields: any[], index?: number) {
    const formArray = this.form?.get(name) as UntypedFormArray;
    if (index) {
      if (index === formArray?.length) {
        let object = {}
        fields.map(m => {
          object[m?.field] = [m?.value, Validators.required]
        })
        formArray.push(
          this.fb.group(
            object
          )
        )
      }
    } else {
      let object = {}
      fields.map(m => {
        object[m?.field] = [m?.value, Validators.required]
      })
      formArray.push(
        this.fb.group(
          object
        )
      )
    }
  }
  getFormArrvalueFields(name: string, fields: string[]) {
    const formArr = this.form.get(name) as UntypedFormArray;
    return formArr?.controls?.filter(f => f?.get(fields[0])?.value).map(m => {
      let obj = {};
      fields.forEach(m1 => {
        obj[m1] = m?.get(m1)?.value
      })
      return obj;
    })
  }

  async _selectLiveProvince(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_district: null,
      live_commune: null,
    })
    if (value) {
      // const geoDistrictData = await this.store.fetchList(this.ds.districtRef(value.key));
      // this.liveDistrict = MappingService.autoComplete(this.live_district, geoDistrictData, 'name')
    }
  }

  async _selectLiveDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_commune: null,
    })
    if (value) {
      // const geoCommuneData = await this.store.fetchList(this.ds.communeRef(value.key));
      // this.liveCommune = MappingService.autoComplete(this.live_commune, geoCommuneData, 'name')
    }
  }

  async _selectLiveCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_village: null,
    })
    if (value) {
      // const geoCommuneData = await this.store.fetchList(this.ds.villageRef(value.key));
      // this.liveVillage = MappingService.autoComplete(this.live_village, geoCommuneData, 'name');
    }
  }


  async _selectProvince(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_district: null,
      bd_commune: null,
    })
    if (value) {
      // const geoDistrictData = await this.store.fetchList(this.ds.districtRef(value.key));
      // this.bdDistrict = MappingService.autoComplete(this.bd_district, geoDistrictData, 'name')

    }
  }

  async _selectDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_commune: null,
    })
    if (value) {
      // const geoCommuneData = await this.store.fetchList(this.ds.communeRef(value.key));
      // this.bdCommune = MappingService.autoComplete(this.bd_commune, geoCommuneData, 'name')
    }
  }

  async _selectCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_village: null,
    })
    if (value) {
      // const geoCommuneData = await this.store.fetchList(this.ds.villageRef(value.key));
      // this.bdVillage = MappingService.autoComplete(this.bd_village, geoCommuneData, 'name')
    }
  }

  _onApproval() {
    this.dialog.open(HumanResourceApprovalComponent, {
      data: { item: this.store?.selectedOfficer },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '600px',
      disableClose: true,
    })
  }

  selectedFile(file, index) {
  }

  print() {
    this.ps.print('#print', 'a4')
  }

}
