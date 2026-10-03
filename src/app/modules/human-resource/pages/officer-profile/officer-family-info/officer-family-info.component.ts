import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, STATUS_LIVES_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, monthOfYear } from 'src/app/dummy/report';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
  selector: 'app-officer-family-info',
  templateUrl: './officer-family-info.component.html',
  styleUrls: ['./officer-family-info.component.scss']
})
export class OfficerFamilyInfoComponent implements OnInit {

  form: FormGroup;
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

  ITEM: any;
  process: boolean = false;

  @ViewChild('praiseFile') praiseFile: ElementRef;
  @ViewChild('penaltyFile') penaltyFile: ElementRef;

  STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY;

  spouseDeadStatus;
  fatherDeadStatus;
  motherDeadStatus;
  constructor(
    private fb: FormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public store: OfficerStore,
  ) { }

  async ngOnInit() {

    this.form = this.fb.group({
      spouse: [null],
      spouseIsDead: [false],
      spouseDob: [null],
      spousePlaceOfBirth: [null],
      spouseCurrentOccupation: [null],
      spouseCurrentAddress: [null],

      childrenNumber: [null],
      childrenFemaleNumber: [null],
      childrenMaleNumber: [null],

      childrenInfo: new FormArray([]),

      fatherName: [null],
      fatherIsDead: [false],
      fatherDob: [null],
      fatherPlaceOfBirth: [null],
      fatherCurrentAddress: [null],
      fatherCurrentOccupation: [null],


      motherName: [null],
      motherIsDead: [false],
      motherDob: [null],
      motherPlaceOfBirth: [null],
      motherCurrentAddress: [null],
      motherCurrentOccupation: [null],



    })
    const { registrationFormDoc } = this.store;
    if (registrationFormDoc && registrationFormDoc.childrenInfo && registrationFormDoc.childrenInfo.length > 0) {

      registrationFormDoc.childrenInfo.forEach(m => {
        this.addFormArrayWithFields('childrenInfo', [{ field: 'name', value: m?.name }, { field: 'gender', value: m?.gender }, { field: 'dob', value: m.dob ? m.dob : null }, { field: 'occupation', value: m?.occupation }]);
      })

    } else {
      this.addFormArrayWithFields('childrenInfo', [{ field: 'name', value: null }, { field: 'gender', value: null }, { field: 'dob', value: null }, { field: 'occupation', value: null }]);

    }
    if (registrationFormDoc) {
      const { spouse, childrenNumber, childrenInfo, fatherInfo, motherInfo,childrenFemaleNumber,childrenMaleNumber } = registrationFormDoc || {};
      this.spouseDeadStatus = spouse?.isDead || null;
      this.fatherDeadStatus = fatherInfo?.isDead || null;
      this.motherDeadStatus = motherInfo?.isDead || null;

      this.form.patchValue({
        spouse: spouse?.name || null,
        spouseIsDead: spouse?.isDead || null,
        spouseDob: spouse?.dob ? spouse?.dob : null,
        spousePlaceOfBirth: spouse?.birthAddress || null,
        spouseCurrentAddress: spouse?.permanentAddress || null,
        spouseCurrentOccupation: spouse?.occupation || null,

        childrenNumber: childrenNumber || null,
        childrenFemaleNumber: childrenFemaleNumber || null,
        childrenMaleNumber: childrenMaleNumber || null,

        fatherName: fatherInfo?.name || null,
        fatherIsDead: fatherInfo?.isDead || null,
        fatherDob: fatherInfo?.dob ? fatherInfo?.dob : null,
        fatherPlaceOfBirth: fatherInfo?.birthAddress || null,
        fatherCurrentAddress: fatherInfo?.permanentAddress || null,
        fatherCurrentOccupation: fatherInfo?.occupation || null,


        motherName: motherInfo?.name || null,
        motherIsDead: motherInfo?.isDead || null,
        motherDob: motherInfo?.dob ? motherInfo?.dob : null,
        motherPlaceOfBirth: motherInfo?.birthAddress || null,
        motherCurrentAddress: motherInfo?.permanentAddress || null,
        motherCurrentOccupation: motherInfo?.occupation || null,
      })
    }


  }


  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
  }
  //multiform
  removeFormArrayWithField(name: string, index?: number) {
    const formArray = this.form.get(name) as FormArray;
    if (formArray?.controls?.length === 1) return;
    formArray.removeAt(formArray?.controls?.length - 1);

  }

  addFormArrayWithFields(name: string, fields: any[], index?: number) {
    const formArray = this.form?.get(name) as FormArray;
    if (index) {
      if (index === formArray?.length) {
        let object = {}
        fields.map(m => {
          object[m?.field] = [m?.value]
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
        object[m?.field] = [m?.value]
      })
      formArray.push(
        this.fb.group(
          object
        )
      )
    }
  }

  _onSave(f: any) {
    this.process = true
    const {
      spouse,
      spouseIsDead,
      spouseDob,
      spousePlaceOfBirth,
      spouseCurrentOccupation,
      spouseCurrentAddress,


      fatherName,
      fatherIsDead,
      fatherDob,
      fatherPlaceOfBirth,
      fatherCurrentAddress,
      fatherCurrentOccupation,


      motherName,
      motherIsDead,
      motherDob,
      motherPlaceOfBirth,
      motherCurrentAddress,
      motherCurrentOccupation,


      childrenNumber,
      childrenFemaleNumber,
      childrenMaleNumber,
      childrenInfo,

    } = this.form.getRawValue();
    const { registrationFormDoc } = this.store;
    const spouseData = {
      name: spouse,
      isDead: spouseIsDead,
      dob: spouseDob,
      birthAddress: spousePlaceOfBirth,
      permanentAddress: spouseCurrentAddress,
      occupation: spouseCurrentOccupation,
    }


    const fatherData = {
      name: fatherName,
      isDead: fatherIsDead,
      dob: fatherDob,
      birthAddress: fatherPlaceOfBirth,
      permanentAddress: fatherCurrentAddress,
      occupation: fatherCurrentOccupation,
    }

    const motherData = {
      name: motherName,
      isDead: motherIsDead,
      dob: motherDob,
      birthAddress: motherPlaceOfBirth,
      permanentAddress: motherCurrentAddress,
      occupation: motherCurrentOccupation,
    }


    const data = {
      key: registrationFormDoc.key,
      spouse: spouseData,
      childrenNumber: childrenNumber,
      childrenFemaleNumber: childrenFemaleNumber,
      childrenMaleNumber: childrenMaleNumber,
      childrenInfo: childrenInfo,
      fatherInfo: fatherData,
      motherInfo: motherData,
    }
    this.store.saveRegistrationForm(data, (success, res) => {
      this.process = false

      if (success) {
        this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      } else {
        alert(res);
      }
    })

  }

  onSelectedDateSpouse(event){
    this.form.get('spouseDob').patchValue(event)
  }

  onSelectedDateChildDoB(event,index){
    const form = this.form.get('childrenInfo') as FormArray;
    form.at(index).get('dob').patchValue(event)
  }

  onSelectedDateFatherDob(event){
    this.form.get('fatherDob').patchValue(event)
  }

  onSelectedDateMotherDob(event){
    this.form.get('motherDob').patchValue(event)
  }
}
