import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { LINE_TYPE_OBJECT, MOVEMENT_STATUS_OBJ, PURCHASE_TYPE_OPTIONS } from 'src/app/dummy/status';
import { IProduct, IUnitConverter, InvoiceItem } from 'src/app/interfaces/product.interface';
import { ConvertService, pushObjArray, sum } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService, toDepartment, toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { AutoCompleteStore } from 'src/app/stores/autocomplete.store';
import { BaseStore } from 'src/app/stores/base.store';
import { InventoryAdjustmentStore } from 'src/app/stores/inventory-adjustment.store';

@Component({
    selector: 'app-stock-adjustment-form-items',
    templateUrl: './stock-adjustment-form-items.component.html',
    styleUrls: ['./stock-adjustment-form-items.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StockAdjustmentFormItemsComponent implements OnInit {
  @ViewChild('inputRef', { static: true }) inputRef: ElementRef;

  title: any = "Add adjustment item";
  form: UntypedFormGroup;
  product: AbstractControl;
  qty: AbstractControl;
  from_number: AbstractControl;
  to_number: AbstractControl;

  total: number = 0;
  filteredProductOptions: Observable<Array<IProduct>>;
  filteredUnitSaleOptions: Observable<Array<IUnitConverter>>;

  selectedProduct: any;
  loading: boolean = true;
  filterVisaTypes: Observable<any[]>;

  constructor(
    public dialogRef: MatDialogRef<StockAdjustmentFormItemsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: InventoryAdjustmentStore,
    private auth: AuthStore,
    private autoStore: AutoCompleteStore,
    public ds: DataService,
    private baseStore: BaseStore
  ) { }

  async ngOnInit() {
    const { item } = this.data;
    this.form = this.fb.group({
      product: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      qty: [null, [Validators.compose([Validators.required, this.validCashIn.bind(this)])]],
      from_number: [null, [Validators.compose([Validators.required, this.validCashIn.bind(this)])]],
      to_number: [null, Validators.required],
    })
    this.product = this.form.controls['product']
    this.qty = this.form.controls['qty']
    this.from_number = this.form.controls['from_number']
    this.to_number = this.form.controls['to_number']

    if (this.data.item) {
      this.title = "Edit adjustment item";

    }

    this.to_number.disable()

    const { branch } = this.data.FORM;
    const visaTypes = await this.baseStore.fetchList(this.ds.visa_typesRef(ref => ref.orderBy('order')));
    this.filterVisaTypes = MappingService.autoComplete(this.product, visaTypes, "name");

    this.loading = false;
  }

  toNum = 0
  public validCashIn(control: AbstractControl): { [s: string]: boolean } {
    const value = control.value;
    if (value !== undefined && value !== null && value !== "") {
      if (value <= 0) {
        return { validAmount: true }
      }

      this.toNum = 0
      if (this.qty.value > 0 && this.from_number.value > 0) {
        this.toNum = toNumber(this.from_number.value) + toNumber(this.qty.value) - 1
        this.to_number.patchValue(this.toNum)
      }
    }
  }

  async _onSelectedProduct(event) {
    const { unitStock, key, cost, avg } = event.option.value
    const { branch } = this.data.FORM;
  }

  _onSave(f: any) {
    if (this.form.valid) {
      const { adjustmentType, branch } = this.data.FORM;
      this.form.disable();
      const { product, qty, from_number } = f;
      const price = product.price;
      const subtotal = qty * price
      const data: InvoiceItem = {
        key: this.data.item ? this.data.item?.key : this.ds.createId(),
        page_key: ConvertService.pageKey(),
        headerKey: null,
        storeKey: null, //this.auth.storeKey,
        created_date: this.ds.serverTimestamp(),
        created_by: this.auth.uid,
        //fields
        productKey: product.key,
        product: {
          key: product.key,
          name: product.name,
          short_name: product.short_name,
          category: product.category,
          order: product.order,
          price: product.price,
        },
        unitMeasurement: null,
        branch: toDepartment(branch),
        discountType: null,
        qty: qty || 0,
        stockQty: qty || 0,
        from_number: from_number || 0,
        to_number: this.toNum || 0,
        originalPrice: product.price,
        price: price,
        subtotal: subtotal,
        discount: null,
        totalDiscount: 0,
        totalAfterDiscount: subtotal,
        vat: null,
        totalVat: 0,
        total: subtotal,
        itemType: PURCHASE_TYPE_OPTIONS[0],
        //analytic
        lineType: LINE_TYPE_OBJECT.ITEM,
        movementStatus: MOVEMENT_STATUS_OBJ.HOLD,
        movementType: adjustmentType,
      }
      const { adjustmentItems } = this.store;
      const items = pushObjArray(adjustmentItems || [], data)
      this.store.adjustmentItems = items;

      this.selectedProduct = null;
      this.store.totalCost = sum(items, 'total')
      this.store.totalQty = sum(items, 'stockQty')
      this.form.reset();
      this.form.enable();
      if (this.data.item) {
        this.dialogRef.close('no')
      }
    }
  }

}
