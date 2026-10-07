import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ADJUSTMENT_TYPES, MOVEMENT_STATUS_OBJ, MASTER_PAGES } from 'src/app/dummy/status';
import { IAdjustmentHeader } from 'src/app/interfaces/product.interface';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { BaseStore } from 'src/app/stores/base.store';
import { InventoryAdjustmentStore } from 'src/app/stores/inventory-adjustment.store';
import { StockAdjustmentFormItemsComponent } from '../stock-adjustment-form-items/stock-adjustment-form-items.component';

@Component({
    selector: 'app-stock-adjustment-form',
    templateUrl: './stock-adjustment-form.component.html',
    styleUrls: ['./stock-adjustment-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StockAdjustmentFormComponent implements OnInit {
  params: any = null;
  queryParams: any = null;
  page;
  title: string = 'Create an Adjustment'
  backUrl: any = '/';
  loading: boolean = true;
  filteredBranchOptions: Observable<Array<any>>;
  filteredEmployeeOptions: Observable<Array<any>>;
  ADJUSTMENT_TYPES = ADJUSTMENT_TYPES

  form: UntypedFormGroup;
  branch: AbstractControl;
  MOVEMENT_STATUS_OBJ = MOVEMENT_STATUS_OBJ;

  IS_HOLD: boolean = true;
  LOADING: boolean = true;
  SAVE_DRAFT: boolean = false;
  SAVE_SUBMIT: boolean = false;
  constructor(
    private route: ActivatedRoute,
    public store: InventoryAdjustmentStore,
    private dialog: MatDialog,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: UntypedFormBuilder,
    public ds: DataService,
    public baseStore: BaseStore,

  ) { }

  async ngOnInit() {
    this.form = this.fb.group({
      adjustmentType: [ADJUSTMENT_TYPES[0], [Validators.required]],
      branch: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      issueDate: [new Date(), [Validators.required]],
      ref: [null],
      memo: [null],
    })
    this.branch = this.form.controls['branch'];

    this.route.queryParams.subscribe(params => {
      const { p, t } = params;
      this.page = MASTER_PAGES[p];
      this.queryParams = params;
      this.backUrl = `${this.page.route}/${t}`
    })

    this.route.params.subscribe(async params => {
      this.params = params;
      this.LOADING = true;
      const { id } = params;
      this.title = id === 'draft' ? 'Create an Adjustment' : 'Open Adjustment';
      const { user } = this.auth;
      const branches = await this.baseStore.fetchList(this.ds.stockVisaRef(ref => ref.orderBy("node")));
      this.filteredBranchOptions = MappingService.autoComplete(this.branch, branches, 'name')
      if (id !== 'draft') {
        this.store.fetchAdjustmentHeader(id, res => {
          if (!res) {
            this.router.navigate([this.backUrl]);
            return;
          }
          this.IS_HOLD = !res || res.movementStatus.key === 0;
          const { branch, employee, memo, movementType, issueDate, tranRefNo } = res;
          this.title = `Open #${tranRefNo || 'Adjustment'}`
          this.form.patchValue({
            branch, employee, memo,
            adjustmentType: movementType,
            issueDate: issueDate.toDate(),
          })
          if (this.IS_HOLD) this.form.enable();
          else this.form.disable();
        })
        this.store.fetchAdjustmentItem(id, res => {
          this.LOADING = false;
        })
      }
      else {
        this.form.patchValue({
          branch: null//this.auth.selectedCampus,
        })
        this.store.adjustmentHeader = null;
        this.store.adjustmentItems = [];
        this.LOADING = false;
      }
    })
    this.loading = false;
  }

  ngOnDestroy() {
    const { fetchAdjustmentItemRef, fetchAdjustmentHeaderRef } = this.store;
    fetchAdjustmentHeaderRef && fetchAdjustmentHeaderRef.unsubscribe();
    fetchAdjustmentItemRef && fetchAdjustmentItemRef.unsubscribe();
  }

  create(item?: any) {
    const { branch } = this.form.value;
    if (!branch) {
      alert("Please select branch from list first.")
      return;
    }
    const dialogRef = this.dialog.open(StockAdjustmentFormItemsComponent, {
      data: { item: item || null, FORM: this.form.value },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,

    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  delete(item?: any) {
    const { adjustmentItems } = this.store;
    this.store.adjustmentItems = adjustmentItems.filter(m => m.key !== item.key);
  }

  _release(f: any, movementStatus) {
    if (this.form.valid) {
      const { adjustmentItems } = this.store;
      if (adjustmentItems.length === 0) {
        alert("Please add adjustment item to list.")
        return;
      }
      const { adjustmentType } = f;
      if (movementStatus.key === MOVEMENT_STATUS_OBJ.RELEASED.key) {
        let dialogRef = this.dialog.open(ConfirmSuccessComponent, {
          data: { title: 'Release Adjustment', memo: 'Please check your item and make sure you check all information before submit.', name: `${adjustmentType.name}` },
          width: '680px',
          disableClose: true,
          role: 'dialog',
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'yes') {
            this._save(f, movementStatus)
          }
        });
      } else {
        this._save(f, movementStatus)
      }
    }
  }

  _save(f: any, movementStatus) {
    const { adjustmentHeader } = this.store;
    this.form.disable()
    this.SAVE_DRAFT = movementStatus.key === MOVEMENT_STATUS_OBJ.HOLD.key;
    this.SAVE_SUBMIT = movementStatus.key === MOVEMENT_STATUS_OBJ.RELEASED.key;
    const { adjustmentType, branch, employee, issueDate: issueDate0, ref, memo } = f;
    const issueDate = issueDate0?._isAMomentObject ? issueDate0.toDate() : issueDate0;
    const item: IAdjustmentHeader = {
      key: adjustmentHeader ? adjustmentHeader?.key : this.ds.createId(),
      status: STATUS_OBJ.ACTIVE,
      created_at: adjustmentHeader ? adjustmentHeader.created_at : this.ds.serverTimestamp(),
      created_by: adjustmentHeader ? adjustmentHeader.created_by : this.auth.uid,
      created_byRef: adjustmentHeader ? adjustmentHeader.created_byRef : this.ds.usersRef().doc(this.auth.uid).ref,
      updated_by: this.auth.uid,
      updated_byRef: this.ds.usersRef().doc(this.auth.uid).ref,
      updated_at: this.ds.serverTimestamp(),
      // deleted_by?: any;
      // deleted_byRef?: any;
      // deleted_at?: any;
      page_key: ConvertService.pageKey(),
      keyword: [],
      // storeKey: this.auth.storeKey,
      // storeRef: this.ds.storeRef().ref,
      //fields
      movementStatus: movementStatus,
      movementType: adjustmentType,
      branch: { key: branch.key, name: branch.name || null, phone: branch.phone || null, short_name: branch.short_name || null },
      employee: employee ? { key: employee.key, full_name: employee.full_name } : null,
      issueDate: issueDate,
      ref: ref || null,
      files: [],
      memo: memo || null,
      total: this.store.totalCost,
      totalQty: this.store.totalQty,
    }
    this.store.released(item, (success, res) => {
      this.form.enable();
      if (success) {
        this.SAVE_DRAFT = false;
        this.SAVE_SUBMIT = false;
        this.snackBar.open(`Inventory adjustment has been saved successful.`, "Done", { duration: 1000 });
        this.router.navigate([`apps/stock-adjustment/all`])
      } else {
        this.snackBar.open(`${res}`, "Error", { duration: 3000 });
      }
    })
  }

}
