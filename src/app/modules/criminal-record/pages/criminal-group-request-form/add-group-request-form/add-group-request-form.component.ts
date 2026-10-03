import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { ConvertService, orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { addDays, formatFormDate, generateKeywords, getCriminalNo, MappingService, toKhDate, toYearKey, workingDay, workingDayMinus } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { PositionStore } from 'src/app/stores/document/position.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { DOCUMENT_FLOW_CATEGORY } from '../../../dummy/criminal.dummy';

@Component({
  selector: 'app-add-group-request-form',
  templateUrl: './add-group-request-form.component.html',
  styleUrls: ['./add-group-request-form.component.scss']
})
export class AddGroupRequestFormComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតបញ្ជីលេខរៀង";
  form: FormGroup;
  criminal_letters: AbstractControl

  hashtagItems: string[] = [];
  form2: FormGroup;

  folder_group_items: any[] = [];
  // folder_items: any[] = [];

  URGENT_OBJ_ARRAY = URGENT_OBJ_ARRAY
  filteredFolderOptions: Observable<any[]>;

  searchString: string = '';
  statusKey: string = '';
  isEmptyResult: boolean = false;
  focusSearch: boolean = false;

  selectedItems: any = [];
  date: any;
  holidays: any = [];
  loading: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<AddGroupRequestFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: PositionStore,
    private ds: DataService,
    public storage: FireStorageService,
    public criminalApplicationStore: CriminalApplicationStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public pa: PositionStore,
  ) { }

  async ngOnInit() {
    this.form = this.fb.group({
      release_date: [null, [Validators.required]],
      period_process_document: [URGENT_OBJ_ARRAY[0], [Validators.required]],
      is_category_labor: [null],
      is_urgent: [null],
      remark: [null],
      folder_classify: [null, [Validators.required]]
    })
    this.form2 = this.fb.group({
      application: [null],
      criminal_letters: [null],
    })
    this.criminal_letters = this.form2.controls['criminal_letters'];

    const { item } = this.data;

    this.store.criminal_folder = item || null;
    this.store.criminal_folder_items = [];
    await this.auth.getServerTime();
    const { serverDateTime } = this.auth;
    if (item) {
      this.title = "កែប្រែបញ្ជីលេខរៀង"
      const { release_date, period_process_document, is_urgent, is_category_labor } = item;
      this.form.patchValue({
        release_date: release_date?.toDate(),
        period_process_document: URGENT_OBJ_ARRAY?.find(m => m?.key === period_process_document?.key),
        is_category_labor: is_category_labor,
        is_urgent: is_urgent,
        folder_classify: true,
      })
      this.criminalApplicationStore?.fetchCriminalFolder(item?.key)
      if (release_date) {
        this.folder_group_items = await (await this.store.fetchCriminalCanClassifyByDate(formatFormDate(release_date))).gItems
        console.log("this.folder_group_items",this.folder_group_items)
      }
    }
    await this.criminalApplicationStore?.getCriminalUnClassify()
    console.log()
    this.holidays = await this.criminalApplicationStore?.fetchHoliday(toYearKey(serverDateTime))
    if(serverDateTime.getMonth() == 11){
      const nextYearHoliday = await this.criminalApplicationStore?.fetchHoliday(toYearKey(serverDateTime)+1)
      this.holidays = this.holidays?.concat(nextYearHoliday?.length ? nextYearHoliday : [])
    }
    const release_date = this.calculateWithdrawDate(item?.period_process_document?.key || this.form?.value?.period_process_document?.key || 20)
    this.form.patchValue({
      release_date: release_date,
    })
    this.date = toKhDate(this.form.value?.release_date)
    this.loading = false
  }

  ngOnDestroy() {
    this.criminalApplicationStore?.fetchCriminalFolderRef?.unsubscribe()
    this.criminalApplicationStore.criminalFolderItems = [];
    Promise.resolve()
  }

  selectionChangeCriminal(event: MatSelectionListChange) {
    const { value, selected } = event.option
    if (selected) {
      this.store.addCriminalToFolder(value, this.data.item, this.criminalApplicationStore?.getMappedProfile()).then(() => {
        this.snackBar.open(`ព្រឹត្តិបត្រថ្កោលទោសត្រូវបានរក្សាទុកដោយជោគជ័យក្នុងបញ្ជីលេខរៀង`, "ជោគជ័យ", { duration: 3000 });
        this.folder_group_items = this.folder_group_items?.filter(m => m?.key !== value?.key)
      }).catch(err => {
        alert(err)
      })
    } else {
      this.store.removeCriminalFromFolder(value, this.data.item, this.criminalApplicationStore?.getMappedProfile()).then(() => {
        this.snackBar.open(`ព្រឹត្តិបត្រថ្កោលទោសត្រូវបានដកចេញដោយជោគជ័យពីបញ្ជីលេខរៀង`, "ជោគជ័យ", { duration: 3000 });
      }).catch(err => {
        alert(err)
      })
    }
  }

  onChangedCheckBox(event: MatCheckboxChange, field: string) {
    const { checked } = event;
    if (checked) {
      switch (field) {
        case 'is_category_labor':
          this.form.patchValue({
            is_urgent: false,
          })
          break;
        default:
          this.form.patchValue({
            is_category_labor: false,
          })
          break;
      }
    }
  }

  changePeriod(event: MatRadioChange) {
    const release_date = this.calculateWithdrawDate(event?.value?.key)
    // addDays(serverDateTime, event?.value?.key);
    this.form.patchValue({
      release_date: release_date,
    })
    this.date = toKhDate(this.form.value?.release_date)
  }

  dateChange(event) {
    const { value } = event;
    this.date = toKhDate(value)
  }

  async onDateChange(event) {
    const { release_date } = this.form.value
    this.folder_group_items = await (await this.store.fetchCriminalCanClassifyByDate(formatFormDate(release_date))).gItems
  }

  displayFolderNo(item: any): string {
    return item ? item?.criminal_folder_no : null;
  }

  _onFolderSelected(event: MatAutocompleteSelectedEvent) {
    const { value } = event?.option;
    const tag = value?.criminal_folder_no || null
    if (!tag) return
    const find = this.hashtagItems.find(m => m === `${tag}`)
    if (!find) {
      this.hashtagItems.push(`${tag}`)
      this.folder_group_items = this.folder_group_items.filter(m => m.criminal_folder_no !== tag.criminal_folder_no)
      this.form.controls['criminal_letters']?.reset()
      this.filteredFolderOptions = MappingService.autoComplete(this.criminal_letters, this.folder_group_items, 'criminal_folder_no')

      // this.form.controls['name']?.reset()
      // this.form.patchValue({
      //   items: this.hashtagItems?.length > 0 ? this.hashtagItems?.toString() : null,
      // })
    }

  }


  removeTag(tag: any) {
    this.hashtagItems = this.hashtagItems.filter(m => m !== `${tag}`)
    this.form.patchValue({
      items: this.hashtagItems?.length > 0 ? this.hashtagItems?.toString() : null,
    })
  }

  removeCriminal(criminal: any) {
    // this.folder_items = this.folder_items?.filter(m => m?.key !== criminal?.key);
    // const peopleKeys = toUniq(toFlatten(this.folder_items?.map(m => m?.request_approval_workplace)))
    // if (this.data.item) {
    //   this.data.item.peopleKeys = peopleKeys || [];
    //   this.store.removeCriminalToFolder(peopleKeys, criminal, this.data.item, this.criminalApplicationStore?.getMappedProfile()).then(() => {
    //     this.snackBar.open(`Group has been saved successful.`, "Done", { duration: 3000 });
    //   }).catch(err => {
    //     alert(err)
    //   })
    // }
  }

  addTag(name: number) {
    const tag = getCriminalNo(name)
    const find = this.hashtagItems.find(m => m === `${tag}`)
    if (!find) {
      this.hashtagItems.push(`${tag}`)
      this.form.controls['name']?.reset()
      this.form.patchValue({
        items: this.hashtagItems?.length > 0 ? this.hashtagItems?.toString() : null,
      })
    }
  }


  process: boolean = false;
  async _onSave(f: any, stepper) {
    this.form.disable();
    this.process = true;
    const { release_date, period_process_document,
      is_category_labor,
      is_urgent,
      remark,
    } = f;
    const { config } = this.auth;
    const item: any = (this.data && this.data.item) || null;
    const workplaceData = (await this.criminalApplicationStore?.fetchProcessApproval(DOCUMENT_FLOW_CATEGORY.normal))?.filter(m => m?.flowNo !== 1);
    const isUrgent = is_urgent || false;
    const workplaces = orderBy(((is_category_labor || isUrgent) ? workplaceData.filter(m => !m?.canSkipByCategory) : workplaceData)?.map(m => ({
      key: m.key,
      department: m?.department,
      canSkipByCategory: m?.canSkipByCategory,
      flowNo: m?.flowNo
    })), 'flowNo')

    // const created_at_update = addDays(formatFormDate(release_date), period_process_document?.key * -1);
    await this.auth.getServerTime();
    const { serverDateTime } = this.auth;
    const holidays = await this.criminalApplicationStore?.fetchHoliday(toYearKey(serverDateTime))
    if(serverDateTime.getMonth() == 11){
      const nextYearHoliday = await this.criminalApplicationStore?.fetchHoliday(toYearKey(serverDateTime)+1)
      this.holidays = this.holidays?.concat(nextYearHoliday?.length ? nextYearHoliday : [])
    }
    const created_at_update = workingDayMinus(holidays, formatFormDate(release_date), period_process_document?.key)

    const notifyWorkplace = workplaces[0];
    const category_folder = is_category_labor ? config.criminal_record_category_labor : config.criminal_record_category;
    const data: any = {
      key: item?.key || this.ds.createId(),
      status: item?.status || STATUS_OBJ.PROCESSING,
      created_at: item?.created_at || this.ds.serverTimestamp(),
      created_by: item?.created_by || this.criminalApplicationStore?.getMappedProfile(),
      updated_by: this.criminalApplicationStore?.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
      date_key: item?.date_key || ConvertService.dateKey(),
      page_key: item?.page_key || ConvertService.pageKey(),
      keyword: generateKeywords([this.hashtagItems?.toString()]),
      isDelete: item?.isDelete || false,
      //fields
      release_date: release_date,
      release_date_key: ConvertService.toDateKey(release_date),
      period_process_document: period_process_document,
      is_category_labor: is_category_labor || false,
      is_urgent: is_urgent || false,
      category_folder: category_folder,

      request_approval_workplace: [notifyWorkplace?.department?.key],
      workplaceKeys: workplaces?.map(m => m?.department?.key),
      workplaces: workplaces,
      remark: remark,
      folder_date : created_at_update,
    }

    this.store.saveGroup(data, async (success, res) => {
      data.created_at = new Date();
      data.updated_at = new Date();
      this.store.criminal_folder = data;
      this.data.item = data;
      if (success) {
        this.snackBar.open(`បញ្ជីលេខរៀងត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.form.patchValue({
          folder_classify: data,
        })
        this.criminalApplicationStore?.fetchCriminalFolder(data?.key)
        this.form.enable();
        stepper?.next()
      } else {
        alert(res);
      }
      this.process = false;
    })
  }

  onSelectItemSearch(item: any) {
    if (this.data.item) {
      this.store.addCriminalToFolder(item, this.data.item, this.criminalApplicationStore?.getMappedProfile()).then(() => {
        this.store.searchResult = this.store?.searchResult.filter(m => m?.key !== item?.key)
        this.snackBar.open(`ព្រឹត្តិបត្រថ្កោលទោសត្រូវបានរក្សាទុកដោយជោគជ័យក្នុងបញ្ជីលេខរៀង`, "ជោគជ័យ", { duration: 3000 });
      }).catch(err => {
        alert(err)
      })
    }
  }

  onSelectAdd(item,folder){
    if (this.data.item && item) {
      if(!folder) return
      if(folder===12){
        this.criminalApplicationStore.unClassify12 = this.criminalApplicationStore?.unClassify12.filter(f=> f.key !== item?.key)
      }else if(folder===20){
        this.criminalApplicationStore.unClassify20 = this.criminalApplicationStore?.unClassify20.filter(f=> f.key !== item?.key)
      }
      this.store.addCriminalToFolder(item, this.data.item, this.criminalApplicationStore?.getMappedProfile()).then(() => {
        this.store.searchResult = this.store?.searchResult.filter(m => m?.key !== item?.key)
        this.snackBar.open(`ព្រឹត្តិបត្រថ្កោលទោសត្រូវបានរក្សាទុកដោយជោគជ័យក្នុងបញ្ជីលេខរៀង`, "ជោគជ័យ", { duration: 3000 });
      }).catch(err => {
        alert(err)
      })
    }
  }

  onSearch(string) {
    this.searchString = string;
    if (string) {
      this.store.searchCriminalForClassify(string)
    }
  }

  onRemoveSelectedSearch(item) {
    this.criminalApplicationStore.criminalFolderItems = this.criminalApplicationStore?.criminalFolderItems?.filter(f => f.key !== item.key)
    this.pa.removeCriminalFromFolder(item, this.criminalApplicationStore?.selectedGroupDoc, this.criminalApplicationStore?.getMappedProfile()).then(() => {

    }).catch(err => {
      alert(err)
    })
  }

  calculateWithdrawDate(val?){
    const { serverDateTime } = this.auth;
    return workingDay(this.holidays, serverDateTime, val || 20)
  }

}
