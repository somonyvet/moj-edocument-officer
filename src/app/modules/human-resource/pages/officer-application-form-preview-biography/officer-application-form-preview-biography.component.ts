import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { GENDER_DATA, FAMILY_STATUS, STATUS_OBJ, STATUS_LIVES_ARRAY } from 'src/app/dummy/appinfo';
import { days, KHdays, monthOfYear } from 'src/app/dummy/report';
import { DataService } from 'src/app/shared/services/data.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { HrStore } from '../../stores/hr.store';
import { HumanResourceApprovalComponent } from '../human-resource-approval/human-resource-approval.component';

@Component({
    selector: 'app-officer-application-form-preview-biography',
    templateUrl: './officer-application-form-preview-biography.component.html',
    styleUrls: ['./officer-application-form-preview-biography.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerApplicationFormPreviewBiographyComponent implements OnInit {

  form: UntypedFormGroup;
  params: any;
  parentParams: any;
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

  @ViewChild('praiseFile') praiseFile: ElementRef;
  @ViewChild('penaltyFile') penaltyFile: ElementRef;
  generalEducationArray = [];
  trainingLevelArray = [];

  positionHistoryArray = [];
  rankHistoryArray = [];
  commendationDataArray = []
  punishmentArray = [];
  childrenInfoArray = [];
  occupationHistoryArray = [];
  STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY;

  profileUrl: string = null

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    private route: ActivatedRoute,
    public store: HrStore,
    private dialog: MatDialog,
    private ps: PrintService,
  ) { }

  async ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.params = params;
      let docKey = params?.docKey;
      if (params?.docKey === 'officer') {
        docKey = this.auth?.uid
      }
      this.store.fetchSelectedOfficer(docKey, doc => {

        this.profileUrl = this.store.selectedOfficer?.photo?.downloadUrl || this.store.selectedOfficer?.file?.downloadUrl
        const { trainingLevel, commendation, punishment, childrenInfo, occupationHistory } = this.store?.selectedOfficer as any;
        this.trainingLevelArray = trainingLevel || [];
        const c = 6 - this.trainingLevelArray.length;
        if (this.trainingLevelArray.length <= 6) {
          for (let i = 0; i < c; i++) {
            this.trainingLevelArray.push({
              name: null,
              specialization: null,
              education: null,
              date: null,
              skill: null,
              location: null,
              duration: null,
            })
          }
        } else {
          this.trainingLevelArray = trainingLevel || [];
        }
        this.commendationDataArray = commendation || [];
        const f = 9 - this.commendationDataArray.length;
        if (this.commendationDataArray.length <= 9) {
          for (let i = 0; i < f; i++) {
            this.commendationDataArray.push({
              name: null,
              specialization: null,
              education: null,
              date: null,
              skill: null,
              location: null,
              duration: null,
              rank: null,
            })
          }
        } else {
          this.commendationDataArray = commendation || [];
        }
        this.punishmentArray = punishment || [];
        const g = 4 - this.punishmentArray.length;
        if (this.punishmentArray.length <= 4) {
          for (let i = 0; i < g; i++) {
            this.punishmentArray.push({
              specialization: null,
              education: null,
              date: null,
              skill: null,
              location: null,
              duration: null,
              rank: null,
              reason: null,
            })
          }
        } else {
          this.punishmentArray = punishment || [];
        }
        this.childrenInfoArray = childrenInfo || [];
        const h = 10 - this.childrenInfoArray.length;
        if (this.childrenInfoArray.length <= 10) {
          for (let i = 0; i < h; i++) {
            this.childrenInfoArray.push({
              dob: null,
              occupation: null,
              name: null,
              gender: null,
            })
          }
        } else {
          this.childrenInfoArray = childrenInfo || [];
        }
        this.occupationHistoryArray = occupationHistory || [];
        const j = 10 - this.occupationHistoryArray.length;
        if (this.occupationHistoryArray.length <= 10) {
          for (let i = 0; i < j; i++) {
            this.occupationHistoryArray.push({
              fromDate: null,
              toDate: null,
              name: null,
              unit: null,
            })
          }
        } else {
          this.occupationHistoryArray = occupationHistory || [];
        }
      })
    })
  }

  _onApproval() {
    this.dialog.open(HumanResourceApprovalComponent, {
      data: { item: this.store?.selectedOfficer },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '600px',
      disableClose: true,
    })
  }
}
