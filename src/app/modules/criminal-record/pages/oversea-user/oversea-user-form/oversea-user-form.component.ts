import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPosition } from 'functions/src/interfaces/interface';
import { Observable } from 'rxjs';
import { DOC_CATEGORY_APP_ARRAY, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IOfficer, IStockVisa } from 'src/app/interfaces/document/document.interface';
import { ConvertService, orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { toFlatten, toUniq,groupBy, generateKeywords, toNumber, toNameKey, toRanking, toCompany, toDepartment, MappingService, mapToCountryData, mapToEmbassyData } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { GroupsAccountStore } from '../../../stores/groups-account.store';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-oversea-user-form',
  templateUrl: './oversea-user-form.component.html',
  styleUrls: ['./oversea-user-form.component.scss']
})
export class OverseaUserFormComponent implements OnInit {
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('inputRef') inputRef: ElementRef;

  titleForm: any = "បង្កើតគណនីស្ថានទូក";
  form: FormGroup;

  title: AbstractControl;
  stock_visa: AbstractControl;
  filterTitle: Observable<IPosition[]>;
  filteredStockVisaOptions: Observable<IStockVisa[]>;

  SELECTED_PHOTO: any = null;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;

  filterEmbassy: any = []
  filterCountry: any = []

  constructor(
    public dialogRef: MatDialogRef<OverseaUserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public storage: FireStorageService,
    private auth: AuthStore,
    public store: OfficerStore,
    public ds: DataService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public gaStore: GroupsAccountStore,
  ) {
    this.form = this.fb.group({
      officerId: [null, [Validators.required], this.checkExistRef.bind(this)],
      first_name: [null, [Validators.required]],
      last_name: [null, [Validators.required]],
      first_name_en: [null, [Validators.required]],
      last_name_en: [null, [Validators.required]],
      application_country: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      application_embassy: [null, [Validators.required, MappingService.validSelected.bind(this)]],
    })
  }

  async ngOnInit(): Promise<void> {

    this.filterCountry = await this.gaStore.fetchFilterDropdownData('countries', null, 'en_short_name')
    this.form.get('application_country')?.valueChanges.pipe(
      debounceTime(300),
      tap(() => false),
      switchMap((value) =>
        this.gaStore.fetchFilterDropdownData('countries', value, 'en_short_name')
      )
    )
    .subscribe((res) => {
      this.filterCountry = res;
    });

    if (this.data?.item) {
      this.titleForm = "កែប្រែមន្ត្រីបុគ្គលិក"
      const item = this.data?.item as any;
      const {isAdmin, officerId, first_name, last_name, first_name_en, last_name_en, file, application_country, application_embassy } = item || {};
      if (isAdmin) {
        this.form.controls['officerId'].disable()
      } else {
        this.form.controls['officerId'].enable()
      }
      if (this.data?.item) {
        this.form.patchValue({
          officerId,
          first_name,
          last_name,
          last_name_en,
          first_name_en,
          application_country,
          application_embassy
        })
        this.URL = file?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
      }
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {

      // production key: 'TnxF2zQfNL0tUNDETdrL',
      // test key: 'MFj2namvNi9AuxgJ5XFJ',

      const groupData = {
        key: 'TnxF2zQfNL0tUNDETdrL',
        name: 'ស្ថានទូតក្រៅប្រទេស',
        isAdmin:  false,
      }

      const currentDepartment = {
        key: '7c68RTjX8R28PE22ohB3',
        name: 'ស្ថានទូតក្រៅប្រទេស'
      }

      const workplaceKey = '7c68RTjX8R28PE22ohB3'

      const { last_name_en, first_name, last_name, first_name_en, application_country, application_embassy} = f;
      const item: any = (this.data && this.data.item) || null;
      const officerId = f?.officerId || item?.officerId;
      const { uid, selectedCompany } = this.auth;
      const fullName = `${last_name} ${first_name}`
      const fullNameEn = `${last_name_en} ${first_name_en}`
      const data: any = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([`${officerId}`, ConvertService.toCapitalize(fullName), ConvertService.toCapitalize(fullNameEn)]),
        isDelete: item?.isDelete || false,
        //fields
        officerIdNo: toNumber(`${officerId}`.trim()),
        officerId: officerId,
        first_name: ConvertService.toCapitalize(first_name),
        last_name: ConvertService.toCapitalize(last_name),
        nameKey: toNameKey(officerId),
        last_name_en: ConvertService.toCapitalize(last_name_en),
        first_name_en: ConvertService.toCapitalize(first_name_en),
        displayName: `${ConvertService.toCapitalize(last_name)} ${ConvertService.toCapitalize(first_name)}`,
        file: item?.file ?? null,
        company: selectedCompany ? toCompany(selectedCompany) : null,
        application_country: mapToCountryData(application_country),
        application_embassy: mapToEmbassyData(application_embassy),
        groupData: groupData,
        isEmbassy: true,
        currentDepartment,
        workplaceKey
      }
      if (this.SELECTED_PHOTO) {
        if (data?.file) {
          await this.storage.deleteFile(data.stampFile);
        }
        const file = await this.storage.upload([this.SELECTED_PHOTO])
        data.file = file[0]
      }

      await this.store.saveOverseaOfficer(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Officer has been created successful.`, "Done", { duration: 3000 });
          this.form.reset();
          this.store.workingOffices = []
          this.store.position = []
          this.SELECTED_PHOTO = null;
          this.inputRef.nativeElement.focus();
          if (this.data.req || this.data.item) {
            this.dialogRef.close(data);
          }
        } else {
          alert(res);
        }
      })

    }
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

  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { nameKey } = item;
        if (nameKey !== value) {
          const val = value?.trim()?.toLocaleUpperCase()
          const doc = await this.store.checkOfficeExist(`${val}`, 'nameKey').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const val = value?.trim()?.toLocaleUpperCase()
        const doc = await this.store.checkOfficeExist(`${val}`, "nameKey").get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  async optionSelectedCountry(e){
    this.filterEmbassy = [];
    if(e?.key){
      this.filterEmbassy = await this.gaStore.getEmbassyByCountryKey(e?.key);
      if(!this.filterEmbassy?.length){
        const message = `គ្មានស្ថានទូតកម្ពុជាប្រចាំប្រទេស ${e?.en_short_name} ផ្ដល់សេវាដកព្រឹត្តិបត្រថ្កោលទោស។`
        alert(message)
      }
    }
  }

  displayItemCountry(item: any): string {
    return item ? item?.en_short_name : item;
  }

  displayEmbassy(item: any): string {
    return item ? item?.name : item;
  }
}
