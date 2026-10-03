export interface IUnitMeasurement {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  name: any;
}

export interface IUnitConverter {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  name: any;
  factor: number;
  operator: any;
}

export interface ICategory {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  name: any;
}

export interface IProduct {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  name: any;
  productType: any;
  sku: any;
  barcode: any;
  category: any;
  files?: any;
  unitStock: any;
  cost: number;
  sellingPrice: number;
  reorderPoint: number;
  bundleItems?: any;
}

export interface IBundleItems {
  key: string;
  page_key?: any;
  //fields
  productKey: string;
  product: any;
  unitSale: any;
  sellingPrice: number;
  qty: number;
  stockQty: number;
  total: number;
  cost: number;
}

export interface IAdjustmentHeader {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef?: any;
  storeKey?: string;
  //fields
  movementStatus: any;
  movementType: any;
  branch: any;
  employee: any;
  issueDate: any;
  ref: any;
  files?: any;
  memo?: any;
  total: number;
  totalQty: number;
  tranRefNo?: any;
}

export interface IAdjustmentItems {
  headerKey?: any;
  key: string;
  page_key?: any;
  //fields
  productKey: string;
  product: any;
  unitSale: any;
  qty: number;
  saleQty: number;
  stockQty: number;
  totalCost: number;
  cost: number;
  sellingPrice: number;
  totalSale: number;
  total?: any;
  storeKey: string;
  lineType: any;
  movementStatus: any;

  movementType?: any;
  campusKey?: any;
  branch?: any;
  created_date: Date;
  created_by: any;
  receive_byKey: string;
}

export interface IPaymentTerm {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  name: any;
  numberOfDay: number;
}

export interface InvoiceItem {
  headerKey?: any;
  key: string;
  page_key?: any;
  storeKey?: string;
  created_date: any;
  created_by: string;
  //fields
  productKey: string;
  product: any;
  unitMeasurement: any;
  branch: any;
  discountType: any;
  qty: number;
  stockQty: number;
  from_number: number;
  to_number: number;
  originalPrice: number;
  price: number; //calc originalPrice after discount to find price per unit
  subtotal: any;
  discount: any;
  totalDiscount: any;
  totalAfterDiscount: any;
  vat: any;
  totalVat: any;
  total: number;
  itemType: any; //free or not?
  //analytic
  lineType: any; //discount or item?
  movementStatus: any;
  movementType?: any;

  qty_bill?: any;
  billRef?: any;
  billItemRef?: any;
  isEqual?: any;
}

export interface BillItem {
  headerKey?: any;
  key: string;
  page_key?: any;
  storeKey: string;
  create_date?: any;
  create_by?: string;
  //fields
  productKey: string;
  product: any;
  unitSale: any;
  discountType: any;
  discount: any;
  qty: number;
  stockQty: number;
  purchaseType: any;
  originalCost: number;
  price: number;
  branch: any;
  subtotal: any;
  totalDiscount: any;
  total: any;
  //analytic
  lineType: any;
  movementStatus: any;
  movementType?: any;
}

export interface IBillHeader {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  movementStatus: any;
  movementType: any;
  branch: any;
  paymentTerm: any;
  supplier: any;
  billNo?: any;
  orderNumber?: any;
  tranRefNo?: any;
  memo?: any;
  billDate?: any;
  dueDate?: any;
  total: number;
  discountType: any;
  discount: any;
  totalDiscount: any;
  totalAfterDiscount: any;
  vat?: any;
  totalVat: any;
  grandTotal: any;
  deposit?: any;
  totalCredit: any;
  //
  files?: any;

  received_stock?: any;
  received_stock_ref?: any;
  received_stock_dataRef?: any;
}

export interface IReceiveStockHeader {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  movementStatus: any;
  movementType: any;
  branch: any;
  branchReceived: any;
  issueDate: any;
  files?: any;
  memo?: any;
  total: number;
  tranRefNo?: any;

  receivedBy: any;
  receivedDate: any;
  receivedRemark: any;
  receivedStatus: any;

  bill_ref?: any;
  bill_dataRef?: any;
}

export interface ITransferHeader {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  movementStatus: any;
  movementType: any;
  branch: any;
  branchReceived: any;
  issueDate: any;
  files?: any;
  memo?: any;
  total: number;
  tranRefNo?: any;

  receivedBy: any;
  receivedDate: any;
  receivedRemark: any;
  receivedStatus: any;

  received_stock?: any;
  received_stock_ref?: any;
  received_stock_dataRef?: any;
}

export interface IRemarkPolicy {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  // created_byRef: any;
  updated_by?: any;
  // updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  // deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  // storeRef: any;
  storeKey: string;
  //fields
  name: any;
  kh_name: any;
  userType?: any;
}

export interface IGroupTimePolicy {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  updated_by?: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeKey: string;
  //fields
  name: any;
  kh_name: any;
  userType?: any;
  daysOfWeek?: any;
  dayNamesOfWeek?: any;
}

export interface ITimePolicy {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  created_byRef: any;
  updated_by?: any;
  updated_byRef: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_byRef?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeRef: any;
  storeKey: string;
  //fields
  remarkKey: any;
  remark: any;
  fromHours: any;
  toHours: any;
  fromHoursTime: any;
  fromHoursNumber: any;
  toHoursTime: any;
  toHoursNumber: any;
  userType: any;
  type: any;
  shift: any;
  groupTimePolicy?: any;
}

export interface ITranscriptTemplate {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  updated_by?: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeKey: string;
  //fields
  name: any;
  displayName: any;
}
export interface ITranscriptTemplateParagraph {
  key: string;
  status?: any;
  isDelete?: boolean;
  created_at?: any;
  created_by?: any;
  updated_by?: any;
  updated_at?: any;
  deleted_by?: any;
  deleted_at?: any;
  page_key?: any;
  keyword: any;
  storeKey: string;
  //fields
  name: any;
  displayName: any;
  isTitle: boolean;
  templateKey: any;
  block: any;
}
