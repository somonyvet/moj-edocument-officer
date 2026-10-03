import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CRIMINAL_APPLICATION_LANGUAGE_ARRAY, FAMILY_STATUS, GENDER_DATA, PHOTO_LIB, STATUS_LIVES_ARRAY, STATUS_OBJ, URGENT_OBJ, URGENT_STATUS_ARRAY } from 'src/app/dummy/appinfo';
import { days, DOCUMENT_ATTACHMENT_TYPES, KHMER_DAY, monthOfYear } from 'src/app/dummy/report';
import { APPLICATION_TYPE_OBJ } from 'src/app/dummy/status';
import { ConvertService, orderBy, pushObjArray, pushToArray, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, getYearsList, MappingService, todayDate, toGeoData, toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CitizenStore } from 'src/app/modules/criminal-record/stores/citizen.store';
import { CriminalStore } from 'src/app/modules/criminal-record/stores/criminal.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-latter-application',
  templateUrl: './criminal-latter-application.component.html',
  styleUrls: ['./criminal-latter-application.component.scss']
})
export class CriminalLatterApplicationComponent implements OnInit, OnDestroy {

  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('docFile') docFile: ElementRef;
  khmerNationality: any = null;

  isKhmerForm : boolean = true;

  DOCUMENT_ATTACHMENT_TYPES = JSON.parse(JSON.stringify(DOCUMENT_ATTACHMENT_TYPES)) // clone array
  params: any = null;
  SELECTED_PHOTO: any = null;
  URL: any = null;
  filteredBirthNationality: Observable<Array<any>>;
  filteredNationality: Observable<Array<any>>;
  nationals: any = [];

  backUrl: string = null;
  form: FormGroup;
  GENDER_KH = GENDER_DATA;
  FAMILY_STATUS = FAMILY_STATUS;
  STATUS_OBJ = STATUS_OBJ;
  khDay = KHMER_DAY;

  STATUS_LIVES_ARRAY_DATA: any[] = [];
  APPLICATION_TYPE_OBJ = APPLICATION_TYPE_OBJ;

  DAYS: any[] = [];
  KHDAYS = KHMER_DAY;
  MONTHS: any[] = [];
  years: any[] = [];

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

  day_header: AbstractControl;
  month_header: AbstractControl;
  year_header: AbstractControl;
  current_nationality: AbstractControl;
  before_nationality: AbstractControl;

  process: boolean = false;
  positionList = [];
  titleList = [];

  hashtagItems: any[] = []
  loading: boolean = false;
  selected_attachment_files: any[] = [];

  canSave: boolean = false;
  // old_age: boolean = false;
  // old_age_father: boolean = false;
  // old_age_mother: boolean = false;

  constructor(
    public criminal: CriminalStore,
    private fb: FormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private router: Router,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    public storage: FireStorageService,
  ) { }

  async ngOnInit() {

    if(!this.criminalStore?.applicationConfig){
      this.router.navigate(['/ecosystem/criminal-record-latter/create'])
      return;
    }

    this.buildForm();
    const { selectedCriminalRecord, selectedCitizenProfile, isKhmerForm } = this.criminalStore;
    this.loading = true;
    this.selected_attachment_files = []

    if(selectedCriminalRecord){
      // this.old_age = selectedCriminalRecord?.dateOfBirthYear?.key <= 1979;
      // this.old_age_father = selectedCriminalRecord?.fatherDob?.year?.key <= 1979;
      // this.old_age_mother = selectedCriminalRecord?.motherDob?.year?.key <= 1979;
      this.canSave = selectedCriminalRecord?.status?.key === STATUS_OBJ.DRAFT?.key || selectedCriminalRecord?.status?.key === STATUS_OBJ.APPLY?.key;
    }else{
      this.canSave = true;
    }

    const { config } = this.auth;
    this.isKhmerForm = isKhmerForm
    this.DAYS = days?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    this.MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: isKhmerForm, name_en: `${m}` } })
    this.GENDER_KH = GENDER_DATA?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    this.years = years
    const date = todayDate(this.auth.serverDateTime, this.DAYS, this.MONTHS, this.years);
    this.STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    this.DOCUMENT_ATTACHMENT_TYPES = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === isKhmerForm);

    this.criminalStore.citizens = [];
    this.backUrl = `/ecosystem/criminal-record-latter/create`;
    this.URL = selectedCriminalRecord?.photo?.downloadUrl || null;
    this.hashtagItems = selectedCitizenProfile?.hashtags || [];
    const arrProvince = await this.fetchProvinces()
    let nationals = (await this.store.getNational())?.map(m => ({ ...m, isKhmer: isKhmerForm }))
    const khmerNationality = isKhmerForm ? nationals?.find(m => m?.key === config?.country_khmer_key) : null;
    this.khmerNationality = khmerNationality;

    this.bdProvince = MappingService.autoComplete(this.bd_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
    this.liveProvince = MappingService.autoComplete(this.live_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
    this.father_bdProvince = MappingService.autoComplete(this.father_bd_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
    this.mother_bdProvince = MappingService.autoComplete(this.mother_bd_province, arrProvince, isKhmerForm ? 'name' : 'name_en');
    this.filteredDay = MappingService.autoComplete(this.day_header, this.KHDAYS, 'name')
    this.filteredMonth = MappingService.autoComplete(this.month_header, this.MONTHS, isKhmerForm ? 'name' : 'name_en')
    this.filteredYear = MappingService.autoComplete(this.year_header, years, 'name')
    this.filteredBirthNationality = MappingService.autoComplete(this.before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
    this.filteredNationality = MappingService.autoComplete(this.current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
    this.filteredFatherBirthNationality = MappingService.autoComplete(this.father_before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
    this.filteredFatherNationality = MappingService.autoComplete(this.father_current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
    this.filteredMotherBirthNationality = MappingService.autoComplete(this.mother_before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
    this.filteredMotherNationality = MappingService.autoComplete(this.mother_current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
    this.filteredSpouseBirthNationality = MappingService.autoComplete(this.spouse_before_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')
    this.filteredSpouseNationality = MappingService.autoComplete(this.spouse_current_nationality, nationals, isKhmerForm ? 'kh_nationality' : 'nationality')

    const bdProvinceItem = arrProvince?.find(m => m?.key === (selectedCriminalRecord?.birthAddress?.province?.key || selectedCitizenProfile?.birthAddress?.province?.key || null))
    const live_provinceItem = arrProvince?.find(m => m?.key === (selectedCriminalRecord?.permanentAddress?.province?.key || selectedCitizenProfile?.permanentAddress?.province?.key || null))
    const father_provinceItem = arrProvince?.find(m => m?.key === (selectedCriminalRecord?.fatherBirthAddress?.province?.key || selectedCitizenProfile?.fatherBirthAddress?.province?.key || null));
    const mother_provinceItem = arrProvince?.find(m => m?.key === (selectedCriminalRecord?.motherBirthAddress?.province?.key || selectedCitizenProfile?.motherBirthAddress?.province?.key || null));

    const live_districtItemKey = selectedCriminalRecord?.permanentAddress?.district?.key || selectedCitizenProfile?.permanentAddress?.district?.key || null;
    const live_communeItemKey = selectedCriminalRecord?.permanentAddress?.commune?.key || selectedCitizenProfile?.permanentAddress?.commune?.key || null;
    const live_villageItemKey = selectedCriminalRecord?.permanentAddress?.village?.key || selectedCitizenProfile?.permanentAddress?.village?.key || null;

    const father_districtItemKey = selectedCriminalRecord?.fatherBirthAddress?.district?.key || selectedCitizenProfile?.fatherBirthAddress?.district?.key || null;
    const father_communeItemKey = selectedCriminalRecord?.fatherBirthAddress?.commune?.key || selectedCitizenProfile?.fatherBirthAddress?.commune?.key || null;
    const father_villageItemKey = selectedCriminalRecord?.fatherBirthAddress?.village?.key || selectedCitizenProfile?.fatherBirthAddress?.village?.key || null;

    const mother_districtItemKey = selectedCriminalRecord?.motherBirthAddress?.district?.key || selectedCitizenProfile?.motherBirthAddress?.district?.key || null;
    const mother_communeItemKey = selectedCriminalRecord?.motherBirthAddress?.commune?.key || selectedCitizenProfile?.motherBirthAddress?.commune?.key || null;
    const mother_villageItemKey = selectedCriminalRecord?.motherBirthAddress?.village?.key || selectedCitizenProfile?.motherBirthAddress?.village?.key || null;

    const fatherIsDeadKey = selectedCriminalRecord?.fatherIsDead?.key || selectedCitizenProfile?.fatherIsDead?.key || null;
    const motherIsDeadKey = selectedCriminalRecord?.motherIsDead?.key || selectedCitizenProfile?.motherIsDead?.key || null;
    const spouseIsDeadKey = selectedCriminalRecord?.spouseIsDead?.key || selectedCitizenProfile?.spouseIsDead?.key || null;

    let bdDistrictItem: any, bdCommuneItem: any, bdVillageItem: any;
    let live_districtItem: any, live_communeItem: any, live_villageItem: any;
    let father_districtItem: any, father_communeItem: any, father_villageItem: any;
    let mother_districtItem: any, mother_communeItem: any, mother_villageItem: any;

    if (bdProvinceItem) {
      const geoDistrictData = await this.fetchDistricts(bdProvinceItem?.key)
      this.bdDistrict = MappingService.autoComplete(this.bd_district, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
      bdDistrictItem = geoDistrictData?.find(m => m?.key === (selectedCriminalRecord?.birthAddress?.district?.key || selectedCitizenProfile?.birthAddress?.district?.key || null))
    }
    if (bdDistrictItem) {
      const geoDistrictData = await this.fetchCommune(bdDistrictItem?.key)
      this.bdCommune = MappingService.autoComplete(this.bd_commune, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
      bdCommuneItem = geoDistrictData?.find(m => m?.key === (selectedCriminalRecord?.birthAddress?.commune?.key || selectedCitizenProfile?.birthAddress?.commune?.key || null))
    }
    if (bdCommuneItem) {
      const geoDistrictData = await this.fetchVillages(bdCommuneItem?.key)
      this.bdVillage = MappingService.autoComplete(this.bd_village, geoDistrictData, isKhmerForm ? 'name' : 'name_en')
      bdVillageItem = geoDistrictData?.find(m => m?.key === (selectedCriminalRecord?.birthAddress?.village?.key || selectedCitizenProfile?.birthAddress?.village?.key || null))
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

    this.form.patchValue({
      day_header: date?.day,
      month_header: date?.month,
      year_header: date?.year,

      first_name_kh: selectedCriminalRecord?.first_name || selectedCitizenProfile?.first_name || null,
      last_name_kh: selectedCriminalRecord?.last_name || selectedCitizenProfile?.last_name || null,

      first_name_en: selectedCriminalRecord?.first_name_en || selectedCitizenProfile?.first_name_en || null,
      last_name_en: selectedCriminalRecord?.last_name_en || selectedCitizenProfile?.last_name_en || null,

      // first_name_fr: selectedCriminalRecord?.first_name_fr || selectedCitizenProfile?.first_name_en || null,
      // last_name_fr: selectedCriminalRecord?.last_name_fr || selectedCitizenProfile?.last_name_fr || null,

      nick_name: selectedCriminalRecord?.nick_name || selectedCitizenProfile?.nick_name || null,
      nick_name_en: selectedCriminalRecord?.nick_name_en || selectedCitizenProfile?.nick_name_en || null,
      // nick_name_fr: selectedCriminalRecord?.nick_name_fr || selectedCitizenProfile?.nick_name_fr || null,

      permanentAddressText: selectedCriminalRecord?.permanentAddressText || selectedCitizenProfile?.permanentAddressText || null,
      permanentAddressText_en: selectedCriminalRecord?.permanentAddressText_en || selectedCitizenProfile?.permanentAddressText_en || null,
      permanentAddressText_fr: selectedCriminalRecord?.permanentAddressText_fr || selectedCitizenProfile?.permanentAddressText_fr || null,

      gender: selectedCriminalRecord?.gender || selectedCitizenProfile?.gender || null,
      dateOfBirthDay: selectedCriminalRecord?.dateOfBirthDay || selectedCitizenProfile?.dateOfBirthDay || null,
      dateOfBirthMonth: selectedCriminalRecord?.dateOfBirthMonth || selectedCitizenProfile?.dateOfBirthMonth || null,
      dateOfBirthYear: selectedCriminalRecord?.dateOfBirthYear || selectedCitizenProfile?.dateOfBirthYear || null,
      before_nationality: selectedCriminalRecord?.before_nationality || selectedCitizenProfile?.before_nationality || khmerNationality || null,
      current_nationality: selectedCriminalRecord?.current_nationality || selectedCitizenProfile?.current_nationality || khmerNationality || null,

      occupation_kh: selectedCriminalRecord?.occupation || selectedCitizenProfile?.occupation || null,
      occupation_fr: selectedCriminalRecord?.occupation_fr || selectedCitizenProfile?.occupation_fr || null,
      occupation_en: selectedCriminalRecord?.occupation_en || selectedCitizenProfile?.occupation_en || null,

      father_name_kh: selectedCriminalRecord?.father_name || selectedCitizenProfile?.father_name_kh || null,
      father_name_en: selectedCriminalRecord?.father_name_en || selectedCitizenProfile?.father_name_en || null,
      // father_name_fr: selectedCriminalRecord?.father_name_fr || selectedCitizenProfile?.father_name_fr || null,

      fatherDob: selectedCriminalRecord?.fatherDob || selectedCitizenProfile?.fatherDob || null,
      father_before_nationality: selectedCriminalRecord?.father_before_nationality || selectedCitizenProfile?.father_before_nationality || null,
      father_current_nationality: selectedCriminalRecord?.father_current_nationality || selectedCitizenProfile?.father_current_nationality || null,

      fatherCurrentOccupation_kh: selectedCriminalRecord?.fatherCurrentOccupation || selectedCitizenProfile?.fatherCurrentOccupation || null,
      fatherCurrentOccupation_en: selectedCriminalRecord?.fatherCurrentOccupation_en || selectedCitizenProfile?.fatherCurrentOccupation_en || null,
      fatherCurrentOccupation_fr: selectedCriminalRecord?.fatherCurrentOccupation_fr || selectedCitizenProfile?.fatherCurrentOccupation_fr || null,

      fatherIsDead: fatherIsDeadKey ? this.STATUS_LIVES_ARRAY_DATA.find(m => m?.key === fatherIsDeadKey) : this.STATUS_LIVES_ARRAY_DATA[0],
      father_bd_province : father_provinceItem,
      father_bd_district : father_districtItem,
      father_bd_commune : father_communeItem,
      father_bd_village : father_villageItem,

      mother_name_kh: selectedCriminalRecord?.mother_name || selectedCitizenProfile?.mother_name || null,
      mother_name_en: selectedCriminalRecord?.mother_name_en || selectedCitizenProfile?.mother_name_en || null,
      // mother_name_fr: selectedCriminalRecord?.mother_name_fr || selectedCitizenProfile?.mother_name_fr || null,

      motherDob: selectedCriminalRecord?.motherDob || selectedCitizenProfile?.motherDob || null,
      mother_before_nationality: selectedCriminalRecord?.mother_before_nationality || selectedCitizenProfile?.mother_before_nationality || null,
      mother_current_nationality: selectedCriminalRecord?.mother_current_nationality || selectedCitizenProfile?.mother_current_nationality || null,

      motherCurrentOccupation_kh: selectedCriminalRecord?.motherCurrentOccupation || selectedCitizenProfile?.motherCurrentOccupation || null,
      motherCurrentOccupation_en: selectedCriminalRecord?.motherCurrentOccupation_en || selectedCitizenProfile?.motherCurrentOccupation_en || null,
      motherCurrentOccupation_fr: selectedCriminalRecord?.motherCurrentOccupation_fr || selectedCitizenProfile?.motherCurrentOccupation_fr || null,

      motherIsDead: motherIsDeadKey ? this.STATUS_LIVES_ARRAY_DATA.find(m => m?.key === motherIsDeadKey) : this.STATUS_LIVES_ARRAY_DATA[0],
      mother_bd_province : mother_provinceItem,
      mother_bd_district : mother_districtItem,
      mother_bd_commune : mother_communeItem,
      mother_bd_village : mother_villageItem,

      spouse_name_kh: selectedCriminalRecord?.spouse || selectedCitizenProfile?.spouse || null,
      spouse_name_en: selectedCriminalRecord?.spouse_en || selectedCitizenProfile?.spouse_en || null,
      // spouse_name_fr: selectedCriminalRecord?.spouse_name_fr || selectedCitizenProfile?.spouse_name_fr || null,

      spouseDob: selectedCriminalRecord?.spouseDob || selectedCitizenProfile?.spouseDob || null,
      spouseIsDead: spouseIsDeadKey ? this.STATUS_LIVES_ARRAY_DATA.find(m => m?.key === spouseIsDeadKey) : this.STATUS_LIVES_ARRAY_DATA[0],
      spouse_before_nationality: selectedCriminalRecord?.spouse_before_nationality || selectedCitizenProfile?.spouse_before_nationality || null,
      spouse_current_nationality: selectedCriminalRecord?.spouse_current_nationality || selectedCitizenProfile?.spouse_current_nationality || null,

      spouseCurrentOccupation_kh: selectedCriminalRecord?.spouseCurrentOccupation || selectedCitizenProfile?.spouseCurrentOccupation || null,
      spouseCurrentOccupation_en: selectedCriminalRecord?.spouseCurrentOccupation_en || selectedCitizenProfile?.spouseCurrentOccupation_en || null,
      spouseCurrentOccupation_fr: selectedCriminalRecord?.spouseCurrentOccupation_fr || selectedCitizenProfile?.spouseCurrentOccupation_fr || null,

      footer_phone: selectedCriminalRecord?.phoneNumber || selectedCitizenProfile?.phoneNumber || null,

      bd_province: bdProvinceItem,
      bd_district: bdDistrictItem,
      bd_commune: bdCommuneItem,
      bd_village: bdVillageItem,

      live_province: live_provinceItem,
      live_district: live_districtItem,
      live_commune: live_communeItem,
      live_village: live_villageItem,

      foreignerPlaceOfBirth: selectedCriminalRecord?.foreignerPlaceOfBirth || selectedCitizenProfile?.foreignerPlaceOfBirth || null,
      foreignerPlaceOfBirth_en: selectedCriminalRecord?.foreignerPlaceOfBirth_en || selectedCitizenProfile?.foreignerPlaceOfBirth_en || null,
      foreignerPlaceOfBirth_fr: selectedCriminalRecord?.foreignerPlaceOfBirth_fr || selectedCitizenProfile?.foreignerPlaceOfBirth_fr || null,

      foreignerFatherBirthAddress: selectedCriminalRecord?.foreignerFatherBirthAddress || selectedCitizenProfile?.foreignerFatherBirthAddress || null,
      foreignerFatherBirthAddress_en: selectedCriminalRecord?.foreignerFatherBirthAddress_en || selectedCitizenProfile?.foreignerFatherBirthAddress_en || null,
      foreignerFatherBirthAddress_fr: selectedCriminalRecord?.foreignerFatherBirthAddress_fr || selectedCitizenProfile?.foreignerFatherBirthAddress_fr || null,

      foreignerMotherBirthAddress: selectedCriminalRecord?.foreignerMotherBirthAddress || selectedCitizenProfile?.foreignerMotherBirthAddress || null,
      foreignerMotherBirthAddress_en: selectedCriminalRecord?.foreignerMotherBirthAddress_en || selectedCitizenProfile?.foreignerMotherBirthAddress_en || null,
      foreignerMotherBirthAddress_fr: selectedCriminalRecord?.foreignerMotherBirthAddress_fr || selectedCitizenProfile?.foreignerMotherBirthAddress_fr || null,

      home_no_kh: selectedCriminalRecord?.permanentAddress?.home_no_kh || selectedCitizenProfile?.permanentAddress?.home_no_kh || null,

      street_no_kh: selectedCriminalRecord?.permanentAddress?.street_no_kh || selectedCitizenProfile?.permanentAddress?.street_no_kh || null,
      isTextAddress : selectedCriminalRecord?.isTextAddress || selectedCitizenProfile?.isTextAddress || false,
    })

    // if (isKhmerForm) {

    //   this.form.controls['current_nationality'].disable()
    //   this.form.controls['before_nationality'].disable()

    // } else {

    //   this.form.controls['current_nationality'].enable()
    //   this.form.controls['before_nationality'].enable()

    // }
    this.onChangeLiveStatusFather({ value: {key:fatherIsDeadKey}} )
    this.onChangeLiveStatusMother({ value: {key:motherIsDeadKey}} )
    this.onChangeLiveStatusSpouse({ value: {key:spouseIsDeadKey}} )

    if(!selectedCriminalRecord?.isTextAddress){
      this.form.controls['foreignerPlaceOfBirth'].disable()
    }

    if(selectedCriminalRecord?.isTextAddress) this.onTextAddressChange({checked: true})
    else this.onTextAddressChange({checked: false})

    this.loading = false;
  }

  ngOnDestroy(): void {
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

  selectedAttachmentType: any = null;
  _onOpenSelected(event: any, type: any) {
    this.selectedAttachmentType = type;
    event.click();
  }

  onSelectedAttachmentFile(event: any) {
    if (event && event.target.files.length > 0) {
      const file = event.target.files[0];
      const { key, name, name_en, forKhmer, required } = this.selectedAttachmentType
      if (`${file?.type}`.indexOf(`image`) > -1) {
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (event) => {
          const item = {
            key: `${this.selectedAttachmentType?.key}`,
            docType: { key, name, name_en, forKhmer, required },
            file: file,
            url: event.target.result,
            image: true,
          }
          const index = this.DOCUMENT_ATTACHMENT_TYPES?.findIndex(m => `${m?.key}` === `${this.selectedAttachmentType?.key}`);
          this.DOCUMENT_ATTACHMENT_TYPES[index].data = [item];
          this.selected_attachment_files = pushObjArray(this.selected_attachment_files, item)
        }
      } else {
        const item = {
          key: `${this.selectedAttachmentType?.key}`,
          docType: { key, name, name_en, forKhmer, required },
          file: file,
          image: false,
        }
        const index = this.DOCUMENT_ATTACHMENT_TYPES?.findIndex(m => `${m?.key}` === `${this.selectedAttachmentType?.key}`);
        this.DOCUMENT_ATTACHMENT_TYPES[index].data = [item];
        this.selected_attachment_files = pushObjArray(this.selected_attachment_files, item)
      }
      this.docFile.nativeElement.value = "";
    }
  }
  _onRemoveFile(file: any) {
    const { key, docType } = file;
    const index = this.DOCUMENT_ATTACHMENT_TYPES?.findIndex(m => `${m?.key}` === `${docType?.key}`);
    this.DOCUMENT_ATTACHMENT_TYPES[index].data = [];
    this.selected_attachment_files = this.selected_attachment_files?.filter(m => m?.key !== key);
  }

  _onRemoveAttachment(file: any) {
    const { selectedCitizenProfile, selectedCriminalRecord, attachment_files } = this.criminalStore;
    const files = attachment_files?.filter(m => m?.key !== file?.key);
    selectedCriminalRecord.attachments = files;
    if (selectedCitizenProfile) {
      selectedCitizenProfile.attachments = files;
    }
    this.store.saveCriminalRecord(selectedCriminalRecord, selectedCitizenProfile, async (success, res) => {
      this.form.enable();
      if (success) {
        await this.storage.deleteFile(file);
        this.snackBar.open(`ឯកសារភ្ជាប់ត្រូវបានលុបចេញពីប្រព័ន្ធ`, "ជោគជ័យ", { duration: 2000 });
      } else {
        alert(res);
      }
    })
  }

  onSelectedDateFatherDob(event) {
    // if(event?.year && (event?.year?.key <= 1979)) this.old_age_father = true;
    // else this.old_age_father = false;

    this.form.get('fatherDob').patchValue(event)
  }

  onSelectedDateMotherDob(event) {
    // if(event?.year && (event?.year?.key <= 1979)) this.old_age_mother = true;
    // else this.old_age_mother = false;

    this.form.get('motherDob').patchValue(event)
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

  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
  }

  _onSelectedOldNationally(event: MatAutocompleteSelectedEvent, field: string) {
    this.form.patchValue({
      [field]: event?.option.value
    })
  }

  onSelectedDateSpouse(event) {
    this.form.get('spouseDob').patchValue(event)
  }

  onSelectedDateOfEntryPoliceWork(event) {
    this.form.get('dateOfEntryPoliceWorkDay').patchValue(event?.day);
    this.form.get('dateOfEntryPoliceWorkMonth').patchValue(event?.month);
    this.form.get('dateOfEntryPoliceWorkYear').patchValue(event?.year);
  }

  onSelectedDateOfBirth(event) {
    // if(event?.year && (event?.year?.key <= 1979)){
    //   this.old_age = true;
    //   this.form.get('foreignerPlaceOfBirth').enable();
    //   this.form.get('bd_province').disable();
    //   this.form.get('bd_district').disable();
    //   this.form.get('bd_commune').disable();
    //   this.form.get('bd_village').disable();
    // }
    // else {
    //   this.old_age = false;
    //   if(!this.form.get('isTextAddress').value){
    //     this.form.get('bd_province').enable();
    //     this.form.get('bd_district').enable();
    //     this.form.get('bd_commune').enable();
    //     this.form.get('bd_village').enable();
    //     this.form.get('foreignerPlaceOfBirth').disable();
    //   }
    // }
    this.form.get('dateOfBirthDay').patchValue(event?.day);
    this.form.get('dateOfBirthMonth').patchValue(event?.month);
    this.form.get('dateOfBirthYear').patchValue(event?.year);
  }

  async _selectLiveProvince(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_district: null,
      live_commune: null,
    })
    if (value) {
      const geoDistrictData = await this.fetchDistricts(value?.key)
      this.liveDistrict = MappingService.autoComplete(this.live_district, geoDistrictData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _selectLiveDistrict(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_commune: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchCommune(value?.key)
      this.liveCommune = MappingService.autoComplete(this.live_commune, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en')
    }
  }

  async _selectLiveCommune(event) {
    const { value } = event.option;
    this.form.patchValue({
      live_village: null,
    })
    if (value) {
      const geoCommuneData = await this.fetchVillages(value?.key)
      this.liveVillage = MappingService.autoComplete(this.live_village, geoCommuneData, this.criminalStore?.isKhmerForm ? 'name' : 'name_en');
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

  async _onSave(f: any) {

    // const invalid = [];
    // const controls = this.form.controls;
    // for (const name in controls) {
    //     if (controls[name].invalid) {
    //         invalid.push(name);
    //     }
    // }

    const { selectedCitizenProfile, selectedCriminalRecord, selectedApplicationType, isKhmerForm, selectedApplicationNationality } = this.criminalStore;

    const fileRequiredKeys = this.selected_attachment_files?.filter(m => m?.docType?.required)?.map(m => (`${m?.key}`));
    const findFileRequired = this.DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.data?.length === 0 && m?.required && !fileRequiredKeys.includes(`${m?.key}`))

    if (this.form.invalid) {
      alert('សូមបំពេញព័ត៌មានឱ្យបានត្រឹមត្រូវ សូមពិនិត្យសញ្ញាផ្កាយពណ៌ក្រហមតំណាងឲ្យព័ត៌មានដែលលោកអ្នកត្រូវតែបំពេញ')
      return;
    }
    if (!selectedCriminalRecord?.photo && !this.SELECTED_PHOTO) {
      alert('សូមបញ្ចូលរូបថត 4x6ឲ្យបានត្រឹមត្រូវ')
      return;
    }
    if (findFileRequired?.length > 0) {
      if(findFileRequired?.find(f=>!this.criminalStore?.attachment_files?.find(item=>item?.docType?.key === f.key))){
        alert('សូមជូនភ្ជាប់មកជាមួយនូវ ឯកសារភ្ជាប់ដែលតម្រូវឱ្យមាន សូមអានកំណត់សម្គាល់ដើម្បីទទួលបានព័ត៌មានបន្ថែម')
        return;
      }
    }
    //already submitted can not save;
    if (!this.canSave) {
      alert('Sorry! this application has been approved. you cannot modify this information.')
      return;
    }

    // if (selectedCriminalRecord?.status?.key === STATUS_OBJ.ACTIVE.key) {
    //   alert('Sorry! this application has been approved. you cannot modify this information.')
    //   return;
    // }

    const {
      last_name_kh,
      first_name_kh,

      last_name_en,
      first_name_en,

      nick_name,
      nick_name_en,

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

      permanentAddressText,
      permanentAddressText_en,
      permanentAddressText_fr,

      occupation_kh,
      occupation_en,
      occupation_fr,

      father_name_kh,
      father_name_en,

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

      spouseIsDead,
      spouse_before_nationality,
      spouse_current_nationality,

      spouseCurrentOccupation_kh,
      spouseCurrentOccupation_en,
      spouseCurrentOccupation_fr,
      spouseDob,
      footer_phone,
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
      isTextAddress,
    } = f

    this.form.disable()
    this.process = true;
    const { publicApplication, uid, config } = this.auth;
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
      home_no_kh: home_no_kh||null,
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

    const khmerFullName = last_name_kh + ' ' + first_name_kh;
    const full_name_en = `${last_name_en} ${first_name_en}`

    const date = todayDate(this.auth.serverDateTime, this.DAYS, this.MONTHS, this.years);

    const spacialKey = this.getSpacialKey()
    const phoneNumber = `0${toNumber(`${footer_phone}`.trim())}`;
    const citizenKey = selectedCitizenProfile?.key || (publicApplication ? uid : this.ds.createId());

    let selected_language = []
    const khmer_language_obj = {
      ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[0],
      amount: this.criminalStore?.applicationConfig?.khmer_amount,
    }
    selected_language.push(khmer_language_obj);
    if(this.criminalStore?.applicationConfig?.france_form){
      const france_language_obj = {
        ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[1],
        amount: this.criminalStore?.applicationConfig?.france_amount ,
      }
      selected_language.push(france_language_obj);
    }
    if(this.criminalStore?.applicationConfig?.english_form){
      const english_language_obj = {
        ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[2],
        amount: this.criminalStore?.applicationConfig?.english_amount,
      }
      selected_language.push(english_language_obj);
    }

    const urgent_obj = this.criminalStore?.applicationConfig?.duration;

    // const urgent_status = this.criminalStore?.applicationConfig?.duration === 20? false : true;

    const data: any = {
      key: selectedCriminalRecord?.key || this.ds.createId(),
      status: selectedCriminalRecord?.status || STATUS_OBJ.DRAFT,
      created_at: selectedCriminalRecord?.created_at || this.ds.serverTimestamp(),
      created_by: selectedCriminalRecord?.created_by || this.store.getMappedProfile(),

      date_key: selectedCriminalRecord?.date_key || ConvertService.dateKey(),
      page_key: selectedCriminalRecord?.page_key || ConvertService.pageKey(),
      isDelete: selectedCriminalRecord?.isDelete || false,
      apply: publicApplication || false,//seperate between user and officer
      updated_by: this.store.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
      keyword: generateKeywords([khmerFullName, full_name_en]).concat([`${phoneNumber}`, spacialKey]),
      application_type: this.criminalStore.selectedApplicationType || null,
      photo: selectedCriminalRecord?.photo || null,
      national_application: selectedApplicationNationality,
      criminal_record_category: config?.criminal_record_category || null,
      day_header: date?.day,
      month_header: date?.month,
      year_header: date.year,

      nick_name: nick_name || null,
      nick_name_en: nick_name_en || null,

      before_nationality: isKhmerForm ? this.khmerNationality : before_nationality,
      current_nationality: isKhmerForm ? this.khmerNationality : current_nationality,
      first_name: first_name_kh,
      last_name: last_name_kh,

      first_name_en: first_name_en || null,
      last_name_en: last_name_en || null,

      gender: gender,
      occupation: occupation_kh || null,
      occupation_en: occupation_en || null,
      occupation_fr: occupation_fr || null,

      dateOfBirthDay: dateOfBirthDay || null,
      dateOfBirthMonth: dateOfBirthMonth || null,
      dateOfBirthYear: dateOfBirthYear || null,

      birthAddress: birthAddressData || null,
      permanentAddress: permanentAddressData,
      permanentAddressText: permanentAddressText || null,
      permanentAddressText_en: permanentAddressText_en || null,
      permanentAddressText_fr : permanentAddressText_fr || null,

      phoneNumber: phoneNumber || null,
      spacialKey: spacialKey,

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

      storyboard: selectedCriminalRecord?.storyboard || null,
      hashtags: this.hashtagItems || [],

      attachments: selectedCriminalRecord?.attachments || [],
      citizen_ref: citizenKey,

      foreignerPlaceOfBirth: foreignerPlaceOfBirth || null,
      foreignerPlaceOfBirth_en: foreignerPlaceOfBirth_en || null,
      foreignerPlaceOfBirth_fr: foreignerPlaceOfBirth_fr || null,

      foreignerFatherBirthAddress: foreignerFatherBirthAddress || null,
      foreignerFatherBirthAddress_en: foreignerFatherBirthAddress_en || null,
      foreignerFatherBirthAddress_fr: foreignerFatherBirthAddress_fr || null,

      foreignerMotherBirthAddress: foreignerMotherBirthAddress || null,
      foreignerMotherBirthAddress_en: foreignerMotherBirthAddress_en || null,
      foreignerMotherBirthAddress_fr: foreignerMotherBirthAddress_fr || null,

      criminal_language : selected_language,

      workplace_entry : null,

      urgent: false,
      urgent_obj: urgent_obj,
      urgentStatus: false,

      isTextAddress: isTextAddress || false,

    }
    data?.keyword?.push(data?.spacialKey || null);
    data?.keyword?.push(data?.phoneNumber || null)
    data?.keyword?.concat(this.hashtagItems || [])

    if (this.SELECTED_PHOTO) {
      const file = await this.storage.upload([this.SELECTED_PHOTO])
      data.photo = file[0];
    }
    if (this.selected_attachment_files?.length > 0) {
      const attFiles = this.selected_attachment_files?.map(m => m?.file)
      const files = await this.storage.upload(attFiles)
      data.attachments = files?.map((m, index) => {
        const docType = this.selected_attachment_files[index].docType;
        delete docType.data;
        const r = { ...m, docType: docType }
        return r;
      })
    }
    let citizenData = {
      ...data,
      criminal_record_ref: data?.key,
      key: citizenKey,
      status: STATUS_OBJ.ACTIVE,
    }
    if (selectedCitizenProfile) {
      citizenData = {
        key: citizenKey,
        status: STATUS_OBJ.ACTIVE,
        updated_by: this.store.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),
        keyword: generateKeywords([khmerFullName, full_name_en]).concat([`${phoneNumber}`, spacialKey]),
        application_type: this.criminalStore.selectedApplicationType || null,
        photo: data?.photo || null,
        apply: publicApplication || false,
        // fullname_header,
        day_header: date?.day,
        month_header: date?.month,
        year_header: date.year,

        nick_name: nick_name || null,
        nick_name_en: nick_name_en || null,

        before_nationality: selectedCitizenProfile?.before_nationality || null,
        current_nationality: selectedCitizenProfile?.current_nationality || null,

        first_name: first_name_kh,
        last_name: last_name_kh,
        first_name_en: first_name_en || null,
        last_name_en: last_name_en || null,

        gender: gender,

        occupation: occupation_kh || null,
        occupation_en: occupation_en || null,
        occupation_fr: occupation_fr || null,

        national_application: selectedApplicationNationality,
        criminal_record_category: config?.criminal_record_category || null,

        dateOfBirthDay: dateOfBirthDay || null,
        dateOfBirthMonth: dateOfBirthMonth || null,
        dateOfBirthYear: dateOfBirthYear || null,

        birthAddress: birthAddressData || null,
        permanentAddress: permanentAddressData,
        phoneNumber: phoneNumber || null,
        spacialKey: spacialKey,

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
        spouse_name_en: spouse_name_en || null,

        spouseIsDead: spouseIsDead || null,
        spouse_before_nationality: spouse_before_nationality || null,
        spouse_current_nationality: spouse_current_nationality || null,

        spouseCurrentOccupation: spouseCurrentOccupation_kh || null,
        spouseCurrentOccupation_en: spouseCurrentOccupation_en || null,
        spouseCurrentOccupation_fr: spouseCurrentOccupation_fr || null,

        spouseDob: spouseDob || null,

        storyboard: selectedCriminalRecord?.storyboard || null,
        hashtags: this.hashtagItems || [],

        criminal_language : selected_language,

        urgent: false,
        urgent_obj: urgent_obj,
        urgentStatus: false,

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
        permanentAddressText_fr : permanentAddressText_fr || null,

        attachments: selectedCriminalRecord?.attachments || [],
        criminal_record_ref: data?.key,
        isTextAddress: isTextAddress || false,
      }
    }
    const oldPhoto = selectedCriminalRecord?.photo || null;
    const oldAttachment: any[] = selectedCriminalRecord?.attachments || [];
    this.store.saveCriminalRecord(data, citizenData, async (success, res) => {
      this.form.enable();
      this.process = false;
      if (success) {
        if (oldPhoto && this.SELECTED_PHOTO) {
          await this.storage.deleteFile(oldPhoto);
        }
        if (this.selected_attachment_files?.length > 0) {
          const deleteKeys = this.selected_attachment_files?.map(m => m?.key);
          const deleteFile = oldAttachment?.filter(m => deleteKeys.includes(`${m?.docType?.key}`))
          for await (const item of deleteFile) {
            await this.storage.deleteFile(item);
          }
        }
        this.DOCUMENT_ATTACHMENT_TYPES = DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === isKhmerForm)
        this.selected_attachment_files = [];
        this.SELECTED_PHOTO = null;
        this.criminalStore.attachment_files = orderBy(data?.attachments || [], 'key')?.map(m => {
          if (`${m?.type}`.indexOf(`image`) > -1) {
            return { ...m, image: true, photoUrl: m?.downloadUrl ? transformImageSameTokenNo(m?.downloadUrl, '720').uri : PHOTO_LIB.EMPTY_PHOTO }
          }
          return { ...m, image: false }
        })
        this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.router.navigate([`/ecosystem/criminal-record-form/${selectedApplicationNationality?.key}/${selectedApplicationType?.route}/${citizenKey}/${data?.key}`])      } else {
        alert(res);
      }
    })
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
        uid_key = `${last_name_en}_${first_name_en}_${gender?.name_en}_${dob}_${current_nationality?.key}_${bd_province?.key}_${bd_district?.key}_${bd_commune?.key}_${bd_village?.key}`;
      }
    } else {
      if (first_name_en && last_name_en && gender && current_nationality && dateOfBirthDay && dateOfBirthMonth && dateOfBirthYear) {
        uid_key = `${last_name_en}_${first_name_en}_${gender?.name_en}_${dob}_${current_nationality?.key}`;
      }
    }
    return uid_key;
  }

  removeTag(tag: string) {
    this.hashtagItems = this.hashtagItems.filter(m => m !== tag.trim())
  }

  addTag(tag: string) {
    const find = this.hashtagItems.find(m => m === tag.trim())
    if (!find) {
      this.hashtagItems.push(tag.trim())
      this.form.controls['hashtag'].reset()
    }
  }


  displayNameAndNameEn(item: any): string {
    return item ? (item?.isKhmer ? item?.name : item?.name_en) : null;
  }

  displayNameAndEnName(item: any): string {
    return item ? (item?.isKhmer ? item?.name : item?.en_name) : null;
  }

  displayName(item: any): string {
    return item?.name || null;
  }

  displayNationalityKH(item: any): string {
    return item ? (item?.isKhmer ? item?.kh_nationality : item?.nationality) : null;
  }

  buildForm() {
    this.form = this.fb.group({
      day_header: [{ value: null, disabled: true }, [MappingService.validSelected.bind(this)]],
      month_header: [{ value: null, disabled: true }, [MappingService.validSelected.bind(this)]],
      year_header: [{ value: null, disabled: true }, [MappingService.validSelected.bind(this)]],

      //check spacial
      footer_phone: [null, [Validators.required, Validators.minLength(9)]],

      first_name_en: [null, [Validators.required]],
      last_name_en: [null, [Validators.required]],

      // first_name_fr: [null, [Validators.required]],
      // last_name_fr: [null, [Validators.required]],

      permanentAddressText: [null, [Validators.required]],
      permanentAddressText_en: [null],
      permanentAddressText_fr: [null],

      gender: [null, [Validators.required, MappingService.validSelected.bind(this)],],
      current_nationality: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      dateOfBirthDay: [null, [Validators.required, MappingService.validSelected.bind(this)],],
      dateOfBirthMonth: [null, [Validators.required, MappingService.validSelected.bind(this)],],
      dateOfBirthYear: [null, [Validators.required, MappingService.validSelected.bind(this)],],
      bd_province: [null, [Validators.required, MappingService.validSelected.bind(this)],],
      bd_commune: [null, [Validators.required, MappingService.validSelected.bind(this)],],
      bd_district: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      bd_village: [null, [Validators.required, MappingService.validSelected.bind(this)]],

      foreignerPlaceOfBirth_fr:[null],
      foreignerPlaceOfBirth_en:[null],
      foreignerPlaceOfBirth:[null,[Validators.required]],

      first_name_kh: [null, [Validators.required]],
      last_name_kh: [null, [Validators.required]],

      occupation_kh: [null, [Validators.required]],
      occupation_en: [null],
      occupation_fr: [null],
      live_province: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_district: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_commune: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_village: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      live_street: [null],
      live_home: [null],

      nick_name: [null],
      nick_name_en: [null],

      before_nationality: [null, [Validators.required, MappingService.validSelected.bind(this)]],

      father_name_kh: [null],
      father_name_en: [null],
      fatherDob: [null],
      fatherIsDead: [null],
      father_before_nationality: [null, [MappingService.validSelected.bind(this)]],
      father_current_nationality: [null, [MappingService.validSelected.bind(this)]],
      father_bd_province: [null, [MappingService.validSelected.bind(this)]],
      father_bd_commune: [null, [MappingService.validSelected.bind(this)]],
      father_bd_district: [null, [MappingService.validSelected.bind(this)]],
      father_bd_village: [null, [MappingService.validSelected.bind(this)]],
      foreignerFatherBirthAddress:[null],
      foreignerFatherBirthAddress_en:[null],
      foreignerFatherBirthAddress_fr:[null],

      fatherCurrentOccupation_kh: [null],
      fatherCurrentOccupation_en: [null],
      fatherCurrentOccupation_fr: [null],

      mother_name_kh: [null],
      mother_name_en: [null],

      motherDob: [null],
      motherIsDead: [null],
      mother_before_nationality: [null, [MappingService.validSelected.bind(this)]],
      mother_current_nationality: [null, [MappingService.validSelected.bind(this)]],

      mother_bd_province: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_commune: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_district: [null, [MappingService.validSelected.bind(this)]],
      mother_bd_village: [null, [MappingService.validSelected.bind(this)]],

      foreignerMotherBirthAddress:[null],
      foreignerMotherBirthAddress_en:[null],
      foreignerMotherBirthAddress_fr:[null],

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
      spouseCurrentOccupation_fr: [null],
      spouseCurrentOccupation_en: [null],

      hashtag: [null],
      urgent: [URGENT_STATUS_ARRAY[0]],

      home_no_kh: [null],
      home_no_en: [null],
      home_no_fr: [null],

      street_no_kh: [null],
      street_no_en: [null],
      street_no_fr: [null],

      isTextAddress: [false],
    })

    this.day_header = this.form.controls['day_header'];
    this.month_header = this.form.controls['month_header'];
    this.year_header = this.form.controls['year_header'];

    this.bd_province = this.form.controls['bd_province'];
    this.bd_district = this.form.controls['bd_district'];
    this.bd_commune = this.form.controls['bd_commune'];
    this.bd_village = this.form.controls['bd_village'];

    this.live_province = this.form.controls['live_province'];
    this.live_district = this.form.controls['live_district'];
    this.live_commune = this.form.controls['live_commune'];
    this.live_village = this.form.controls['live_village'];

    this.father_bd_province = this.form.controls['father_bd_province'];
    this.father_bd_district = this.form.controls['father_bd_district'];
    this.father_bd_commune = this.form.controls['father_bd_commune'];
    this.father_bd_village = this.form.controls['father_bd_village'];

    this.mother_bd_province = this.form.controls['mother_bd_province'];
    this.mother_bd_district = this.form.controls['mother_bd_district'];
    this.mother_bd_commune = this.form.controls['mother_bd_commune'];
    this.mother_bd_village = this.form.controls['mother_bd_village'];
    this.current_nationality = this.form.controls['current_nationality']
    this.before_nationality = this.form.controls['before_nationality']

    this.father_before_nationality = this.form.controls['father_before_nationality']
    this.father_current_nationality = this.form.controls['father_current_nationality']
    this.mother_before_nationality = this.form.controls['mother_before_nationality']
    this.mother_current_nationality = this.form.controls['mother_current_nationality']
    this.spouse_before_nationality = this.form.controls['spouse_before_nationality']
    this.spouse_current_nationality = this.form.controls['spouse_current_nationality']

  }

  onTextAddressChange(event){
    if(event?.checked){
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
    }else{
      this.form.get('permanentAddressText').disable();

      this.form.get('foreignerPlaceOfBirth').disable();

      this.form.get('live_province').enable();
      this.form.get('live_district').enable();
      this.form.get('live_commune').enable();
      this.form.get('live_village').enable();

      this.form.get('bd_province').enable();
      this.form.get('bd_district').enable();
      this.form.get('bd_commune').enable();
      this.form.get('bd_village').enable();

      // this.onSelectedDateOfBirth({
      //   day:this.form?.get('dateOfBirthDay')?.value,
      //   month:this.form?.get('dateOfBirthMonth')?.value,
      //   year:this.form?.get('dateOfBirthYear')?.value
      // })
    }
  }

  onChangeLiveStatusMother(event){
    if(event?.value?.key === 3){
      this.form.get('motherCurrentOccupation_kh').disable();
      this.form.get('motherCurrentOccupation_en').disable();
      this.form.get('motherCurrentOccupation_fr').disable();
    }else{
      this.form.get('motherCurrentOccupation_kh').enable();
      this.form.get('motherCurrentOccupation_en').enable();
      this.form.get('motherCurrentOccupation_fr').enable();
    }
  }

  onChangeLiveStatusFather(event){
    if(event?.value?.key === 3){
      this.form.get('fatherCurrentOccupation_kh').disable();
      this.form.get('fatherCurrentOccupation_en').disable();
      this.form.get('fatherCurrentOccupation_fr').disable();
    }else{
      this.form.get('fatherCurrentOccupation_kh').enable();
      this.form.get('fatherCurrentOccupation_en').enable();
      this.form.get('fatherCurrentOccupation_fr').enable();
    }
  }

  onChangeLiveStatusSpouse(event){
    if(event?.value?.key === 3){
      this.form.get('spouseCurrentOccupation_kh').disable();
      this.form.get('spouseCurrentOccupation_en').disable();
      this.form.get('spouseCurrentOccupation_fr').disable();
    }else{
      this.form.get('spouseCurrentOccupation_kh').enable();
      this.form.get('spouseCurrentOccupation_en').enable();
      this.form.get('spouseCurrentOccupation_fr').enable();
    }
  }
}
