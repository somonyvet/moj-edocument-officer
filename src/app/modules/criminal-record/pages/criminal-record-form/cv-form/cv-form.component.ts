import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, PHOTO_LIB, STATUS_LIVES_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, KHMER_DAY, monthOfYear } from 'src/app/dummy/report';
import { APPLICATION_TYPE } from 'src/app/dummy/status';
import { IOfficerPersonalInfo } from 'src/app/interfaces/user';
import { ConvertService, pushToArray, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, getYearsList, MappingService, toGeoData, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
  selector: 'app-cv-form',
  templateUrl: './cv-form.component.html',
  styleUrls: ['./cv-form.component.scss']
})
export class CvFormComponent implements OnInit {
  backUrl: string = null;
  form: FormGroup;
  params: any;
  GENDER_KH = GENDER_DATA;
  FAMILY_STATUS = FAMILY_STATUS;
  STATUS_OBJ = STATUS_OBJ;
  khDay = KHMER_DAY;

  STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY;

  NATIONALITY = [
    { key: 1, name: 'ខ្មែរ' },
    // { key: 2, name: 'បរទេស' },
    // { key: 3, name: 'វៀតណាម' },
    // { key: 4, name: 'ថៃ' },
  ]

  DAYS = days;
  KHDAYS = KHdays;
  MONTHS = monthOfYear;
  years = getYearsList(100);

  filteredDay: Observable<Array<any>>;
  filteredMonth: Observable<Array<any>>;
  filteredYear: Observable<Array<any>>;

  liveProvince: Observable<Array<any>>;
  liveDistrict: Observable<Array<any>>;
  liveCommune: Observable<Array<any>>;
  liveVillage: Observable<Array<any>>;

  fatherBDProvince: Observable<Array<any>>;
  fatherBDDistrict: Observable<Array<any>>;
  fatherBDCommune: Observable<Array<any>>;
  fatherBDVillage: Observable<Array<any>>;

  motherBDProvince: Observable<Array<any>>;
  motherBDDistrict: Observable<Array<any>>;
  motherBDCommune: Observable<Array<any>>;
  motherBDVillage: Observable<Array<any>>;

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

  father_bd_province: AbstractControl;
  father_bd_district: AbstractControl;
  father_bd_commune: AbstractControl;
  father_bd_village: AbstractControl;

  mother_bd_province: AbstractControl;
  mother_bd_district: AbstractControl;
  mother_bd_commune: AbstractControl;
  mother_bd_village: AbstractControl;

  day_footer: AbstractControl;
  month_footer: AbstractControl;
  year_footer: AbstractControl;

  motherIsDead: AbstractControl;

  selectedPraiseFileArray = {};
  selectedPenaltyFileArray = [];

  @ViewChild('praiseFile') praiseFile: ElementRef;
  @ViewChild('penaltyFile') penaltyFile: ElementRef;
  @ViewChild('policeCartFile') policeCartFile: ElementRef;
  @ViewChild('nationalIDFile') nationalIDFile: ElementRef;
  selectedPoliceCardFiles = [];
  selectedNationalIDFiles = [];

  selectedPoliceCardFilesDB = [];
  selectedNationalIDFilesDB = [];
  deleteFilesID = [];
  deleteFilesPID = [];

  SELECTED_PHOTO: any = null;
  URL: any = null;
  @ViewChild('photoFile') photoFile: ElementRef;
  ITEM: any;
  process: boolean = false;

  positionList = [];
  titleList = [];

  dateOfPostOnInvalid: boolean = false;
  dateOfBirthInvalid: boolean = false;
  dateOfEntryPoliceWorkInvalid: boolean = false;

  photoUrl: string = null;
  disableDate: boolean = false;

  constructor(
    private fb: FormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public store: OfficerStore,
    public storage: FireStorageService,

  ) { }

  async ngOnInit() {
    if (this.route?.snapshot?.queryParams?.backUrl) {
      this.route.queryParams.subscribe(queryParams => {
        this.backUrl = queryParams?.backUrl ? JSON.parse(queryParams?.backUrl) : null;
      })
    }

    this.form = this.fb.group({
      day_footer: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      month_footer: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      year_footer: [null, [Validators.required, MappingService.validSelected.bind(this)]],

      first_name: [null, Validators.required],
      last_name: [null, Validators.required],
      full_name_en: [null, Validators.required],

      gender: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      dateOfBirthDay: [null],
      dateOfBirthMonth: [null],
      dateOfBirthYear: [null],

      before_nationality: [this.NATIONALITY[0], [Validators.required, MappingService.validSelected.bind(this)]],
      current_nationality: [this.NATIONALITY[0], [Validators.required, MappingService.validSelected.bind(this)]],

      occupation: [null],
      liveInForeign: [null],

      father_name: [null, Validators.required],
      fatherDob: [null, Validators.required],
      fatherIsDead: [null, Validators.required],
      father_before_nationality: [null, Validators.required],
      father_current_nationality: [null, Validators.required],
      fatherCurrentOccupation: [null, Validators.required],
      // fatherCurrentAddress: [null, Validators.required],

      mother_name: [null, Validators.required],
      motherDob: [null, Validators.required],
      motherIsDead: [null, Validators.required],
      mother_before_nationality: [null, Validators.required],
      mother_current_nationality: [null, Validators.required],
      motherCurrentOccupation: [null, Validators.required],
      // motherCurrentAddress: [null, Validators.required],

      spouse: [null, Validators.required],
      spouseDob: [null],
      spouseIsDead: [null, Validators.required],
      spouse_before_nationality: [null],
      spouse_current_nationality: [null],
      spouseCurrentOccupation: [null],

      bd_province: [null, [MappingService.validSelected.bind(this)]],
      bd_commune: [null, [MappingService.validSelected.bind(this)]],
      bd_district: [null, [MappingService.validSelected.bind(this)]],
      bd_village: [null, [MappingService.validSelected.bind(this)]],

      father_bd_province: [null, [MappingService.validSelected.bind(this)]],
      father_bd_commune: [null, [MappingService.validSelected.bind(this)]],
      father_bd_district: [null, [MappingService.validSelected.bind(this)]],
      father_bd_village: [null, [MappingService.validSelected.bind(this)]],

      mother_bd_province: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_commune: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_district: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_village: [null, [MappingService.validSelected.bind(this)]],

      live_province: [null, [MappingService.validSelected.bind(this)]],
      live_district: [null, [MappingService.validSelected.bind(this)]],
      live_commune: [null, [MappingService.validSelected.bind(this)]],
      live_village: [null, [MappingService.validSelected.bind(this)]],


    })

    this.day_footer = this.form.controls['day_footer'];
    this.month_footer = this.form.controls['month_footer'];
    this.year_footer = this.form.controls['year_footer'];

    this.father_bd_province = this.form.controls['father_bd_province'];
    this.father_bd_commune = this.form.controls['father_bd_commune'];
    this.father_bd_district = this.form.controls['father_bd_district'];
    this.father_bd_village = this.form.controls['father_bd_village'];

    this.mother_bd_province = this.form.controls['mother_bd_province'];
    this.mother_bd_commune = this.form.controls['mother_bd_commune'];
    this.mother_bd_district = this.form.controls['mother_bd_district'];
    this.mother_bd_village = this.form.controls['mother_bd_village'];

    this.bd_province = this.form.controls['bd_province'];
    this.bd_district = this.form.controls['bd_district'];
    this.bd_commune = this.form.controls['bd_commune'];
    this.bd_village = this.form.controls['bd_village'];

    this.live_province = this.form.controls['live_province'];
    this.live_district = this.form.controls['live_district'];
    this.live_commune = this.form.controls['live_commune'];
    this.live_village = this.form.controls['live_village'];
    this.motherIsDead = this.form.controls['motherIsDead'];

    const positionData = await this.store.fetchList(this.ds.dbRef().collection("positions", ref => ref.orderBy("order", "asc")));
    this.positionList = positionData;
    const titleData = await this.store.fetchList(this.ds.dbRef().collection("ranking", ref => ref.orderBy("order", "asc")));
    this.titleList = titleData;

    const ValueProvince = await this.ds.provinceFireRef().get();
    const arrProvince = pushToArray(ValueProvince);

    this.bdProvince = MappingService.autoComplete(this.bd_province, arrProvince, 'name');
    this.fatherBDProvince = MappingService.autoComplete(this.father_bd_province, arrProvince, 'name');
    this.motherBDProvince = MappingService.autoComplete(this.mother_bd_province, arrProvince, 'name');
    this.liveProvince = MappingService.autoComplete(this.live_province, arrProvince, 'name');

    this.onSelectDate()

    const { registrationFormDoc } = this.store;

    // if (registrationFormDoc) {
    //   this.ITEM = registrationFormDoc;
    //   const {

    //     full_name,
    //     full_name_en,
    //     nick_name,
    //     gender,
    //     before_nationality,
    //     current_nationality,

    //     dateOfBirthDay,
    //     dateOfBirthMonth,
    //     dateOfBirthYear,

    //     // bd_province,
    //     // bd_district,
    //     // bd_commune,
    //     // bd_village,

    //     // live_province,
    //     // live_district,
    //     // live_commune,
    //     // live_village,
    //     occupation,

    //     father_name,
    //     fatherIsDead,
    //     father_before_nationality,
    //     father_current_nationality,
    //     fatherDob,

    //     fatherCurrentOccupation,

    //     mother_name,
    //     motherIsDead,
    //     mother_before_nationality,
    //     mother_current_nationality,

    //     motherCurrentOccupation,
    //     motherDob,

    //     spouse,
    //     spouseIsDead,
    //     spouse_before_nationality,
    //     spouse_current_nationality,
    //     spouseCurrentOccupation,
    //     spouseDob,

    //     footer_phone,

    //     birthAddress,
    //     permanentAddress,
    //     status,
    //     father_bd_province,
    //     father_bd_commune,
    //     father_bd_district,
    //     father_bd_village,

    //     mother_bd_province,
    //     mother_bd_district,
    //     mother_bd_commune,
    //     mother_bd_village,
    //   } = registrationFormDoc;

    //   if (birthAddress?.province) {
    //     const geoDistrictData = await this.store.fetchList(this.ds.districtRef(birthAddress?.province.key));
    //     this.bdDistrict = MappingService.autoComplete(this.bd_district, geoDistrictData, 'name')
    //   }
    //   if (birthAddress?.district) {
    //     const geoDistrictData = await this.store.fetchList(this.ds.communeRef(birthAddress?.district.key));
    //     this.bdCommune = MappingService.autoComplete(this.bd_commune, geoDistrictData, 'name')
    //   }
    //   if (birthAddress?.commune) {
    //     const geoDistrictData = await this.store.fetchList(this.ds.villageRef(birthAddress?.commune.key));
    //     this.bdVillage = MappingService.autoComplete(this.bd_village, geoDistrictData, 'name')
    //   }

    //   if (permanentAddress?.province) {
    //     const geoDistrictData = await this.store.fetchList(this.ds.districtRef(permanentAddress?.province.key));
    //     this.liveDistrict = MappingService.autoComplete(this.live_district, geoDistrictData, 'name')
    //   }
    //   if (permanentAddress?.district) {
    //     const geoDistrictData = await this.store.fetchList(this.ds.communeRef(permanentAddress?.district.key));
    //     this.liveCommune = MappingService.autoComplete(this.live_commune, geoDistrictData, 'name')
    //   }
    //   if (permanentAddress?.commune) {
    //     const geoDistrictData = await this.store.fetchList(this.ds.villageRef(permanentAddress?.commune.key));
    //     this.liveVillage = MappingService.autoComplete(this.live_village, geoDistrictData, 'name')
    //   }

    //   this.form.patchValue({

    //     full_name,
    //     full_name_en,
    //     nick_name,
    //     gender,
    //     before_nationality,
    //     current_nationality,

    //     dateOfBirthDay,
    //     dateOfBirthMonth,
    //     dateOfBirthYear,

    //     occupation,

    //     father_name,
    //     fatherIsDead,
    //     father_before_nationality,
    //     father_current_nationality,
    //     fatherDob,

    //     fatherCurrentOccupation,

    //     mother_name,
    //     motherIsDead,
    //     mother_before_nationality,
    //     mother_current_nationality,

    //     motherCurrentOccupation,
    //     motherDob,

    //     spouse,
    //     spouseIsDead,
    //     spouse_before_nationality,
    //     spouse_current_nationality,
    //     spouseCurrentOccupation,
    //     spouseDob,

    //     footer_phone,

    //     bd_province: birthAddress ? birthAddress.province : null,
    //     bd_district: birthAddress ? birthAddress.district : null,
    //     bd_commune: birthAddress ? birthAddress.commune : null,
    //     bd_village: birthAddress ? birthAddress.village : null,

    //     live_province: permanentAddress ? permanentAddress.province : null,
    //     live_district: permanentAddress ? permanentAddress.district : null,
    //     live_commune: permanentAddress ? permanentAddress.commune : null,
    //     live_village: permanentAddress ? permanentAddress.village : null,

    //     father_bd_province,
    //     father_bd_commune,
    //     father_bd_district,
    //     father_bd_village,

    //     mother_bd_province,
    //     mother_bd_commune,
    //     mother_bd_district,
    //     mother_bd_village,
    //   })
    //   // this.URL = photo?.downloadUrl ? transformImageSameTokenNo(photo?.downloadUrl, "400").uri : null;
    //   this.store?.subscribeOfficerStatus.subscribe(status => {
    //     if (status?.key !== STATUS_OBJ.PENDING.key) {
    //       this.form.disable();
    //       this.disableDate = true;
    //     }
    //     else {
    //       this.form.enable();
    //       this.disableDate = false;
    //     }
    //   })
    // }

  }

  onSelectDate() {
    this.filteredDay = MappingService.autoComplete(this.day_footer, this.DAYS, 'number')
    this.filteredMonth = MappingService.autoComplete(this.month_footer, this.MONTHS, 'name')

    const years = this.years.map(m => { return { key: m.toString(), name: toLocaleNumber(m, 4) } })
    this.filteredYear = MappingService.autoComplete(this.year_footer, years, 'number')
  }

  onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_PHOTO = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.URL = event.target.result;
      }
      this.photoFile.nativeElement.value = "";
    }
  }


  onSelectedPoliceCardFile(event) {
    if (event && event.target.files.length > 0) {
      for (let index = 0; index < event.target.files.length; index++) {
        const element = event.target.files[index];
        if (`${element.type}`.startsWith('image')) {
          const reader = new FileReader();
          reader.readAsDataURL(element);
          reader.onload = (event) => {
            const URL = event.target.result;
            this.selectedPoliceCardFiles.push({ file: element, downloadUrl: URL })
          }
        } else {
          this.selectedPoliceCardFiles.push({ file: element, downloadUrl: null })
        }
      }
      this.policeCartFile.nativeElement.value = "";
    }
  }


  onSelectedNationalIDFile(event) {
    if (event && event.target.files.length > 0) {
      for (let index = 0; index < event.target.files.length; index++) {
        const element = event.target.files[index];
        if (`${element.type}`.startsWith('image')) {
          const reader = new FileReader();
          reader.readAsDataURL(element);
          reader.onload = (event) => {
            const URL = event.target.result;
            this.selectedNationalIDFiles.push({ file: element, downloadUrl: URL })
          }
        } else {
          this.selectedNationalIDFiles.push({ file: element, downloadUrl: null })
        }
      }
      this.nationalIDFile.nativeElement.value = "";
    }
  }


  selectedPraiseFile(event, index) {
    const files = event.target.files[0];
    this.selectedPraiseFileArray[index] = files;
    this.praiseFile.nativeElement.value = "";
  }

  removePraiseFile(index) {
    this.selectedPraiseFileArray[index] = null
  }

  selectedPenaltyFile(event, index) {
    const files = event.target.files[0]
    this.selectedPenaltyFileArray[index] = files;
    this.penaltyFile.nativeElement.value = "";
  }
  removePenaltyFile(index) {
    this.selectedPenaltyFileArray[index] = null
  }

  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
  }

  removeFormArrayWithField(name: string, index?: number) {
    const formArray = this.form.get(name) as FormArray;

    if (formArray?.controls?.length === 1) return;
    formArray.removeAt(formArray?.controls?.length - 1);
    if (name === 'praiseHistory') {
      this.selectedPraiseFileArray[index] = null
    }
    if (name === 'penaltyHistory') {
      this.selectedPenaltyFileArray[index] = null
    }

  }

  addFormArrayWithFields(name: string, fields: any[], index?: number) {
    const formArray = this.form?.get(name) as FormArray;
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
    const formArr = this.form.get(name) as FormArray;
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
      const geoDistrictData = await this.store.fetchList(this.ds.districtRef(value.key));
      this.liveDistrict = MappingService.autoComplete(this.live_district, geoDistrictData, 'name')
    }
  }
  async _selectFatherProvince(event) {
    const { value } = event.option;
    this.form.patchValue({
      father_live_district: null,
      father_live_commune: null,
    })
    if (value) {
      const geoDistrictData = await this.store.fetchList(this.ds.districtRef(value.key));
      this.fatherBDDistrict = MappingService.autoComplete(this.live_district, geoDistrictData, 'name')
    }
  }
  async _selectMotherProvince(event) {
    const { value } = event.option;
    this.form.patchValue({
      mother_bd_district: null,
      mother_bd_commune: null,
    })
    if (value) {
      const geoDistrictData = await this.store.fetchList(this.ds.districtRef(value.key));
      this.motherBDDistrict = MappingService.autoComplete(this.mother_bd_district, geoDistrictData, 'name')
    }
  }

  async _selectLiveDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.communeRef(value.key));
      this.liveCommune = MappingService.autoComplete(this.live_commune, geoCommuneData, 'name')
    }
  }

  async _selectFatherDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      father_live_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.communeRef(value.key));
      this.fatherBDCommune = MappingService.autoComplete(this.father_bd_commune, geoCommuneData, 'name')
    }
  }

  async _selectMotherDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      mother_bd_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.communeRef(value.key));
      this.motherBDCommune = MappingService.autoComplete(this.mother_bd_commune, geoCommuneData, 'name')
    }
  }


  async _selectLiveCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_village: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.villageRef(value.key));
      this.liveVillage = MappingService.autoComplete(this.live_village, geoCommuneData, 'name');
    }
  }

  async _selectFatherCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      father_bd_village: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.villageRef(value.key));
      this.fatherBDVillage = MappingService.autoComplete(this.father_bd_village, geoCommuneData, 'name');
    }
  }
  async _selectMotherCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      mother_bd_village: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.villageRef(value.key));
      this.motherBDVillage = MappingService.autoComplete(this.mother_bd_village, geoCommuneData, 'name');
    }
  }


  async _selectProvince(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_district: null,
      bd_commune: null,
    })
    if (value) {
      const geoDistrictData = await this.store.fetchList(this.ds.districtRef(value.key));
      this.bdDistrict = MappingService.autoComplete(this.bd_district, geoDistrictData, 'name')

    }
  }

  async _selectDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.communeRef(value.key));
      this.bdCommune = MappingService.autoComplete(this.bd_commune, geoCommuneData, 'name')
    }
  }

  async _selectCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_village: null,
    })
    if (value) {
      const geoCommuneData = await this.store.fetchList(this.ds.villageRef(value.key));
      this.bdVillage = MappingService.autoComplete(this.bd_village, geoCommuneData, 'name')
    }
  }

  onRemoveFilePID(file, i) {
    this.selectedPoliceCardFiles = this.selectedPoliceCardFiles.filter((_, index) => index !== i)
  }

  onRemoveFilePID_DB(file, i) {
    this.deleteFilesPID.push(file);
    this.selectedPoliceCardFilesDB = this.selectedPoliceCardFilesDB.filter((_, index) => index !== i)
    this.ITEM.policeCardFiles = this.selectedPoliceCardFilesDB
  }

  onRemoveFileID(file, i) {
    this.selectedNationalIDFiles = this.selectedNationalIDFiles.filter((_, index) => index !== i)
  }

  onRemoveFileID_DB(file, i) {
    this.deleteFilesID.push(file);
    this.selectedNationalIDFilesDB = this.selectedNationalIDFilesDB.filter((_, index) => index !== i)
    this.ITEM.nationalCardIdFiles = this.selectedNationalIDFilesDB;
  }


  async _onSave(f: any) {
    const item: any = this.ITEM || {};
    // if (item && item?.status?.key !== STATUS_OBJ.PENDING.key) {
    //   return;
    // }

    const {
      full_name_en,
      first_name,
      last_name,
      gender,
      before_nationality,
      current_nationality,

      dateOfBirthDay,
      dateOfBirthMonth,
      dateOfBirthYear,

      bd_province,
      bd_district,
      bd_commune,
      bd_village,

      live_province,
      live_district,
      live_commune,
      live_village,
      occupation,

      father_name,
      fatherIsDead,
      father_before_nationality,
      father_current_nationality,
      fatherDob,

      father_bd_province,
      father_bd_district,
      father_bd_commune,
      father_bd_village,

      fatherCurrentOccupation,

      mother_name,
      motherIsDead,
      mother_before_nationality,
      mother_current_nationality,

      mother_bd_province,
      mother_bd_district,
      mother_bd_commune,
      mother_bd_village,

      motherCurrentOccupation,
      motherDob,

      spouse,
      spouseIsDead,
      spouse_before_nationality,
      spouse_current_nationality,
      spouseCurrentOccupation,
      spouseDob,

      footer_phone,
    } = f

    this.form.disable()
    this.process = true;
    const { uid } = this.auth;

    const birthAddressData = {
      province: bd_province ? toGeoData(bd_province) : null,
      district: bd_district ? toGeoData(bd_district) : null,
      commune: bd_commune ? toGeoData(bd_commune) : null,
      village: bd_village ? toGeoData(bd_village) : null,
    };
    const permanentAddressData = {
      province: live_province ? toGeoData(live_province) : null,
      district: live_district ? toGeoData(live_district) : null,
      commune: live_commune ? toGeoData(live_commune) : null,
      village: live_village ? toGeoData(live_village) : null,
    };

    const fatherBirthAddressData = {
      province: father_bd_province ? toGeoData(father_bd_province) : null,
      district: father_bd_district ? toGeoData(father_bd_district) : null,
      commune: father_bd_commune ? toGeoData(father_bd_commune) : null,
      village: father_bd_village ? toGeoData(father_bd_village) : null,
    }

    const motherBirthAddressData = {
      province: mother_bd_province ? toGeoData(mother_bd_province) : null,
      district: mother_bd_district ? toGeoData(mother_bd_district) : null,
      commune: mother_bd_commune ? toGeoData(mother_bd_commune) : null,
      village: mother_bd_village ? toGeoData(mother_bd_village) : null,
    }


    // if (this.SELECTED_PHOTO) {
    //   if (item?.photo) {
    //     await this.storage.deleteFile(item.photo);
    //   }
    //   const file = await this.storage.upload([this.SELECTED_PHOTO])
    //   item.photo = file[0];
    // }

    // const { policeCardFiles, nationalCardIdFiles } = item || {};
    // let policeCardFilesData = policeCardFiles || [];
    // if (this.selectedPoliceCardFiles) {
    //   const files = await this.storage.uploadMulti(this.selectedPoliceCardFiles)
    //   item.policeCardFiles = policeCardFilesData.concat(files)
    // }

    // let nationalCardIdFilesData = nationalCardIdFiles || []
    // if (this.selectedNationalIDFiles) {
    //   const files = await this.storage.uploadMulti(this.selectedNationalIDFiles)
    //   item.nationalCardIdFiles = nationalCardIdFilesData.concat(files)
    // }

    // if (this.deleteFilesID.length > 0) {
    //   this.storage.delete(this.deleteFilesID);
    //   this.deleteFilesID = [];
    // }

    // if (this.deleteFilesPID.length > 0) {
    //   this.storage.delete(this.deleteFilesPID);
    //   this.deleteFilesPID = [];
    // }
    const khmerFullName = last_name + ' ' + first_name;

    const key = this.ds.createId();

    const data: any = {
      key: item?.key || key,
      status: item?.status || STATUS_OBJ.PENDING,
      created_at: item?.created_at || this.ds.serverTimestamp(),
      created_by: item?.created_by || uid,
      updated_by: uid,
      updated_at: this.ds.serverTimestamp(),
      date_key: item?.date_key || ConvertService.dateKey(),
      page_key: item?.page_key || ConvertService.pageKey(),
      keyword: generateKeywords([khmerFullName]).concat([`${footer_phone}`]),
      isDelete: item?.isDelete || false,

      application_type: APPLICATION_TYPE[0],

      photo: item?.photo || null,
      full_name_en: full_name_en || null,
      before_nationality,
      current_nationality,
      first_name,
      last_name,
      full_name: khmerFullName,
      gender: gender,
      occupation: occupation || null,

      dateOfBirthDay: dateOfBirthDay || null,
      dateOfBirthMonth: dateOfBirthMonth || null,
      dateOfBirthYear: dateOfBirthYear || null,

      birthAddress: birthAddressData || null,
      permanentAddress: permanentAddressData,
      phoneNumber: footer_phone || null,

      spacialKey: this.getSpacialKey(),

      father_name: father_name || null,
      fatherIsDead: fatherIsDead || null,
      father_before_nationality: father_before_nationality || null,
      father_current_nationality: father_current_nationality || null,
      fatherDob: fatherDob || null,
      fatherBirthAddress: fatherBirthAddressData,
      fatherCurrentOccupation: fatherCurrentOccupation || null,

      mother_name: mother_name || null,
      motherIsDead: motherIsDead || null,
      mother_before_nationality: mother_before_nationality || null,
      mother_current_nationality: mother_current_nationality || null,
      motherDob: motherDob || null,
      motherBirthAddress: motherBirthAddressData,
      motherCurrentOccupation: motherCurrentOccupation || null,

      spouse: spouse || null,
      spouseIsDead: spouseIsDead || null,
      spouse_before_nationality: spouse_before_nationality || null,
      spouse_current_nationality: spouse_current_nationality || null,
      spouseCurrentOccupation: spouseCurrentOccupation || null,
      spouseDob: spouseDob || null,
    }

    data?.keyword?.push(data?.spacialKey)

    // this.ds.criminalRecordRef().doc(data?.key).set(data, { merge: true })

    this.ds.citizensRef().doc(data.key).set({ ...data, criminal_record_ref: null }, { merge: true }).then(() => {
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.form.reset();
    }).catch(err => {
      alert(err);
    })

    // this.store.saveRegistrationForm(data, (success, res) => {
      this.form.enable();
      this.process = false;
    //   if (success) {
    //     this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    //     this.SELECTED_PHOTO = null;
    //   } else {
    //     alert(res);
    //   }
    // })
  }

  onSelectedDateOfPostOn(event) {
    this.form.get('dateOfPostOnDay').patchValue(event?.day);
    this.form.get('dateOfPostOnMonth').patchValue(event?.month);
    this.form.get('dateOfPostOnYear').patchValue(event?.year);

    if (event?.day && event?.month && event?.year)
      this.dateOfPostOnInvalid = !this.checkValidDate(event?.day?.key, event?.month?.key, event?.year?.key)
    else
      this.dateOfPostOnInvalid = false;
  }

  onSelectedDateOfEntryPoliceWork(event) {
    this.form.get('dateOfEntryPoliceWorkDay').patchValue(event?.day);
    this.form.get('dateOfEntryPoliceWorkMonth').patchValue(event?.month);
    this.form.get('dateOfEntryPoliceWorkYear').patchValue(event?.year);
    if (event?.day && event?.month && event?.year)
      this.dateOfEntryPoliceWorkInvalid = !this.checkValidDate(event?.day?.key, event?.month?.key, event?.year?.key)
    else
      this.dateOfEntryPoliceWorkInvalid = false;
  }

  onSelectedDateOfBirth(event) {
    this.form.get('dateOfBirthDay').patchValue(event?.day);
    this.form.get('dateOfBirthMonth').patchValue(event?.month);
    this.form.get('dateOfBirthYear').patchValue(event?.year);

    if (event?.day && event?.month && event?.year)
      this.dateOfBirthInvalid = !this.checkValidDate(event?.day?.key, event?.month?.key, event?.year?.key)
    else
      this.dateOfBirthInvalid = false;
  }


  checkValidDate(day, month, year) {
    const date = moment(`${year}-${month}-${day}`);
    return date.isValid()
  }

  optionSelected() {

  }

  onSelectedDateSpouse(event) {
    this.form.get('spouseDob').patchValue(event)
  }

  onSelectedDateChildDoB(event, index) {
    const form = this.form.get('childrenInfo') as FormArray;
    form.at(index).get('dob').patchValue(event)
  }

  onSelectedDateFatherDob(event) {
    this.form.get('fatherDob').patchValue(event)
  }

  onSelectedDateMotherDob(event) {
    this.form.get('motherDob').patchValue(event)
  }

  getSpacialKey() {
    const dobDay = this.form.get('dateOfBirthDay')?.value?.key || null;
    const dobMonth = this.form.get('dateOfBirthMonth')?.value?.key || null;
    const dobYear = this.form.get('dateOfBirthYear')?.value?.key || null;
    const dob = dobYear ? dobYear : '' + dobMonth ? dobMonth : '' + dobDay ? dobDay : '';
    const skey = this.form.get('last_name').value + '_' + this.form.get('first_name').value + '_' + this.form.get('gender').value?.text + '_' + dob + '_' + this.form.get('bd_province').value?.name + '_' + this.form.get('bd_district').value?.name + '_' + this.form.get('bd_commune').value?.name + '_' + this.form.get('bd_village').value?.name;
    return skey;
  }

  findInvalidControls() {
    const invalid = [];
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
}
