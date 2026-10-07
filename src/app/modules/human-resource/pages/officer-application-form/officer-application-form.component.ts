import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, monthOfYear } from 'src/app/dummy/report';
import { IDepartment, IPosition } from 'src/app/interfaces/document/document.interface';
import { ConvertService, pushToArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { generateKeywords, MappingService } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { BaseStore } from 'src/app/stores/base.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { HrStore } from '../../stores/hr.store';
import { HumanResourceApprovalComponent } from '../human-resource-approval/human-resource-approval.component';

@Component({
    selector: 'app-officer-application-form',
    templateUrl: './officer-application-form.component.html',
    styleUrls: ['./officer-application-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class OfficerApplicationFormComponent implements OnInit,OnDestroy {

  form: UntypedFormGroup;
  params: any;
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

  positionList = [];
  titleList = [];
  constructor(
    private fb: UntypedFormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public store: HrStore,
    private dialog:MatDialog,
    private ps: PrintService,

  ) { }

  async ngOnInit() {

    this.form = this.fb.group({

      firstNameKh: [null,[Validators.required]],
      firstNameEn: [null,[Validators.required]],
      lastNameKh: [null,[Validators.required]],
      lastNameEn: [null,[Validators.required]],

      gender: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      dob: [null, [Validators.required]],
      nationality: [null, [Validators.required, MappingService.validSelected.bind(this)]],

      dateJoinPolice : [null, [Validators.required]],
      fileID: [null, [Validators.required]],
      dateFile: [null, [Validators.required]],

      ranking: [null, [Validators.required]],
      organization : [null, [Validators.required, MappingService.validSelected.bind(this)]],
      position : [null, [Validators.required, MappingService.validSelected.bind(this)]],
      phoneNumber: [null, [Validators.required]],

      policeID: [null, [Validators.required]],
      policeNo: [null, [Validators.required]],
      personalID: [null, [Validators.required]],

      educationLevel:[null],
      educationLevels: new UntypedFormArray([]),
      foreignLanguages: [null, [Validators.required]],

      vocationalTrainingLevel: new UntypedFormArray([]),
      positions: new UntypedFormArray([]),

      positionHistory: new UntypedFormArray([]),
      rankingHistory: new UntypedFormArray([]),

      bd_province: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      bd_commune: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      bd_district: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      bd_village: [null, [Validators.required, MappingService.validSelected.bind(this)]],

      live_province: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_district: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_commune: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_village: [null, [Validators.required, MappingService.validSelected.bind(this)]],


      praiseHistory: new UntypedFormArray([]),
      penaltyHistory: new UntypedFormArray([]),

      spouse:[null],
      spouseDob:[null],
      spousePlaceOfBirth:[null],
      spouseCurrentOccupation:[null],
      spouseCurrentAddress:[null],

      childrenNumber:[null],
      childrenMaleNumber:[null],
      childrenFemaleNumber:[null],
      childrenInfo: new UntypedFormArray([]),


      fatherName:[null],
      fatherDob:[null],
      fatherPlaceOfBirth:[null],
      fatherCurrentAddress:[null],
      fatherCurrentOccupation:[null],


      motherName:[null],
      motherDob:[null],
      motherPlaceOfBirth:[null],
      motherCurrentAddress:[null],
      motherCurrentOccupation:[null],



    })


    this.bd_province = this.form.controls['bd_province'];
    this.bd_district = this.form.controls['bd_district'];
    this.bd_commune = this.form.controls['bd_commune'];
    this.bd_village = this.form.controls['bd_village'];

    this.live_province = this.form.controls['live_province'];
    this.live_district = this.form.controls['live_district'];
    this.live_commune = this.form.controls['live_commune'];
    this.live_village = this.form.controls['live_village'];

    const positionData = await this.store.fetchList(this.ds.dbRef().collection("positions", ref => ref.orderBy("order", "asc")));
    this.positionList = positionData;
    const titleData = await this.store.fetchList(this.ds.dbRef().collection("ranking", ref => ref.orderBy("order", "asc")));
    this.titleList = titleData;

    const ValueProvnce = await this.ds.provinceFireRef().get();
    const arrProvince = pushToArray(ValueProvnce);
    this.bdProvince = MappingService.autoComplete(this.bd_province, arrProvince, 'name')
    this.liveProvince = MappingService.autoComplete(this.live_province, arrProvince, 'name')

    this.addFormArrayWithFields('educationLevels',[{field:'name',value:null},{field:'specialization',value:null},{field:'date',value:null}])
    this.addFormArrayWithFields('vocationalTrainingLevel',[{field:'name',value:null},{field:'school',value:null},{field:'duration',value:null},{field:'date',value:null}])
    this.addFormArrayWithFields('positionHistory',[{field:'name',value:null},{field:'fileId',value:null},{field:'date',value:null}])
    this.addFormArrayWithFields('rankingHistory',[{field:'name',value:null},{field:'fileId',value:null},{field:'date',value:null}])

    this.addFormArrayWithFields('praiseHistory',[{field:'name',value:null},{field:'date',value:null}, {field:'praiseFile',value:null}])
    this.addFormArrayWithFields('penaltyHistory',[{field:'name',value:null},{field:'reason',value:null}, {field:'date',value:null}])
    this.addFormArrayWithFields('childrenInfo',[{field:'name',value:null},{field:'gender',value:null},{field:'dob',value:null}, {field:'occupation',value:null}])


    this.route.params.subscribe(params => {
      this.store.fetchSelectedOfficer(params?.docKey, doc=>{

        if(doc){
          const {first_name, last_name, first_name_en, last_name_en, officerId, gender, dataOfBirth, nationality, birthAddress, dateOfEntryPoliceWork, documentNumber, dateOfPostOn,
            rank, organization, position, permanentAddress, phoneNumber, policeCardID
          } = this.store.selectedOfficer as any
          this.form.patchValue({
            firstNameKh: first_name || null,
            lastNameKh: last_name || null,
            firstNameEn: first_name_en || null,
            lastNameEn: last_name_en || null,
            gender: gender || null,
            dob: dataOfBirth && dataOfBirth.toDate() || null,
            nationality: nationality || null,
            bd_province: birthAddress?.province || null,
            bd_district: birthAddress?.district || null,
            bd_commune: birthAddress?.commune || null,
            bd_village: birthAddress?.village || null,

            dateJoinPolice: dateOfEntryPoliceWork && dateOfEntryPoliceWork.toDate() || null,
            fileID: documentNumber || null,
            dateFile: dateOfPostOn && dateOfPostOn.toDate() || null,

            ranking: rank || null,
            organization: organization || null,
            position: position || null,

            live_province: permanentAddress?.province || null,
            live_district: permanentAddress?.district || null,
            live_commune: permanentAddress?.commune || null,
            live_village: permanentAddress?.village || null,

            phoneNumber: phoneNumber || null,
            policeNo: officerId || null,
            policeID: policeCardID || null,
            personalID: documentNumber || null,



          })
        }
      })
    })
  }

  async ngOnDestroy() {
    await this.store.subscribeSelectedOfficer()
  }


  selectedPraiseFile(event,index){
    const files = event.target.files[0];
    this.selectedPraiseFileArray[index] = files;
    this.praiseFile.nativeElement.value = "";
  }
  removePraiseFile(index){
    this.selectedPraiseFileArray[index] = null
    // this.selectedPraiseFileArray.splice(index, 1);
  }


  selectedPenaltyFile(event,index){
    const files = event.target.files[0]
    this.selectedPenaltyFileArray[index] = files;
    this.penaltyFile.nativeElement.value = "";
  }

  removePenaltyFile(index){
    // this.selectedPenaltyFileArray.splice(index, 1);
    this.selectedPenaltyFileArray[index] = null

  }

  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
  }
  //multiform
  removeFormArrayWithField(name: string, index?:number) {
    const formArray = this.form.get(name) as UntypedFormArray;

    if(formArray?.controls?.length === 1) return;
    formArray.removeAt(formArray?.controls?.length - 1);
    if(name === 'praiseHistory'){
      this.selectedPraiseFileArray[index] = null
    }
    if(name === 'penaltyHistory'){
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
      height: '780px',
      disableClose: true,
    })
  }

  selectedFile(file,index){
  }

  print() {
    this.ps.print('#print', 'a4')
  }

}
