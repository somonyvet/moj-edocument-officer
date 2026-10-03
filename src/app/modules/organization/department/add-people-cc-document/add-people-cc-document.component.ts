import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { IDepartment } from 'src/app/interfaces/document/document.interface';
import { orderBy, pushObjArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService} from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
  selector: 'app-add-people-cc-document',
  templateUrl: './add-people-cc-document.component.html',
  styleUrls: ['./add-people-cc-document.component.scss']
})
export class AddPeopleCcDocumentComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បញ្ចូលគណនីទទួលអនុវត្ត";
  form: FormGroup;
  office: AbstractControl;
  filterOffice: Observable<IDepartment[]>;

  loading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<AddPeopleCcDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: DepartmentStore,
    public offices: OfficerStore,
    public ds: DataService,
    private auth: AuthStore,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      office: [null, Validators.compose([Validators.required, MappingService.validSelected.bind(this)])],
    })
    this.office = this.form.controls['office']

    const { item } = this.data;
    const offices = await this.offices.fetchOfficers();
    this.filterOffice = MappingService.autoComplete(this.office, offices, "displayName");

    if (item) {
      this.title = "កែប្រែគណនីទទួលអនុវត្ត"
      this.form.patchValue({
        office: item,
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
      const { office } = f;
      const item = {
        ...office,
        isNew: true,
      }
      const { departmentOfficersCC } = this.store;
      this.store.departmentOfficersCC = pushObjArray(departmentOfficersCC, item)

      this.store.departmentOfficersCC = orderBy(this.store.departmentOfficersCC, "displayName")
      this.form.enable()
      this.dialogRef.close('yes')
      this.form.reset()
      this.inputRef.nativeElement.focus()
    }
  }

}
