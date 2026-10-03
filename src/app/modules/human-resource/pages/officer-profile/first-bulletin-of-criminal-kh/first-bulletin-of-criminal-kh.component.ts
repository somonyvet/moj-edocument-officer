import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, PHOTO_LIB, STATUS_LIVES_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, KHMER_DAY, monthOfYear } from 'src/app/dummy/report';
import { IOfficerPersonalInfo } from 'src/app/interfaces/user';
import { ConvertService, pushToArray, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, getYearsList, MappingService, toGeoData, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
  selector: 'app-first-bulletin-of-criminal-kh',
  templateUrl: './first-bulletin-of-criminal-kh.component.html',
  styleUrls: ['./first-bulletin-of-criminal-kh.component.scss']
})
export class FirstBulletinOfCriminalKhComponent implements OnInit {
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
    { key: 2, name: 'បរទេស' },
    { key: 3, name: 'វៀតណាម' },
    { key: 4, name: 'ថៃ' },
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

  day_footer: AbstractControl;
  month_footer: AbstractControl;
  year_footer: AbstractControl;

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
      code_header: [null, [Validators.required]],

      full_name: [null, [Validators.required]],
      nick_name: [null],

      gender: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      dateOfBirthDay: [null],
      dateOfBirthMonth: [null],
      dateOfBirthYear: [null],

      before_nationality: [this.NATIONALITY[0], [Validators.required, MappingService.validSelected.bind(this)]],
      current_nationality: [this.NATIONALITY[0], [Validators.required, MappingService.validSelected.bind(this)]],

      occupation: [null],

      father_name: [null, [Validators.required]],
      fatherDob: [null, [Validators.required]],
      father_before_nationality: [null, Validators.required],
      father_current_nationality: [null, Validators.required],
      fatherPlaceOfBirth: [null, Validators.required],
      fatherCurrentOccupation: [null, Validators.required],

      mother_name: [null, [Validators.required]],
      motherDob: [null, [Validators.required]],
      mother_before_nationality: [null, Validators.required],
      mother_current_nationality: [null, Validators.required],
      motherPlaceOfBirth: [null, Validators.required],
      motherCurrentOccupation: [null, Validators.required],

      spouse: [null, Validators.required],
      spouseDob: [null],
      spouse_before_nationality: [null],
      spouse_current_nationality: [null],
      spouseCurrentOccupation: [null],

      bd_province: [null, [MappingService.validSelected.bind(this)]],
      bd_commune: [null, [MappingService.validSelected.bind(this)]],
      bd_district: [null, [MappingService.validSelected.bind(this)]],
      bd_village: [null, [MappingService.validSelected.bind(this)]],

      live_province: [null, [MappingService.validSelected.bind(this)]],
      live_district: [null, [MappingService.validSelected.bind(this)]],
      live_commune: [null, [MappingService.validSelected.bind(this)]],
      live_village: [null, [MappingService.validSelected.bind(this)]],

      day_footer: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      month_footer: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      year_footer: [null, [Validators.required, MappingService.validSelected.bind(this)]],

    })

    this.day_footer = this.form.controls['day_footer'];
    this.month_footer = this.form.controls['month_footer'];
    this.year_footer = this.form.controls['year_footer'];

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

    const ValueProvince = await this.ds.provinceFireRef().get();
    const arrProvince = pushToArray(ValueProvince);

    this.bdProvince = MappingService.autoComplete(this.bd_province, arrProvince, 'name');
    this.liveProvince = MappingService.autoComplete(this.live_province, arrProvince, 'name');

    this.onSelectDate()

    const { registrationFormDoc } = this.store;

    if (registrationFormDoc) {
      this.ITEM = registrationFormDoc;
      const {
        first_name,
        last_name,
        first_name_en,
        last_name_en,
        gender,
        // dataOfBirth,
        dateOfBirthDay,
        dateOfBirthMonth,
        dateOfBirthYear,
        nationality,
        dateOfEntryPoliceWorkDay,
        dateOfEntryPoliceWorkMonth,
        dateOfEntryPoliceWorkYear,
        documentNumber,
        // dateOfPostOn,
        dateOfPostOnDay,
        dateOfPostOnMonth,
        dateOfPostOnYear,
        rank,
        positionForm,
        phoneNumber,
        officerId,
        policeCardID,
        nationalCardId,
        photo,
        policeCardFiles,
        nationalCardIdFiles,

        birthAddress,
        permanentAddress,
        status,
      } = registrationFormDoc;

      if (birthAddress?.province) {
        const geoDistrictData = await this.store.fetchList(this.ds.districtRef(birthAddress?.province.key));
        this.bdDistrict = MappingService.autoComplete(this.bd_district, geoDistrictData, 'name')
      }
      if (birthAddress?.district) {
        const geoDistrictData = await this.store.fetchList(this.ds.communeRef(birthAddress?.district.key));
        this.bdCommune = MappingService.autoComplete(this.bd_commune, geoDistrictData, 'name')
      }
      if (birthAddress?.commune) {
        const geoDistrictData = await this.store.fetchList(this.ds.villageRef(birthAddress?.commune.key));
        this.bdVillage = MappingService.autoComplete(this.bd_village, geoDistrictData, 'name')
      }

      if (permanentAddress?.province) {
        const geoDistrictData = await this.store.fetchList(this.ds.districtRef(permanentAddress?.province.key));
        this.liveDistrict = MappingService.autoComplete(this.live_district, geoDistrictData, 'name')
      }
      if (permanentAddress?.district) {
        const geoDistrictData = await this.store.fetchList(this.ds.communeRef(permanentAddress?.district.key));
        this.liveCommune = MappingService.autoComplete(this.live_commune, geoDistrictData, 'name')
      }
      if (permanentAddress?.commune) {
        const geoDistrictData = await this.store.fetchList(this.ds.villageRef(permanentAddress?.commune.key));
        this.liveVillage = MappingService.autoComplete(this.live_village, geoDistrictData, 'name')
      }

      this.form.patchValue({
        first_name,
        last_name,
        first_name_en,
        last_name_en,
        gender,
        // dataOfBirth: dataOfBirth?.toDate(),

        dateOfBirthDay,
        dateOfBirthMonth,
        dateOfBirthYear,

        nationality: nationality || this.NATIONALITY[0],

        // dateOfEntryPoliceWork: dateOfEntryPoliceWork ? dateOfEntryPoliceWork.toDate() : null,

        dateOfEntryPoliceWorkDay,
        dateOfEntryPoliceWorkMonth,
        dateOfEntryPoliceWorkYear,

        documentNumber,
        // dateOfPostOn: dateOfPostOn || null,

        dateOfPostOnDay,
        dateOfPostOnMonth,
        dateOfPostOnYear,

        rank,
        position: positionForm,
        phoneNumber,
        policeID: officerId,
        policeCardID,
        nationalCardId,


        bd_province: birthAddress ? birthAddress.province : null,
        bd_district: birthAddress ? birthAddress.district : null,
        bd_commune: birthAddress ? birthAddress.commune : null,
        bd_village: birthAddress ? birthAddress.village : null,

        live_province: permanentAddress ? permanentAddress.province : null,
        live_district: permanentAddress ? permanentAddress.district : null,
        live_commune: permanentAddress ? permanentAddress.commune : null,
        live_village: permanentAddress ? permanentAddress.village : null,
      })
      this.URL = photo?.downloadUrl ? transformImageSameTokenNo(photo?.downloadUrl, "400").uri : null;
      this.selectedPoliceCardFilesDB = policeCardFiles;
      this.selectedNationalIDFilesDB = nationalCardIdFiles;
      this.store?.subscribeOfficerStatus.subscribe(status => {
        if (status?.key !== STATUS_OBJ.PENDING.key) {
          this.form.disable();
          this.disableDate = true;
        }
        else {
          this.form.enable();
          this.disableDate = false;
        }
      })
    }

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
    if (item && item?.status?.key !== STATUS_OBJ.PENDING.key) {
      return;
    }

    // const {
    //   first_name,
    //   last_name,
    //   first_name_en,
    //   last_name_en,
    //   gender,

    //   // dataOfBirth,
    //   dateOfBirthDay,
    //   dateOfBirthMonth,
    //   dateOfBirthYear,

    //   nationality,
    //   dateOfEntryPoliceWorkDay,
    //   dateOfEntryPoliceWorkMonth,
    //   dateOfEntryPoliceWorkYear,
    //   documentNumber,

    //   // dateOfPostOn,
    //   dateOfPostOnDay,
    //   dateOfPostOnMonth,
    //   dateOfPostOnYear,

    //   rank,
    //   position,
    //   phoneNumber,
    //   policeID,
    //   policeCardID,
    //   nationalCardId,
    //   bd_province,
    //   bd_district,
    //   bd_commune,
    //   bd_village,
    //   live_province,
    //   live_district,
    //   live_commune,
    //   live_village,
    // } = this.form.getRawValue();

    // this.form.disable()
    // this.process = true;
    // const { uid } = this.auth;
    // const { registrationFormDoc } = this.store;
    // const birthAddressData = {
    //   province: bd_province ? toGeoData(bd_province) : null,
    //   district: bd_district ? toGeoData(bd_district) : null,
    //   commune: bd_commune ? toGeoData(bd_commune) : null,
    //   village: bd_village ? toGeoData(bd_village) : null,
    // };
    // const permanentAddressData = {
    //   province: live_province ? toGeoData(live_province) : null,
    //   district: live_district ? toGeoData(live_district) : null,
    //   commune: live_commune ? toGeoData(live_commune) : null,
    //   village: live_village ? toGeoData(live_village) : null,
    // };

    // const khmerFullName = last_name + ' ' + first_name;
    // const enFullName = first_name_en + ' ' + last_name_en;
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

    // const data: IOfficerPersonalInfo = {
    //   key: item?.key || uid,
    //   status: item?.status || STATUS_OBJ.PENDING,
    //   created_at: item?.created_at || this.ds.serverTimestamp(),
    //   created_by: item?.created_by || uid,
    //   updated_by: uid,
    //   updated_at: this.ds.serverTimestamp(),
    //   date_key: item?.date_key || ConvertService.dateKey(),
    //   page_key: item?.page_key || ConvertService.pageKey(),
    //   keyword: generateKeywords([khmerFullName, enFullName]).concat([`${phoneNumber}`, `${policeID}`, `${policeCardID}`, `${nationalCardId}`]),
    //   isDelete: item?.isDelete || false,

    //   photo: item?.photo || null,
    //   first_name,
    //   last_name,
    //   first_name_en,
    //   last_name_en,
    //   gender: gender,

    //   // dataOfBirth: dataOfBirth,
    //   dateOfBirthDay: dateOfBirthDay || null,
    //   dateOfBirthMonth: dateOfBirthMonth || null,
    //   dateOfBirthYear: dateOfBirthYear || null,

    //   nationality,
    //   birthAddress: birthAddressData || null,

    //   dateOfEntryPoliceWorkDay: dateOfEntryPoliceWorkDay || null,
    //   dateOfEntryPoliceWorkMonth: dateOfEntryPoliceWorkMonth || null,
    //   dateOfEntryPoliceWorkYear: dateOfEntryPoliceWorkYear || null,

    //   documentNumber: documentNumber || null,

    //   // dateOfPostOn: dateOfPostOn || null,

    //   dateOfPostOnDay: dateOfPostOnDay || null,
    //   dateOfPostOnMonth: dateOfPostOnMonth || null,
    //   dateOfPostOnYear: dateOfPostOnYear || null,

    //   rank: rank,
    //   positionForm: position || null,
    //   permanentAddress: permanentAddressData,
    //   phoneNumber: phoneNumber || null,
    //   officerIdNo: Number(policeID),
    //   officerId: policeID,
    //   nameKey: policeID,
    //   policeCardID: policeCardID || null,
    //   policeCardFiles: item?.policeCardFiles,
    //   nationalCardId: nationalCardId || null,
    //   nationalCardIdFiles: item?.nationalCardIdFiles,
    // }

    // this.store.saveRegistrationForm(data, (success, res) => {
    //   this.form.enable();
    //   this.process = false;
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
}
