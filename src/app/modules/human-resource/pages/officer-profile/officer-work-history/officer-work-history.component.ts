import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, monthOfYear } from 'src/app/dummy/report';
import { IObjectRankAndPosition } from 'src/app/interfaces/user';
import { pushToArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
    selector: 'app-officer-work-history',
    templateUrl: './officer-work-history.component.html',
    styleUrls: ['./officer-work-history.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerWorkHistoryComponent implements OnInit {

  form: UntypedFormGroup;
  params: any;
  GENDER_KH = GENDER_DATA;
  FAMILY_STATUS = FAMILY_STATUS;
  STATUS_OBJ = STATUS_OBJ;

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

  selectedRankFileArray = [];
  selectedPositionFileArray = [];
  rankHistoryData = [];
  positionHistoryData = [];
  occupationHistoryData = [];

  process: boolean = false;
  ITEM = null;
  listDisplayFile1: any[] = [];
  listDisplayFile2: any[] = [];

  deleteFiles: any[] = [];

  positionList = [];
  titleList = [];

  dateOfEntryStateWorkInvalid : boolean = false;

  @ViewChild('praiseFile') praiseFile: ElementRef;
  @ViewChild('penaltyFile') penaltyFile: ElementRef;
  constructor(
    private fb: UntypedFormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public store: OfficerStore,
    public storage: FireStorageService,

  ) { }

  async ngOnInit() {

    this.form = this.fb.group({
      unit: [null],
      dateOfEntryStateWork: [null],
      rankHistory: new UntypedFormArray([]),
      positionHistory: new UntypedFormArray([]),

      occupationHistory: new UntypedFormArray([]),
    })
    const { registrationFormDoc } = this.store;
    const { rankHistory, positionHistory, unit, dateOfEntryStateWork, occupationHistory } = registrationFormDoc || {};
    if (registrationFormDoc) {
      this.ITEM = registrationFormDoc;
      this.form.patchValue({
        unit: unit || null,
        dateOfEntryStateWork: dateOfEntryStateWork ? dateOfEntryStateWork : null
      })
    }



    if (occupationHistory && occupationHistory.length > 0) {
      this.occupationHistoryData = occupationHistory;
      occupationHistory.forEach(m => {
        this.addFormArrayWithFields('occupationHistory', [{ field: 'fromDate', value: m.fromDate ? m.fromDate : null }, { field: 'toDate', value: m.toDate ? m.toDate : null }, { field: 'name', value: m.name }, { field: 'unit', value: m.unit }])
      })
    } else {
      this.addFormArrayWithFields('occupationHistory', [{ field: 'fromDate', value: null }, { field: 'toDate', value: null }, { field: 'name', value: null }, { field: 'unit', value: null }])
    }

    if (rankHistory && rankHistory.length > 0) {
      this.rankHistoryData = rankHistory;
      rankHistory.forEach(m => {
        this.addFormArrayWithFields('rankHistory', [{ field: 'numDoc', value: m.numDoc }, { field: 'name', value: m.name }, { field: 'order', value: m.order }, { field: 'date', value: m.date ? m.date : null }, { field: 'files', value: m.files }])
      })
    } else {
      this.addFormArrayWithFields('rankHistory', [{ field: 'numDoc', value: null }, { field: 'name', value: null }, { field: 'order', value: null }, { field: 'date', value: null }, { field: 'files', value: null }])
    }

    if (positionHistory && positionHistory.length > 0) {
      this.positionHistoryData = positionHistory;
      positionHistory.forEach(m => {
        this.addFormArrayWithFields('positionHistory', [{ field: 'numDoc', value: m.numDoc }, { field: 'name', value: m.name }, { field: 'order', value: m.order }, { field: 'date', value: m.date ? m.date : null }, { field: 'files', value: m.files }])
      })
    } else {
      this.addFormArrayWithFields('positionHistory', [{ field: 'numDoc', value: null }, { field: 'name', value: null }, { field: 'order', value: null }, { field: 'date', value: null }, { field: 'files', value: null }])
    }


    const positionData = await this.store.fetchList(this.ds.dbRef().collection("positions", ref => ref.orderBy("order", "asc")));
    this.positionList = positionData;
    const titleData = await this.store.fetchList(this.ds.dbRef().collection("ranking", ref => ref.orderBy("order", "asc")));
    this.titleList = titleData;

  }

  removeRankFileDB(index, i, file) {
    const listFile = this.rankHistoryData[index].files;
    this.rankHistoryData[index].files = (listFile || []).filter((_, ind) => ind !== i);
    // this._onSave().then(() => {
    //   this.storage.deleteFile(file)
    // });
    this.deleteFiles.push(file)
  }

  removeRankFile(index, i) {
    const listFile = this.selectedRankFileArray[index];
    this.selectedRankFileArray[index] = (listFile || []).filter((_, ind) => ind !== i);

    const listFile2 = this.listDisplayFile1[index];
    this.listDisplayFile2[index] = (listFile2 || []).filter((_, ind) => ind !== i);
  }


  selectedRankFile(event, index) {
    const formArr = this.form.get('rankHistory') as UntypedFormArray;
    if (event && event.target.files.length > 0) {
      const files = event.target.files;
      const listFile = this.selectedRankFileArray[index];
      this.selectedRankFileArray[index] = (listFile || []).concat(Object.values(files))
      const file = event.target.files[0];
      const { type } = file;
      switch (type) {
        case 'application/pdf':
          const listFile1 = this.listDisplayFile2[index];
          this.listDisplayFile2[index] = (listFile1 || []).concat([PHOTO_LIB.PDF])
          formArr.controls[index].patchValue({ files: this.listDisplayFile2[index] })
          break;
        default:
          Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (event) => {
              const listFile1 = this.listDisplayFile2[index];
              this.listDisplayFile2[index] = (listFile1 || []).concat(event.target.result)
              formArr.controls[index].patchValue({ files: this.listDisplayFile2[index] })
            }
          });
          break;
      }

      this.praiseFile.nativeElement.value = "";
    }
  }


  removePositionFileDB(index, i, file) {
    const listFile = this.positionHistoryData[index].files;
    this.positionHistoryData[index].files = (listFile || []).filter((_, ind) => ind !== i);
    // this._onSave().then(() => {
    //   this.storage.deleteFile(file)
    // });
    this.deleteFiles.push(file)
  }

  removePositionFile(index, i) {
    const listFile = this.selectedPositionFileArray[index];
    this.selectedPositionFileArray[index] = (listFile || []).filter((_, ind) => ind !== i);
    // this._onSave().then(() => {});

    const listFile1 = this.listDisplayFile1[index];
    this.listDisplayFile1[index] = (listFile1 || []).filter((_, ind) => ind !== i);
  }


  selectedPositionFile(event, index) {
    const formArr = this.form.get('positionHistory') as UntypedFormArray;
    if (event && event.target.files.length > 0) {
      const files = event.target.files;
      const listFile = this.selectedPositionFileArray[index];
      this.selectedPositionFileArray[index] = (listFile || []).concat(Object.values(files))
      const file = event.target.files[0];
      const { type } = file;
      switch (type) {
        case 'application/pdf':
          const listFile1 = this.listDisplayFile1[index];
          this.listDisplayFile1[index] = (listFile1 || []).concat([PHOTO_LIB.PDF])
          formArr.controls[index].patchValue({ files: this.listDisplayFile1[index] })
          break;
        default:
          Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (event) => {
              const listFile1 = this.listDisplayFile1[index];
              this.listDisplayFile1[index] = (listFile1 || []).concat(event.target.result)
              formArr.controls[index].patchValue({ files: this.listDisplayFile1[index] })
            }
          });
          break;
      }

      this.praiseFile.nativeElement.value = "";
    }
  }



  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
  }

  //multiform
  removeFormArrayWithField(name: string, index?: number) {
    const formArray = this.form.get(name) as UntypedFormArray;
    if (formArray?.controls?.length === 1) return;
    formArray.removeAt(formArray?.controls?.length - 1);

    if (name === 'rankHistory') {
      this.selectedRankFileArray[index] = null;
      const item = this.rankHistoryData[index]
      // this._onSave().then(() => {
      //   if (item && item.files.length > 0) {
      //     this.storage.delete(item.files)
      //   }
      // });
      this.deleteFiles.concat(item?.files || [])
      this.rankHistoryData.splice(index, 1);
    }
    if (name === 'positionHistory') {
      this.selectedPositionFileArray[index] = null;
      const item = this.positionHistoryData[index]
      // this._onSave().then(() => {
      //   if (item && item.files.length > 0) {
      //     this.storage.delete(item.files)
      //   }
      // });
      this.deleteFiles.concat(item?.files || [])
      this.positionHistoryData.splice(index, 1);
    }

  }

  addFormArrayWithFields(name: string, fields: any[], index?: number) {
    const formArray = this.form?.get(name) as UntypedFormArray;
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


  async _onSave() {
    this.process = true;
    const { rankHistory, positionHistory, unit, dateOfEntryStateWork, occupationHistory } = this.form.getRawValue();
    const { registrationFormDoc } = this.store;

    let rankHistoryData = [];
    for await (const [index, form] of (rankHistory || []).entries()) {
      const { date, numDoc, name, order } = form;
      const oldData = this.rankHistoryData ? this.rankHistoryData[index] : null;
      const files = this.selectedRankFileArray[index];
      let data: IObjectRankAndPosition = {
        date: date,
        order: order,
        name: name,
        numDoc: numDoc,
        files: oldData?.files || []
      }
      if (files && files.length > 0) {
        const photoFiles = await this.storage.upload(files);
        data.files = data.files.concat(photoFiles);
      }
      rankHistoryData.push(data);
    }

    let positionHistoryData = [];
    for await (const [index, form] of (positionHistory || []).entries()) {
      const { date, numDoc, name, order } = form;
      const oldData = this.positionHistoryData ? this.positionHistoryData[index] : null;
      const files = this.selectedPositionFileArray[index];
      let data: IObjectRankAndPosition = {
        date: date,
        order: order,
        name: name,
        numDoc: numDoc,
        files: oldData?.files || []
      }
      if (files && files.length > 0) {
        const photoFiles = await this.storage.upload(files);
        data.files = data.files.concat(photoFiles);
      }
      positionHistoryData.push(data);
    }


    if (this.deleteFiles?.length > 0) {
      this.storage.delete(this.deleteFiles)
      this.deleteFiles = [];
    }



    const data = {
      key: registrationFormDoc.key,
      unit: unit || null,
      dateOfEntryStateWork: dateOfEntryStateWork || null,
      rankHistory: rankHistoryData,
      positionHistory: positionHistoryData,
      occupationHistory: occupationHistory,
    }
    this.store.saveRegistrationForm(data, (success, res) => {
      this.process = false;
      if (success) {
        this.listDisplayFile1 = []
        this.listDisplayFile2 = []
        this.selectedRankFileArray = [];
        this.rankHistoryData = rankHistoryData;

        this.selectedPositionFileArray = [];
        this.positionHistoryData = positionHistoryData;

        this.snackBar.open(`ព័ត៌មានត្រូវបានរក្សាទុកដោយជោគជ័យ។`, "យល់ព្រម", { duration: 3000 });
      } else {
        alert(res);
      }
    })

  }

  onSelectedDateOfEntryStateWork(event){
    this.form.get('dateOfEntryStateWork').patchValue(event);
    if(event?.day && event?.month && event?.year)
      this.dateOfEntryStateWorkInvalid = !this.checkValidDate(event?.day?.key,event?.month?.key,event?.year?.key)
    else
      this.dateOfEntryStateWorkInvalid = false;
  }

  onSelectedDateFrom(event,index){
    const form = this.form.get('occupationHistory') as UntypedFormArray;
    form.at(index).get('fromDate').patchValue(event)
  }

  onSelectedDateTo(event,index){
    const form = this.form.get('occupationHistory') as UntypedFormArray;
    form.at(index).get('toDate').patchValue(event)
  }

  onSelectedPosDate(event,index){
    const form = this.form.get('positionHistory') as UntypedFormArray;
    form.at(index).get('date').patchValue(event)
  }

  onSelectedRankDate(event,index){
    const form = this.form.get('rankHistory') as UntypedFormArray;
    form.at(index).get('date').patchValue(event)
  }

  checkValidDate(day,month,year){
    const date = moment(`${year}-${month}-${day}`);
    return date.isValid()
  }
}
