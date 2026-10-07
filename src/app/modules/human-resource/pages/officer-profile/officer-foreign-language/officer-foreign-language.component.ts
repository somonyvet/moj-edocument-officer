import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FAMILY_STATUS, GENDER_DATA, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, KHdays, monthOfYear } from 'src/app/dummy/report';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
    selector: 'app-officer-foreign-language',
    templateUrl: './officer-foreign-language.component.html',
    styleUrls: ['./officer-foreign-language.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerForeignLanguageComponent implements OnInit {
  form: UntypedFormGroup;
  params: any;
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

  process : boolean = false;
  ITEM: any = null;

  @ViewChild('praiseFile') praiseFile: ElementRef;
  @ViewChild('penaltyFile') penaltyFile: ElementRef;
  constructor(
    private fb: UntypedFormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public store: OfficerStore,
  ) { }

  async ngOnInit() {
    this.form = this.fb.group({
      foreignLanguageLevel: [null, [Validators.required]],
    })
    const { registrationFormDoc } = this.store;
    this.ITEM = registrationFormDoc;
    if(registrationFormDoc && registrationFormDoc.foreignLanguageLevel){
      this.form.patchValue({
        foreignLanguageLevel:registrationFormDoc.foreignLanguageLevel
      })
    }
  }

  _onSave(f: any) {
    if(this.form.valid){
      this.process = true;
      const { foreignLanguageLevel } = this.form.value;
      const { registrationFormDoc } = this.store;
      const data = {
        key: registrationFormDoc.key,
        foreignLanguageLevel: foreignLanguageLevel,
      }
      this.store.saveRegistrationForm(data, (success, res) => {
        this.process = false;
        if (success) {
          this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });        } else {
          alert(res);
        }
      })
    }

  }


}
