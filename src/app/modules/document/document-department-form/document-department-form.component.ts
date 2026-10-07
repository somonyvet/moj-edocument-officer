import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { IDepartment } from 'src/app/interfaces/document/document.interface';
import { Observable } from 'rxjs';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { ConvertService, pushObjArray } from 'src/app/shared/services/convert.service';
import { FLOW_TYPE_OBJECT, OFFICE_OR_OFFICER_OBJECT } from 'src/app/dummy/config';

@Component({
    selector: 'app-document-department-form',
    templateUrl: './document-department-form.component.html',
    styleUrls: ['./document-department-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentDepartmentFormComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "";
  form: UntypedFormGroup;
  workplace: AbstractControl;
  filteredWorkplace: Observable<IDepartment[]>;

  showIncludeAssistant: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<DocumentDepartmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public department: DepartmentStore,
    public store: DocumentStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public ds: DatabaseService,
    public storage: FireStorageService,
    private changeRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    const item = this.data?.item;
    const { flowTypeObject, level } = this.data;
    this.title = flowTypeObject.name;
    this.store.peopleAndWorkplace = [];
    this.store.officers = [];
    this.form = this.fb.group({
      workplace: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      approve: [true],
      includeAssistant: [true],
    })
    this.workplace = this.form.controls['workplace'];
    const { config } = this.auth;
    const items = await this.department.fetchDepartmentByLevel(null, level.key)
    this.filteredWorkplace = MappingService.autoComplete(this.workplace, items, 'name')
    const { generalDepartmentLevel, departmentLevel } = config;
    if (generalDepartmentLevel?.key !== level.key && departmentLevel.key !== level.key) {
      this.form.patchValue({
        includeAssistant: false,
      })
      this.showIncludeAssistant = false
    }
  }

  ngOnDestroy(): void {
    this.store.peopleAndWorkplace = [];
    this.store.officers = []
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }


  async optionSelectedPosition(event: any, f: any) {
    const { value } = event.option;
    const { approve, includeAssistant } = f;
    const { headerOfficer } = value;
    const { flowTypeObject, level } = this.data;
    const { config } = this.auth
    const officeDoc = {
      ...value,
      flowType: flowTypeObject,
      dataType: OFFICE_OR_OFFICER_OBJECT.OFFICE,
      requiredApprove: approve || false,
      includeAssistant: includeAssistant || false,
      flowPageKey: ConvertService.pageKey(),
      flowBy: this.auth.uid,
      flowAt: new Date(),
      officeKey: value.key,
      key: `${flowTypeObject.key}_${value.key}`
    }
    this.store.peopleAndWorkplace = pushObjArray(this.store.peopleAndWorkplace, officeDoc);
    Array.isArray(headerOfficer) && headerOfficer.map(officer => {
      if (officer) {
        const data = {
          ...officer,
          flowType: flowTypeObject,
          dataType: OFFICE_OR_OFFICER_OBJECT.OFFICER,
          officeKeyRef: officeDoc.key,
          originalOfficeKey:value.key,
          requiredApprove: approve || false,
          onlyInfo: false,
          flowPageKey: ConvertService.pageKey(),
          flowBy: this.auth.uid,
          flowAt: new Date(),
          officerKey: officer.key,
          key: `${flowTypeObject.key}_${officer?.position?.key}_${officer.key}`
        }
        this.store.peopleAndWorkplace = pushObjArray(this.store.peopleAndWorkplace, data);
        this.store.officers = pushObjArray(this.store.officers, data);
      }
    })
    if (includeAssistant) {
      const { generalDepartmentLevel, departmentLevel, assistantDepartmentPosition, assistantGeneralPosition } = config;
      let position = null;
      if (generalDepartmentLevel?.key === level?.key) {
        position = assistantGeneralPosition;
      } else if (departmentLevel?.key === level.key) {
        position = assistantDepartmentPosition;
      }
      if (position) {
        const assistants = await this.department.fetchOfficerByPosition(position.key)
        Array.isArray(assistants) && assistants.filter(m => m).map(officer => {
          const officerAssistant = {
            ...officer,
            positions: officer.position,
            position: position,
            flowType: flowTypeObject,
            dataType: OFFICE_OR_OFFICER_OBJECT.OFFICER,
            officeKeyRef: officeDoc.key,
            originalOfficeKey:value.key,
            requiredApprove: false,
            onlyInfo: true,
            flowPageKey: ConvertService.pageKey(),
            flowBy: this.auth.uid,
            flowAt: new Date(),
            officerKey: officer.key,
            key: `${flowTypeObject.key}_${position?.key}_${officer.key}`
          }
          this.store.peopleAndWorkplace = pushObjArray(this.store.peopleAndWorkplace, officerAssistant);
          this.store.officers = pushObjArray(this.store.officers, officerAssistant);
        })
      }
    }
  }


  _onSave(f: any) {
    if (this.form.valid) {
      const { officers } = this.store;
      if (officers.length === 0) {
        alert("ពុំមានមន្ត្រីទទួលបន្ទុកការងារ")
        return;
      }
      this.form.disable();
      const { flowTypeObject } = this.data;
      this.store.saveDocumentFlow(flowTypeObject, (status, error) => {
        this.form.enable()
        if (status) {
          this.store.peopleAndWorkplace = [];
          this.store.officers = [];
          this.form.controls['workplace'].reset();
          this.inputRef.nativeElement.focus()
          this.snackBar.open('Flow has been saved.', "Done", { duration: 3000 })
        } else {
          alert(error)
        }
      })
    }
  }

}
