import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalRecordFlowFormComponent } from '../criminal-record-flow-form/criminal-record-flow-form.component';
import { CRIMINAL_LATTER_NUMBER_TYPES, DOCUMENT_FLOW_CATEGORY } from '../../../dummy/criminal.dummy';

@Component({
  selector: 'app-criminal-record-flow',
  templateUrl: './criminal-record-flow.component.html',
  styleUrls: ['./criminal-record-flow.component.scss']
})
export class CriminalRecordFlowComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  category = DOCUMENT_FLOW_CATEGORY;
  normalFlows: any[] = [];
  digitalFlows: any[] = [];

  latterTypes = CRIMINAL_LATTER_NUMBER_TYPES;
  latterForm: FormGroup;
  latterSettings: any = {};
  loadingLatterNo: boolean = true;
  savingLatterNo: string = null;

  constructor(private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public store: CriminalStore,) { }

  ngOnInit(): void {
    this.buildLatterForm();
    this.loadLatterSettings();
    this.store.fetchCriminalFlow(res => {
      this.normalFlows = this.byCategory(res, DOCUMENT_FLOW_CATEGORY.normal.key);
      this.digitalFlows = this.byCategory(res, DOCUMENT_FLOW_CATEGORY.digital.key);
      this.loading = false;
    })
  }

  private buildLatterForm() {
    const group: any = {};
    this.latterTypes.forEach(type => {
      group[type.key] = this.fb.group({
        prefix: [null],
        start_no: [null, [Validators.required]],
        padding: [null, [Validators.required]],
        include_year: [true],
      })
    })
    this.latterForm = this.fb.group(group);
  }

  // each counter is its own doc under settings/{key}
  private async loadLatterSettings() {
    this.loadingLatterNo = true;
    for (const type of this.latterTypes) {
      const setting = await this.store.fetchLatterNoSetting(type.key);
      this.latterSettings[type.key] = setting;
      this.latterGroup(type.key).patchValue({
        prefix: setting?.prefix ?? null,
        start_no: setting?.start_no ?? null,
        padding: setting?.padding ?? null,
        include_year: setting?.include_year ?? true,
      })
    }
    this.loadingLatterNo = false;
  }

  latterGroup(key: string): FormGroup {
    return this.latterForm?.controls[key] as FormGroup;
  }

  onSaveLatterNo(type: any) {
    const key = type?.key;
    const group = this.latterGroup(key);
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    const value = group.getRawValue();
    // last_no / last_no_at / year_key are owned by the number generator, never written here
    const item = {
      name: this.latterSettings[key]?.name || type?.name,
      application_type_key: this.latterSettings[key]?.application_type_key ?? type?.application_type_key,
      prefix: value?.prefix || null,
      start_no: Number(value?.start_no),
      padding: Number(value?.padding),
      include_year: value?.include_year || false,
    }
    this.savingLatterNo = key;
    this.store.saveLatterNoSetting(key, item).then(() => {
      this.savingLatterNo = null;
      this.latterSettings[key] = { ...(this.latterSettings[key] || {}), ...item };
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
    }).catch(err => {
      this.savingLatterNo = null;
      alert(err)
    })
  }

  // flows created before the category field existed are treated as normal
  private byCategory(items: any[], categoryKey: number) {
    return (items || []).filter(m => (m?.category?.key || DOCUMENT_FLOW_CATEGORY.normal.key) === categoryKey);
  }

  async ngOnDestroy() {
    await this.store.subscribeCriminalFlow()
  }

  create(item?: any, category: any = DOCUMENT_FLOW_CATEGORY.normal) {
    const dialogRef = this.dialog.open(CriminalRecordFlowFormComponent, {
      data: { item: item || null, category: item?.category || category },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
