import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT_NOTE_TYPE } from 'src/app/dummy/appinfo';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';

@Component({
  selector: 'app-criminal-setting',
  templateUrl: './criminal-setting.component.html',
  styleUrls: ['./criminal-setting.component.scss']
})
export class CriminalSettingComponent implements OnInit {
  loading: boolean = true;
  form: FormGroup;

  country_khmer: AbstractControl;
  criminal_record_category: AbstractControl;
  criminal_storyboard_office: AbstractControl;
  criminal_decree_noted: AbstractControl;
  criminal_confirm_noted: AbstractControl;
  criminal_record_category_labor: AbstractControl;
  criminal_record_support: AbstractControl;

  filterCategory: any;
  filterCategoryLabor: any;
  filterNationalities: any;
  filterDepartments: any;
  filterDecreeNoted: any;
  filterConfirmNoted: any;
  filterSupport: any;

  document_note = DOCUMENT_NOTE_TYPE

  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private criminal: CriminalStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    const { config } = this.auth;
    this.form = this.fb.group({
      criminal_record_category: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      criminal_record_category_labor: [null, [Validators.required, MappingService.validSelected.bind(this)]],

      country_khmer: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      criminal_storyboard_office: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      criminal_decree_noted: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      criminal_confirm_noted: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      criminal_record_support: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      // retrieve_document_address: [config?.retrieve_document_address || null]
    })
    this.criminal_record_category_labor = this.form.controls['criminal_record_category_labor'];
    this.criminal_record_category = this.form.controls['criminal_record_category'];
    this.country_khmer = this.form.controls['country_khmer'];
    this.criminal_storyboard_office = this.form.controls['criminal_storyboard_office']
    this.criminal_decree_noted = this.form.controls['criminal_decree_noted'];
    this.criminal_record_support = this.form.controls['criminal_record_support'];
    this.criminal_confirm_noted = this.form.controls['criminal_confirm_noted'];

    const documentNoted = await this.criminal.fetchDecreeNoted();
    const decreeNoted = documentNoted.filter(f => f.type?.key === this.document_note?.DECREE?.key);
    const confirmNoted = documentNoted.filter(f => f.type?.key === this.document_note?.CONFIRM?.key);
    const nationalities = await this.criminal.fetchNationality();
    const departments = await this.criminal.fetchDepartments();
    const categories = await this.criminal.fetchCriminalCategory();
    this.filterDepartments = MappingService.autoComplete(this.criminal_storyboard_office, departments, 'name');
    this.filterSupport = MappingService.autoComplete(this.criminal_record_support, departments, 'name');
    this.filterCategory = MappingService.autoComplete(this.criminal_record_category, categories, 'name');
    this.filterCategoryLabor = MappingService.autoComplete(this.criminal_record_category_labor, categories, 'name');

    this.filterNationalities = MappingService.autoComplete(this.country_khmer, nationalities, 'en_nationality');
    this.filterDecreeNoted = MappingService.autoComplete(this.criminal_decree_noted, decreeNoted, 'name');
    this.filterConfirmNoted = MappingService.autoComplete(this.criminal_confirm_noted, confirmNoted, 'name');

    const settingCategoryLabor = categories?.find(m => m?.key === config?.criminal_record_category_labor?.key);
    const settingCountry = nationalities?.find(m => m?.key === config?.country_khmer_key)
    const settingCategory = categories?.find(m => m?.key === config?.criminal_record_category?.key);
    const settingDepartment = departments?.find(m => m?.key === config?.criminal_storyboard_office?.key);
    const settingDecree = decreeNoted?.find(m => m?.key === config?.criminal_decree_noted?.key);
    const supportDoc = departments?.find(m => m?.key === config?.criminal_record_support?.key);
    const settingConfirm = confirmNoted?.find(m => m?.key === config?.criminal_confirm_noted?.key);

    this.form.patchValue({
      country_khmer: settingCountry || null,
      criminal_record_category: settingCategory || null,
      criminal_storyboard_office: settingDepartment || null,
      criminal_decree_noted: settingDecree || null,
      criminal_record_support: supportDoc || null,
      criminal_confirm_noted: settingConfirm || null,
      criminal_record_category_labor: settingCategoryLabor || null,
    })
    this.loading = false;
  }

  async ngOnDestroy(): Promise<void> {

  }

  _onCategorySelected(event: MatAutocompleteSelectedEvent,field:string) {
    const { value } = event?.option;
    const item = {
      key: value?.key,
      direct: value?.direct || false,
      name: value?.name,
      name_en: value?.name_en || null,
    }
    this.criminal.saveSetting(item,field || 'criminal_record_category').then(() => {
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    }).catch(err => {
      alert(err)
    })
  }

  _onDepartmentSelected(event: MatAutocompleteSelectedEvent, field: string) {
    const { value } = event?.option;
    const item = {
      key: value?.key,
      name: value?.name,
    }
    this.criminal.saveSetting(item, field).then(() => {
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    }).catch(err => {
      alert(err)
    })
  }


  _onDecreeSelected(event: MatAutocompleteSelectedEvent) {
    const { value } = event?.option;
    const item = {
      key: value?.key,
      name: value?.name,
      name_en: value?.name_en || null,
      name_fr: value?.name_fr || null,
    }
    this.criminal.saveSetting(item, 'criminal_decree_noted').then(() => {
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    }).catch(err => {
      alert(err)
    })
  }

  _onConfirmNoteSelected(event: MatAutocompleteSelectedEvent) {
    const { value } = event?.option;
    const item = {
      key: value?.key,
      name: value?.name,
    }
    this.criminal.saveSetting(item, 'criminal_confirm_noted').then(() => {
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    }).catch(err => {
      alert(err)
    })
  }

  _onNationalitySelected(event: MatAutocompleteSelectedEvent) {
    const { value } = event?.option;
    const item = {
      key: value?.key,
      nationality: value?.nationality,
    }
    this.criminal.saveSetting(item, 'country_khmer').then(() => {
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    }).catch(err => {
      alert(err)
    })
  }

  displayNameAndNameEn(item: any): string {
    return item ? item?.name || item?.name_en || item?.text : null;
  }

  displayNationality(item: any): string {
    return item ? item?.nationality : null;
  }


}
