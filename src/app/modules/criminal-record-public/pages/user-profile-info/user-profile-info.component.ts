import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, PHOTO_LIB, STATUS_LIVES_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, KHMER_DAY, monthOfYear } from 'src/app/dummy/report';
import { ConvertService, pushToArray, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { fromNow, generateKeywords, getYearsList, MappingService, todayDate, toGeoData, toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { map, take, debounceTime } from "rxjs/operators";
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { MatDialog } from '@angular/material/dialog';
import { ChooseFormLanguageDialogComponent } from '../choose-form-language-dialog/choose-form-language-dialog.component';

@Component({
  selector: 'app-user-profile-info',
  templateUrl: './user-profile-info.component.html',
  styleUrls: ['./user-profile-info.component.scss']
})
export class UserProfileInfoComponent implements OnInit {
  backUrl: string = null;
  form: FormGroup;
  params: any;
  GENDER_KH = GENDER_DATA;
  FAMILY_STATUS = FAMILY_STATUS;
  STATUS_OBJ = STATUS_OBJ;
  khDay = KHMER_DAY;
  STATUS_LIVES_ARRAY_DATA: any[] = [];
  nationals: any = null;
  DAYS = KHMER_DAY;
  KHDAYS = KHdays;
  MONTHS = [];
  years = [];
  khmerNationality: any = null;

  filteredBirthNationality: Observable<Array<any>>;
  filteredNationality: Observable<Array<any>>;

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

  father_bdProvince: Observable<Array<any>>;
  father_bdDistrict: Observable<Array<any>>;
  father_bdCommune: Observable<Array<any>>;
  father_bdVillage: Observable<Array<any>>;

  father_bd_province: AbstractControl;
  father_bd_district: AbstractControl;
  father_bd_commune: AbstractControl;
  father_bd_village: AbstractControl;

  father_before_nationality: AbstractControl;
  father_current_nationality: AbstractControl;
  filteredFatherBirthNationality: Observable<Array<any>>;
  filteredFatherNationality: Observable<Array<any>>;

  mother_bdProvince: Observable<Array<any>>;
  mother_bdDistrict: Observable<Array<any>>;
  mother_bdCommune: Observable<Array<any>>;
  mother_bdVillage: Observable<Array<any>>;

  mother_bd_province: AbstractControl;
  mother_bd_district: AbstractControl;
  mother_bd_commune: AbstractControl;
  mother_bd_village: AbstractControl;

  mother_before_nationality: AbstractControl;
  mother_current_nationality: AbstractControl;
  filteredMotherBirthNationality: Observable<Array<any>>;
  filteredMotherNationality: Observable<Array<any>>;

  filteredSpouseBirthNationality: Observable<Array<any>>;
  filteredSpouseNationality: Observable<Array<any>>;
  spouse_before_nationality: AbstractControl;
  spouse_current_nationality: AbstractControl;

  day_footer: AbstractControl;
  month_footer: AbstractControl;
  year_footer: AbstractControl;

  current_nationality: AbstractControl;
  before_nationality: AbstractControl;

  motherIsDead: AbstractControl;

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

  loading: boolean = false;
  canSave: boolean = false;

  old_age: boolean = false;
  old_age_father: boolean = false;
  old_age_mother: boolean = false;

  constructor(
    private fb: FormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public storage: FireStorageService,
    public criminalStore: CriminalApplicationStore,
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  async ngOnInit() {

    this.loading = true;
    this.buildForm();

    const { uid } = this.auth;
    this.criminalStore.fetchSelectedCitizen(uid, async res => {
      const { selectedCitizenProfile, isKhmerForm } = this.criminalStore;
      const { config } = this.auth;
      let nationals = (await this.store.getNational())?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      this.nationals = nationals;
      this.STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: isKhmerForm, name_en: `${m}` } })
      this.years = years
      this.DAYS = days?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      this.MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: isKhmerForm }))
      const date = todayDate(this.auth.serverDateTime, this.DAYS, this.MONTHS, this.years);

      const positionData = await this.store.fetchList(this.ds.dbRef().collection("positions", ref => ref.orderBy("order", "asc")));
      this.positionList = positionData;
      const titleData = await this.store.fetchList(this.ds.dbRef().collection("ranking", ref => ref.orderBy("order", "asc")));
      this.titleList = titleData;

      const arrProvince = await this.fetchProvinces()

      this.bdProvince = MappingService.autoComplete(this.bd_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
      this.father_bdProvince = MappingService.autoComplete(this.father_bd_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
      this.mother_bdProvince = MappingService.autoComplete(this.mother_bd_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
      this.liveProvince = MappingService.autoComplete(this.live_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
      this.filteredBirthNationality = MappingService.autoComplete(this.before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredNationality = MappingService.autoComplete(this.current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredFatherBirthNationality = MappingService.autoComplete(this.father_before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredFatherNationality = MappingService.autoComplete(this.father_current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredMotherBirthNationality = MappingService.autoComplete(this.mother_before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredMotherNationality = MappingService.autoComplete(this.mother_current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredSpouseBirthNationality = MappingService.autoComplete(this.spouse_before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredSpouseNationality = MappingService.autoComplete(this.spouse_current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
      this.filteredDay = MappingService.autoComplete(this.day_footer, this.KHDAYS, 'name')
      this.filteredMonth = MappingService.autoComplete(this.month_footer, this.MONTHS, isKhmerForm ? 'name' : 'name_en')
      this.filteredYear = MappingService.autoComplete(this.year_footer, years, 'name')

      this.addFormArrayForeign()
      const khmerNationality = isKhmerForm ? nationals?.find(m => m?.key === config?.country_khmer_key) : null;
      this.khmerNationality = khmerNationality;
      this.ITEM = selectedCitizenProfile || null;

      const fatherIsDeadKey = selectedCitizenProfile?.fatherIsDead?.key || null;
      const motherIsDeadKey = selectedCitizenProfile?.motherIsDead?.key || null;
      const spouseIsDeadKey = selectedCitizenProfile?.spouseIsDead?.key || null;

      const bdProvinceItem = arrProvince?.find(m => m?.key === (selectedCitizenProfile?.birthAddress?.province?.key || null))
      const live_provinceItem = arrProvince?.find(m => m?.key === (selectedCitizenProfile?.permanentAddress?.province?.key || null))
      const father_provinceItem = arrProvince?.find(m => m?.key === (selectedCitizenProfile?.fatherBirthAddress?.province?.key || null));
      const mother_provinceItem = arrProvince?.find(m => m?.key === (selectedCitizenProfile?.motherBirthAddress?.province?.key || null));

      const live_districtItemKey = selectedCitizenProfile?.permanentAddress?.district?.key || null;
      const live_communeItemKey = selectedCitizenProfile?.permanentAddress?.commune?.key || null;
      const live_villageItemKey = selectedCitizenProfile?.permanentAddress?.village?.key || null;

      const father_districtItemKey = selectedCitizenProfile?.fatherBirthAddress?.district?.key || null;
      const father_communeItemKey = selectedCitizenProfile?.fatherBirthAddress?.commune?.key || null;
      const father_villageItemKey = selectedCitizenProfile?.fatherBirthAddress?.village?.key || null;

      const mother_districtItemKey = selectedCitizenProfile?.motherBirthAddress?.district?.key || null;
      const mother_communeItemKey = selectedCitizenProfile?.motherBirthAddress?.commune?.key || null;
      const mother_villageItemKey = selectedCitizenProfile?.motherBirthAddress?.village?.key || null;


      let bdDistrictItem: any, bdCommuneItem: any, bdVillageItem: any;
      let live_districtItem: any, live_communeItem: any, live_villageItem: any;
      let father_districtItem: any, father_communeItem: any, father_villageItem: any;
      let mother_districtItem: any, mother_communeItem: any, mother_villageItem: any;

      if (bdProvinceItem) {
        const geoDistrictData = await this.fetchDistricts(bdProvinceItem?.key)
        this.bdDistrict = MappingService.autoComplete(this.bd_district, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        bdDistrictItem = geoDistrictData?.find(m => m?.key === (selectedCitizenProfile?.birthAddress?.district?.key || null))
      }
      if (bdDistrictItem) {
        const geoDistrictData = await this.fetchCommune(bdDistrictItem?.key)
        this.bdCommune = MappingService.autoComplete(this.bd_commune, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        bdCommuneItem = geoDistrictData?.find(m => m?.key === (selectedCitizenProfile?.birthAddress?.commune?.key || null))
      }
      if (bdCommuneItem) {
        const geoDistrictData = await this.fetchVillages(bdCommuneItem?.key)
        this.bdVillage = MappingService.autoComplete(this.bd_village, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        bdVillageItem = geoDistrictData?.find(m => m?.key === (selectedCitizenProfile?.birthAddress?.village?.key || null))
      }
      if (live_provinceItem) {
        const geoDistrictData = await this.fetchDistricts(live_provinceItem?.key)
        this.liveDistrict = MappingService.autoComplete(this.live_district, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        live_districtItem = geoDistrictData?.find(m => m?.key === live_districtItemKey)
      }
      if (live_districtItem) {
        const geoDistrictData = await this.fetchCommune(live_districtItem?.key)
        this.liveCommune = MappingService.autoComplete(this.live_commune, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        live_communeItem = geoDistrictData?.find(m => m?.key === live_communeItemKey)
      }
      if (live_communeItem) {
        const geoDistrictData = await this.fetchVillages(live_communeItem?.key)
        this.liveVillage = MappingService.autoComplete(this.live_village, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        live_villageItem = geoDistrictData?.find(m => m?.key === live_villageItemKey)
      }

      if (father_provinceItem) {
        const geoDistrictData = await this.fetchDistricts(father_provinceItem?.key)
        this.father_bdDistrict = MappingService.autoComplete(this.father_bd_district, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        father_districtItem = geoDistrictData?.find(m => m?.key === father_districtItemKey)
      }
      if (father_districtItem) {
        const geoDistrictData = await this.fetchCommune(father_districtItem?.key)
        this.father_bdCommune = MappingService.autoComplete(this.father_bd_commune, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        father_communeItem = geoDistrictData?.find(m => m?.key === father_communeItemKey)
      }
      if (father_communeItem) {
        const geoDistrictData = await this.fetchVillages(father_communeItem?.key)
        this.father_bdVillage = MappingService.autoComplete(this.father_bd_village, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        father_villageItem = geoDistrictData?.find(m => m?.key === father_villageItemKey)
      }

      if (mother_provinceItem) {
        const geoDistrictData = await this.fetchDistricts(mother_provinceItem?.key)
        this.mother_bdDistrict = MappingService.autoComplete(this.mother_bd_district, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        mother_districtItem = geoDistrictData?.find(m => m?.key === mother_districtItemKey)
      }
      if (mother_districtItem) {
        const geoDistrictData = await this.fetchCommune(mother_districtItem?.key)
        this.mother_bdCommune = MappingService.autoComplete(this.mother_bd_commune, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        mother_communeItem = geoDistrictData?.find(m => m?.key === mother_communeItemKey)
      }
      if (mother_communeItem) {
        const geoDistrictData = await this.fetchVillages(mother_communeItem?.key)
        this.mother_bdVillage = MappingService.autoComplete(this.mother_bd_village, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
        mother_villageItem = geoDistrictData?.find(m => m?.key === mother_villageItemKey)
      }


      if (selectedCitizenProfile?.liveInForeign?.length > 0) {
        this.patchFormArray(selectedCitizenProfile?.liveInForeign)
      }

      this.form.patchValue({
        day_footer: date?.day,
        month_footer: date?.month,
        year_footer: date?.year,

        last_name_kh: selectedCitizenProfile?.last_name || null,
        first_name_kh: selectedCitizenProfile?.first_name || null,
        last_name_en: selectedCitizenProfile?.last_name_en || null,
        first_name_en: selectedCitizenProfile?.first_name_en || null,
        last_name_fr: selectedCitizenProfile?.last_name_fr || null,
        first_name_fr: selectedCitizenProfile?.first_name_fr || null,

        gender: selectedCitizenProfile?.gender || null,
        dateOfBirthDay: selectedCitizenProfile?.dateOfBirthDay || null,
        dateOfBirthMonth: selectedCitizenProfile?.dateOfBirthMonth || null,
        dateOfBirthYear: selectedCitizenProfile?.dateOfBirthYear || null,
        before_nationality: selectedCitizenProfile?.before_nationality || khmerNationality || null,
        current_nationality: selectedCitizenProfile?.current_nationality || khmerNationality || null,

        occupation_kh: selectedCitizenProfile?.occupation || null,
        occupation_en: selectedCitizenProfile?.occupation_en || null,
        occupation_fr: selectedCitizenProfile?.occupation_fr || null,

        father_name_kh: selectedCitizenProfile?.father_name || null,
        father_name_en: selectedCitizenProfile?.father_name_en || null,
        father_name_fr: selectedCitizenProfile?.father_name_fr || null,

        fatherDob: selectedCitizenProfile?.fatherDob || null,
        father_before_nationality: selectedCitizenProfile?.father_before_nationality || null,
        father_current_nationality: selectedCitizenProfile?.father_current_nationality || null,

        fatherCurrentOccupation_kh: selectedCitizenProfile?.fatherCurrentOccupation || null,
        fatherCurrentOccupation_en: selectedCitizenProfile?.fatherCurrentOccupation_en || null,
        fatherCurrentOccupation_fr: selectedCitizenProfile?.fatherCurrentOccupation_fr || null,

        fatherIsDead: fatherIsDeadKey ? this.STATUS_LIVES_ARRAY_DATA.find(m => m?.key === fatherIsDeadKey) : this.STATUS_LIVES_ARRAY_DATA[0],
        father_bd_province: father_provinceItem,
        father_bd_district: father_districtItem,
        father_bd_commune: father_communeItem,
        father_bd_village: father_villageItem,

        mother_name_kh: selectedCitizenProfile?.mother_name || null,
        mother_name_en: selectedCitizenProfile?.mother_name_en || null,
        mother_name_fr: selectedCitizenProfile?.mother_name_fr || null,

        motherDob: selectedCitizenProfile?.motherDob || null,
        mother_before_nationality: selectedCitizenProfile?.mother_before_nationality || null,
        mother_current_nationality: selectedCitizenProfile?.mother_current_nationality || null,

        motherCurrentOccupation_kh: selectedCitizenProfile?.motherCurrentOccupation || null,
        motherCurrentOccupation_en: selectedCitizenProfile?.motherCurrentOccupation_en || null,
        motherCurrentOccupation_fr: selectedCitizenProfile?.motherCurrentOccupation_fr || null,

        motherIsDead: motherIsDeadKey ? this.STATUS_LIVES_ARRAY_DATA.find(m => m?.key === motherIsDeadKey) : this.STATUS_LIVES_ARRAY_DATA[0],
        mother_bd_province: mother_provinceItem,
        mother_bd_district: mother_districtItem,
        mother_bd_commune: mother_communeItem,
        mother_bd_village: mother_villageItem,


        spouse_name_kh: selectedCitizenProfile?.spouse || null,
        spouse_name_en: selectedCitizenProfile?.spouse_en || null,

        spouseDob: selectedCitizenProfile?.spouseDob || null,
        spouse_before_nationality: selectedCitizenProfile?.spouse_before_nationality || null,
        spouse_current_nationality: selectedCitizenProfile?.spouse_current_nationality || null,

        spouseCurrentOccupation_kh: selectedCitizenProfile?.spouseCurrentOccupation || null,
        spouseCurrentOccupation_en: selectedCitizenProfile?.spouseCurrentOccupation_en || null,
        spouseCurrentOccupation_fr: selectedCitizenProfile?.spouseCurrentOccupation_fr || null,

        spouseIsDead: spouseIsDeadKey ? this.STATUS_LIVES_ARRAY_DATA.find(m => m?.key === spouseIsDeadKey) : this.STATUS_LIVES_ARRAY_DATA[0],
        footer_phone: selectedCitizenProfile?.phoneNumber || null,

        bd_province: bdProvinceItem,
        bd_district: bdDistrictItem,
        bd_commune: bdCommuneItem,
        bd_village: bdVillageItem,

        live_province: live_provinceItem,
        live_district: live_districtItem,
        live_commune: live_communeItem,
        live_village: live_villageItem,

        foreignerPlaceOfBirth: selectedCitizenProfile?.foreignerPlaceOfBirth || null,
        foreignerPlaceOfBirth_en: selectedCitizenProfile?.foreignerPlaceOfBirth_en || null,
        foreignerPlaceOfBirth_fr: selectedCitizenProfile?.foreignerPlaceOfBirth_fr || null,

        foreignerFatherBirthAddress: selectedCitizenProfile?.foreignerFatherBirthAddress || null,
        foreignerFatherBirthAddress_en: selectedCitizenProfile?.foreignerFatherBirthAddress_en || null,
        foreignerFatherBirthAddress_fr: selectedCitizenProfile?.foreignerFatherBirthAddress_fr || null,

        foreignerMotherBirthAddress: selectedCitizenProfile?.foreignerMotherBirthAddress || null,
        foreignerMotherBirthAddress_en: selectedCitizenProfile?.foreignerMotherBirthAddress_en || null,
        foreignerMotherBirthAddress_fr: selectedCitizenProfile?.foreignerMotherBirthAddress_fr || null,

        street_no_kh: selectedCitizenProfile?.permanentAddress?.street_no_kh || null,
        home_no_kh: selectedCitizenProfile?.permanentAddress?.home_no_kh || null,

        isTextAddress: selectedCitizenProfile?.isTextAddress || false,

        permanentAddressText: selectedCitizenProfile?.permanentAddressText || null,
        permanentAddressText_en: selectedCitizenProfile?.permanentAddressText_en || null,
        permanentAddressText_fr: selectedCitizenProfile?.permanentAddressText_fr || null,

      })

      // if (isKhmerForm) {
      //   this.form.controls['current_nationality'].disable()
      //   this.form.controls['before_nationality'].disable()

      // } else {
      //   this.form.controls['current_nationality'].enable()
      //   this.form.controls['before_nationality'].enable()
      // }

      this.onChangeLiveStatusFather({ value: { key: fatherIsDeadKey } })
      this.onChangeLiveStatusMother({ value: { key: motherIsDeadKey } })
      this.onChangeLiveStatusSpouse({ value: { key: spouseIsDeadKey } })

      if (!selectedCitizenProfile?.isTextAddress) {
        this.form.controls['foreignerPlaceOfBirth'].disable()
      }

      if (selectedCitizenProfile?.isTextAddress) this.onTextAddressChange({ checked: true })
      else this.onTextAddressChange({ checked: false })

      this.loading = false;

    });
  }

  buildForm() {
    this.form = this.fb.group({
      day_footer: [{ value: null, disabled: true }, [MappingService.validSelected.bind(this)]],
      month_footer: [{ value: null, disabled: true }, [MappingService.validSelected.bind(this)]],
      year_footer: [{ value: null, disabled: true }, [MappingService.validSelected.bind(this)]],

      footer_phone: [null, [Validators.required, Validators.minLength(9)], this.checkExistPhoneNumber()],
      first_name_en: [null, [Validators.required]],
      last_name_en: [null, [Validators.required]],

      permanentAddressText: [null, [Validators.required]],
      permanentAddressText_en: [null],
      permanentAddressText_fr: [null],

      isTextAddress: [false],
      gender: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('gender')],
      current_nationality: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('current_nationality')],
      dateOfBirthDay: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('dateOfBirthDay')],
      dateOfBirthMonth: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('dateOfBirthMonth')],
      dateOfBirthYear: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('dateOfBirthYear')],
      bd_province: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('bd_province')],
      bd_commune: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('bd_commune')],
      bd_district: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('bd_district')],
      bd_village: [null, [Validators.required, MappingService.validSelected.bind(this)], this.checkExistOnEdit('bd_village')],

      first_name_kh: [null, [Validators.required]],
      last_name_kh: [null, [Validators.required]],

      live_province: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_district: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_commune: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_village: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      before_nationality: [null, [Validators.required, MappingService.validSelected.bind(this)]],

      occupation_kh: [null, [Validators.required]],
      occupation_en: [null],
      occupation_fr: [null],

      nick_name_kh: [null],
      nick_name_en: [null],
      nick_name_fr: [null],

      liveInForeign: new FormArray([]),

      father_name_kh: [null],
      father_name_en: [null],

      fatherDob: [null],
      fatherIsDead: [null],
      father_before_nationality: [null],
      father_current_nationality: [null],

      mother_name_kh: [null],
      mother_name_en: [null],

      motherDob: [null],
      motherIsDead: [null],
      mother_before_nationality: [null],
      mother_current_nationality: [null],

      motherCurrentOccupation_kh: [null],
      motherCurrentOccupation_en: [null],
      motherCurrentOccupation_fr: [null],

      spouse_name_kh: [null],
      spouse_name_en: [null],

      spouseDob: [null],
      spouseIsDead: [null],
      spouse_before_nationality: [null],
      spouse_current_nationality: [null],

      spouseCurrentOccupation_kh: [null],
      spouseCurrentOccupation_en: [null],
      spouseCurrentOccupation_fr: [null],

      father_bd_province: [null, [MappingService.validSelected.bind(this)]],
      father_bd_commune: [null, [MappingService.validSelected.bind(this)]],
      father_bd_district: [null, [MappingService.validSelected.bind(this)]],
      father_bd_village: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_province: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_commune: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_district: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_village: [null, [MappingService.validSelected.bind(this)]],

      foreignerPlaceOfBirth_fr: [null],
      foreignerPlaceOfBirth_en: [null],
      foreignerPlaceOfBirth: [null, [Validators.required]],

      foreignerFatherBirthAddress: [null],
      foreignerFatherBirthAddress_en: [null],
      foreignerFatherBirthAddress_fr: [null],

      foreignerMotherBirthAddress: [null],
      foreignerMotherBirthAddress_en: [null],
      foreignerMotherBirthAddress_fr: [null],

      fatherCurrentOccupation_kh: [null],
      fatherCurrentOccupation_en: [null],
      fatherCurrentOccupation_fr: [null],

      home_no_kh: [null],
      home_no_en: [null],
      home_no_fr: [null],

      street_no_kh: [null],
      street_no_en: [null],
      street_no_fr: [null],
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

    this.current_nationality = this.form.controls['current_nationality']
    this.before_nationality = this.form.controls['before_nationality']

    this.father_before_nationality = this.form.controls['father_before_nationality']
    this.father_current_nationality = this.form.controls['father_current_nationality']
    this.mother_before_nationality = this.form.controls['mother_before_nationality']
    this.mother_current_nationality = this.form.controls['mother_current_nationality']
    this.spouse_before_nationality = this.form.controls['spouse_before_nationality']
    this.spouse_current_nationality = this.form.controls['spouse_current_nationality']

  }

  _onSelectedNationally(event: MatAutocompleteSelectedEvent) {
    const { key } = event.option.value;
    const { config } = this.auth;
    if (key === config?.country_khmer_key) {
      this.form.controls['bd_province'].enable()
      this.form.controls['bd_district'].enable()
      this.form.controls['bd_commune'].enable()
      this.form.controls['bd_village'].enable()
    } else {
      this.form.controls['bd_province'].disable()
      this.form.controls['bd_district'].disable()
      this.form.controls['bd_commune'].disable()
      this.form.controls['bd_village'].disable()
    }
  }
  checkExistPhoneNumber() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value) {
        const phone = `0${toNumber(`${value}`?.trim())}`;
        return this.ds.citizensRef(ref => ref.where('phoneNumber', '==', phone ? phone : '~!NA!~').limit(20)).get()
          .pipe(
            debounceTime(300),
            take(50),
            map(arr => {
              this.criminalStore.citizens = pushToArray(arr).map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
              return null;
            })
          );
      }
    };
  }

  checkExistOnEdit(field: string) {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      let uniqueKey = this.getSpacialKey({ key: field, value: value })
      if (value) {
        return this.ds.citizensRef(ref => ref.where('spacialKey', '==', uniqueKey ? uniqueKey : '~!NA!~').limit(1)).get()
          .pipe(
            debounceTime(300),
            take(50),
            map(arr => {
              this.criminalStore.citizens = pushToArray(arr).map((m: any) => ({ ...m, amTimeAgo: fromNow(m?.created_at?.toDate(), true), photoUrl: m?.photo?.downloadUrl ? transformImageSameTokenNo(m?.photo?.downloadUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR }));
              return null;
            })
          );
      }
    };
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

  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
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

  _onSelectedOldNationally(event: MatAutocompleteSelectedEvent, field: string) {
    this.form.patchValue({
      [field]: event?.option.value
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
      father_bd_district: null,
      father_bd_commune: null,
    })
    if (value) {
      const geoDistrictData = await this.fetchDistricts(value?.key)
      this.father_bdDistrict = MappingService.autoComplete(this.father_bd_district, geoDistrictData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _selectFatherDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      father_bd_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchCommune(value?.key)
      this.father_bdCommune = MappingService.autoComplete(this.father_bd_commune, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _selectFatherCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      father_bd_village: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchVillages(value?.key)
      this.father_bdVillage = MappingService.autoComplete(this.father_bd_village, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en');
    }
  }

  async _selectMotherProvince(event) {
    const { value } = event.option;
    this.form.patchValue({
      mother_bd_district: null,
      mother_bd_commune: null,
    })
    if (value) {
      const geoDistrictData = await this.fetchDistricts(value?.key)
      this.mother_bdDistrict = MappingService.autoComplete(this.mother_bd_district, geoDistrictData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _selectMotherDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      mother_bd_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchCommune(value?.key)
      this.mother_bdCommune = MappingService.autoComplete(this.mother_bd_commune, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _selectMotherCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      mother_bd_village: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchVillages(value?.key)
      this.mother_bdVillage = MappingService.autoComplete(this.mother_bd_village, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en');
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
      const geoDistrictData = await this.fetchDistricts(value?.key)
      this.bdDistrict = MappingService.autoComplete(this.bd_district, geoDistrictData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')

    }
  }

  async _selectDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchCommune(value?.key)
      this.bdCommune = MappingService.autoComplete(this.bd_commune, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _selectCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      bd_village: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchVillages(value?.key)
      this.bdVillage = MappingService.autoComplete(this.bd_village, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _onSave(f: any) {

    if (!this.form.valid) return;
    const { selectedCitizenProfile, isKhmerForm } = this.criminalStore
    const item: any = selectedCitizenProfile || null;
    const {
      last_name_kh,
      first_name_kh,

      last_name_en,
      first_name_en,

      last_name_fr,
      first_name_fr,

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

      occupation_kh,
      occupation_en,
      occupation_fr,

      father_name_kh,
      father_name_en,
      father_name_fr,

      fatherIsDead,
      father_before_nationality,
      father_current_nationality,
      fatherDob,

      father_bd_province,
      father_bd_district,
      father_bd_commune,
      father_bd_village,

      fatherCurrentOccupation_kh,
      fatherCurrentOccupation_en,
      fatherCurrentOccupation_fr,

      mother_name_kh,
      mother_name_en,
      mother_name_fr,

      motherIsDead,
      mother_before_nationality,
      mother_current_nationality,

      mother_bd_province,
      mother_bd_district,
      mother_bd_commune,
      mother_bd_village,

      motherCurrentOccupation_kh,
      motherCurrentOccupation_en,
      motherCurrentOccupation_fr,

      motherDob,

      spouse_name_kh,
      spouse_name_en,
      spouse_name_fr,

      spouseIsDead,
      spouse_before_nationality,
      spouse_current_nationality,

      spouseCurrentOccupation_kh,
      spouseCurrentOccupation_en,
      spouseCurrentOccupation_fr,

      spouseDob,

      day_footer,
      month_footer,
      year_footer,

      footer_phone,
      liveInForeign,

      foreignerPlaceOfBirth,
      foreignerPlaceOfBirth_en,
      foreignerPlaceOfBirth_fr,

      foreignerFatherBirthAddress,
      foreignerFatherBirthAddress_en,
      foreignerFatherBirthAddress_fr,

      foreignerMotherBirthAddress,
      foreignerMotherBirthAddress_en,
      foreignerMotherBirthAddress_fr,

      home_no_kh,
      street_no_kh,

      permanentAddressText,
      permanentAddressText_en,
      permanentAddressText_fr,

      isTextAddress,
    } = f

    this.form.disable()
    this.process = true;

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
      home_no_kh: home_no_kh || null,
      street_no_kh: street_no_kh || null,
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

    const date = todayDate(this.auth.serverDateTime, this.DAYS, this.MONTHS, this.years);

    const { uid } = this.auth.user;
    const key = uid || this.ds.createId();
    const phoneNumber = `0${toNumber(`${footer_phone}`.trim())}`;
    const khmerFullName = `${last_name_kh} ${first_name_kh}`;
    const full_name_en = `${last_name_en} ${first_name_en}`;

    const data: any = {
      key: item?.key || key,
      status: item?.status || STATUS_OBJ.ACTIVE,
      created_at: item?.created_at || this.ds.serverTimestamp(),
      created_by: item?.created_by || this.store.getMappedProfile(),
      updated_by: this.store.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
      date_key: item?.date_key || ConvertService.dateKey(),
      page_key: item?.page_key || ConvertService.pageKey(),
      keyword: generateKeywords([khmerFullName, full_name_en]).concat([first_name_kh, phoneNumber, last_name_kh]),
      isDelete: item?.isDelete || false,

      application_type: this.criminalStore.selectedApplicationType,
      last_name: last_name_kh || null,
      first_name: first_name_kh || null,
      last_name_en: last_name_en || null,
      first_name_en: first_name_en || null,

      photo: item?.photo || null,
      before_nationality: isKhmerForm ? this.khmerNationality : before_nationality,
      current_nationality: isKhmerForm ? this.khmerNationality : current_nationality,
      gender: gender,
      occupation: occupation_kh || null,
      occupation_en: occupation_en || null,
      occupation_fr: occupation_fr || null,

      dateOfBirthDay: dateOfBirthDay || null,
      dateOfBirthMonth: dateOfBirthMonth || null,
      dateOfBirthYear: dateOfBirthYear || null,

      birthAddress: birthAddressData || null,
      permanentAddress: permanentAddressData,
      phoneNumber: phoneNumber || null,

      spacialKey: this.getSpacialKey(),

      father_name: father_name_kh || null,
      father_name_en: father_name_en || null,

      fatherIsDead: fatherIsDead || null,
      father_before_nationality: father_before_nationality || null,
      father_current_nationality: father_current_nationality || null,
      fatherDob: fatherDob || null,
      fatherBirthAddress: fatherBirthAddressData,

      fatherCurrentOccupation: fatherCurrentOccupation_kh || null,
      fatherCurrentOccupation_en: fatherCurrentOccupation_en || null,
      fatherCurrentOccupation_fr: fatherCurrentOccupation_fr || null,

      mother_name: mother_name_kh || null,
      mother_name_en: mother_name_en || null,

      motherIsDead: motherIsDead || null,
      mother_before_nationality: mother_before_nationality || null,
      mother_current_nationality: mother_current_nationality || null,
      motherDob: motherDob || null,
      motherBirthAddress: motherBirthAddressData,

      motherCurrentOccupation: motherCurrentOccupation_kh || null,
      motherCurrentOccupation_en: motherCurrentOccupation_en || null,
      motherCurrentOccupation_fr: motherCurrentOccupation_fr || null,

      spouse: spouse_name_kh || null,
      spouse_en: spouse_name_en || null,

      spouseIsDead: spouseIsDead || null,
      spouse_before_nationality: spouse_before_nationality || null,
      spouse_current_nationality: spouse_current_nationality || null,
      spouseCurrentOccupation: spouseCurrentOccupation_kh || null,
      spouseCurrentOccupation_en: spouseCurrentOccupation_en || null,
      spouseCurrentOccupation_fr: spouseCurrentOccupation_fr || null,
      spouseDob: spouseDob || null,

      day_footer: date?.day || null,
      month_footer: date?.month || null,
      year_footer: date.year || null,

      liveInForeign: liveInForeign || [],

      foreignerPlaceOfBirth: foreignerPlaceOfBirth || null,
      foreignerPlaceOfBirth_en: foreignerPlaceOfBirth_en || null,
      foreignerPlaceOfBirth_fr: foreignerPlaceOfBirth_fr || null,

      foreignerFatherBirthAddress: foreignerFatherBirthAddress || null,
      foreignerFatherBirthAddress_en: foreignerFatherBirthAddress_en || null,
      foreignerFatherBirthAddress_fr: foreignerFatherBirthAddress_fr || null,

      foreignerMotherBirthAddress: foreignerMotherBirthAddress || null,
      foreignerMotherBirthAddress_en: foreignerMotherBirthAddress_en || null,
      foreignerMotherBirthAddress_fr: foreignerMotherBirthAddress_fr || null,

      permanentAddressText: permanentAddressText || null,
      permanentAddressText_en: permanentAddressText_en || null,
      permanentAddressText_fr: permanentAddressText_fr || null,
      isTextAddress: isTextAddress || false,
    }
    data?.keyword?.push(data?.spacialKey)

    this.store.save(data, (success, err) => {
      this.process = false;
      this.form.enable();
      if (success) {
        this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.router.navigate(['/ecosystem/profile']);
      } else {
        alert(err)
      }
    })
  }


  onSelectedDateOfBirth(event) {
    if (event?.year && (event?.year?.key <= 1979)) {
      this.old_age = true;
      this.form.get('foreignerPlaceOfBirth').enable();
      this.form.get('bd_province').disable();
      this.form.get('bd_district').disable();
      this.form.get('bd_commune').disable();
      this.form.get('bd_village').disable();
    }
    else {
      this.old_age = false;
      if (!this.form.get('isTextAddress').value) {
        this.form.get('bd_province').enable();
        this.form.get('bd_district').enable();
        this.form.get('bd_commune').enable();
        this.form.get('bd_village').enable();
        this.form.get('foreignerPlaceOfBirth').disable();
      }
    }
    this.form.get('dateOfBirthDay').patchValue(event?.day);
    this.form.get('dateOfBirthMonth').patchValue(event?.month);
    this.form.get('dateOfBirthYear').patchValue(event?.year);
  }

  onSelectedFromDateArr(event, index) {
    const form = this.form.get('liveInForeign') as FormArray
    form.at(index).get('from_date').patchValue(event)
  }

  onSelectedToDateArr(event, index) {
    const form = this.form.get('liveInForeign') as FormArray
    form.at(index).get('to_date').patchValue(event)
  }


  checkValidDate(day, month, year) {
    const date = moment(`${year}-${month}-${day}`);
    return date.isValid()
  }

  onSelectedDateSpouse(event) {
    this.form.get('spouseDob').patchValue(event)
  }


  onSelectedDateFatherDob(event) {
    this.form.get('fatherDob').patchValue(event)
  }

  onSelectedDateMotherDob(event) {
    this.form.get('motherDob').patchValue(event)
  }

  getSpacialKey(refValue?: any) {
    const { config } = this.auth;
    let f = this.form?.value || {}
    const first_name_en = refValue?.key === 'first_name_en' ? refValue?.value : f?.first_name_en;
    const last_name_en = refValue?.key === 'last_name_en' ? refValue?.value : f?.last_name_en;
    const gender = refValue?.key === 'gender' ? refValue?.value : f?.gender;
    const current_nationality = refValue?.key === 'current_nationality' ? refValue?.value : f?.current_nationality;
    const dateOfBirthDay = refValue?.key === 'dateOfBirthDay' ? refValue?.value : f?.dateOfBirthDay;
    const dateOfBirthMonth = refValue?.key === 'dateOfBirthMonth' ? refValue?.value : f?.dateOfBirthMonth;
    const dateOfBirthYear = refValue?.key === 'dateOfBirthYear' ? refValue?.value : f?.dateOfBirthYear;
    const bd_province = refValue?.key === 'bd_province' ? refValue?.value : f?.bd_province;
    const bd_commune = refValue?.key === 'bd_commune' ? refValue?.value : f?.bd_commune;
    const bd_district = refValue?.key === 'bd_district' ? refValue?.value : f?.bd_district;
    const bd_village = refValue?.key === 'bd_commune' ? refValue?.value : f?.bd_village;

    let uid_key: string = null;
    const nationality = this.form.get('current_nationality')?.value?.key || null;
    const dobDay = dateOfBirthDay || null;
    const dobMonth = dateOfBirthMonth || null;
    const dobYear = dateOfBirthYear || null;
    const dob = `${dobYear?.key}${dobMonth?.key}${dobDay?.key}`;

    if (nationality && config?.country_khmer_key === nationality) {
      if (first_name_en && last_name_en && gender && current_nationality && dateOfBirthDay && dateOfBirthMonth && dateOfBirthYear && bd_province && bd_commune && bd_district && bd_village) {
        uid_key = `${last_name_en}_${first_name_en}_${gender?.text}_${dob}_${current_nationality?.key}_${bd_province?.key}_${bd_district?.key}_${bd_commune?.key}_${bd_village?.key}`;
      }
    } else {
      if (first_name_en && last_name_en && gender && current_nationality && dateOfBirthDay && dateOfBirthMonth && dateOfBirthYear) {
        uid_key = `${last_name_en}_${first_name_en}_${gender?.text}_${dob}_${current_nationality?.key}`;
      }
    }
    return uid_key;
  }


  addFormArrayForeign() {
    const form = this.form.get('liveInForeign') as FormArray;
    form.push(this.fb.group({
      name: [null],
      from_date: [null],
      to_date: [null],
    }))
  }

  removeFormArrayForeign(index) {
    const form = this.form.get('liveInForeign') as FormArray;
    form.removeAt(index);
  }

  patchFormArray(list) {
    const form = this.form.get('liveInForeign') as FormArray;
    while (form.length > 0) {
      form.removeAt(0)
    }
    list.map(m => {
      form.push(this.fb.group({
        name: [m?.name],
        from_date: [m?.from_date],
        to_date: [m?.to_date],
      }))
    })
  }

  displayNameAndNameEn(item: any): string {
    return item ? (item?.isKhmer ? item?.name : item?.name_en) : null;
  }

  displayNameAndEnName(item: any): string {
    return item ? (item?.isKhmer ? item?.name : item?.en_name) : null;
  }

  displayNationalityKH(item: any): string {
    return item ? (item?.isKhmer ? item?.kh_nationality : item?.nationality) : null;
  }

  async fetchProvinces() {
    const { isKhmerForm } = this.criminalStore
    return (await this.store.fetchList(this.ds.provincesRef()))?.map(m => ({ ...m, isKhmer: isKhmerForm }))
  }

  async fetchDistricts(provinceKey) {
    const { isKhmerForm } = this.criminalStore
    return (await this.store.fetchList(this.ds.districtRef(provinceKey)))?.map(m => ({ ...m, isKhmer: isKhmerForm }))
  }
  async fetchCommune(districtKey) {
    const { isKhmerForm } = this.criminalStore
    return (await this.store.fetchList(this.ds.communeRef(districtKey)))?.map(m => ({ ...m, isKhmer: isKhmerForm }))
  }
  async fetchVillages(communeKey) {
    const { isKhmerForm } = this.criminalStore
    return (await this.store.fetchList(this.ds.villageRef(communeKey)))?.map(m => ({ ...m, isKhmer: isKhmerForm }))
  }

  onTextAddressChange(event) {
    if (event?.checked) {
      this.form.get('foreignerPlaceOfBirth').enable();

      this.form.get('permanentAddressText').enable();

      this.form.get('bd_province').disable();
      this.form.get('bd_district').disable();
      this.form.get('bd_commune').disable();
      this.form.get('bd_village').disable();

      this.form.get('live_province').disable();
      this.form.get('live_district').disable();
      this.form.get('live_commune').disable();
      this.form.get('live_village').disable();
    } else {

      this.form.get('permanentAddressText').disable();

      this.form.get('live_province').enable();
      this.form.get('live_district').enable();
      this.form.get('live_commune').enable();
      this.form.get('live_village').enable();

      this.onSelectedDateOfBirth({
        day: this.form?.get('dateOfBirthDay')?.value,
        month: this.form?.get('dateOfBirthMonth')?.value,
        year: this.form?.get('dateOfBirthYear')?.value
      })
    }
  }

  onChangeLiveStatusMother(event) {
    if (event?.value?.key === 3) {
      this.form.get('motherCurrentOccupation_kh').disable();
      this.form.get('motherCurrentOccupation_en').disable();
      this.form.get('motherCurrentOccupation_fr').disable();
    } else {
      this.form.get('motherCurrentOccupation_kh').enable();
      this.form.get('motherCurrentOccupation_en').enable();
      this.form.get('motherCurrentOccupation_fr').enable();
    }
  }

  onChangeLiveStatusFather(event) {
    if (event?.value?.key === 3) {
      this.form.get('fatherCurrentOccupation_kh').disable();
      this.form.get('fatherCurrentOccupation_en').disable();
      this.form.get('fatherCurrentOccupation_fr').disable();
    } else {
      this.form.get('fatherCurrentOccupation_kh').enable();
      this.form.get('fatherCurrentOccupation_en').enable();
      this.form.get('fatherCurrentOccupation_fr').enable();
    }
  }

  onChangeLiveStatusSpouse(event) {
    if (event?.value?.key === 3) {
      this.form.get('spouseCurrentOccupation_kh').disable();
      this.form.get('spouseCurrentOccupation_en').disable();
      this.form.get('spouseCurrentOccupation_fr').disable();
    } else {
      this.form.get('spouseCurrentOccupation_kh').enable();
      this.form.get('spouseCurrentOccupation_en').enable();
      this.form.get('spouseCurrentOccupation_fr').enable();
    }
  }

}

