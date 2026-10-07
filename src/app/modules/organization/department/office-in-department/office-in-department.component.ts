import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { IDepartment, IPosition } from 'src/app/interfaces/document/document.interface';
import { orderBy, pushObjArray, pushToObject } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService, toDepartment, toPosition, toRanking } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
    selector: 'app-office-in-department',
    templateUrl: './office-in-department.component.html',
    styleUrls: ['./office-in-department.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OfficeInDepartmentComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បញ្ចូលគណនីថ្នាក់ដឹកនាំ";
  form: UntypedFormGroup;
  office: AbstractControl;
  filterOffice: Observable<IDepartment[]>;

  position: AbstractControl;
  filterPosition: Observable<IDepartment[]>;

  loading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<OfficeInDepartmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DepartmentStore,
    public offices: OfficerStore,
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

    const { item, department } = this.data;
    const offices = await this.offices.fetchOfficers();
    this.filterOffice = MappingService.autoComplete(this.office, offices, "displayName");

    const managementLevel = pushToObject(await this.ds.managementLevelFireRef().doc(department.ranking.key).get().toPromise())
    const positionManager = managementLevel.positionManager || []
    this.filterPosition = MappingService.autoComplete(this.position, positionManager, "name");

    if (item) {
      this.title = "កែប្រែគណនីថ្នាក់ដឹកនាំ"
      const { position } = item;
      this.form.patchValue({
        office: item,
        position: position,
      })
    } else {

      this.form.patchValue({
        position: positionManager && positionManager.length > 0 ? positionManager[0] : null
      })
    }

    this.office.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (false)),
        switchMap(value => this.offices.fetchSearchOfficers(value,null,null, data => {
          this.filterOffice = MappingService.autoComplete(this.office, data, "displayName");
          this.loading = false;
        }))
      )
      .subscribe(res => { });
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { office, position } = f;
      const item = {
        ...office,
        isNew: true,
        position_new: toPosition(position),
      }
      const { departmentOfficers } = this.store;
      this.store.departmentOfficers = pushObjArray(departmentOfficers, item)

      this.store.departmentOfficers = orderBy(this.store.departmentOfficers, "displayName")
      this.form.enable()
      this.dialogRef.close('yes')
      this.form.reset()
      this.inputRef.nativeElement.focus()
    }
  }

}
