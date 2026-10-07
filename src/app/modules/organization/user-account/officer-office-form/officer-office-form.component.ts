import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IDepartment, IPosition } from 'src/app/interfaces/document/document.interface';
import { pushObjArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService, toDepartment, toRanking } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
    selector: 'app-officer-office-form',
    templateUrl: './officer-office-form.component.html',
    styleUrls: ['./officer-office-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficerOfficeFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតមុខងារតួនាទី";
  form: UntypedFormGroup;
  office: AbstractControl;
  filterOffice: Observable<IDepartment[]>;
  position: AbstractControl;
  filterPosition: Observable<IPosition[]>;

  constructor(
    public dialogRef: MatDialogRef<OfficerOfficeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: OfficerStore,
    public ds: DataService,
    private auth: AuthStore,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      office: [null, Validators.compose([Validators.required, MappingService.validSelected.bind(this)])],
      position: [null, Validators.compose([Validators.required, MappingService.validSelected.bind(this)])],
    })
    this.office = this.form.controls['office']
    this.position = this.form.controls['position']

    const { config } = this.auth;
    const offices = await this.store.fetchDepartments(config);
    this.filterOffice = MappingService.autoComplete(this.office, offices, "name");
    const positions = await this.store.fetchManagementLevel();
    this.filterPosition = MappingService.autoComplete(this.position, positions, "name");
    const { item } = this.data;
    if (item) {
      this.title = "កែប្រែមុខងារតួនាទី"
      const { office, position } = item;
      this.form.patchValue({
        office: offices.find(m => m.key === office?.key),
        position: positions.find(m => m.key === position?.key)
      })
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const data = this.data?.item || null;
      const { office, position } = f;
      const { uid } = this.auth;
      const item = {
        key: data?.key || `${office.key}_${position.key}`,
        office: toDepartment(office),
        position: toRanking(position),
        updated_by: uid,
        updated_at: new Date()
      }
      const { workingOffices } = this.store;
      this.store.workingOffices = pushObjArray(workingOffices, item)
      this.form.enable()
      if (data) {
        this.dialogRef.close('yes')
        return;
      }
      this.form.reset()
      this.inputRef.nativeElement.focus()
    }
  }

}
