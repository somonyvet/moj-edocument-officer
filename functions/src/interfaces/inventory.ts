
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
    storeRef: any;
    storeKey: string;
    //fields
    movementStatus: any;
    movementType: any;
    branch: any;
    employee: any;
    issueDate: any;
    ref: any;
    files?: any;
    memo?: any;
}

export interface IAdjustmentItems {
    headerKey?: any;
    student?: any;
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
    price: number;
    sellingPrice: number;
    total: number;
    totalSale: number;
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
    storeRef: any;
    storeKey: string;
    //fields
    movementStatus: any;
    movementType: any;
    branch: any;
    employee: any;
    issueDate: any;
    ref: any;
    files?: any;
    memo?: any;
}

export interface IInvoiceItems {
    headerKey?: any;
    key: string;
    page_key?: any;
    storeKey: string;
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
    originalPrice: number;
    price: number;//calc originalPrice after discount to find price per unit
    subtotal: any;
    discount: any;
    totalDiscount: any;
    totalAfterDiscount: any;
    vat: any;
    totalVat: any;
    total: number;
    //analytic
    lineType: any;//free or item?
    movementStatus: any;
    movementType?: any;
}

export interface IGeneralJournal {
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
  campus?: any;
  person?: any;
  personType?: any;
  journalDate?: any;
  account: any;
  note: any;
  totalDebit: any;
  totalCredit: any;
  grandTotal: number;
  //analytic
  recordType: any;
  lineNo: number;
  lineType: any;
  headerKey: any;
  tranRefNo: any;
  movementStatus: any;
  }

  export interface IPettyCashHeader {
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
    campus: any;
    person: any;
    nameType: any;
    issueDate: any;
    files?: any;
    memo?: any;
    total: number;
    ref?:any;
    tranRefNo?: any;
  }


export interface IPettyCashItem {
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
    campus?: any;
    person?: any;
    personType?: any;
    issueDate?: any;
    name: any;
    amount: number;
    //analytic
    headerKey: any;
    movementStatus: any;
  }
