import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tabs } from 'src/app/dummy/tabs';
import { IDepartment, IPosition, IRanking } from 'src/app/interfaces/document/document.interface';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MappingService, toDepartment, toRanking } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { SettingsStore } from 'src/app/stores/document/settings.store';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  tabs = tabs.settings
  form: FormGroup;

  generalDepartmentLevel: AbstractControl;
  filterGeneralDepartmentLevel: Observable<IRanking[]>;
  departmentLevel: AbstractControl;
  filterDepartmentLevel: Observable<IRanking[]>;

  assistantGeneralPosition: AbstractControl;
  filterAssistantGeneralPosition: Observable<IRanking[]>;
  assistantDepartmentPosition: AbstractControl;
  filterAssistantDepartmentPosition: Observable<IRanking[]>;

  headOfficerPosition: AbstractControl;
  filterHeadOfficerPosition: Observable<IPosition[]>;

  secretaryOfStatePosition: AbstractControl;
  filterSecretaryOfStatePosition: Observable<IPosition[]>;
  secretaryOfStateAssistantPosition: AbstractControl;
  filterSecretaryOfStateAssistantPosition: Observable<IPosition[]>;

  secretaryOfStateOfficePosition: AbstractControl;
  filterSecretaryOfStateOfficePosition: Observable<IPosition[]>;

  startFromLevel: AbstractControl;
  filterStartFromLevel: Observable<IPosition[]>;

  contactSupports: string[] = [];
  constructor(public store: SettingsStore,
    private department: OfficerStore,
    private fb: FormBuilder,
    public auth: AuthStore,
    public ds: DatabaseService,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      headOfficerPosition: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      generalDepartmentLevel: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      assistantGeneralPosition: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      departmentLevel: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      assistantDepartmentPosition: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      verifyFromAssistantGeneral: [null],
      verifyFromAssistantDepartment: [null],

      secretaryOfStatePosition: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      secretaryOfStateAssistantPosition: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      secretaryOfStateOfficePosition: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      googleSMS: [null],
      loginWithOTP: [null],
      loginWithUsername: [null],
      verifyFromAssistantSecretaryOfState: [null],
      contactSupport: [null],
      startFromLevel: [null, [Validators.required, MappingService.validSelected.bind(this)]]
    })
    this.headOfficerPosition = this.form.controls['headOfficerPosition']
    this.departmentLevel = this.form.controls['departmentLevel']
    this.assistantGeneralPosition = this.form.controls['assistantGeneralPosition']
    this.assistantDepartmentPosition = this.form.controls['assistantDepartmentPosition']
    this.generalDepartmentLevel = this.form.controls['generalDepartmentLevel']
    this.secretaryOfStatePosition = this.form.controls['secretaryOfStatePosition']
    this.secretaryOfStateAssistantPosition = this.form.controls['secretaryOfStateAssistantPosition']
    this.secretaryOfStateOfficePosition = this.form.controls['secretaryOfStateOfficePosition']
    this.startFromLevel = this.form.controls['startFromLevel']

    const positions = await this.department.fetchManagementLevel();
    const levels = await this.department.fetchLevel();
    
    this.filterHeadOfficerPosition = MappingService.autoComplete(this.headOfficerPosition, positions, "name");
    this.filterStartFromLevel = MappingService.autoComplete(this.startFromLevel, levels, "name");

    this.filterAssistantGeneralPosition = MappingService.autoComplete(this.assistantGeneralPosition, positions, "name");
    this.filterAssistantDepartmentPosition = MappingService.autoComplete(this.assistantDepartmentPosition, positions, "name");
    this.filterGeneralDepartmentLevel = MappingService.autoComplete(this.generalDepartmentLevel, levels, "name");
    this.filterDepartmentLevel = MappingService.autoComplete(this.departmentLevel, levels, "name");
    this.filterSecretaryOfStatePosition = MappingService.autoComplete(this.secretaryOfStatePosition, positions, "name");
    this.filterSecretaryOfStateAssistantPosition = MappingService.autoComplete(this.secretaryOfStateAssistantPosition, positions, "name");
    this.filterSecretaryOfStateOfficePosition = MappingService.autoComplete(this.secretaryOfStateOfficePosition, positions, "name");

    this.store.fetchData(res => {
      const { administrationOffice, headOfficerPosition, assistantGeneralPosition,
        assistantDepartmentPosition, generalDepartmentLevel, departmentLevel,
        verifyFromAssistantGeneral, verifyFromAssistantDepartment,
        secretaryOfStateAssistantPosition, secretaryOfStatePosition, googleSMS, loginWithOTP, verifyFromAssistantSecretaryOfState
        , secretaryOfStateOfficePosition, loginWithUsername, contactSupports, startFromLevel
      } = res;
      this.contactSupports = contactSupports || [];
      this.form.patchValue({
        administrationOffice: administrationOffice,
        headOfficerPosition: headOfficerPosition,
        assistantGeneralPosition, assistantDepartmentPosition, generalDepartmentLevel, departmentLevel,
        verifyFromAssistantGeneral: verifyFromAssistantGeneral || false,
        verifyFromAssistantDepartment: verifyFromAssistantDepartment || false,
        loginWithOTP: loginWithOTP || false,
        verifyFromAssistantSecretaryOfState: verifyFromAssistantSecretaryOfState || false,
        secretaryOfStateAssistantPosition: secretaryOfStateAssistantPosition || null,
        secretaryOfStatePosition: secretaryOfStatePosition || false,
        googleSMS: googleSMS || false,
        secretaryOfStateOfficePosition: secretaryOfStateOfficePosition || false,
        loginWithUsername: loginWithUsername || false,
        contactSupport: null,
        startFromLevel: startFromLevel || null,
      })
    })
  }

  ngOnDestroy() {
    this.store.unsubscribe()
  }

  removeTag(tag: string) {
    this.contactSupports = this.contactSupports.filter(m => m !== tag.trim())
    const { data } = this.store;
    data.contactSupports = this.contactSupports;
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }

  addTag(tag: string) {
    const find = this.contactSupports.find(m => m === tag.trim())
    if (!find) {
      this.contactSupports.push(tag.trim())
      const { data } = this.store;
      data.contactSupports = this.contactSupports;
      this.store.save(data, (success, error) => {
        this.form.enable()
        if (success) {
          this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
        } else {
          alert(error);
        }
      })
      this.form.controls['contactSupport'].reset()
    }
  }


  optionSelectedPositionChanged(event, field: string) {
    const { value } = event.option
    const { data } = this.store
    this.form.disable()
    data[field] = toRanking(value);
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }


  _onCheckChanged(event, filed: string) {
    const { checked } = event;
    const { data } = this.store
    this.form.disable()
    data[filed] = checked || false;
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }

  optionSelectedAssistantGeneral(event) {
    const { value } = event.option
    const { data } = this.store
    this.form.disable()
    data.assistantGeneralPosition = toRanking(value);
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }

  optionSelectedGeneral(event) {
    const { value } = event.option
    const { data } = this.store
    this.form.disable()
    data.generalDepartmentLevel = toRanking(value);
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }

  optionSelectedAssistantDepartment(event) {
    const { value } = event.option
    const { data } = this.store
    this.form.disable()
    data.assistantDepartmentPosition = toRanking(value);
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }

  optionSelectedDepartment(event) {
    const { value } = event.option
    const { data } = this.store
    this.form.disable()
    data.departmentLevel = toRanking(value);
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }

  optionSelectedOffice(event) {
    const { value } = event.option
    const { data } = this.store
    this.form.disable()
    data.administrationOffice = toDepartment(value);
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }


  optionSelectedHeadOfficerPosition(event) {
    const { value } = event.option
    const { data } = this.store
    this.form.disable()
    data.headOfficerPosition = toRanking(value);
    this.store.save(data, (success, error) => {
      this.form.enable()
      if (success) {
        this.snackBar.open(`Settings has been saved successful.`, "Done", { duration: 3000 });
      } else {
        alert(error);
      }
    })
  }


  _save(f: any) {
    if (this.form.valid) {
      const { administrationOffice } = f;

    }
  }

}
