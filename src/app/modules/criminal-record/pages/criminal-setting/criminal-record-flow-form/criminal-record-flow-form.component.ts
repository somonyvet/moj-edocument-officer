import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryFormComponent } from 'src/app/modules/organization/category/category-form/category-form.component';
import { DataService } from 'src/app/shared/services/data.service';
import { pushToArray } from 'src/app/shared/services/convert.service';
import { MappingService, toKeyAndName } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ICriminalFlow } from '../../../interfaces/interface';
import { CriminalService } from '../../../services/criminal.service';
import { CriminalStore } from '../../../stores/criminal.store';
import { DOCUMENT_FLOW_CATEGORY } from '../../../dummy/criminal.dummy';

@Component({
    selector: 'app-criminal-record-flow-form',
    templateUrl: './criminal-record-flow-form.component.html',
    styleUrls: ['./criminal-record-flow-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordFlowFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតចរន្តឯកសារ";
  form: UntypedFormGroup;
  department: AbstractControl;
  filterDepartments: any;
  category: any = DOCUMENT_FLOW_CATEGORY.normal;

  constructor(
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: CriminalStore,
    private ds: CriminalService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    this.category = this.data?.item?.category || this.data?.category || DOCUMENT_FLOW_CATEGORY.normal;
    this.title = `${this.data?.item ? 'កែប្រែចរន្តឯកសារ' : 'បង្កើតចរន្តឯកសារ'} (${this.category?.name})`
    this.form = this.fb.group({
      department: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      flowNo: [null, [Validators.required], this.checkExistNoRef.bind(this)],
      canSkipByCategory:[null]
    })
    this.department = this.form.controls['department'];

    const departments = await this.store.fetchDepartments();
    this.filterDepartments = MappingService.autoComplete(this.department, departments, 'name');
    if (this.data?.item) {
      const item = (this.data.item as ICriminalFlow) || null;
      const { flowNo, department,canSkipByCategory } = item;
      this.form.patchValue({
        flowNo, department,canSkipByCategory
      })
    }

  }
  displayNameAndNameEn(item: any): string {
    return item ? item?.name || item?.name_en : null;
  }

  async checkExistNoRef(control: AbstractControl) {
    if (!control) return null;
    const { item } = this.data;
    const { value } = control;
    if (!value) return null;
    if (item && item.flowNo === value) return null;

    // a flowNo only has to be unique within its own category
    const snapshot = await this.store.checkExist(value, 'flowNo').get().toPromise();
    const exist = pushToArray(snapshot).some(doc =>
      doc?.key !== item?.key &&
      (doc?.category?.key || DOCUMENT_FLOW_CATEGORY.normal.key) === this.category?.key
    );
    return exist ? { nameAvailable: true } : null;
  }

  _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { department, flowNo,canSkipByCategory } = f;
      const item: ICriminalFlow = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: ICriminalFlow = {
        key: item?.key || this.ds.createId(),
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        flowNo: flowNo,
        category: this.category,
        department: toKeyAndName(department),
        canSkipByCategory:canSkipByCategory || false,
      }
      this.store.saveFlow(data).then(() => {
        this.snackBar.open(`Criminal flow has been saved successful.`, "Done", { duration: 3000 });
        this.form.reset();
        if (this.data.req || this.data.item) {
          this.dialogRef.close(data);
        }
      }).catch(err => {
        alert(err)
      }).finally(() => {
        this.form.enable()
        this.inputRef.nativeElement.focus();
      })
    }
  }

}
