import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, monthOfYear } from 'src/app/dummy/report';
import { IObjectCommendation, IObjectGeneralEducation } from 'src/app/interfaces/user';
import { pushToArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
    selector: 'app-officer-education-level',
    templateUrl: './officer-education-level.component.html',
    styleUrls: ['./officer-education-level.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerEducationLevelComponent implements OnInit {

  form: UntypedFormGroup;
  params: any;
  GENDER_KH = GENDER_DATA;
  FAMILY_STATUS = FAMILY_STATUS;
  STATUS_OBJ = STATUS_OBJ;


  DAYS = days;
  KHDAYS = KHdays;
  MONTHS = monthOfYear

  selectedPraiseFileArray = [];
  praiseFileArrayDB = [];
  selectedPenaltyFileArray = [];
  commendationData = []

  listDisplayFile: any[] = []
  deleteFiles: any[] = [];
  ITEM: any;
  process: boolean = false;

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
      latestGeneralEducation:[null],
      praiseHistory: new UntypedFormArray([]),
    })

    const { registrationFormDoc } = this.store;
    this.ITEM = registrationFormDoc;
    const { generalEducation, latestGeneralEducation } = registrationFormDoc || {};
    if(latestGeneralEducation){
      this.form.patchValue({
        latestGeneralEducation:latestGeneralEducation
      })
    }
    if (generalEducation && generalEducation.length > 0) {
      this.commendationData = generalEducation;
      generalEducation.forEach(m => {
        this.addFormArrayWithFields('praiseHistory', [{ field: 'skill', value: m?.skill },{ field: 'certificate', value: m?.certificate }, { field: 'date', value: m?.date ? m?.date : null }, { field: 'files', value: m?.files }])
      })
    } else {
      this.addFormArrayWithFields('praiseHistory', [{ field: 'skill', value:null },{ field: 'certificate', value:null }, { field: 'date', value:null }, { field: 'files', value:null }])
    }
  }


  removePraiseFileDB(index, i, file) {
    const listFile = this.commendationData[index].files;
    this.commendationData[index].files = (listFile || []).filter((_, ind) => ind !== i);
    this._onSave().then(() => {
      this.storage.deleteFile(file)
    });
  }

  // selectedPraiseFile(event, index) {
  //   const files = event.target.files;
  //   const listFile = this.selectedPraiseFileArray[index];
  //   this.selectedPraiseFileArray[index] = (listFile || []).concat(Object.values(files))
  //   this.praiseFile.nativeElement.value = "";
  // }

  selectedPraiseFile(event,index) {
    const formArr = this.form.get('praiseHistory') as UntypedFormArray;
    if (event && event.target.files.length > 0) {

      const files = event.target.files;
      const listFile = this.selectedPraiseFileArray[index];
      this.selectedPraiseFileArray[index] = (listFile || []).concat(Object.values(files))
      const file=event.target.files[0];
      const { type } = file;
      switch (type) {
        case 'application/pdf':
          const listFile1 = this.listDisplayFile[index];
          this.listDisplayFile[index] = (listFile1 || []).concat([PHOTO_LIB.PDF])
          formArr.controls[index].patchValue({ files: this.listDisplayFile[index] })
          break;
        default:
          Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (event) => {
              const listFile1 = this.listDisplayFile[index];
              this.listDisplayFile[index] = (listFile1 || [] ).concat(event.target.result)
              formArr.controls[index].patchValue({files: this.listDisplayFile[index]})
            }
           });
          break;
      }

      this.praiseFile.nativeElement.value = "";
    }
  }


  removePraiseFile(index, i) {
    const formArr = this.form.get('praiseHistory') as UntypedFormArray;

    const listFile = this.selectedPraiseFileArray[index];
    const listFile1 = this.listDisplayFile[index];
    this.selectedPraiseFileArray[index] = (listFile || []).filter((_, ind) => ind !== i);
    this.listDisplayFile[index] = (listFile1 || []).filter((_, ind) => ind !== i);
    formArr.controls[index].patchValue({files: this.selectedPraiseFileArray[index]})
  }

  compareObjects(o1: any, o2: any): boolean {
    if (o2) return o1.key === o2.key;
  }

  //multiform
  removeFormArrayWithField(name: string, index?: number) {
    const formArray = this.form.get(name) as UntypedFormArray;
    if (formArray?.controls?.length === 1) return;
    formArray.removeAt(formArray?.controls?.length - 1);
    if (name === 'praiseHistory') {
      this.selectedPraiseFileArray[index] = null
      this.listDisplayFile[index] = null
    }
    const item = this.commendationData[index]
    // this._onSave().then(() => {
    //   if (item && item.files.length > 0) {
    //     this.storage.delete(item.files)
    //   }
    // });
    this.deleteFiles = this.deleteFiles.concat(item?.files||[]);
    this.commendationData.splice(index, 1);
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
    if(this.form.valid){
      this.process = true;
      const { praiseHistory, latestGeneralEducation } = this.form.value;
      const { registrationFormDoc } = this.store;
      let praiseHistoryData = [];
      for await (const [index, form] of (praiseHistory || []).entries()) {
        const { date, certificate, skill } = form;
        const oldData = this.commendationData ? this.commendationData[index] : null;
        const files = this.selectedPraiseFileArray[index];
        let data: IObjectGeneralEducation = {
          date: date,
          certificate: certificate,
          skill: skill,
          files: oldData?.files || []
        }
        if (files && files.length > 0) {
          const photoFiles = await this.storage.upload(files);
          data.files = data.files.concat(photoFiles);
        }
        praiseHistoryData.push(data);
      }

      if(this.deleteFiles?.length>0){
        this.storage.delete(this.deleteFiles)
        this.deleteFiles = [];
      }

      const data = {
        key: registrationFormDoc.key,
        latestGeneralEducation:latestGeneralEducation,
        generalEducation: praiseHistoryData || [],
      }
      this.store.saveRegistrationForm(data, (success, res) => {
        this.process = false;
        if (success) {
          this.selectedPraiseFileArray = []
          this.listDisplayFile = [];
          this.commendationData = praiseHistoryData;
          this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        } else {
          alert(res);
        }
      })
    }
  }

  onSelectedDate(event,index){
    const form = this.form.get('praiseHistory') as UntypedFormArray;
    form.at(index).get('date').patchValue(event)
  }
}
